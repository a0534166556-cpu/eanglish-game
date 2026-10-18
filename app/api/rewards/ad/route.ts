import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, type, amount } = await request.json();

    if (!userId || !type || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, and amount are required' },
        { status: 400 }
      );
    }

    // Validate reward type
    const validTypes = ['diamonds', 'coins', 'points'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid reward type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user's currency based on reward type
    const updateData: any = {};
    if (type === 'diamonds') {
      updateData.diamonds = { increment: amount };
    } else if (type === 'coins') {
      updateData.coins = { increment: amount };
    } else if (type === 'points') {
      updateData.points = { increment: amount };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        diamonds: true,
        coins: true,
        points: true
      }
    });

    return NextResponse.json({
      success: true,
      reward: {
        type,
        amount
      },
      user: {
        id: updatedUser.id,
        diamonds: updatedUser.diamonds,
        coins: updatedUser.coins,
        points: updatedUser.points
      }
    });

  } catch (error) {
    console.error('Error updating ad reward:', error);
    return NextResponse.json(
      { error: 'Failed to update ad reward' },
      { status: 500 }
    );
  }
}




