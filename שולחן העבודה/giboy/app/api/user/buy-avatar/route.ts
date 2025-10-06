import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, avatarId, price } = await req.json();
    
    if (!userId || !avatarId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // מצא משתמש
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // בדוק אם יש מספיק כסף
    if (user.coins < price) {
      return NextResponse.json({ error: 'Not enough coins' }, { status: 400 });
    }

    // קבל רשימת אווטארים שכבר נקנו
    const ownedAvatars = (user as any).ownedAvatars ? JSON.parse((user as any).ownedAvatars) : [];
    
    // בדוק אם כבר קנה את האווטאר
    if (ownedAvatars.includes(avatarId)) {
      return NextResponse.json({ error: 'Avatar already owned' }, { status: 400 });
    }

    // הוסף את האווטאר לרשימה
    ownedAvatars.push(avatarId);

    // עדכן במסד נתונים
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        coins: user.coins - price,
        ownedAvatars: JSON.stringify(ownedAvatars),
        updatedAt: new Date()
      } as any
    });

    return NextResponse.json({
      success: true,
      coins: updatedUser.coins,
      ownedAvatars: ownedAvatars
    });
  } catch (err) {
    console.error('Buy avatar error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}



