import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const now = new Date()

    // Get the highest priority active banner that is currently within its date range
    const banner = await prisma.banner.findFirst({
      where: {
        isActive: true,
        OR: [
          {
            startDate: null,
            endDate: null,
          },
          {
            startDate: { lte: now },
            endDate: null,
          },
          {
            startDate: null,
            endDate: { gte: now },
          },
          {
            startDate: { lte: now },
            endDate: { gte: now },
          },
        ],
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    })

    if (!banner) {
      return NextResponse.json(null)
    }

    return NextResponse.json(banner)
  } catch (error) {
    console.error("Active banner fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
