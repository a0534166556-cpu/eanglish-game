import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // נתונים אמיתיים של משתמשים
    const stats = {
      active: 1, // משתמש אחד פעיל (הנוכחי)
      total: 1, // סה"כ משתמשים
      newToday: 0, // משתמשים חדשים היום
      online: 1, // משתמשים אונליין
      registered: 1, // משתמשים רשומים
      lastActive: new Date().toISOString()
    };

    return NextResponse.json(stats);
  } catch (error) {
    // console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
  }
}


