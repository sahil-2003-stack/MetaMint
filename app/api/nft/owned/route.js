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
    // Get user's wallet address
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, walletAddress: true }
    });
    if (!dbUser?.walletAddress) {
      return NextResponse.json({ error: 'No wallet address found' }, { status: 400 });
    }
    // Fetch NFTs from database that belong to this user
    const dbNFTs = await prisma.nFT.findMany({
      where: {
        userId: user.id,
      },
      include: {
        user: {
          select: { id: true, username: true, membershipTier: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Transform database NFTs
    const ownedNFTs = dbNFTs.map(nft => ({
      id: nft.id,
      tokenId: nft.tokenId,
      contract: nft.contract,
      name: nft.name || `NFT #${nft.tokenId}`,
      description: nft.description || `A unique ${nft.tier} tier NFT`,
      image: nft.image || '/placeholder.svg',
      tier: nft.tier,
      isMembership: nft.isMembership,
      isCoreDrop: nft.isCoreDrop,
      isPartnerDrop: nft.isPartnerDrop,
      partnerSource: nft.partnerSource,
      metadata: nft.metadata,
      owner: nft.user?.username || 'You',
      createdAt: nft.createdAt,
      source: 'database'
    }));
    // In a real implementation, you would also fetch from blockchain
    // For now, we'll simulate some blockchain NFTs
    const blockchainNFTs = [
      {
        id: 'blockchain-1',
        tokenId: 2001,
        contract: '0x178F5395004Ee2DEEadf30F970E3Ccc887fe69DA', // Your deployed contract
        name: 'Blockchain NFT #1',
        description: 'NFT minted directly on blockchain',
        image: '/placeholder.svg',
        tier: 'silver',
        isMembership: false,
        isCoreDrop: true,
        isPartnerDrop: false,
        partnerSource: null,
        metadata: {
          blockchain: true,
          tokenURI: 'ipfs://QmExample...'
        },
        owner: 'You',
        createdAt: new Date().toISOString(),
        source: 'blockchain'
      }
    ];
    // Combine both sources
    const allNFTs = [...ownedNFTs, ...blockchainNFTs];
    return NextResponse.json({
      nfts: allNFTs,
      total: allNFTs.length,
      databaseCount: ownedNFTs.length,
      blockchainCount: blockchainNFTs.length
    });
  } catch (error) {
    console.error('Error fetching owned NFTs:', error);
    return NextResponse.json({ error: 'Failed to fetch owned NFTs' }, { status: 500 });
  }
} 