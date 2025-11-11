import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface ApplyRewardsRequest {
  rewardIds: string[]
  orderTotal: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { rewardIds, orderTotal }: ApplyRewardsRequest = await request.json()

    if (!rewardIds || !Array.isArray(rewardIds)) {
      return NextResponse.json(
        { message: "Invalid reward IDs" },
        { status: 400 }
      )
    }

    // Get the rewards to apply
    const rewardsToApply = await prisma.redeemedReward.findMany({
      where: {
        id: { in: rewardIds },
        userId: session.user.id,
        status: "APPROVED",
      },
      include: {
        reward: true,
      },
    })

    if (rewardsToApply.length === 0) {
      return NextResponse.json(
        { message: "No applicable rewards found" },
        { status: 400 }
      )
    }

    // Calculate total discount from rewards
    let totalDiscount = 0
    let freeDeliveryApplied = false

    for (const redeemedReward of rewardsToApply) {
      if (redeemedReward.reward.type === "DISCOUNT") {
        totalDiscount += redeemedReward.reward.value
      } else if (redeemedReward.reward.type === "FREE_DELIVERY") {
        freeDeliveryApplied = true
      }
    }

    // Apply rewards and mark as used
    await prisma.$transaction(async (tx) => {
      for (const redeemedReward of rewardsToApply) {
        await tx.redeemedReward.update({
          where: { id: redeemedReward.id },
          data: {
            status: "USED",
            usedAt: new Date(),
          },
        })
      }
    })

    const appliedRewards = {
      discountAmount: totalDiscount,
      freeDelivery: freeDeliveryApplied,
      appliedRewardIds: rewardsToApply.map(r => r.id),
      appliedRewards: rewardsToApply.map(r => ({
        id: r.id,
        name: r.reward.name,
        type: r.reward.type,
        value: r.reward.value,
      })),
    }

    return NextResponse.json(appliedRewards)
  } catch (error) {
    console.error("Apply rewards error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
