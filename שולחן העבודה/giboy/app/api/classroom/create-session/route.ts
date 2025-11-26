import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { title, description, unit, level, teacherName } = await request.json();

    if (!title || !unit || !level) {
      return NextResponse.json({ error: 'Missing title, unit, or level' }, { status: 400 });
    }

    // צור משחק כיתה חדש
    const session = await prisma.classroomSession.create({
      data: {
        title: title,
        description: description || '',
        unit: unit,
        level: level,
        teacherId: 'teacher_' + Date.now(), // מזהה ייחודי זמני
        teacherName: teacherName || '',
        isActive: true,
        duration: 120
      }
    });

    return NextResponse.json({ 
      success: true, 
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        unit: session.unit,
        level: session.level,
        teacherName: session.teacherName,
        isActive: session.isActive,
        duration: session.duration,
        created: session.createdAt.toLocaleString('he-IL'),
        students: [] // מערך ריק בהתחלה
      }
    });

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
