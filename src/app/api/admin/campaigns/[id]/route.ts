import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const body = await request.json()
    const {
      title,
      description,
      type,
      discountType,
      discountValue,
      minPurchase,
      pointsMultiplier,
      isActive,
      usageLimit,
      startDate,
      endDate,
    } = body

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        title,
        description,
        type,
        discountType,
        discountValue,
        minPurchase,
        pointsMultiplier,
        isActive,
        usageLimit,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error("Campaign update error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.campaign.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Campaign deleted successfully" })
  } catch (error) {
    console.error("Campaign deletion error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
