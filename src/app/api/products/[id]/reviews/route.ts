import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
})

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
    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      )
    }

    // Check if user has purchased and received this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: id,
        order: {
          userId: session.user.id,
          status: "DELIVERED"
        }
      }
    })

    if (!hasPurchased) {
      return NextResponse.json(
        { message: "You must purchase and receive this product before leaving a review" },
        { status: 403 }
      )
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: id,
        },
      },
    })

    let review

    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: validatedData.rating,
          comment: validatedData.comment,
        },
        include: {
          user: {
            select: { name: true, image: true }
          }
        }
      })
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          userId: session.user.id,
          productId: id,
          rating: validatedData.rating,
          comment: validatedData.comment,
        },
        include: {
          user: {
            select: { name: true, image: true }
          }
        }
      })
    }

    return NextResponse.json(review, { status: existingReview ? 200 : 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("Review creation error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: {
        user: {
          select: { name: true, image: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Reviews fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
