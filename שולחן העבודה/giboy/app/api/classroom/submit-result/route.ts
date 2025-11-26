import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { sessionId, studentResult } = await request.json();

    if (!sessionId || !studentResult) {
      return NextResponse.json({ error: 'Missing sessionId or studentResult' }, { status: 400 });
    }

    // בדוק אם הפעלה קיימת
    const session = await prisma.classroomSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // חשב דירוג
    const allResults = await prisma.classroomResult.findMany({
      where: { sessionId: sessionId },
      orderBy: { score: 'desc' }
    });

    const currentRank = allResults.length + 1;

    // עדכן או צור תוצאה
    const result = await prisma.classroomResult.upsert({
      where: {
        sessionId_studentName: {
          sessionId: sessionId,
          studentName: studentResult.name
        }
      },
      update: {
        score: studentResult.score,
        baseScore: studentResult.baseScore,
        timeBonus: studentResult.timeBonus,
        totalTime: studentResult.totalTime,
        timeInMinutes: studentResult.timeInMinutes,
        questionsAnswered: studentResult.questionsAnswered,
        correctAnswers: studentResult.correctAnswers,
        gameProgress: studentResult.gameProgress,
        rank: currentRank,
        lastActivity: new Date()
      },
      create: {
        sessionId: sessionId,
        studentName: studentResult.name,
        score: studentResult.score,
        baseScore: studentResult.baseScore,
        timeBonus: studentResult.timeBonus,
        totalTime: studentResult.totalTime,
        timeInMinutes: studentResult.timeInMinutes,
        questionsAnswered: studentResult.questionsAnswered,
        correctAnswers: studentResult.correctAnswers,
        gameProgress: studentResult.gameProgress,
        rank: currentRank,
        submittedAt: new Date(),
        lastActivity: new Date()
      }
    });

    // עדכן דירוגים של כל התלמידים
    const updatedResults = await prisma.classroomResult.findMany({
      where: { sessionId: sessionId },
      orderBy: { score: 'desc' }
    });

    // עדכן דירוגים
    for (let i = 0; i < updatedResults.length; i++) {
      await prisma.classroomResult.update({
        where: { id: updatedResults[i].id },
        data: { rank: i + 1 }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Result submitted successfully',
      totalStudents: updatedResults.length,
      rank: currentRank
    });

  } catch (error) {
    console.error('Error submitting result:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
