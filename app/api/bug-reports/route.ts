import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, description, screenshots, deviceInfo } = await request.json();

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'תיאור הבעיה נדרש' },
        { status: 400 }
      );
    }

    // שמור דיווח במסד הנתונים
    const bugReport = await prisma.bugReport.create({
      data: {
        email: email || null,
        description: description.trim(),
        screenshots: screenshots ? JSON.stringify(screenshots) : null,
        deviceInfo: deviceInfo || null,
        status: 'pending',
        priority: 'medium'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'הדיווח נשלח בהצלחה! נחזור אליכם בקרוב.',
      reportId: bugReport.id
    });

  } catch (error) {
    console.error('Error saving bug report:', error);
    return NextResponse.json(
      { error: 'שגיאה בשמירת הדיווח' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || 'all';

    // בנה תנאי חיפוש
    const where: any = {};
    if (status !== 'all') {
      where.status = status;
    }
    if (priority !== 'all') {
      where.priority = priority;
    }

    // קבל דיווחים
    const reports = await prisma.bugReport.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // המר screenshots מ-JSON
    const processedReports = reports.map(report => ({
      ...report,
      screenshots: report.screenshots ? JSON.parse(report.screenshots) : null
    }));

    return NextResponse.json({
      success: true,
      reports: processedReports
    });

  } catch (error) {
    console.error('Error fetching bug reports:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת הדיווחים' },
      { status: 500 }
    );
  }
}


