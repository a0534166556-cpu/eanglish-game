import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');

    const where: any = { isActive: true };
    
    if (category) {
      where.category = category;
    }
    
    if (rarity) {
      where.rarity = rarity;
    }

    const items = await prisma.shopItem.findMany({
      where,
      orderBy: [
        { rarity: 'asc' },
        { price: 'asc' }
      ]
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching shop items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, itemId } = await request.json();

    if (!userId || !itemId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // בדיקה אם המשתמש קיים
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // בדיקה אם הפריט קיים
    const shopItem = await prisma.shopItem.findUnique({
      where: { id: itemId }
    });

    if (!shopItem || !shopItem.isActive) {
      return NextResponse.json(
        { error: 'Item not found or not available' },
        { status: 404 }
      );
    }

    // בדיקה אם למשתמש יש מספיק יהלומים
    if (user.diamonds < shopItem.price) {
      return NextResponse.json(
        { error: 'Insufficient diamonds' },
        { status: 400 }
      );
    }

    // קביעת scale לפי סוג הפריט
    let defaultScale = 1.5; // ברירת מחדל גדולה יותר
    if (shopItem.name.includes('ספה')) defaultScale = 3.0; // ספה ענקית!
    else if (shopItem.name.includes('מיטה')) defaultScale = 2.5;
    else if (shopItem.name.includes('שולחן')) defaultScale = 2.3;
    else if (shopItem.name.includes('שטיח')) defaultScale = 2.2;
    else if (shopItem.name.includes('ארון')) defaultScale = 2.0;
    else if (shopItem.name.includes('כיסא')) defaultScale = 1.8;
    
    // רכישת הפריט
    const houseItem = await prisma.houseItem.create({
      data: {
        userId,
        shopItemId: itemId,
        positionX: 0,
        positionY: 0,
        rotation: 0,
        scale: defaultScale,
        isPlaced: false
      }
    });

    // הפחתת יהלומים מהמשתמש
    await prisma.user.update({
      where: { id: userId },
      data: {
        diamonds: user.diamonds - shopItem.price
      }
    });

    return NextResponse.json({
      success: true,
      houseItem,
      remainingDiamonds: user.diamonds - shopItem.price
    });

  } catch (error) {
    console.error('Error purchasing item:', error);
    return NextResponse.json(
      { error: 'Failed to purchase item' },
      { status: 500 }
    );
  }
}
