import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { awardPointsToUser } from "@/lib/loyalty"
import { TransactionType } from "@prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Get user and reward info
    const [user, reward] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { loyaltyPoints: true },
      }),
      prisma.reward.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          pointsCost: true,
          type: true,
        },
      }),
    ])

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    if (!reward) {
      return NextResponse.json(
        { message: "Reward not found" },
        { status: 404 }
      )
    }

    if (user.loyaltyPoints < reward.pointsCost) {
      return NextResponse.json(
        { message: "Insufficient points" },
        { status: 400 }
      )
    }

    // Create redemption request (pending admin approval)
    const redeemedReward = await prisma.redeemedReward.create({
      data: {
        userId: session.user.id,
        rewardId: reward.id,
        status: "PENDING", // Requires admin approval
      },
    })

    // Points will be deducted after admin approval

    return NextResponse.json({
      message: "Reward redemption request submitted successfully",
      redeemedReward,
    })
  } catch (error) {
    console.error("Reward redemption error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
