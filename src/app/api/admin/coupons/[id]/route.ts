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

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        minPurchase,
        maxDiscount,
        isActive,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit,
        usageLimitPerUser,
      },
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Coupon update error:", error)
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

    await prisma.coupon.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Coupon deleted successfully" })
  } catch (error) {
    console.error("Coupon deletion error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
