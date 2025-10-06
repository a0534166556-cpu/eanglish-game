import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, tagId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // אם לא בוחרים תג (מסירים)
    if (!tagId) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { selectedTag: null },
      });
      return NextResponse.json({ 
        success: true, 
        selectedTag: updatedUser.selectedTag 
      });
    }

    // בודק שהמשתמש בעל התג
    let ownedTags = user.ownedTags ? JSON.parse(user.ownedTags) : [];
    if (!ownedTags.includes(tagId)) {
      return NextResponse.json({ error: 'Tag not owned' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { selectedTag: tagId },
    });

    return NextResponse.json({ 
      success: true, 
      selectedTag: updatedUser.selectedTag 
    });
  } catch (error) {
    console.error('Error selecting tag:', error);
    return NextResponse.json({ error: 'Failed to select tag' }, { status: 500 });
  }
}



