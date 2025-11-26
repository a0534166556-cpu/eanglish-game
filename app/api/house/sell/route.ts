import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, itemId } = await request.json();

    if (!userId || !itemId) {
      return NextResponse.json(
        { error: 'User ID and item ID are required' },
        { status: 400 }
      );
    }

    // Find the house item
    const houseItem = await prisma.houseItem.findUnique({
      where: { id: itemId },
      include: { shopItem: true }
    });

    if (!houseItem) {
      return NextResponse.json(
        { error: 'House item not found' },
        { status: 404 }
      );
    }

    // Calculate sell price (70% of original price)
    const sellPrice = Math.floor(houseItem.shopItem.price * 0.7);

    // Update user's diamonds
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        diamonds: user.diamonds + sellPrice
      }
    });

    // Delete the house item
    await prisma.houseItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({
      success: true,
      sellPrice: sellPrice,
      remainingDiamonds: updatedUser.diamonds
    });

  } catch (error) {
    console.error('Error selling item:', error);
    return NextResponse.json(
      { error: 'Failed to sell item' },
      { status: 500 }
    );
  }
}
