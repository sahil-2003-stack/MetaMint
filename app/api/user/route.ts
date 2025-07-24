import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST /api/user - creates or returns user by walletAddress
export async function POST(req) {
  try {
    const { walletAddress } = await req.json()

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address missing" }, { status: 400 })
    }

    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: { walletAddress },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("API POST /user error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// GET /api/user?walletAddress=...
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get("walletAddress")

    if (!walletAddress) {
      return NextResponse.json({ error: "Missing walletAddress" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        nfts: true,
        // transactions: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("API GET /user error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
