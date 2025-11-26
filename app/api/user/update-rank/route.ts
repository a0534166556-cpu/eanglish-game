import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRankByPoints, getRankByUserStats, calculateTotalScore, calculateProgress, calculateRankProgress, canLevelUp, calculateLevelProgress } from '@/lib/rankSystem';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    console.log('🔵 [update-rank] Received request for userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // קבל נתוני משתמש
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log('❌ [update-rank] User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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

    console.log('📊 [update-rank] User data:', {
      level: user.level,
      points: user.points,
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      achievementsCount: completedUserAchievements.length
    });

    // חשב נקודות ניסיון מהישגים ומספר הישגים שהושלמו
    const achievementsXP = completedUserAchievements.reduce((total, userAchievement) => 
      total + (userAchievement.achievement.xpReward || 0), 0
    );
    const completedAchievementsCount = completedUserAchievements.length;
    console.log('🎯 [update-rank] Achievements:', {
      achievementsXP,
      completedAchievementsCount
    });

    // קבע דרגה חדשה - לפי כל הנתונים (נקודות, משחקים, ניצחונות, הישגים)
    // זה מבטיח שהדרגה תהיה הגיונית לפי הפעילות האמיתית
    const basePoints = user.points;
    const newRank = getRankByUserStats({
      points: basePoints,
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      completedAchievementsCount,
      level: user.level // הוסף את הרמה כדי שהדרגה תהיה קשורה לרמה
    });
    // חשב התקדמות לדרגה הבאה לפי כל הנתונים (נקודות, משחקים, ניצחונות, הישגים)
    const progress = calculateRankProgress({
      points: basePoints,
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      completedAchievementsCount
    });
    const oldRank = (user as any).rank;

    // בדוק אם יכול לעלות רמה
    const canLevel = canLevelUp({
      points: user.points,
      gamesWon: user.gamesWon,
      gamesPlayed: user.gamesPlayed,
      level: user.level,
      achievementsXP,
      completedAchievementsCount
    });

    console.log('🔍 [update-rank] Level up check:', {
      canLevel,
      currentLevel: user.level,
      points: user.points,
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      completedAchievementsCount
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
      console.log('🚀 [update-rank] User can level up! Updating from level', user.level, 'to', newLevel);
    } else {
      console.log('⏸️ [update-rank] User cannot level up yet');
    }

    // עדכן דרגה ורמה
    console.log('💾 [update-rank] Updating database with:', {
      rank: newRank.id,
      rankProgress: progress,
      level: newLevel
    });
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        rank: newRank.id,
        rankProgress: progress,
        level: newLevel
      } as any
    });
    
    console.log('✅ [update-rank] Database updated successfully. New level:', updatedUser.level);

    // בדוק אם עלה דרגה
    const rankUp = oldRank !== newRank.id;
    
    // חשב totalScore
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



