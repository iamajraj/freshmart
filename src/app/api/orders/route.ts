import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { processOrderPoints } from '@/lib/loyalty';
import { applyCampaigns, updateCampaignUsage } from '@/lib/campaigns-server';

const createOrderSchema = z.object({
  shippingAddress: z.string().min(1, 'Shipping address is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { appliedRewards, appliedCoupon, appliedCampaigns, ...orderData } = body;
    const validatedData = createOrderSchema.parse(orderData);

    // Debug logging
    console.log('Order creation data:', {
      appliedCoupon: appliedCoupon ? { code: appliedCoupon.code, discountAmount: appliedCoupon.discountAmount } : null,
      appliedCampaigns: appliedCampaigns ? { totalDiscount: appliedCampaigns.totalDiscount, campaignsCount: appliedCampaigns.campaigns?.length } : null
    });

    // Get user's cart
    const cartItems = await prisma.cart.findMany({
      where: { userId: session.user.id },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    // Check stock availability for all items
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for ${item.product.name}` },
          { status: 400 }
        );
      }
    }

    // Calculate base total
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const baseShipping = subtotal > 50 ? 0 : 5.99;

    // Use campaigns data from checkout (already calculated)
    const campaignDiscount = appliedCampaigns?.totalDiscount || 0;
    const campaignFreeShipping = appliedCampaigns?.freeShipping || false;
    const campaignPointsMultiplier = appliedCampaigns?.pointsMultiplier || 1;

    // Calculate shipping after campaigns
    const finalShipping = campaignFreeShipping ? 0 : baseShipping;
    const subtotalAfterCampaigns = subtotal - campaignDiscount;
    const tax = subtotalAfterCampaigns * 0.08;
    const baseTotal = subtotalAfterCampaigns + tax + finalShipping;

    // Calculate final order amounts with all discounts
    let finalDiscountAmount = campaignDiscount;
    let finalRewardsApplied = null;
    let finalCouponsApplied = null;
    let finalCampaignsApplied = appliedCampaigns?.campaigns ? JSON.stringify(appliedCampaigns.campaigns) : null;

    // Apply rewards
    if (
      appliedRewards &&
      appliedRewards.rewardIds &&
      appliedRewards.rewardIds.length > 0
    ) {
      finalDiscountAmount += appliedRewards.discountAmount || 0;
      finalRewardsApplied = JSON.stringify(appliedRewards.appliedRewards || []);
    }

    // Apply coupons
    if (appliedCoupon && appliedCoupon.discountAmount) {
      finalDiscountAmount += appliedCoupon.discountAmount;
      finalCouponsApplied = JSON.stringify([appliedCoupon]);
    }

    // Debug logging for stored data
    console.log('Storing in order:', {
      finalCouponsApplied,
      finalCampaignsApplied
    });

    const finalTotalAmount = Math.max(
      0,
      baseTotal - (finalDiscountAmount - campaignDiscount)
    );

    const result = await prisma.$transaction(async (tx) => {
      // Create order with all discount information
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount: finalTotalAmount,
          shippingAddress: validatedData.shippingAddress,
          status: 'CONFIRMED',
          discountAmount: finalDiscountAmount,
          rewardsApplied: finalRewardsApplied,
          campaignsApplied: finalCampaignsApplied,
          couponsApplied: finalCouponsApplied,
        },
      });

      // Create order items
      const orderItems = await Promise.all(
        cartItems.map((item) =>
          tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
            },
          })
        )
      );

      // Update product stock
      await Promise.all(
        cartItems.map((item) =>
          tx.product.update({
            where: { id: item.product.id },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        )
      );

      // Clear user's cart
      await tx.cart.deleteMany({
        where: { userId: session.user.id },
      });

      // Apply rewards (mark as used) if any were applied
      if (
        appliedRewards &&
        appliedRewards.rewardIds &&
        appliedRewards.rewardIds.length > 0
      ) {
        // Get the redeemed rewards to check their types (only APPROVED ones)
        const redeemedRewards = await tx.redeemedReward.findMany({
          where: {
            id: { in: appliedRewards.rewardIds },
            status: 'APPROVED', // Only apply approved rewards
          },
          include: { reward: true },
        });

        // Mark rewards as used
        await Promise.all(
          appliedRewards.rewardIds.map((rewardId: string) =>
            tx.redeemedReward.update({
              where: { id: rewardId },
              data: {
                status: 'USED',
                usedAt: new Date(),
              },
            })
          )
        );

        // Handle cashback rewards by awarding points
        const cashbackRewards = redeemedRewards.filter(
          (r) => r.reward.type === 'CASHBACK'
        );
        for (const cashbackReward of cashbackRewards) {
          await tx.pointsTransaction.create({
            data: {
              userId: session.user.id,
              amount: cashbackReward.reward.value,
              type: 'REWARD_CREDIT',
              description: `Cashback reward: ${cashbackReward.reward.name}`,
              referenceId: cashbackReward.id,
            },
          });

          // Update user's loyalty points
          await tx.user.update({
            where: { id: session.user.id },
            data: {
              loyaltyPoints: {
                increment: cashbackReward.reward.value,
              },
            },
          });
        }

        // FREE_PRODUCT rewards are marked as used but require manual processing
        // (customer contacts support to select their free product)

        // Handle coupon usage tracking
        if (appliedCoupon && appliedCoupon.id) {
          await tx.couponUsage.create({
            data: {
              couponId: appliedCoupon.id,
              userId: session.user.id,
              orderId: order.id,
              discountAmount: appliedCoupon.discountAmount || 0,
            },
          });

          // Increment coupon usage count
          await tx.coupon.update({
            where: { id: appliedCoupon.id },
            data: {
              usageCount: { increment: 1 },
            },
          });
        }
      }

      return { order, orderItems };
    });

    // Update campaign usage counts (run in background)
    if (appliedCampaigns?.campaigns && appliedCampaigns.campaigns.length > 0) {
      const campaignIds = appliedCampaigns.campaigns.map((c: { campaign: { id: string } }) => c.campaign.id);
      updateCampaignUsage(campaignIds).catch(console.error);
    }

    // Process loyalty points for the order (run in background)
    processOrderPoints(result.order.id, campaignPointsMultiplier).catch(
      console.error
    );

    return NextResponse.json(result.order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.issues },
        { status: 400 }
      );
    }

    console.error('Order creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
