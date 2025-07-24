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
    const { items, loyaltyPointsUsed, totalAmount, discountAmount = 0, currency = 'usd' } = await req.json();
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }
    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
    }
    // Get user's current loyalty points
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, loyaltyPoints: true, membershipTier: true }
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Calculate loyalty points to use (if any)
    const pointsToUse = loyaltyPointsUsed ? Math.min(dbUser.loyaltyPoints || 0, 1000) : 0; // Max 1000 points per transaction
    const pointsValue = pointsToUse * 0.0001; // 1 point = 0.0001 ETH
    // Calculate final amount after discount
    const finalAmount = Math.max(totalAmount - discountAmount - pointsValue, 0);
    // Stripe expects amount in cents (or smallest currency unit)
    const stripeAmount = Math.round(finalAmount * 100);
    // Create a Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency,
      metadata: {
        userId: dbUser.id,
        items: JSON.stringify(items),
        pointsUsed: pointsToUse,
        pointsValue: pointsValue,
      },
    });
    // Optionally, create a pending order in DB here (status: PENDING)
    // ...
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: finalAmount,
      currency,
      message: 'Payment intent created',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
} 