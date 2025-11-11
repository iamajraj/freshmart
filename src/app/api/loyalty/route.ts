import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getNextTierInfo } from "@/lib/loyalty"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        loyaltyPoints: true,
        loyaltyTier: true,
        totalSpent: true,
        _count: {
          select: {
            pointsTransactions: true,
          },
        },
      },
    })

    // Get redeemed rewards
    const redeemedRewards = await prisma.redeemedReward.findMany({
      where: { userId: session.user.id },
      include: {
        reward: true,
      },
      orderBy: { redeemedAt: "desc" },
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    const tierInfo = getNextTierInfo(user.loyaltyTier, user.totalSpent)

    // Get recent transactions
    const recentTransactions = await prisma.pointsTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      points: user.loyaltyPoints,
      tier: user.loyaltyTier,
      totalSpent: user.totalSpent,
      transactionCount: user._count.pointsTransactions,
      tierInfo,
      recentTransactions,
      redeemedRewards,
    })
  } catch (error) {
    console.error("Loyalty fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
