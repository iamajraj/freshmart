import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const cartItems = await prisma.cart.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const total = cartItems.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    )

    return NextResponse.json({
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    })
  } catch (error) {
    console.error("Cart fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = addToCartSchema.parse(body)

    // Check if product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    })

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      )
    }

    if (!product.isActive) {
      return NextResponse.json(
        { message: "Product is not available" },
        { status: 400 }
      )
    }

    if (product.stock < validatedData.quantity) {
      return NextResponse.json(
        { message: "Insufficient stock" },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: validatedData.productId,
        },
      },
    })

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + validatedData.quantity

      if (product.stock < newQuantity) {
        return NextResponse.json(
          { message: "Insufficient stock" },
          { status: 400 }
        )
      }

      const updatedItem = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      })

      return NextResponse.json(updatedItem)
    } else {
      // Create new cart item
      const cartItem = await prisma.cart.create({
        data: {
          userId: session.user.id,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      })

      return NextResponse.json(cartItem, { status: 201 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Add to cart error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
