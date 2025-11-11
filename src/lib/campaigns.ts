export interface Campaign {
  id: string;
  title: string;
  description: string;
  type: string; // From database: 'DISCOUNT' | 'BOGO' | 'FREE_SHIPPING' | 'POINTS_MULTIPLIER'
  discountType?: string | null; // From database: 'PERCENTAGE' | 'FIXED' | null
  discountValue?: number | null;
  minPurchase?: number | null;
  pointsMultiplier: number;
  isActive: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  usageLimit?: number | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppliedCampaign {
  campaign: Campaign;
  discountAmount: number;
  freeShipping: boolean;
  pointsMultiplier: number;
}

export interface CampaignApplicationResult {
  campaigns: AppliedCampaign[];
  totalDiscount: number;
  freeShipping: boolean;
  pointsMultiplier: number;
}
