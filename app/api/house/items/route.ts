import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const houseId = searchParams.get('houseId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // אם לא צוין houseId, טען את הבית ברירת המחדל
    let whereClause: any = { userId };
    if (houseId) {
      whereClause.houseId = houseId;
    } else {
      // מצא את הבית ברירת המחדל
      const defaultHouse = await prisma.house.findFirst({
        where: { userId, isDefault: true }
      });
      if (defaultHouse) {
        whereClause.houseId = defaultHouse.id;
      } else {
        // אם אין בית ברירת מחדל, טען פריטים ללא houseId (פריטים ישנים)
        whereClause.houseId = null;
      }
    }

    const houseItems = await prisma.houseItem.findMany({
      where: whereClause,
      include: {
        shopItem: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ houseItems });
  } catch (error) {
    console.error('Error fetching house items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch house items' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { itemId, positionX, positionY, rotation, scale, isPlaced } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (positionX !== undefined) updateData.positionX = positionX;
    if (positionY !== undefined) updateData.positionY = positionY;
    if (rotation !== undefined) updateData.rotation = rotation;
    if (scale !== undefined) updateData.scale = scale;
    if (isPlaced !== undefined) updateData.isPlaced = isPlaced;

    const houseItem = await prisma.houseItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        shopItem: true
      }
    });

    return NextResponse.json({ houseItem });
  } catch (error) {
    console.error('Error updating house item:', error);
    return NextResponse.json(
      { error: 'Failed to update house item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    await prisma.houseItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting house item:', error);
    return NextResponse.json(
      { error: 'Failed to delete house item' },
      { status: 500 }
    );
  }
}
