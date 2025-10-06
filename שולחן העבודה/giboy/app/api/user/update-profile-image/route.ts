import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, profileImage } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // עדכן תמונת פרופיל במסד נתונים
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        profileImage: profileImage || null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      profileImage: user.profileImage 
    });
  } catch (err) {
    console.error('Update profile image error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}



