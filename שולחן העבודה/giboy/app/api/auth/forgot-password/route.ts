import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// In-memory store for reset tokens (in production, use Redis or database)
const resetTokens = new Map<string, { email: string; expires: number; used: boolean }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour

    // Store token
    resetTokens.set(token, {
      email: user.email,
      expires,
      used: false
    });

    // In production, send email here
    // For now, we'll just return the token for testing
    console.log(`Reset token for ${email}: ${token}`);

    return NextResponse.json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
      // Remove this in production - only for testing
      token: token
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Note: resetTokens is stored in memory and shared across requests
// In production, use Redis or database for token storage
