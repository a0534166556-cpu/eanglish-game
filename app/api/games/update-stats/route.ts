import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, gameName, score, won } = body;

    // won is optional, default to false if not provided
    const isWon = typeof won === 'boolean' ? won : (score > 0);

    if (!userId || !gameName || typeof score !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update game-specific stats
    const existingStat = await prisma.gameStat.findUnique({
      where: {
        userId_gameName: {
          userId,
          gameName,
        },
      },
    });

    if (existingStat) {
      const newTotalScore = existingStat.averageScore * existingStat.gamesPlayed + score;
      const newGamesPlayed = existingStat.gamesPlayed + 1;
      
      await prisma.gameStat.update({
        where: {
          id: existingStat.id,
        },
        data: {
          gamesPlayed: newGamesPlayed,
          gamesWon: {
            increment: isWon ? 1 : 0,
          },
          averageScore: newTotalScore / newGamesPlayed,
        },
      });
    } else {
      await prisma.gameStat.create({
        data: {
          userId,
          gameName,
          gamesPlayed: 1,
          gamesWon: isWon ? 1 : 0,
          averageScore: score,
        },
      });
    }

    // הגבל את הניקוד המקסימלי למשחק - מקסימום 100 נקודות למשחק
    // זה מונע ניקוד גבוה מדי ממשחקים שיש בהם באגים או ניצול
    const maxScorePerGame = 100;
    const cappedScore = Math.min(score, maxScorePerGame);
    
    if (score > maxScorePerGame) {
      console.warn(`⚠️ [update-stats] Score capped from ${score} to ${maxScorePerGame} for user ${userId}, game ${gameName}`);
    }

    // Update user's overall stats
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: cappedScore },
        gamesPlayed: { increment: 1 },
        gamesWon: { increment: isWon ? 1 : 0 }
      }
    });

    // Update achievements
    let newlyCompletedAchievements: Array<{id: string, name: string, icon: string, reward: number, xpReward: number}> = [];
    try {
      const achievementsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          gameName, 
          action: isWon ? 'win' : 'complete', 
          score 
        })
      });
      
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        newlyCompletedAchievements = achievementsData.newlyCompletedAchievements || [];
      } else {
        console.error('Failed to update achievements:', await achievementsResponse.text());
      }
    } catch (achievementsError) {
      console.error('Error updating achievements:', achievementsError);
      // Continue even if achievements update fails
    }

    // Update user rank automatically
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user/update-rank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        console.error('Failed to update rank:', await response.text());
      }
    } catch (rankError) {
      console.error('Error updating rank:', rankError);
      // Continue even if rank update fails
    }

    return NextResponse.json({ 
      success: true,
      newlyCompletedAchievements: newlyCompletedAchievements
    });
  } catch (error) {
    console.error('Error updating game stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
