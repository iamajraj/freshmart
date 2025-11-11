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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { loyaltyPoints: true },
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Get all active rewards that user can afford
    const rewards = await prisma.reward.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        pointsCost: true,
        value: true,
        type: true,
      },
      orderBy: { pointsCost: "asc" },
    })

    // Add affordability info
    const rewardsWithAvailability = rewards.map(reward => ({
      ...reward,
      canAfford: user.loyaltyPoints >= reward.pointsCost,
    }))

    return NextResponse.json(rewardsWithAvailability)
  } catch (error) {
    console.error("Rewards fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
