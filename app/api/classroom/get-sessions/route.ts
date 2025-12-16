import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // קבל את ה-teacherId מה-query parameters
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({ error: 'Missing teacherId. User must be logged in.' }, { status: 400 });
    }

    // קבל רק את משחקי הכיתה של המשתמש המחובר
    const sessions = await prisma.classroomSession.findMany({
      where: {
        teacherId: teacherId
      },
      orderBy: { createdAt: 'desc' },
      include: {
        results: {
          orderBy: { score: 'desc' }
        }
      }
    });

    // המר לפורמט המתאים
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      title: session.title,
      description: session.description,
      unit: session.unit,
      level: session.level,
      teacherName: session.teacherName,
      isActive: session.isActive,
      duration: session.duration,
      created: session.createdAt.toLocaleString('he-IL'),
      students: session.results.map(result => ({
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
      }))
    }));

    return NextResponse.json({ 
      success: true, 
      sessions: formattedSessions
    });

  } catch (error) {
    console.error('Error getting sessions:', error);
    // במקום להחזיר שגיאה 500, נחזיר מערך ריק
    return NextResponse.json({ 
      success: true, 
      sessions: []
    });
  } finally {
    await prisma.$disconnect();
  }
}
