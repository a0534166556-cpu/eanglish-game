import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - קבלת כל הפרסומות שלי
export async function GET(request: NextRequest) {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      ads: ads
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch ads'
    }, { status: 500 });
  }
}

// POST - יצירת פרסומת חדשה
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { title, type, position, imageUrl, linkUrl, startDate, endDate, isActive } = body;

    // בדיקת שדות חובה
    if (!title || !type || !position || !linkUrl || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // יצירת הפרסומת במסד הנתונים
    const ad = await prisma.ad.create({
      data: {
        title,
        type: type as any,
        position: position as any,
        imageUrl: imageUrl || null,
        videoUrl: null,
        linkUrl,
        isActive: isActive !== false,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        impressions: 0,
        clicks: 0,
        ctr: 0,
        earnings: 0
      }
    });

    return NextResponse.json({
      success: true,
      ad: ad
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create ad'
    }, { status: 500 });
  }
}

