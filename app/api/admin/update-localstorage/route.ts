import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // This is a client-side operation, so we'll return instructions
    return NextResponse.json({
      success: true,
      message: 'Please refresh the page or log out and log back in to see updated currency',
      instructions: [
        '1. Log out from the current session',
        '2. Log back in with the same credentials',
        '3. The updated currency will be loaded from the database'
      ]
    });

  } catch (error) {
    console.error('Error updating localStorage:', error);
    return NextResponse.json(
      { error: 'Failed to update localStorage' },
      { status: 500 }
    );
  }
}
