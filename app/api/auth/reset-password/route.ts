import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Import reset tokens from forgot-password route
// In production, use Redis or database for this
const resetTokens = new Map<string, { email: string; expires: number; used: boolean }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get token data
    const tokenData = resetTokens.get(token);

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    if (tokenData.used) {
      return NextResponse.json(
        { error: 'Token already used' },
        { status: 400 }
      );
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { email: tokenData.email },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    // Mark token as used
    tokenData.used = true;
    resetTokens.set(token, tokenData);

    // In production, also invalidate all user sessions
    // await prisma.session.deleteMany({
    //   where: { userId: user.id }
    // });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    // console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


