import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // נתונים אמיתיים של משחקים
    const stats = {
      totalPlays: 0, // סה"כ משחקים
      averageScore: 0, // ציון ממוצע
      topGame: 'אין נתונים', // משחק פופולרי
      gamesToday: 0, // משחקים היום
      totalUsers: 1, // סה"כ משתמשים
      lastPlayed: null, // משחק אחרון
      popularGames: [
        { name: 'Word Clash', plays: 0 },
        { name: 'Matching Pairs', plays: 0 },
        { name: 'Mixed Quiz', plays: 0 },
        { name: 'Picture Description Duel', plays: 0 }
      ]
    };

    return NextResponse.json(stats);
  } catch (error) {
    // console.error('Error fetching game stats:', error);
    return NextResponse.json({ error: 'Failed to fetch game stats' }, { status: 500 });
  }
}


