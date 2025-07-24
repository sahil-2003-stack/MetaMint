import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

const getUserFromRequest = (req) => {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.replace('Bearer ', '');
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET);
  } catch {
    return null;
  }
};

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nftId, loyaltyPointsToUse, originalPrice } = await req.json();

    if (!nftId || !originalPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's current loyalty points
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, loyaltyPoints: true, membershipTier: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate maximum points that can be used (max 1000 points per transaction)
    const maxPointsToUse = Math.min(dbUser.loyaltyPoints || 0, 1000);
    const actualPointsToUse = Math.min(loyaltyPointsToUse || 0, maxPointsToUse);
    // Calculate discount (1 point = 0.0001 ETH)
    const pointsValue = actualPointsToUse * 0.0001;
    const discountedPrice = Math.max(parseFloat(originalPrice) - pointsValue, 0);
    // Calculate loyalty points to earn (5% of original price)
    const pointsToEarn = Math.floor(parseFloat(originalPrice) * 50); // 0.001 ETH = 50 points
    return NextResponse.json({
      success: true,
      originalPrice: parseFloat(originalPrice),
      discountedPrice: discountedPrice,
      pointsUsed: actualPointsToUse,
      pointsValue: pointsValue,
      pointsToEarn: pointsToEarn,
      userPoints: dbUser.loyaltyPoints,
      membershipTier: dbUser.membershipTier
    });
  } catch (error) {
    console.error('Purchase redeem error:', error);
    return NextResponse.json({ error: 'Failed to process purchase redemption' }, { status: 500 });
  }
} 