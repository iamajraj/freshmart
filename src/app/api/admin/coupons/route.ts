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

    const coupons = await prisma.coupon.findMany({
      include: {
        _count: {
          select: {
            couponUsages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Add usageCount to each coupon
    const couponsWithUsage = coupons.map(coupon => ({
      ...coupon,
      usageCount: coupon._count.couponUsages,
    }))

    return NextResponse.json(couponsWithUsage)
  } catch (error) {
    console.error("Coupons fetch error:", error)
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
      code,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      isActive,
      startDate,
      endDate,
      usageLimit,
      usageLimitPerUser,
    } = body

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        minPurchase,
        maxDiscount,
        isActive: isActive ?? true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit,
        usageLimitPerUser,
      },
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error("Coupon creation error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
