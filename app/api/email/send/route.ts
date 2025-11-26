import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email API called');
    const body = await request.json();
    const { to, subject, html } = body;
    console.log('📧 Email data:', { 
      to, 
      subject: subject.substring(0, 50) + '...', 
      htmlLength: html.length 
    });

    if (!to || !subject || !html) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    console.log('🚀 Attempting to send email via SendGrid...');
    await sendEmail({
      to,
      subject,
      html,
    });
    console.log('✅ Email sent successfully');

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ API Error sending email:', error);
    console.error('❌ Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack?.substring(0, 500)
    });
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

