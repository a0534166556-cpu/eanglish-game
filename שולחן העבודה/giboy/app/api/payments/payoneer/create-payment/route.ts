import { NextRequest, NextResponse } from 'next/server';
import { payoneerService } from '@/lib/payoneer';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, userId, plan, userEmail } = await request.json();

    // בדיקת פרמטרים
    if (!amount || !currency || !userId || !plan) {
      return NextResponse.json(
        { error: 'חסרים פרמטרים נדרשים' },
        { status: 400 }
      );
    }

    // יצירת תשלום ב-Payoneer
    const payment = await payoneerService.createPayment(
      amount,
      currency,
      userId,
      plan
    ) as { id: string; payment_url: string; [key: string]: any };

    // שמירת פרטי התשלום במסד הנתונים
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'pending',
        startDate: new Date(),
        endDate: new Date(Date.now() + (plan === 'basic' ? 30 : plan === 'premium' ? 30 : 365) * 24 * 60 * 60 * 1000),
        paymentId: payment.id,
        paymentMethod: 'payoneer',
        amount: amount,
        currency: currency.toUpperCase(),
        bankAccount: '047312 בנק פאגי סניף 173'
      }
    });

    // יצירת רשומת תשלום
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: amount,
        currency: currency.toUpperCase(),
        paymentMethod: 'payoneer',
        status: 'pending',
        bankAccount: '047312 בנק פאגי סניף 173',
        paymentDetails: JSON.stringify(payment)
      }
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentUrl: payment.payment_url,
      subscriptionId: subscription.id
    });

  } catch (error) {
    console.error('שגיאה ביצירת תשלום Payoneer:', error);
    return NextResponse.json(
      { error: 'שגיאה ביצירת תשלום' },
      { status: 500 }
    );
  }
}


