import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, diamonds, coins } = await request.json();

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'User ID or email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email: email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user currency
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        diamonds: diamonds !== undefined ? diamonds : user.diamonds,
        coins: coins !== undefined ? coins : user.coins
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        diamonds: updatedUser.diamonds,
        coins: updatedUser.coins
      }
    });

  } catch (error) {
    console.error('Error updating user currency:', error);
    return NextResponse.json(
      { error: 'Failed to update user currency' },
      { status: 500 }
    );
  }
}
