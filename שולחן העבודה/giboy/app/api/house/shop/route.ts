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
    const { userId, itemId, houseId } = await request.json();

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

    // בדיקת מנוי Premium להנחה של 50%
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: 'active',
        plan: { in: ['premium', 'yearly'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    // בדיקה אם המנוי עדיין פעיל
    let isPremium = false;
    if (subscription) {
      const now = new Date();
      const endDate = new Date(subscription.endDate);
      if (endDate > now) {
        isPremium = true;
      }
    }

    // חישוב מחיר עם הנחה של 50% למנוי Premium
    const finalPrice = isPremium ? Math.floor(shopItem.price * 0.5) : shopItem.price;

    // בדיקה אם למשתמש יש מספיק יהלומים
    if (user.diamonds < finalPrice) {
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
    
    // מצא את הבית הנוכחי של המשתמש
    // אם המשתמש שולח houseId, השתמש בו; אחרת, מצא את הבית ברירת המחדל
    let targetHouseId = houseId;
    
    if (!targetHouseId) {
      const currentHouse = await prisma.house.findFirst({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }]
      });
      targetHouseId = currentHouse?.id;
    }

    // אם אין בית, צור בית ברירת מחדל
    if (!targetHouseId) {
      const newHouse = await prisma.house.create({
        data: {
          userId,
          name: 'בית שלי',
          isDefault: true
        }
      });
      targetHouseId = newHouse.id;
    }

    // רכישת הפריט
    const houseItem = await prisma.houseItem.create({
      data: {
        userId,
        houseId: targetHouseId,
        shopItemId: itemId,
        positionX: 0,
        positionY: 0,
        rotation: 0,
        scale: defaultScale,
        isPlaced: false
      }
    });

    // הפחתת יהלומים מהמשתמש (עם הנחה אם יש מנוי Premium)
    await prisma.user.update({
      where: { id: userId },
      data: {
        diamonds: user.diamonds - finalPrice
      }
    });

    return NextResponse.json({
      success: true,
      houseItem,
      remainingDiamonds: user.diamonds - finalPrice,
      originalPrice: shopItem.price,
      finalPrice: finalPrice,
      discount: isPremium ? 50 : 0
    });

  } catch (error) {
    console.error('Error purchasing item:', error);
    return NextResponse.json(
      { error: 'Failed to purchase item' },
      { status: 500 }
    );
  }
}
