import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // חיפוש מנוי פעיל
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: 'active'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        message: 'No active subscription found'
      });
    }

    // בדיקה אם המנוי עדיין פעיל
    const now = new Date();
    const endDate = new Date(subscription.endDate);

    if (endDate <= now) {
      // עדכון סטטוס המנוי לפג תוקף
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' }
      });

      return NextResponse.json({
        subscription: null,
        message: 'Subscription expired'
      });
    }

    // החזרת נתוני המנוי
    const subscriptionData = {
      id: subscription.id,
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate.toISOString(),
      paymentId: subscription.paymentId,
      paymentMethod: subscription.paymentMethod,
      amount: subscription.amount,
      currency: subscription.currency
    };

    return NextResponse.json({
      subscription: subscriptionData,
      message: 'Active subscription found'
    });

  } catch (error) {
    console.error('Check subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


