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

    const { rewardId, pointsCost } = await req.json();

    if (!rewardId || !pointsCost) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's current data
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, loyaltyPoints: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (dbUser.loyaltyPoints < pointsCost) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Deduct points from user
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { loyaltyPoints: dbUser.loyaltyPoints - pointsCost }
      });

      // Record the points spent transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'LOYALTY_SPENT',
          amount: pointsCost.toString(),
          description: `Redeemed reward #${rewardId}`,
          status: 'COMPLETED',
          metadata: {
            rewardId: rewardId,
            pointsSpent: pointsCost,
            previousPoints: dbUser.loyaltyPoints,
            newPoints: updatedUser.loyaltyPoints
          }
        }
      });

      // Handle different reward types
      let rewardData = null;
      
      // For NFT rewards, create the NFT record
      if (rewardId >= 1 && rewardId <= 3) { // NFT rewards
        const tierMap = { 1: 'bronze', 2: 'silver', 3: 'gold' };
        const tier = tierMap[rewardId];
        
        rewardData = await tx.nFT.create({
          data: {
            tokenId: Date.now() + Math.random(), // Generate unique token ID
            contract: '0x178F5395004Ee2DEEadf30F970E3Ccc887fe69DA',
            userId: user.id,
            tier: tier,
            name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Loyalty NFT`,
            description: `Exclusive ${tier} tier NFT earned through loyalty points`,
            image: `/placeholder.svg`,
            price: '0', // Free through loyalty points
            isCoreDrop: false,
            isMembership: false,
            isPartnerDrop: false,
            metadata: {
              source: 'loyalty_reward',
              rewardId: rewardId,
              pointsCost: pointsCost
            }
          }
        });
      }

      return {
        transaction,
        rewardData,
        newLoyaltyPoints: updatedUser.loyaltyPoints
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Reward redeemed successfully',
      newLoyaltyPoints: result.newLoyaltyPoints,
      rewardData: result.rewardData
    });

  } catch (error) {
    console.error('Loyalty redeem error:', error);
    return NextResponse.json({ error: 'Failed to redeem reward' }, { status: 500 });
  }
} 