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

    const { 
      nftId, 
      originalPrice, 
      finalPrice, 
      pointsUsed, 
      pointsToEarn,
      transactionHash,
      nftData 
    } = await req.json();

    if (!nftId || !originalPrice || !finalPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's current data
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, loyaltyPoints: true, membershipTier: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Deduct loyalty points if used
      let newLoyaltyPoints = dbUser.loyaltyPoints || 0;
      if (pointsUsed && pointsUsed > 0) {
        newLoyaltyPoints = Math.max(0, newLoyaltyPoints - pointsUsed);
      }
      // Add earned loyalty points
      if (pointsToEarn && pointsToEarn > 0) {
        newLoyaltyPoints += pointsToEarn;
      }
      // Update user's loyalty points
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { loyaltyPoints: newLoyaltyPoints }
      });
      // Record the purchase transaction
      const purchaseTransaction = await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'PURCHASE',
          amount: finalPrice.toString(),
          description: `Purchased NFT ${nftId} for ${finalPrice} ETH`,
          status: 'COMPLETED',
          metadata: {
            nftId,
            originalPrice,
            finalPrice,
            pointsUsed,
            pointsToEarn,
            transactionHash,
            nftData
          }
        }
      });
      // Record loyalty points usage if any
      if (pointsUsed && pointsUsed > 0) {
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'LOYALTY_USED',
            amount: pointsUsed.toString(),
            description: `Used ${pointsUsed} loyalty points for purchase discount`,
            status: 'COMPLETED',
            metadata: {
              nftId,
              pointsValue: (pointsUsed * 0.0001).toString()
            }
          }
        });
      }
      // Record loyalty points earned
      if (pointsToEarn && pointsToEarn > 0) {
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'LOYALTY_EARNED',
            amount: pointsToEarn.toString(),
            description: `Earned ${pointsToEarn} loyalty points from purchase`,
            status: 'COMPLETED',
            metadata: {
              nftId,
              originalPrice
            }
          }
        });
      }
      return {
        updatedUser,
        purchaseTransaction,
        newLoyaltyPoints
      };
    });
    return NextResponse.json({
      success: true,
      message: 'Purchase completed successfully',
      newLoyaltyPoints: result.newLoyaltyPoints,
      pointsEarned: pointsToEarn,
      pointsUsed: pointsUsed
    });
  } catch (error) {
    console.error('Purchase complete error:', error);
    return NextResponse.json({ error: 'Failed to complete purchase' }, { status: 500 });
  }
} 