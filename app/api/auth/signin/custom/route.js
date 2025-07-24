import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    
    console.log('🔍 Custom sign-in with:', { email, hasPassword: !!password });
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    
    // Find user
    const user = await prisma.user.findFirst({
      where: { email }
    });
    
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isValid);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    // Create a simple JWT token
    const token = sign(
      { 
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.walletAddress,
        membershipTier: user.membershipTier,
        loyaltyPoints: user.loyaltyPoints
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Authentication successful for user:', user.email);
    
    // Set cookie and redirect
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.walletAddress,
        membershipTier: user.membershipTier,
        loyaltyPoints: user.loyaltyPoints,
        profileImage: user.profileImage,
        profileBanner: user.profileBanner,
        createdAt: user.createdAt
      },
      token,
      message: 'Authentication successful'
    });
    
    // Set a custom session cookie
    response.cookies.set('custom-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('💥 Custom sign-in error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 