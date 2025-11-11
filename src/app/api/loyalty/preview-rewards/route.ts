import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface PreviewRewardsRequest {
  orderTotal: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { orderTotal }: PreviewRewardsRequest = await request.json();

    // Get approved rewards that haven't been used yet
    const applicableRewards = await prisma.redeemedReward.findMany({
      where: {
        userId: session.user.id,
        status: 'APPROVED', // Only show approved rewards in preview
      },
      include: {
        reward: true,
      },
      orderBy: {
        redeemedAt: 'asc', // Use oldest first
      },
    });

    // Calculate which rewards would be applied (preview only)
    const discountRewards = applicableRewards.filter(
      (r) => r.reward.type === 'DISCOUNT'
    );
    const freeDeliveryRewards = applicableRewards.filter(
      (r) => r.reward.type === 'FREE_DELIVERY'
    );
    const cashbackRewards = applicableRewards.filter(
      (r) => r.reward.type === 'CASHBACK'
    );
    const freeProductRewards = applicableRewards.filter(
      (r) => r.reward.type === 'FREE_PRODUCT'
    );

    const rewardsToPreview: string[] = [];
    let totalDiscount = 0;
    let freeDeliveryApplied = false;

    // Apply one discount reward (highest value first)
    if (discountRewards.length > 0) {
      const bestDiscount = discountRewards.reduce((best, current) =>
        current.reward.value > best.reward.value ? current : best
      );
      rewardsToPreview.push(bestDiscount.id);
      totalDiscount = bestDiscount.reward.value;
    }

    // Apply one free delivery reward if shipping would be charged
    if (freeDeliveryRewards.length > 0 && orderTotal < 50) {
      rewardsToPreview.push(freeDeliveryRewards[0].id);
      freeDeliveryApplied = true;
    }

    // Include all cashback rewards (they're automatically applied)
    cashbackRewards.forEach((reward) => {
      rewardsToPreview.push(reward.id);
    });

    // Include all free product rewards (require manual processing)
    freeProductRewards.forEach((reward) => {
      rewardsToPreview.push(reward.id);
    });

    const preview = {
      discountAmount: totalDiscount,
      freeDelivery: freeDeliveryApplied,
      rewardIds: rewardsToPreview,
      appliedRewards: applicableRewards
        .filter((r) => rewardsToPreview.includes(r.id))
        .map((r) => ({
          id: r.id,
          name: r.reward.name,
          type: r.reward.type,
          value: r.reward.value,
        })),
      // Separate rewards that affect current order vs. post-order bonuses
      orderRewards: applicableRewards
        .filter(
          (r) =>
            rewardsToPreview.includes(r.id) &&
            (r.reward.type === 'DISCOUNT' || r.reward.type === 'FREE_DELIVERY')
        )
        .map((r) => ({
          id: r.id,
          name: r.reward.name,
          type: r.reward.type,
          value: r.reward.value,
        })),
      bonusRewards: applicableRewards
        .filter(
          (r) =>
            rewardsToPreview.includes(r.id) &&
            (r.reward.type === 'CASHBACK' || r.reward.type === 'FREE_PRODUCT')
        )
        .map((r) => ({
          id: r.id,
          name: r.reward.name,
          type: r.reward.type,
          value: r.reward.value,
        })),
    };

    return NextResponse.json(preview);
  } catch (error) {
    console.error('Preview rewards error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
