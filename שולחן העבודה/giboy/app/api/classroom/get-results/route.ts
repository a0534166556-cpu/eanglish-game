import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // קבל תוצאות ממסד הנתונים
    const results = await prisma.classroomResult.findMany({
      where: { sessionId: sessionId },
      orderBy: { score: 'desc' }
    });

    // המר לפורמט המתאים
    const formattedResults = results.map(result => ({
      id: result.id,
      name: result.studentName,
      score: result.score,
      baseScore: result.baseScore,
      timeBonus: result.timeBonus,
      totalTime: result.totalTime,
      timeInMinutes: result.timeInMinutes,
      date: result.submittedAt.toLocaleString('he-IL'),
      questionsAnswered: result.questionsAnswered,
      correctAnswers: result.correctAnswers,
      lastActivity: result.lastActivity.toLocaleString('he-IL'),
      gameProgress: result.gameProgress,
      rank: result.rank
    }));

    return NextResponse.json({ 
      success: true, 
      results: formattedResults,
      totalStudents: formattedResults.length 
    });

  } catch (error) {
    console.error('Error getting results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
