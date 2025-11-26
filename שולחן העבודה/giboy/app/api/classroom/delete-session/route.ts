import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // מחק את המשחק ואת כל התוצאות שלו
    await prisma.classroomResult.deleteMany({
      where: { sessionId: sessionId }
    });

    await prisma.classroomSession.delete({
      where: { id: sessionId }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

