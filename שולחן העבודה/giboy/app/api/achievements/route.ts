import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // קבלת כל ההישגים עם ההתקדמות של המשתמש
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
      include: {
        userAchievements: {
          where: { userId },
          select: {
            progress: true,
            isCompleted: true,
            completedAt: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { requirement: 'asc' }
      ]
    });

    // עיבוד הנתונים
    const processedAchievements = achievements.map(achievement => {
      const userProgress = achievement.userAchievements[0];
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        requirement: achievement.requirement,
        reward: achievement.reward,
        progress: userProgress?.progress || 0,
        isCompleted: userProgress?.isCompleted || false,
        completedAt: userProgress?.completedAt,
        progressPercentage: Math.min(100, Math.round((userProgress?.progress || 0) / achievement.requirement * 100))
      };
    });

    return NextResponse.json({ achievements: processedAchievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, gameName, action, score } = await request.json();

    if (!userId || !gameName || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // קבלת פרסים למשחק
    const gameRewards = await prisma.gameReward.findMany({
      where: {
        gameName,
        action,
        isActive: true
      }
    });

    let totalDiamonds = 0;
    let totalCoins = 0;
    let totalPoints = 0;

    // חישוב הפרסים
    for (const reward of gameRewards) {
      totalDiamonds += reward.diamonds;
      totalCoins += reward.coins;
      totalPoints += reward.points;
    }

    // עדכון המשתמש
    if (totalDiamonds > 0 || totalCoins > 0 || totalPoints > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          diamonds: { increment: totalDiamonds },
          coins: { increment: totalCoins },
          points: { increment: totalPoints }
        }
      });
    }

    // עדכון הישגים
    await updateAchievements(userId, gameName, action, score);

    return NextResponse.json({
      success: true,
      rewards: {
        diamonds: totalDiamonds,
        coins: totalCoins,
        points: totalPoints
      }
    });

  } catch (error) {
    console.error('Error processing rewards:', error);
    return NextResponse.json(
      { error: 'Failed to process rewards' },
      { status: 500 }
    );
  }
}

async function updateAchievements(userId: string, gameName: string, action: string, score?: number) {
  try {
    // הישגים כלליים
    const generalAchievements = await prisma.achievement.findMany({
      where: {
        category: 'games',
        isActive: true
      }
    });

    for (const achievement of generalAchievements) {
      let progressIncrement = 0;

      switch (achievement.name) {
        case 'משחק ראשון':
          if (action === 'complete') progressIncrement = 1;
          break;
        case 'ניצחון ראשון':
          if (action === 'win') progressIncrement = 1;
          break;
        case '10 משחקים':
          if (action === 'complete') progressIncrement = 1;
          break;
        case '5 ניצחונות':
          if (action === 'win') progressIncrement = 1;
          break;
        case '100 משחקים':
          if (action === 'complete') progressIncrement = 1;
          break;
        case '50 ניצחונות':
          if (action === 'win') progressIncrement = 1;
          break;
      }

      if (progressIncrement > 0) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id
            }
          },
          update: {
            progress: { increment: progressIncrement }
          },
          create: {
            userId,
            achievementId: achievement.id,
            progress: progressIncrement
          }
        });
      }
    }

    // בדיקה אם הישגים הושלמו
    await checkAndCompleteAchievements(userId);

  } catch (error) {
    console.error('Error updating achievements:', error);
  }
}

async function checkAndCompleteAchievements(userId: string) {
  try {
    const userAchievements = await prisma.userAchievement.findMany({
      where: {
        userId,
        isCompleted: false
      },
      include: {
        achievement: true
      }
    });

    for (const userAchievement of userAchievements) {
      if (userAchievement.progress >= userAchievement.achievement.requirement) {
        await prisma.userAchievement.update({
          where: { id: userAchievement.id },
          data: {
            isCompleted: true,
            completedAt: new Date()
          }
        });

        // מתן פרס למשתמש
        await prisma.user.update({
          where: { id: userId },
          data: {
            diamonds: { increment: userAchievement.achievement.reward }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}
