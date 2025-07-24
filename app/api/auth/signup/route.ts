import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcrypt"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(req) {
  try {
    const formData = await req.formData()
    
    const username = formData.get("username")
    const email = formData.get("email")
    const walletAddress = formData.get("walletAddress")
    const password = formData.get("password")
    const profileImage = formData.get("profileImage")
    const profileBanner = formData.get("profileBanner")

    // Validation
    if (!username || !email || !walletAddress || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { walletAddress },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email, wallet address, or username" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Handle file uploads
    let profileImageUrl = null
    let profileBannerUrl = null

    if (profileImage && profileImage instanceof File) {
      const bytes = await profileImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `profile-${Date.now()}-${profileImage.name}`
      const filePath = path.join(process.cwd(), "public", "uploads", fileName)
      await writeFile(filePath, buffer)
      profileImageUrl = `/uploads/${fileName}`
    }

    if (profileBanner && profileBanner instanceof File) {
      const bytes = await profileBanner.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `banner-${Date.now()}-${profileBanner.name}`
      const filePath = path.join(process.cwd(), "public", "uploads", fileName)
      await writeFile(filePath, buffer)
      profileBannerUrl = `/uploads/${fileName}`
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        walletAddress,
        password: hashedPassword,
        profileImage: profileImageUrl,
        profileBanner: profileBannerUrl,
        membershipTier: "Bronze", // Default tier
        loyaltyPoints: 0,
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    // DEBUG: Log the user object before returning
    console.log('Signup API returning user:', userWithoutPassword)
    // Ensure all fields are present
    return NextResponse.json({
      user: {
        id: userWithoutPassword.id,
        username: userWithoutPassword.username,
        email: userWithoutPassword.email,
        walletAddress: userWithoutPassword.walletAddress,
        profileImage: userWithoutPassword.profileImage,
        profileBanner: userWithoutPassword.profileBanner,
        membershipTier: userWithoutPassword.membershipTier,
        loyaltyPoints: userWithoutPassword.loyaltyPoints,
        createdAt: userWithoutPassword.createdAt,
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
