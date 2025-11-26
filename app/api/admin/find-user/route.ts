import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: (user as any).profileImage || null,
        avatarId: (user as any).avatarId || null,
        ownedAvatars: (user as any).ownedAvatars || null,
        selectedTag: (user as any).selectedTag || null,
        ownedTags: (user as any).ownedTags || null,
        rank: (user as any).rank || 'beginner',
        rankProgress: (user as any).rankProgress || 0,
        diamonds: user.diamonds,
        coins: user.coins,
        level: user.level,
        points: user.points,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon
      }
    });

  } catch (error) {
    console.error('Error finding user:', error);
    return NextResponse.json(
      { error: 'Failed to find user' },
      { status: 500 }
    );
  }
}
