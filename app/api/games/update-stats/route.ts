import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRankByPoints, getRankByUserStats, calculateProgress, calculateRankProgress, canLevelUp, calculateLevelProgress } from '@/lib/rankSystem';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, gameName, score, won, correctAnswers, totalQuestions } = body;

    // קבע ניצחון לפי רוב תשובות נכונות
    // אם לא נשלח won, בדוק אם ענה על רוב השאלות נכון (יותר מ-50%)
    let isWon = false;
    if (typeof won === 'boolean') {
      isWon = won;
    } else if (correctAnswers !== undefined && totalQuestions !== undefined && totalQuestions > 0) {
      // ניצחון אם ענה על יותר מ-50% מהשאלות נכון
      isWon = correctAnswers > (totalQuestions / 2);
    } else {
      // fallback - אם לא נשלח מידע, בדוק לפי ניקוד (רק אם score > 0)
      isWon = score > 0;
    }

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

    // הגבל את הניקוד המקסימלי למשחק - מקסימום 1000 נקודות למשחק
    // זה מונע ניקוד גבוה מדי ממשחקים שיש בהם באגים או ניצול
    const maxScorePerGame = 1000;
    const cappedScore = Math.min(score, maxScorePerGame);
    
    if (score > maxScorePerGame) {
      console.warn(`⚠️ [update-stats] Score capped from ${score} to ${maxScorePerGame} for user ${userId}, game ${gameName}`);
    }

    // Update user's overall stats
    const updatedUser = await prisma.user.update({
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

    // Update user rank and level automatically
    try {
      // קבל את המשתמש המעודכן
      const userWithStats = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (userWithStats) {
        // קבל הישגים שהושלמו של המשתמש
        const completedUserAchievements = await prisma.userAchievement.findMany({
          where: {
            userId: userId,
            isCompleted: true
          },
          include: {
            achievement: {
              select: {
                xpReward: true
              }
            }
          }
        });

        // חשב נקודות ניסיון מהישגים ומספר הישגים שהושלמו
        const achievementsXP = completedUserAchievements.reduce((total: number, userAchievement: any) => 
          total + (userAchievement.achievement.xpReward || 0), 0
        );
        const completedAchievementsCount = completedUserAchievements.length;

        // קבע דרגה חדשה - לפי כל הנתונים (נקודות, משחקים, ניצחונות, הישגים)
        const basePoints = userWithStats.points;
        const newRank = getRankByUserStats({
          points: basePoints,
          gamesPlayed: userWithStats.gamesPlayed,
          gamesWon: userWithStats.gamesWon,
          completedAchievementsCount,
          level: userWithStats.level // הוסף את הרמה כדי שהדרגה תהיה קשורה לרמה
        });
        // חשב התקדמות לדרגה הבאה לפי כל הנתונים (נקודות, משחקים, ניצחונות, הישגים)
        const progress = calculateRankProgress({
          points: basePoints,
          gamesPlayed: userWithStats.gamesPlayed,
          gamesWon: userWithStats.gamesWon,
          completedAchievementsCount,
          level: userWithStats.level // הוסף את הרמה
        });

        // בדוק אם יכול לעלות רמה
        const canLevel = canLevelUp({
          points: userWithStats.points,
          gamesWon: userWithStats.gamesWon,
          gamesPlayed: userWithStats.gamesPlayed,
          level: userWithStats.level,
          achievementsXP,
          completedAchievementsCount
        });

        let newLevel = userWithStats.level;
        if (canLevel) {
          newLevel = userWithStats.level + 1;
          console.log('🚀 [update-stats] User can level up! Updating from level', userWithStats.level, 'to', newLevel);
        }

        // עדכן דרגה ורמה
        const finalUser = await prisma.user.update({
          where: { id: userId },
          data: {
            rank: newRank.id,
            rankProgress: progress,
            level: newLevel
          } as any
        });

        // החזר את הרמה החדשה אם היא השתנתה
        if (canLevel && newLevel !== userWithStats.level) {
          return NextResponse.json({ 
            success: true,
            newlyCompletedAchievements: newlyCompletedAchievements,
            levelUp: true,
            oldLevel: userWithStats.level,
            newLevel: newLevel
          });
        }
      }
    } catch (rankError) {
      console.error('Error updating rank:', rankError);
      // Continue even if rank update fails
    }

    return NextResponse.json({ 
      success: true,
      newlyCompletedAchievements: newlyCompletedAchievements,
      levelUp: false
    });
  } catch (error) {
    console.error('Error updating game stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
