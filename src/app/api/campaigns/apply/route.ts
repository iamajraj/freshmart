import { NextRequest, NextResponse } from "next/server"
import { applyCampaigns } from "@/lib/campaigns-server"

export async function POST(request: NextRequest) {
  try {
    const { orderTotal, existingDiscounts = 0 } = await request.json()

    if (typeof orderTotal !== 'number' || orderTotal < 0) {
      return NextResponse.json(
        { message: "Invalid order total" },
        { status: 400 }
      )
    }

    const result = await applyCampaigns(orderTotal, existingDiscounts)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Campaign application error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
