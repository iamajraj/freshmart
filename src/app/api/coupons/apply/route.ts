import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { code, orderTotal }: { code: string; orderTotal: number } = await request.json()

    if (!code || !orderTotal) {
      return NextResponse.json(
        { message: "Code and order total are required" },
        { status: 400 }
      )
    }

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json(
        { message: "Invalid coupon code" },
        { status: 400 }
      )
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { message: "This coupon is no longer active" },
        { status: 400 }
      )
    }

    // Check date validity
    const now = new Date()
    if (coupon.startDate && coupon.startDate > now) {
      return NextResponse.json(
        { message: "This coupon is not yet valid" },
        { status: 400 }
      )
    }
    if (coupon.endDate && coupon.endDate < now) {
      return NextResponse.json(
        { message: "This coupon has expired" },
        { status: 400 }
      )
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { message: "This coupon has reached its usage limit" },
        { status: 400 }
      )
    }

    // Check minimum purchase
    if (coupon.minPurchase && orderTotal < coupon.minPurchase) {
      return NextResponse.json(
        { message: `Minimum purchase of $${coupon.minPurchase} required` },
        { status: 400 }
      )
    }

    // Check per-user usage limit
    if (coupon.usageLimitPerUser) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId: session.user.id,
        },
      })

      if (userUsageCount >= coupon.usageLimitPerUser) {
        return NextResponse.json(
          { message: `You have already used this coupon the maximum number of times (${coupon.usageLimitPerUser})` },
          { status: 400 }
        )
      }
    }

    // Calculate discount amount
    let discountAmount = 0
    let freeShipping = false

    if (coupon.discountType === "FREE_SHIPPING") {
      freeShipping = true
    } else if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (orderTotal * coupon.discountValue!) / 100
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount
      }
    } else if (coupon.discountType === "FIXED") {
      discountAmount = coupon.discountValue!
    }

    return NextResponse.json({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountAmount,
      freeShipping,
      type: coupon.discountType,
    })
  } catch (error) {
    console.error("Coupon application error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
