import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, avatarId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // עדכן אווטאר נבחר
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarId: avatarId || null,
        updatedAt: new Date()
      } as any
    });

    return NextResponse.json({
      success: true,
      avatarId: (user as any).avatarId
    });
  } catch (err) {
    console.error('Select avatar error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}



