import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get total counts
    const [totalUsers, totalProducts, totalOrders, totalRevenueResult] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),
    ])

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Get low stock products (stock <= 5)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 5,
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
      orderBy: { stock: "asc" },
    })

    const stats = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenueResult._sum.totalAmount || 0,
      recentOrders,
      lowStockProducts,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
