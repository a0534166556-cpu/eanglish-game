import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sync = searchParams.get('sync'); // פרמטר חדש לסנכרון הישגים

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // אם sync=true, עדכן את כל ההישגים בהתבסס על הסטטיסטיקות הקיימות
    if (sync === 'true') {
      console.log(`🔄 Syncing achievements for user ${userId}`);
      await syncUserAchievements(userId);
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
        difficulty: achievement.difficulty || 'easy',
        xpReward: achievement.xpReward || 0,
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
    const { userId, gameName, action, score, achievementId } = await request.json();

    // אם achievementId קיים, זה בקשה לקבל פרס על הישג
    if (achievementId && userId) {
      return await claimAchievement(userId, achievementId);
    }

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

    // הגבל את הנקודות מהישגים - מקסימום 20 נקודות למשחק מהישגים
    // זה מונע ניקוד גבוה מדי מהישגים
    const maxPointsFromRewards = 20;
    const cappedPointsFromRewards = Math.min(totalPoints, maxPointsFromRewards);
    
    if (totalPoints > maxPointsFromRewards) {
      console.warn(`⚠️ [achievements] Points from rewards capped from ${totalPoints} to ${maxPointsFromRewards} for user ${userId}, game ${gameName}`);
    }

    // עדכון המשתמש
    if (totalDiamonds > 0 || totalCoins > 0 || cappedPointsFromRewards > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          diamonds: { increment: totalDiamonds },
          coins: { increment: totalCoins },
          points: { increment: cappedPointsFromRewards }
        }
      });
    }

    // עדכון הישגים
    const newlyCompletedAchievements = await updateAchievements(userId, gameName, action, score);

    return NextResponse.json({
      success: true,
      rewards: {
        diamonds: totalDiamonds,
        coins: totalCoins,
        points: totalPoints
      },
      newlyCompletedAchievements: newlyCompletedAchievements
    });

  } catch (error) {
    console.error('Error processing rewards:', error);
    return NextResponse.json(
      { error: 'Failed to process rewards' },
      { status: 500 }
    );
  }
}

async function updateAchievements(userId: string, gameName: string, action: string, score?: number): Promise<Array<{id: string, name: string, icon: string, reward: number, xpReward: number}>> {
  try {
    console.log(`🏆 Updating achievements for user ${userId}, game: ${gameName}, action: ${action}, score: ${score}`);
    
    // הישגים כלליים
    const generalAchievements = await prisma.achievement.findMany({
      where: {
        category: 'games',
        isActive: true
      }
    });

    for (const achievement of generalAchievements) {
      let progressIncrement = 0;

      // בדוק הישגים לפי description ו-requirement ולא לפי שם ספציפי
      // זה מאפשר גמישות אם שמות ההישגים משתנים
      
      const achievementName = achievement.name.toLowerCase();
      const achievementDesc = achievement.description.toLowerCase();
      
      // הישגים של משחקים (complete) - בדוק לפי description
      if (action === 'complete') {
        // בדוק אם ההישג קשור למשחקים (לא ניצחונות, לא ניקוד)
        const isGameAchievement = (
          achievementDesc.includes('שחק') || 
          achievementDesc.includes('משחק') ||
          achievementDesc.includes('play') ||
          achievementName.includes('משחק') ||
          achievementName.includes('שחקן') ||
          achievementName.includes('צעדים ראשונים') ||
          achievementName.includes('מתחיל') ||
          achievementName.includes('פעיל') ||
          achievementName.includes('מנוסה') ||
          achievementName.includes('חובב') ||
          achievementName.includes('מקצוען') ||
          achievementName.includes('ותיק') ||
          achievementName.includes('מכור') ||
          achievementName.includes('מיתוס') ||
          achievementName.includes('אלוהי') ||
          achievementName.includes('מאסטר')
        ) && !achievementDesc.includes('נצח') && 
          !achievementDesc.includes('win') &&
          !achievementName.includes('ניצחון') &&
          !achievementName.includes('ניקוד');
        
        if (isGameAchievement) {
          progressIncrement = 1;
        }
      }
      
      // הישגים של ניצחונות (win) - בדוק לפי description
      if (action === 'win') {
        // בדוק אם ההישג קשור לניצחונות
        const isWinAchievement = (
          achievementDesc.includes('נצח') || 
          achievementDesc.includes('win') ||
          achievementName.includes('ניצחון') ||
          achievementName.includes('מנצח') ||
          achievementName.includes('אלוף') ||
          achievementName.includes('אגדה') ||
          achievementName.includes('אלוהי הניצחון')
        );
        
        if (isWinAchievement) {
          progressIncrement = 1;
        }
      }

      // הישגים ספציפיים למשחקים - בדוק לפי שם המשחק
      if (achievement.name.includes(gameName) || achievement.description.includes(gameName)) {
        if (action === 'complete') progressIncrement = 1;
      }

      // הישגי ניקוד - בדוק הישגים ספציפיים לפי requirement
      if (score && achievement.name.includes('ניקוד')) {
        // בדוק הישגים לפי requirement - אם הניקוד >= requirement, עדכן
        if (achievement.requirement <= score) {
          progressIncrement = 1;
        }
      }

      if (progressIncrement > 0) {
        console.log(`📈 Updating achievement: ${achievement.name} (requirement: ${achievement.requirement}, +${progressIncrement})`);
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

    // בדיקה אם הישגים הושלמו והחזרת רשימת הישגים חדשים
    // חשוב: checkAndCompleteAchievements בודק את כל ההישגים הפעילים, לא רק 'games'
    const newlyCompleted = await checkAndCompleteAchievements(userId);
    return newlyCompleted;

  } catch (error) {
    console.error('Error updating achievements:', error);
    return [];
  }
}

async function checkAndCompleteAchievements(userId: string): Promise<Array<{id: string, name: string, icon: string, reward: number, xpReward: number}>> {
  const newlyCompleted: Array<{id: string, name: string, icon: string, reward: number, xpReward: number}> = [];
  
  try {
    // בדוק גם הישגים שלא הושלמו וגם כאלה שהושלמו בעבר (כדי לאפשר איפוס)
    const userAchievements = await prisma.userAchievement.findMany({
      where: {
        userId
      },
      include: {
        achievement: true
      }
    });

    // בדוק כל הישג - גם כאלה שיש להם רשומה וגם כאלה שאין
    // קודם כל, קבל את כל ההישגים הפעילים
    const allAchievements = await prisma.achievement.findMany({
      where: { isActive: true }
    });

    for (const achievement of allAchievements) {
      // מצא את הרשומה של המשתמש עבור ההישג הזה
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
      
      // אם אין רשומה, צור אחת עם התקדמות 0
      let currentProgress = userAchievement?.progress || 0;
      
      // בדוק אם ההישג הושלם (רק אם לא הושלם בעבר, או אם הושלם אבל ההתקדמות שוב הגיעה לדרישה)
      const wasCompleted = userAchievement?.isCompleted || false;
      
      // רק עדכן את ההתקדמות, אבל אל תסמן כהושלם - המשתמש צריך ללחוץ על ההישג
      // אם ההתקדמות הגיעה לדרישה, רק נשמור את זה, אבל לא נסמן כהושלם ולא נעניק פרסים
      if (currentProgress >= achievement.requirement && !wasCompleted) {
        // רק עדכן את ההתקדמות, אבל אל תסמן כהושלם
        // המשתמש צריך ללחוץ על ההישג בדף ההישגים כדי לקבל את הפרס
        // לא נעדכן כאן את isCompleted - זה יקרה רק כשלוחצים על ההישג
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
  
  return newlyCompleted;
}

// פונקציה לסנכרון הישגים בהתבסס על הסטטיסטיקות הקיימות של המשתמש
async function syncUserAchievements(userId: string): Promise<void> {
  try {
    console.log(`🔄 Syncing achievements for user ${userId}`);
    
    // קבל את הסטטיסטיקות של המשתמש
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        gamesPlayed: true,
        gamesWon: true,
        points: true,
        level: true
      }
    });

    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }

    console.log(`📊 User stats: gamesPlayed=${user.gamesPlayed}, gamesWon=${user.gamesWon}, points=${user.points}, level=${user.level}`);

    // קבל את כל ההישגים הפעילים
    const allAchievements = await prisma.achievement.findMany({
      where: { isActive: true }
    });

    // קבל את ההישגים הקיימים של המשתמש
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true }
    });

    // עדכן כל הישג בהתבסס על הסטטיסטיקות
    for (const achievement of allAchievements) {
      const userAch = userAchievements.find(ua => ua.achievementId === achievement.id);
      const currentProgress = userAch?.progress || 0;
      const wasCompleted = userAch?.isCompleted || false;
      
      // קבע את ההתקדמות הנכונה בהתבסס על הקטגוריה והדרישה
      let correctProgress = 0;
      const achievementName = achievement.name.toLowerCase();
      const achievementDesc = achievement.description.toLowerCase();
      
      if (achievement.category === 'games') {
        // הישגי משחקים
        if (achievementDesc.includes('שחק') || achievementDesc.includes('משחק') || 
            achievementName.includes('משחק') || achievementName.includes('שחקן') ||
            achievementName.includes('צעדים') || achievementName.includes('מתחיל') ||
            achievementName.includes('פעיל') || achievementName.includes('מנוסה') ||
            achievementName.includes('חובב') || achievementName.includes('מקצוען') ||
            achievementName.includes('ותיק') || achievementName.includes('מכור') ||
            achievementName.includes('מיתוס') || achievementName.includes('אלוהי') ||
            achievementName.includes('מאסטר')) {
          if (!achievementDesc.includes('נצח') && !achievementName.includes('ניצחון')) {
            correctProgress = Math.min(user.gamesPlayed, achievement.requirement);
          }
        }
        
        // הישגי ניצחונות
        if (achievementDesc.includes('נצח') || achievementName.includes('ניצחון') ||
            achievementName.includes('מנצח') || achievementName.includes('אלוף') ||
            achievementName.includes('אגדה')) {
          correctProgress = Math.min(user.gamesWon, achievement.requirement);
        }
      } else if (achievement.category === 'level') {
        // הישגי רמה
        correctProgress = Math.min(user.level, achievement.requirement);
      } else if (achievement.category === 'special') {
        // הישגים מיוחדים - נדרש טיפול מיוחד
        if (achievementDesc.includes('נקודות') || achievementDesc.includes('points')) {
          correctProgress = Math.min(user.points, achievement.requirement);
        }
      }

      // עדכן את ההתקדמות רק אם היא שונה מהנוכחית
      if (correctProgress !== currentProgress) {
        console.log(`📈 Updating ${achievement.name}: ${currentProgress} -> ${correctProgress}`);
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id
            }
          },
          update: {
            progress: correctProgress
          },
          create: {
            userId,
            achievementId: achievement.id,
            progress: correctProgress
          }
        });
      }
    }

    // לא נקרא ל-checkAndCompleteAchievements כאן כי אנחנו לא רוצים לסמן הישגים אוטומטית
    // המשתמש צריך ללחוץ על ההישג כדי לקבל אותו
    // await checkAndCompleteAchievements(userId);
    
    console.log(`✅ Sync completed for user ${userId}`);
  } catch (error) {
    console.error('Error syncing achievements:', error);
  }
}

// פונקציה לקבלת פרס על הישג
async function claimAchievement(userId: string, achievementId: string): Promise<NextResponse> {
  try {
    // וידוא שה-userId וה-achievementId תקינים
    if (!userId || !achievementId || typeof userId !== 'string' || typeof achievementId !== 'string') {
      console.error('❌ [claimAchievement] Invalid userId or achievementId:', { userId, achievementId });
      return NextResponse.json({ error: 'Invalid user ID or achievement ID' }, { status: 400 });
    }

    // קבל את ההישג
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId }
    });

    if (!achievement) {
      console.error('❌ [claimAchievement] Achievement not found:', achievementId);
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    // וידוא שההישג פעיל
    if (!achievement.isActive) {
      console.error('❌ [claimAchievement] Achievement is not active:', achievementId);
      return NextResponse.json({ error: 'Achievement is not active' }, { status: 400 });
    }

    // קבל את ההתקדמות של המשתמש
    const userAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId
        }
      }
    });

    if (!userAchievement) {
      console.error('❌ [claimAchievement] User achievement not found:', { userId, achievementId });
      return NextResponse.json({ error: 'User achievement not found. Please play more to unlock this achievement.' }, { status: 404 });
    }

    // בדיקות מחמירות - הישג ניתן רק אם באמת הושג
    const currentProgress = Number(userAchievement.progress) || 0;
    const requiredProgress = Number(achievement.requirement) || 0;
    const isAlreadyCompleted = Boolean(userAchievement.isCompleted);

    console.log(`🔍 [claimAchievement] Checking achievement: ${achievement.name}`, {
      userId,
      achievementId,
      currentProgress,
      requiredProgress,
      isAlreadyCompleted,
      meetsRequirement: currentProgress >= requiredProgress
    });

    // בדוק שההישג מושלם אבל לא נאסף
    if (currentProgress < requiredProgress) {
      console.warn(`⚠️ [claimAchievement] Achievement not completed yet. Progress: ${currentProgress}/${requiredProgress}`);
      return NextResponse.json({ 
        error: 'Achievement not completed yet',
        details: `You need ${requiredProgress - currentProgress} more to complete this achievement.`
      }, { status: 400 });
    }

    if (isAlreadyCompleted) {
      console.warn(`⚠️ [claimAchievement] Achievement already claimed: ${achievementId}`);
      return NextResponse.json({ error: 'Achievement already claimed' }, { status: 400 });
    }

    // בדיקה נוספת - ודא שההתקדמות היא מספר תקין
    if (isNaN(currentProgress) || currentProgress < 0) {
      console.error('❌ [claimAchievement] Invalid progress value:', currentProgress);
      return NextResponse.json({ error: 'Invalid achievement progress' }, { status: 400 });
    }

    // סמן כהושלם ותן פרס - רק אחרי כל הבדיקות
    const xpReward = Number(achievement.xpReward) || 0;
    const diamondReward = Number(achievement.reward) || 0;

    console.log(`✅ [claimAchievement] Claiming achievement: ${achievement.name}`, {
      reward: diamondReward,
      xpReward: xpReward
    });

    // עדכן את ההישג כהושלם - בתוך transaction כדי למנוע race conditions
    await prisma.$transaction(async (tx) => {
      // בדיקה נוספת בתוך ה-transaction
      const freshUserAchievement = await tx.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId
          }
        }
      });

      if (!freshUserAchievement) {
        throw new Error('User achievement not found');
      }

      if (freshUserAchievement.isCompleted) {
        throw new Error('Achievement already claimed');
      }

      if (Number(freshUserAchievement.progress) < requiredProgress) {
        throw new Error('Achievement not completed yet');
      }

      // עדכון ההישג
      await tx.userAchievement.update({
        where: {
          userId_achievementId: {
            userId,
            achievementId
          }
        },
        data: {
          isCompleted: true,
          completedAt: new Date()
        }
      });

      // מתן פרס למשתמש
      await tx.user.update({
        where: { id: userId },
        data: {
          diamonds: { increment: diamondReward },
          points: { increment: xpReward }
        }
      });
    });

    // עדכון רמת המשתמש אחרי קבלת הישג
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user/update-rank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch (rankError) {
      console.error('Error updating rank:', rankError);
    }

    console.log(`✅ [claimAchievement] Achievement claimed successfully: ${achievement.name}`);

    return NextResponse.json({
      success: true,
      reward: diamondReward,
      xpReward: xpReward,
      achievement: {
        id: achievement.id,
        name: achievement.name
      }
    });
  } catch (error) {
    console.error('Error claiming achievement:', error);
    return NextResponse.json({ error: 'Failed to claim achievement' }, { status: 500 });
  }
}
