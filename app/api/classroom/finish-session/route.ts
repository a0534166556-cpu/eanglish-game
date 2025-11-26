import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // עדכן את המשחק להיות לא פעיל
    const updatedSession = await prisma.classroomSession.update({
      where: { id: sessionId },
      data: { isActive: false }
    });

    return NextResponse.json({ 
      success: true, 
      session: updatedSession
    });

  } catch (error) {
    console.error('Error finishing session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

