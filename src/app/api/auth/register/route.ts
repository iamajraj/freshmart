import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { processReferralBonus } from "@/lib/loyalty"
import { APP_CONFIG } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, referralCode } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      )
    }

    // Handle referral code if provided
    let referrerId = null
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode }
      })

      if (referrer) {
        referrerId = referrer.id
      } else {
        // Invalid referral code, but don't block registration
        console.log(`Invalid referral code provided: ${referralCode}`)
      }
    }

    // Hash password
    const hashedPassword = await hash(password, APP_CONFIG.PASSWORD_HASH_ROUNDS)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        referredById: referrerId,
      },
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
