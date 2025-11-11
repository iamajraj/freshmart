import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get price range
    const priceStats = await prisma.product.aggregate({
      where: { isActive: true },
      _min: { price: true },
      _max: { price: true },
    })

    // Get categories with product counts
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: { where: { isActive: true } } }
        }
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json({
      priceRange: {
        min: priceStats._min.price || 0,
        max: priceStats._max.price || 100,
      },
      categories: categories.filter(cat => cat._count.products > 0),
    })
  } catch (error) {
    console.error("Error fetching filters:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
