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
        membershipTier: true,
        createdAt: true,
        loyaltyPoints: true
      }
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({
      membershipTier: dbUser.membershipTier || 'none',
      memberSince: dbUser.createdAt,
      loyaltyPoints: dbUser.loyaltyPoints || 0
    });
  } catch (error) {
    console.error('Membership status error:', error);
    return NextResponse.json({ error: 'Failed to fetch membership status' }, { status: 500 });
  }
} 