import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRankByPoints, calculateTotalScore, calculateProgress, canLevelUp, calculateLevelProgress, calculateLevelRequirements } from '@/lib/rankSystem';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // קבל נתוני משתמש עם הישגים
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // טען הישגים שהושלמו דרך UserAchievement
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
    const achievementsXP = completedUserAchievements.reduce((total, userAchievement) => 
      total + (userAchievement.achievement.xpReward || 0), 0
    );
    const completedAchievementsCount = completedUserAchievements.length;

    console.log('🔍 [update-rank] User data:', {
      userId,
      level: user.level,
      points: user.points,
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      achievementsCount: completedAchievementsCount,
      achievementsXP
    });

    // קבע דרגה חדשה - רק לפי נקודות בסיסיות, לא כולל בונוסים
    // זה מבטיח שהדרגה תהיה הגיונית לפי הפעילות האמיתית
    const basePoints = user.points;
    const newRank = getRankByPoints(basePoints);
    const progress = calculateProgress(basePoints);
    const oldRank = (user as any).rank;

    // בדוק אם יכול לעלות רמה
    const requirements = calculateLevelRequirements(user.level);
    const canLevel = canLevelUp({
      points: user.points,
      gamesWon: user.gamesWon,
      gamesPlayed: user.gamesPlayed,
      level: user.level,
      achievementsXP,
      completedAchievementsCount
    });

    // לוגים מפורטים לבדיקה
    console.log('🔍 [update-rank] Level up check:', {
      canLevel,
      currentLevel: user.level,
      points: user.points,
      pointsNeeded: requirements.pointsNeeded,
      pointsCheck: user.points >= requirements.pointsNeeded,
      gamesPlayed: user.gamesPlayed,
      gamesNeeded: requirements.gamesNeeded,
      gamesCheck: user.gamesPlayed >= requirements.gamesNeeded,
      gamesWon: user.gamesWon,
      winsNeeded: requirements.winsNeeded,
      winsCheck: user.gamesWon >= requirements.winsNeeded,
      completedAchievementsCount,
      achievementsNeeded: requirements.achievementsNeeded,
      achievementsCheck: completedAchievementsCount >= requirements.achievementsNeeded,
      requirements: requirements
    });

    // חשב התקדמות לרמה הבאה
    const levelProgress = calculateLevelProgress({
      points: user.points,
      gamesWon: user.gamesWon,
      gamesPlayed: user.gamesPlayed,
      level: user.level,
      achievementsXP,
      completedAchievementsCount
    });

    let newLevel = user.level;
    let levelUp = false;

    // אם יכול לעלות רמה, עדכן את הרמה
    if (canLevel) {
      newLevel = user.level + 1;
      levelUp = true;
      console.log('✅ [update-rank] Level up!', user.level, '->', newLevel);
    }

    // עדכן דרגה ורמה
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        rank: newRank.id,
        rankProgress: progress,
        level: newLevel
      } as any
    });

    // אם עלה רמה, לוג מפורט
    if (levelUp) {
      console.log('🎉 [update-rank] User leveled up!', {
        userId,
        oldLevel: user.level,
        newLevel: newLevel,
        points: user.points,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
        completedAchievementsCount
      });
    }

    // בדוק אם עלה דרגה
    const rankUp = oldRank !== newRank.id;

    // חשב totalScore אם צריך
    const totalScore = calculateTotalScore({
      points: user.points,
      gamesWon: user.gamesWon,
      gamesPlayed: user.gamesPlayed,
      achievementsXP
    });

    return NextResponse.json({
      success: true,
      rank: newRank,
      progress,
      rankUp,
      levelUp,
      level: newLevel,
      levelProgress,
      totalScore,
      achievementsXP,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating rank:', error);
    return NextResponse.json({ error: 'Failed to update rank' }, { status: 500 });
  }
}



