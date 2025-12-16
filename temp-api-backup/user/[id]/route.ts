import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.id
      },
      select: {
        id: true,
        email: true,
        name: true,
        points: true,
        level: true,
        gamesPlayed: true,
        gamesWon: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { points, gamesPlayed, gamesWon } = body;
    const data: any = {};
    if (typeof points === 'number') data.points = points;
    if (typeof gamesPlayed === 'number') data.gamesPlayed = gamesPlayed;
    if (typeof gamesWon === 'number') data.gamesWon = gamesWon;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { id: params.id },
      data
    });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 