import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - עדכון פרסומת
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, type, position, imageUrl, linkUrl, startDate, endDate, isActive } = body;

    const ad = await prisma.ad.update({
      where: { id: params.id },
      data: {
        title,
        type: type as any,
        position: position as any,
        imageUrl: imageUrl || null,
        linkUrl,
        isActive,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });

    return NextResponse.json({
      success: true,
      ad: ad
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update ad'
    }, { status: 500 });
  }
}

// DELETE - מחיקת פרסומת
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.ad.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete ad'
    }, { status: 500 });
  }
}

