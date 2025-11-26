import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, priority, adminNotes } = await request.json();
    const reportId = params.id;

    if (!reportId) {
      return NextResponse.json(
        { error: 'מזהה דיווח נדרש' },
        { status: 400 }
      );
    }

    // בדוק אם הדיווח קיים
    const existingReport = await prisma.bugReport.findUnique({
      where: { id: reportId }
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: 'דיווח לא נמצא' },
        { status: 404 }
      );
    }

    // עדכן את הדיווח
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) {
      updateData.status = status;
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date();
      }
    }

    if (priority) {
      updateData.priority = priority;
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const updatedReport = await prisma.bugReport.update({
      where: { id: reportId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'הדיווח עודכן בהצלחה',
      report: updatedReport
    });

  } catch (error) {
    console.error('Error updating bug report:', error);
    return NextResponse.json(
      { error: 'שגיאה בעדכון הדיווח' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    if (!reportId) {
      return NextResponse.json(
        { error: 'מזהה דיווח נדרש' },
        { status: 400 }
      );
    }

    // בדוק אם הדיווח קיים
    const existingReport = await prisma.bugReport.findUnique({
      where: { id: reportId }
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: 'דיווח לא נמצא' },
        { status: 404 }
      );
    }

    // מחק את הדיווח
    await prisma.bugReport.delete({
      where: { id: reportId }
    });

    return NextResponse.json({
      success: true,
      message: 'הדיווח נמחק בהצלחה'
    });

  } catch (error) {
    console.error('Error deleting bug report:', error);
    return NextResponse.json(
      { error: 'שגיאה במחיקת הדיווח' },
      { status: 500 }
    );
  }
}


