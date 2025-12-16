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

    // קבל מילים נלמדות אמיתיות מבסיס הנתונים
    console.log(`[API] Fetching learned words for userId: ${userId}`);
    const learnedWordsFromDB = await prisma.learnedWord.findMany({
      where: { userId },
      orderBy: { learnedAt: 'desc' }
    });
    console.log(`[API] Found ${learnedWordsFromDB.length} learned words in database`);

    // קבל נתונים על המשתמש
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        gamesPlayed: true,
        gamesWon: true,
        points: true,
        level: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // המר לפורמט הדף
    const learnedWords = learnedWordsFromDB.map(word => ({
      word: word.word,
      translation: word.translation,
      game: getGameDisplayName(word.gameName),
      gameName: word.gameName, // הוסף את gameName לבדיקה
      difficulty: word.difficulty,
      learnedAt: word.learnedAt.toISOString(),
      timesSeen: word.timesSeen,
      timesCorrect: word.timesCorrect,
      accuracy: word.accuracy,
      isMastered: word.isMastered
    }));

    // חשב סטטיסטיקות לפי משחק
    const gameStatsData = [];
    const gameStatsMap = new Map();

    learnedWordsFromDB.forEach(word => {
      const gameName = getGameDisplayName(word.gameName);
      if (!gameStatsMap.has(gameName)) {
        gameStatsMap.set(gameName, {
          gameName,
          totalWords: 0,
          correctWords: 0,
          masteredWords: 0,
          totalAccuracy: 0
        });
      }
      
      const stats = gameStatsMap.get(gameName);
      stats.totalWords++;
      if (word.timesCorrect > 0) stats.correctWords++;
      if (word.isMastered) stats.masteredWords++;
      stats.totalAccuracy += word.accuracy;
    });

    // המר לסטטיסטיקות
    gameStatsMap.forEach(stats => {
      gameStatsData.push({
        gameName: stats.gameName,
        totalWords: stats.totalWords,
        correctWords: stats.correctWords,
        masteredWords: stats.masteredWords,
        accuracy: Math.round(stats.totalAccuracy / stats.totalWords)
      });
    });

    // אם אין מילים, הוסף הודעה
    if (learnedWords.length === 0) {
      gameStatsData.push({
        gameName: 'אין מילים נלמדות עדיין',
        totalWords: 0,
        correctWords: 0,
        masteredWords: 0,
        accuracy: 0
      });
    }

    return NextResponse.json({
      learnedWords,
      gameStats: gameStatsData,
      userStats: {
        totalWords: learnedWords.length,
        totalGames: user.gamesPlayed,
        totalWins: user.gamesWon,
        level: user.level,
        points: user.points
      }
    });

  } catch (error) {
    console.error('Error fetching learned words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learned words' },
      { status: 500 }
    );
  }
}

function getGameDisplayName(gameName: string): string {
  const gameNames: { [key: string]: string } = {
    'TrueOrFalse': 'נכון/לא נכון',
    'FillInTheBlanks': 'השלמת מילים',
    'MultipleChoice': 'בחירה מרובה',
    'SentenceScramble': 'סידור משפטים',
    'MatchingPairs': 'משחק הזיכרון',
    'picture-description-duel': 'תיאור תמונה - דו-קרב',
    'WordClash': 'קרב זוגי - מילים',
    'Listening': 'האזנה',
    'Pronunciation': 'הגייה',
    'MixedQuiz': 'חידון מעורב',
    'PictureDescription': 'תיאור תמונה',
    'RecordListen': 'הקלטה והאזנה',
    'SentenceBuilder': 'בניית משפטים'
  };
  return gameNames[gameName] || gameName;
}
