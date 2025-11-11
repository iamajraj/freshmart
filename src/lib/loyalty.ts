import { prisma } from "./prisma"
import { LoyaltyTier, TransactionType } from "@prisma/client"

// points calculation rules
export const POINTS_CONFIG = {
  PER_DOLLAR_SPENT: 10, // 10 points per $1 spent
  FIRST_PURCHASE_BONUS: 100, // bonus points for first purchase
  MINIMUM_PURCHASE_FOR_POINTS: 5, // minimum $5 purchase to earn points
}

// tier thresholds (total spent amounts)
export const TIER_THRESHOLDS = {
  BRONZE: 0,      // default tier
  SILVER: 100,    // $100 spent
  GOLD: 500,      // $500 spent
  PLATINUM: 1000, // $1000 spent
}

export function calculatePointsEarned(amount: number, isFirstPurchase = false): number {
  if (amount < POINTS_CONFIG.MINIMUM_PURCHASE_FOR_POINTS) {
    return 0
  }

  let points = Math.floor(amount * POINTS_CONFIG.PER_DOLLAR_SPENT)

  if (isFirstPurchase) {
    points += POINTS_CONFIG.FIRST_PURCHASE_BONUS
  }

  return points
}

export function getTierFromSpentAmount(totalSpent: number): LoyaltyTier {
  if (totalSpent >= TIER_THRESHOLDS.PLATINUM) return "PLATINUM"
  if (totalSpent >= TIER_THRESHOLDS.GOLD) return "GOLD"
  if (totalSpent >= TIER_THRESHOLDS.SILVER) return "SILVER"
  return "BRONZE"
}

export function getNextTierInfo(currentTier: LoyaltyTier, totalSpent: number) {
  const tiers = [
    { tier: "BRONZE", threshold: 0, next: "SILVER", nextThreshold: TIER_THRESHOLDS.SILVER },
    { tier: "SILVER", threshold: TIER_THRESHOLDS.SILVER, next: "GOLD", nextThreshold: TIER_THRESHOLDS.GOLD },
    { tier: "GOLD", threshold: TIER_THRESHOLDS.GOLD, next: "PLATINUM", nextThreshold: TIER_THRESHOLDS.PLATINUM },
    { tier: "PLATINUM", threshold: TIER_THRESHOLDS.PLATINUM, next: null, nextThreshold: null },
  ]

  const currentTierInfo = tiers.find(t => t.tier === currentTier)
  if (!currentTierInfo || !currentTierInfo.next) {
    return { nextTier: null, pointsToNext: 0, progress: 100 }
  }

  const pointsToNext = currentTierInfo.nextThreshold! - totalSpent
  const progress = Math.min(100, ((totalSpent - currentTierInfo.threshold) / (currentTierInfo.nextThreshold! - currentTierInfo.threshold)) * 100)

  return {
    nextTier: currentTierInfo.next,
    pointsToNext: Math.max(0, pointsToNext),
    progress: Math.round(progress),
  }
}

export async function awardPointsToUser(
  userId: string,
  points: number,
  type: TransactionType,
  description: string,
  referenceId?: string
) {
  if (points === 0) return

  await prisma.$transaction(async (tx) => {
    // update user points and total spent
    await tx.user.update({
      where: { id: userId },
      data: {
        loyaltyPoints: {
          increment: points,
        },
      },
    })

    // create transaction record
    await tx.pointsTransaction.create({
      data: {
        userId,
        amount: points,
        type,
        description,
        referenceId,
      },
    })
  })
}

export async function updateUserTier(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalSpent: true, loyaltyTier: true },
  })

  if (!user) return

  const newTier = getTierFromSpentAmount(user.totalSpent)

  if (newTier !== user.loyaltyTier) {
    await prisma.user.update({
      where: { id: userId },
      data: { loyaltyTier: newTier },
    })

    // give tier upgrade bonus
    if (newTier === "SILVER") {
      await awardPointsToUser(userId, 50, "PROMOTION_BONUS", "Silver tier upgrade bonus")
    } else if (newTier === "GOLD") {
      await awardPointsToUser(userId, 100, "PROMOTION_BONUS", "Gold tier upgrade bonus")
    } else if (newTier === "PLATINUM") {
      await awardPointsToUser(userId, 200, "PROMOTION_BONUS", "Platinum tier upgrade bonus")
    }
  }
}

export async function processOrderPoints(orderId: string, pointsMultiplier: number = 1) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  })

  if (!order) return

  // check if this is the user's first purchase
  const previousOrders = await prisma.order.count({
    where: {
      userId: order.userId,
      createdAt: { lt: order.createdAt },
    },
  })

  const isFirstPurchase = previousOrders === 0
  const basePointsEarned = calculatePointsEarned(order.totalAmount, isFirstPurchase)
  const pointsEarned = Math.floor(basePointsEarned * pointsMultiplier)

  if (pointsEarned > 0) {
    await awardPointsToUser(
      order.userId,
      pointsEarned,
      "PURCHASE",
      `Points earned from order #${orderId}${pointsMultiplier > 1 ? ` (${pointsMultiplier}x campaign multiplier)` : ''}`,
      orderId
    )

    // update user's total spent and tier
    await prisma.user.update({
      where: { id: order.userId },
      data: {
        totalSpent: {
          increment: order.totalAmount,
        },
      },
    })

    await updateUserTier(order.userId)
  }
}

export async function processReferralBonus(referrerId: string, referredUserId: string) {
  // check if referrer has already received bonus for this referral
  const existingBonus = await prisma.pointsTransaction.findFirst({
    where: {
      userId: referrerId,
      type: "REFERRAL_BONUS",
      description: {
        contains: referredUserId,
      },
    },
  })

  if (!existingBonus) {
    await awardPointsToUser(
      referrerId,
      200, // 200 points for successful referral
      "REFERRAL_BONUS",
      `Referral bonus for user ${referredUserId}`,
      referredUserId
    )
  }
}
