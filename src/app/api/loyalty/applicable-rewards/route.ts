import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get approved rewards that haven't been used yet
    const applicableRewards = await prisma.redeemedReward.findMany({
      where: {
        userId: session.user.id,
        status: "APPROVED",
      },
      include: {
        reward: true,
      },
      orderBy: {
        redeemedAt: "asc", // Use oldest first
      },
    })

    // Categorize rewards by type
    const categorizedRewards = {
      discounts: applicableRewards.filter(r => r.reward.type === "DISCOUNT"),
      freeDelivery: applicableRewards.filter(r => r.reward.type === "FREE_DELIVERY"),
      freeProducts: applicableRewards.filter(r => r.reward.type === "FREE_PRODUCT"),
      cashback: applicableRewards.filter(r => r.reward.type === "CASHBACK"),
    }

    return NextResponse.json(categorizedRewards)
  } catch (error) {
    console.error("Applicable rewards fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
