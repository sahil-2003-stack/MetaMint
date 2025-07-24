import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate fetching from external APIs (OpenSea, Rarible, etc.)
    // In a real implementation, you would make actual API calls to these services
    
    const partnerDrops = [
      {
        id: 'partner-1',
        tokenId: 1001,
        contract: '0x1234567890123456789012345678901234567890',
        name: 'Exclusive Partner NFT #1',
        description: 'A rare NFT from our partner collection',
        image: '/placeholder.svg',
        price: '0.1',
        tier: 'silver',
        isCoreDrop: false,
        isPartnerDrop: true,
        partnerSource: 'opensea',
        metadata: {
          externalUrl: 'https://opensea.io/assets/0x1234567890123456789012345678901234567890/1001',
          collection: 'Partner Collection',
          attributes: [
            { trait_type: 'Rarity', value: 'Rare' },
            { trait_type: 'Background', value: 'Blue' }
          ]
        },
        owner: 'Partner Gallery',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'partner-2',
        tokenId: 1002,
        contract: '0x2345678901234567890123456789012345678901',
        name: 'Limited Edition Partner NFT #2',
        description: 'Limited edition artwork from renowned artist',
        image: '/placeholder.svg',
        price: '0.25',
        tier: 'gold',
        isCoreDrop: false,
        isPartnerDrop: true,
        partnerSource: 'rarible',
        metadata: {
          externalUrl: 'https://rarible.com/token/0x2345678901234567890123456789012345678901/1002',
          collection: 'Limited Editions',
          attributes: [
            { trait_type: 'Rarity', value: 'Legendary' },
            { trait_type: 'Artist', value: 'Famous Artist' }
          ]
        },
        owner: 'Partner Gallery',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'partner-3',
        tokenId: 1003,
        contract: '0x3456789012345678901234567890123456789012',
        name: 'Community Partner NFT #3',
        description: 'Community-driven NFT with special benefits',
        image: '/placeholder.svg',
        price: '0.08',
        tier: 'bronze',
        isCoreDrop: false,
        isPartnerDrop: true,
        partnerSource: 'foundation',
        metadata: {
          externalUrl: 'https://foundation.app/0x3456789012345678901234567890123456789012/1003',
          collection: 'Community Collection',
          attributes: [
            { trait_type: 'Rarity', value: 'Common' },
            { trait_type: 'Community', value: 'Active' }
          ]
        },
        owner: 'Partner Gallery',
        createdAt: new Date().toISOString(),
      }
    ];

    return NextResponse.json({ drops: partnerDrops });
  } catch (error) {
    console.error('Error fetching partner drops:', error);
    return NextResponse.json({ error: 'Failed to fetch partner drops' }, { status: 500 });
  }
} 