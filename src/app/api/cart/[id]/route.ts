import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateCartSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
})

export async function PUT(
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
    const body = await request.json()
    const validatedData = updateCartSchema.parse(body)

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cart.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        product: true,
      },
    })

    if (!cartItem) {
      return NextResponse.json(
        { message: "Cart item not found" },
        { status: 404 }
      )
    }

    // Check stock availability
    if (cartItem.product.stock < validatedData.quantity) {
      return NextResponse.json(
        { message: "Insufficient stock" },
        { status: 400 }
      )
    }

    const updatedItem = await prisma.cart.update({
      where: { id },
      data: { quantity: validatedData.quantity },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Cart update error:", error)
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

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cart.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!cartItem) {
      return NextResponse.json(
        { message: "Cart item not found" },
        { status: 404 }
      )
    }

    await prisma.cart.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Cart item removed" })
  } catch (error) {
    console.error("Cart delete error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
