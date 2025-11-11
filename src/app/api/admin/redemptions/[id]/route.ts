import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { awardPointsToUser } from "@/lib/loyalty"
import { TransactionType } from "@prisma/client"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const { action } = await request.json()

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      )
    }

    // Get the redemption request
    const redemption = await prisma.redeemedReward.findUnique({
      where: { id },
      include: { reward: true, user: true },
    })

    if (!redemption) {
      return NextResponse.json(
        { message: "Redemption not found" },
        { status: 404 }
      )
    }

    if (redemption.status !== "PENDING") {
      return NextResponse.json(
        { message: "Redemption is not pending" },
        { status: 400 }
      )
    }

    const newStatus = action === "approve" ? "APPROVED" : "REJECTED"

    // Update redemption status
    const updatedRedemption = await prisma.redeemedReward.update({
      where: { id },
      data: {
        status: newStatus,
        ...(action === "approve" && { usedAt: new Date() }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        reward: true,
      },
    })

    // If approving, deduct points from user
    if (action === "approve") {
      await awardPointsToUser(
        redemption.userId,
        -redemption.reward.pointsCost,
        TransactionType.REDEMPTION,
        `Approved redemption: ${redemption.reward.name}`,
        redemption.id
      )
    }

    return NextResponse.json({
      message: `Redemption ${action}d successfully`,
      redemption: updatedRedemption,
    })
  } catch (error) {
    console.error("Redemption update error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
