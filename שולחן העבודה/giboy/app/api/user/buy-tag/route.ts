import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, tagId, price } = await req.json();

    if (!userId || !tagId || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.coins < price) {
      return NextResponse.json({ error: 'Not enough coins' }, { status: 400 });
    }

    let ownedTags = user.ownedTags ? JSON.parse(user.ownedTags) : [];
    if (ownedTags.includes(tagId)) {
      return NextResponse.json({ error: 'Tag already owned' }, { status: 400 });
    }

    ownedTags.push(tagId);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        coins: user.coins - price,
        ownedTags: JSON.stringify(ownedTags),
      },
    });

    return NextResponse.json({ 
      success: true, 
      coins: updatedUser.coins, 
      ownedTags: updatedUser.ownedTags 
    });
  } catch (error) {
    console.error('Error buying tag:', error);
    return NextResponse.json({ error: 'Failed to buy tag' }, { status: 500 });
  }
}



