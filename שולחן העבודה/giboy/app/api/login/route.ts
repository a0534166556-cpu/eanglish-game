import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    console.log('LOGIN API CALLED');
    const { email, password } = await req.json();
    console.log('LOGIN BODY:', { email, password: password ? '***' : 'missing' });
    
    if (!email || !password) {
      console.log('LOGIN ERROR: Missing email or password');
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }
    
    console.log('Looking for user with email:', email);
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('LOGIN ERROR: User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }
    
    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('LOGIN ERROR: Invalid password');
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    console.log('LOGIN SUCCESS:', { id: user.id, email: user.email, name: user.name });
    return NextResponse.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name,
      profileImage: user.profileImage || null,
      diamonds: user.diamonds || 100,
      coins: user.coins || 500,
      success: true 
    });
  } catch (err) {
    console.error('LOGIN SERVER ERROR:', err);
    return NextResponse.json({ 
      error: 'Server error', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}
