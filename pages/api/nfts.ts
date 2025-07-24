import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // List all NFTs
    try {
      const nfts = await prisma.nFT.findMany({
        include: {
          user: {
            select: { id: true, username: true, email: true, membershipTier: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json({ nfts });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch NFTs' });
    }
  }

  if (req.method === 'POST') {
    // Create a new NFT
    const { tokenId, contract, userId, tier } = req.body;
    if (!tokenId || !contract || !userId || !tier) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!['bronze', 'silver', 'gold'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }
    try {
      const nft = await prisma.nFT.create({
        data: {
          tokenId: Number(tokenId),
          contract,
          userId,
          tier,
        },
      });
      return res.status(201).json({ nft });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create NFT' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
