import { prisma } from "@/lib/db"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function PUT(req) {
  try {
    const formData = await req.formData()
    
    const userId = formData.get("userId")
    const username = formData.get("username")
    const email = formData.get("email")
    const walletAddress = formData.get("walletAddress")
    const password = formData.get("password")
    const profileImage = formData.get("profileImage")
    const profileBanner = formData.get("profileBanner")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check for conflicts with other users
    const conflicts = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          {
            OR: [
              { email: email || undefined },
              { walletAddress: walletAddress || undefined },
              { username: username || undefined }
            ]
          }
        ]
      }
    })

    if (conflicts.length > 0) {
      return NextResponse.json({ error: "Email, wallet address, or username already exists" }, { status: 400 })
    }

    // Prepare update data
    const updateData = {
      username: username || undefined,
      email: email || undefined,
      walletAddress: walletAddress || undefined,
    }

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Handle file uploads
    if (profileImage && profileImage instanceof File) {
      const bytes = await profileImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `profile-${Date.now()}-${profileImage.name}`
      const filePath = path.join(process.cwd(), "public", "uploads", fileName)
      await writeFile(filePath, buffer)
      updateData.profileImage = `/uploads/${fileName}`
    }

    if (profileBanner && profileBanner instanceof File) {
      const bytes = await profileBanner.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `banner-${Date.now()}-${profileBanner.name}`
      const filePath = path.join(process.cwd(), "public", "uploads", fileName)
      await writeFile(filePath, buffer)
      updateData.profileBanner = `/uploads/${fileName}`
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser
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
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
