const { PrismaClient } = require('../prisma/lib/db');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        walletAddress: '0x1234567890123456789012345678901234567890',
        password: hashedPassword,
        membershipTier: 'Bronze',
        loyaltyPoints: 100,
        profileImage: '/placeholder-user.jpg',
        profileBanner: '/placeholder.jpg',
      },
    });
    
    console.log('✅ Test user created successfully!');
    console.log('User ID:', testUser.id);
    console.log('Username:', testUser.username);
    console.log('Email:', testUser.email);
    console.log('Wallet Address:', testUser.walletAddress);
    console.log('Membership Tier:', testUser.membershipTier);
    console.log('Loyalty Points:', testUser.loyaltyPoints);
    console.log('\n📝 Login Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: testpassword123');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 