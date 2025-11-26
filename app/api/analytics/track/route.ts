import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // Get client info
    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const referrer = req.headers.get('referer') || null;

    switch (type) {
      case 'page_view':
        await prisma.pageView.create({
          data: {
            userId: data.userId || null,
            page: data.page,
            referrer,
            userAgent,
            ipAddress,
            sessionId: data.sessionId,
          },
        });
        break;

      case 'session_start':
        await prisma.userSession.create({
          data: {
            userId: data.userId || null,
            sessionId: data.sessionId,
            device: data.device,
            browser: data.browser,
            os: data.os,
            country: data.country,
            city: data.city,
          },
        });
        break;

      case 'session_end':
        const existingSession = await prisma.userSession.findUnique({
          where: { sessionId: data.sessionId }
        });
        if (existingSession) {
          await prisma.userSession.update({
            where: { sessionId: data.sessionId },
            data: {
              endTime: new Date(),
              duration: data.duration,
              pageViews: data.pageViews,
            },
          });
        }
        break;

      case 'conversion':
        await prisma.conversion.create({
          data: {
            userId: data.userId || null,
            type: data.conversionType,
            value: data.value || null,
            metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            sessionId: data.sessionId,
          },
        });
        break;

      case 'behavior':
        await prisma.userBehavior.create({
          data: {
            userId: data.userId || null,
            action: data.action,
            element: data.element,
            page: data.page,
            value: data.value,
            sessionId: data.sessionId,
          },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid tracking type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
