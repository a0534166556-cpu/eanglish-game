import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('REGISTER API CALLED');
  try {
    const { email, password, name } = await req.json();
    console.log('REGISTER BODY:', { email, password, name });
    if (!email || !password) {
      console.log('REGISTER ERROR: Missing email or password');
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('REGISTER ERROR: User already exists');
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password: hashed,
        name: name || 'User',
        updatedAt: new Date(),
      },
    });
    console.log('REGISTER SUCCESS:', user);
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (err) {
    console.error('REGISTER SERVER ERROR:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json({ 
      error: 'Server error', 
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}
