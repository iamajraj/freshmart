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

    const banners = await prisma.banner.findMany({
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ],
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error("Banners fetch error:", error)
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
    const { title, description, imageUrl, linkUrl, isActive, priority, startDate, endDate } = body

    const banner = await prisma.banner.create({
      data: {
        title,
        description,
        imageUrl,
        linkUrl,
        isActive: isActive ?? true,
        priority: priority ?? 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    console.error("Banner creation error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
