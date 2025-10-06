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
        profileImage: user.profileImage || null,
        avatarId: user.avatarId || null,
        ownedAvatars: user.ownedAvatars || null,
        selectedTag: user.selectedTag || null,
        ownedTags: user.ownedTags || null,
        rank: user.rank || 'beginner',
        rankProgress: user.rankProgress || 0,
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
