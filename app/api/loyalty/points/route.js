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

export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        loyaltyPoints: true,
        membershipTier: true,
        transactions: {
          where: { type: 'LOYALTY_EARNED' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { amount: true, description: true, createdAt: true }
        }
      }
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({
      points: dbUser.loyaltyPoints || 0,
      tier: dbUser.membershipTier || 'none',
      recentEarnings: dbUser.transactions
    });
  } catch (error) {
    console.error('Loyalty points error:', error);
    return NextResponse.json({ error: 'Failed to fetch loyalty points' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { action, amount, description } = await req.json();
    if (!action || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, loyaltyPoints: true }
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    let newPoints = dbUser.loyaltyPoints || 0;
    let transactionType = 'LOYALTY_EARNED';
    if (action === 'add') {
      newPoints += amount;
    } else if (action === 'use') {
      if (newPoints < amount) {
        return NextResponse.json({ error: 'Insufficient loyalty points' }, { status: 400 });
      }
      newPoints -= amount;
      transactionType = 'LOYALTY_USED';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { loyaltyPoints: newPoints }
    });
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: transactionType,
        amount: amount,
        description: description || `${action === 'add' ? 'Earned' : 'Used'} ${amount} loyalty points`,
        status: 'COMPLETED'
      }
    });
    return NextResponse.json({
      points: newPoints,
      message: `Successfully ${action === 'add' ? 'added' : 'used'} ${amount} loyalty points`
    });
  } catch (error) {
    console.error('Loyalty points update error:', error);
    return NextResponse.json({ error: 'Failed to update loyalty points' }, { status: 500 });
  }
} 