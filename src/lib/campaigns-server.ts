import { prisma } from './prisma';
import type { Campaign, CampaignApplicationResult } from './campaigns';

/**
 * Get all active campaigns that are currently valid
 */
export async function getActiveCampaigns(): Promise<Campaign[]> {
  const campaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
    },
  });

  const now = new Date();

  return campaigns.filter(campaign => {
    // Check date validity
    const startValid = !campaign.startDate || campaign.startDate <= now;
    const endValid = !campaign.endDate || campaign.endDate >= now;

    if (!startValid || !endValid) {
      return false;
    }

    // Check usage limit
    if (campaign.usageLimit !== null && campaign.usageCount >= campaign.usageLimit) {
      return false;
    }

    return true;
  });
}

/**
 * Apply campaignss to a cart/order total
 */
export async function applyCampaigns(
  orderTotal: number,
  existingDiscounts: number = 0
): Promise<CampaignApplicationResult> {
  const campaigns = await getActiveCampaigns();

  const appliedCampaigns: any[] = [];
  let totalDiscount = 0;
  let freeShipping = false;
  let pointsMultiplier = 1;

  // calculate the base amount after existing discounts (coupons, rewards)
  const baseAmount = Math.max(0, orderTotal - existingDiscounts);

  for (const campaign of campaigns) {
    // Check minimum purchase requirement
    if (campaign.minPurchase && orderTotal < campaign.minPurchase) {
      continue;
    }

    let discountAmount = 0;
    let campaignFreeShipping = false;
    let campaignMultiplier = 1;

    switch (campaign.type) {
      case 'DISCOUNT':
        if (campaign.discountType === 'PERCENTAGE' && campaign.discountValue) {
          discountAmount = baseAmount * (campaign.discountValue / 100);
        } else if (
          campaign.discountType === 'FIXED' &&
          campaign.discountValue
        ) {
          discountAmount = Math.min(campaign.discountValue, baseAmount);
        }
        break;

      case 'FREE_SHIPPING':
        campaignFreeShipping = true;
        break;

      case 'POINTS_MULTIPLIER':
        campaignMultiplier = campaign.pointsMultiplier;
        break;

      case 'BOGO':
        // a simple 50% discount as placeholderr
        discountAmount = baseAmount * 0.5;
        break;

      default:
        continue;
    }

    if (discountAmount > 0 || campaignFreeShipping || campaignMultiplier > 1) {
      appliedCampaigns.push({
        campaign,
        discountAmount,
        freeShipping: campaignFreeShipping,
        pointsMultiplier: campaignMultiplier,
      });

      totalDiscount += discountAmount;
      if (campaignFreeShipping) {
        freeShipping = true;
      }
      pointsMultiplier = Math.max(pointsMultiplier, campaignMultiplier);
    }
  }

  return {
    campaigns: appliedCampaigns,
    totalDiscount,
    freeShipping,
    pointsMultiplier,
  };
}

/**
 * Update campaign usage count
 */
export async function updateCampaignUsage(campaignIds: string[]): Promise<void> {
  if (campaignIds.length === 0) return;

  await prisma.campaign.updateMany({
    where: {
      id: { in: campaignIds },
    },
    data: {
      usageCount: {
        increment: 1,
      },
    },
  });
}
