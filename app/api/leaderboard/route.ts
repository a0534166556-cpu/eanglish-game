import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RANKS } from '@/lib/rankSystem';

export const dynamic = 'force-dynamic';

function getRankInfo(rankId: string) {
  return RANKS.find((r) => r.id === rankId) ?? RANKS[0];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50', 10)));

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        profileImage: true,
        selectedTag: true,
        rank: true,
        rankProgress: true,
        level: true,
        points: true,
        gamesPlayed: true,
        gamesWon: true,
        _count: {
          select: {
            achievements: { where: { isCompleted: true } },
          },
        },
      },
      orderBy: [{ level: 'desc' }, { points: 'desc' }, { gamesWon: 'desc' }],
      take: limit,
    });

    const leaderboard = users.map((user, index) => {
      const rankInfo = getRankInfo(user.rank);
      const winRate =
        user.gamesPlayed > 0
          ? Math.round((user.gamesWon / user.gamesPlayed) * 100)
          : 0;

      return {
        place: index + 1,
        id: user.id,
        name: user.name,
        profileImage: user.profileImage,
        selectedTag: user.selectedTag,
        level: user.level,
        rank: {
          id: rankInfo.id,
          name: rankInfo.name,
          icon: rankInfo.icon,
          color: rankInfo.color,
        },
        rankProgress: user.rankProgress,
        points: user.points,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        winRate,
        achievementsCompleted: user._count.achievements,
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
  }
}
