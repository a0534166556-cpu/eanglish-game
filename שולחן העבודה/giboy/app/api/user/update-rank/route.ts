import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRankByPoints, calculateTotalScore, calculateProgress } from '@/lib/rankSystem';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // קבל נתוני משתמש
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // חשב ניקוד כולל
    const totalScore = calculateTotalScore({
      points: user.points,
      gamesWon: user.gamesWon,
      gamesPlayed: user.gamesPlayed
    });

    // קבע דרגה חדשה
    const newRank = getRankByPoints(totalScore);
    const progress = calculateProgress(totalScore);
    const oldRank = (user as any).rank;

    // עדכן דרגה אם השתנתה
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        rank: newRank.id,
        rankProgress: progress
      } as any
    });

    // בדוק אם עלה דרגה
    const rankUp = oldRank !== newRank.id;

    return NextResponse.json({
      success: true,
      rank: newRank,
      progress,
      rankUp,
      totalScore,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating rank:', error);
    return NextResponse.json({ error: 'Failed to update rank' }, { status: 500 });
  }
}



