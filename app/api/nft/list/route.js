import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const nfts = await prisma.nFT.findMany({
      include: {
        user: {
          select: { id: true, username: true, membershipTier: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ nfts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { tokenId, contract, userId, tier } = await req.json();
    if (!tokenId || !contract || !userId || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!['bronze', 'silver', 'gold'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }
    const nft = await prisma.nFT.create({
      data: {
        tokenId: Number(tokenId),
        contract,
        userId,
        tier,
      },
    });
    return NextResponse.json({ nft }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create NFT' }, { status: 500 });
  }
} 