import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const campaigns = await prisma.campaign.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("Campaigns fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

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

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        type,
        discountType,
        discountValue,
        minPurchase,
        pointsMultiplier: pointsMultiplier || 1,
        isActive: isActive ?? true,
        usageLimit,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error("Campaign creation error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
