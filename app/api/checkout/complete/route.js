import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

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

    const { paymentIntentId, items, totalAmount } = await req.json();

    if (!paymentIntentId || !items || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
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
      // Create the order
      const order = await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'PURCHASE',
          amount: totalAmount.toString(),
          description: `Purchase of ${items.length} item(s)`,
          status: 'COMPLETED',
          metadata: {
            items: items,
            paymentIntentId: paymentIntentId,
            stripePaymentIntent: paymentIntent.id,
          }
        }
      });

      // Calculate loyalty points to earn (50 points per 0.001 ETH)
      const pointsToEarn = Math.floor(totalAmount * 50); // 0.001 ETH = 50 points

      if (pointsToEarn > 0) {
        // Add loyalty points
        await tx.user.update({
          where: { id: user.id },
          data: { loyaltyPoints: (dbUser.loyaltyPoints || 0) + pointsToEarn }
        });

        // Record loyalty points earned
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'LOYALTY_EARNED',
            amount: pointsToEarn.toString(),
            description: `Earned ${pointsToEarn} loyalty points from purchase`,
            status: 'COMPLETED',
            metadata: {
              orderId: order.id,
              purchaseAmount: totalAmount
            }
          }
        });
      }

      // Create NFT records for purchased items
      for (const item of items) {
        await tx.nFT.create({
          data: {
            tokenId: Date.now() + Math.random(), // Generate unique token ID
            contract: item.contract || '0x178F5395004Ee2DEEadf30F970E3Ccc887fe69DA',
            userId: user.id,
            tier: item.tier || 'bronze',
            name: item.name,
            description: item.description,
            image: item.image,
            price: item.price,
            isCoreDrop: item.isCoreDrop || false,
            isMembership: item.isMembership || false,
            isPartnerDrop: item.isPartnerDrop || false,
            partnerSource: item.partnerSource,
            metadata: item.metadata || {}
          }
        });
      }

      return {
        order,
        pointsEarned: pointsToEarn,
        newLoyaltyPoints: (dbUser.loyaltyPoints || 0) + pointsToEarn
      };
    });

    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      totalAmount,
      loyaltyPointsEarned: result.pointsEarned,
      newLoyaltyPoints: result.newLoyaltyPoints,
      message: 'Order completed successfully'
    });

  } catch (error) {
    console.error('Checkout complete error:', error);
    return NextResponse.json({ error: 'Failed to complete order' }, { status: 500 });
  }
} 