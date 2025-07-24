import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const nfts = await prisma.nFT.findMany({
      where: {
        isCoreDrop: true,
        isMembership: false, // Exclude membership NFTs from drops
      },
      include: {
        user: {
          select: { id: true, username: true, membershipTier: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform the data to match the expected format
    const drops = nfts.map(nft => ({
      id: nft.id,
      tokenId: nft.tokenId,
      contract: nft.contract,
      name: nft.name || `Core Drop #${nft.tokenId}`,
      description: nft.description || `A unique ${nft.tier} tier NFT from our core collection`,
      image: nft.image || '/placeholder.svg',
      price: nft.price || '0.05',
      tier: nft.tier,
      isCoreDrop: true,
      isPartnerDrop: false,
      partnerSource: null,
      metadata: nft.metadata,
      owner: nft.user?.username || 'Unknown',
      createdAt: nft.createdAt,
    }));

    return NextResponse.json({ drops });
  } catch (error) {
    console.error('Error fetching core drops:', error);
    return NextResponse.json({ error: 'Failed to fetch core drops' }, { status: 500 });
  }
} 