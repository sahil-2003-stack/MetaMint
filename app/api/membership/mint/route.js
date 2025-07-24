import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req) {
  try {
    const { userId, tier } = await req.json();
    if (!userId || !tier) {
      return NextResponse.json({ error: 'Missing userId or tier' }, { status: 400 });
    }
    if (!['bronze', 'silver', 'gold'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Update user membershipTier
    const user = await prisma.user.update({
      where: { id: userId },
      data: { membershipTier: tier },
    });

    // Log the mint as a Transaction
    await prisma.transaction.create({
      data: {
        type: 'mintedMembership',
        description: `Minted ${tier} membership NFT`,
        amount: '0',
        status: 'success',
        userId,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Membership mint error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 