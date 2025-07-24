const { PrismaClient } = require('../prisma/lib/db');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Starting database seed...');

    // Create sample NFTs for the marketplace
    const sampleNFTs = [
      {
        tokenId: 1,
        contract: '0x178F5395004Ee2DEEadf30F970E3Ccc887fe69DA',
        name: 'Bronze Membership NFT',
        description: 'Entry level membership with basic benefits',
        image: '/placeholder.svg',
        price: '0.05',
        tier: 'bronze',
        isMembership: true,
        isCoreDrop: false,
        isPartnerDrop: false,
        metadata: {
          benefits: ['Basic access', 'Community chat', 'Monthly newsletter'],
          rarity: 'Common'
        }
      },
      {
        tokenId: 2,
        contract: '0x178F5395004Ee2DEEadf30F970E3Ccc887fe69DA',
        name: 'Silver Membership NFT',
        description: 'Mid-tier membership with enhanced benefits',
        image: '/placeholder.svg',
        price: '0.15',
        tier: 'silver',
        isMembership: true,
        isCoreDrop: false,
        isPartnerDrop: false,
        metadata: {
          benefits: ['All Bronze benefits', 'Exclusive events', 'Priority support'],
          rarity: 'Uncommon'
        }
      },
      {
        tokenId: 3,
        contract: '0x178F5395004Ee2DEEadf30F970E3Ccc887fe69DA',
        name: 'Gold Membership NFT',
        description: 'Premium membership with exclusive benefits',
        image: '/placeholder.svg',
        price: '0.5',
        tier: 'gold',
        isMembership: true,
        isCoreDrop: false,
        isPartnerDrop: false,
        metadata: {
          benefits: ['All Silver benefits', 'VIP access', 'Personal concierge'],
          rarity: 'Rare'
        }
      },
      {
        tokenId: 4,
        contract: '0x178F5395004Ee2DEEadf30F970E3Ccc887fe69DA',
        name: 'Exclusive Digital Artwork #1',
        description: 'Limited edition digital artwork by renowned artist',
        image: '/placeholder.svg',
        price: '0.2',
        tier: 'silver',
        isMembership: false,
        isCoreDrop: true,
        isPartnerDrop: false,
        metadata: {
          artist: 'Famous Artist',
          edition: '1 of 100',
          rarity: 'Rare'
        }
      },
      {
        tokenId: 5,
        contract: '0x178F5395004Ee2DEEadf30F970E3Ccc887fe69DA',
        name: 'Community Access Token',
        description: 'Access to our exclusive community channels',
        image: '/placeholder.svg',
        price: '0.1',
        tier: 'bronze',
        isMembership: false,
        isCoreDrop: true,
        isPartnerDrop: false,
        metadata: {
          access: ['Discord server', 'Telegram group', 'Community forum'],
          rarity: 'Common'
        }
      },
      {
        tokenId: 6,
        contract: '0x178F5395004Ee2DEEadf30F970E3Ccc887fe69DA',
        name: 'Event Ticket NFT',
        description: 'Ticket to our upcoming virtual event',
        image: '/placeholder.svg',
        price: '0.08',
        tier: 'bronze',
        isMembership: false,
        isCoreDrop: true,
        isPartnerDrop: false,
        metadata: {
          event: 'Virtual NFT Summit 2024',
          date: '2024-12-15',
          rarity: 'Common'
        }
      },
      {
        tokenId: 7,
        contract: '0x178F5395004Ee2DEEadf30F970E3Ccc887fe69DA',
        name: 'Legendary Collection #1',
        description: 'Ultra-rare collectible from our core collection',
        image: '/placeholder.svg',
        price: '1.0',
        tier: 'gold',
        isMembership: false,
        isCoreDrop: true,
        isPartnerDrop: false,
        metadata: {
          collection: 'Legendary Series',
          edition: '1 of 10',
          rarity: 'Legendary'
        }
      }
    ];

    // Clear existing NFTs
    console.log('Clearing existing NFTs...');
    await prisma.nFT.deleteMany({});

    // Create new NFTs
    console.log('Creating sample NFTs...');
    const createdNFTs = await Promise.all(
      sampleNFTs.map(nft => 
        prisma.nFT.create({
          data: nft
        })
      )
    );

    console.log(`✅ Successfully created ${createdNFTs.length} sample NFTs`);
    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed(); 