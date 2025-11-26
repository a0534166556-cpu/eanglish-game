import { NextRequest, NextResponse } from 'next/server';
import { payoneerService } from '@/lib/payoneer';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'חסר paymentId' },
        { status: 400 }
      );
    }

    // בדיקת סטטוס ב-Payoneer
    const paymentStatus = await payoneerService.getPaymentStatus(paymentId) as { status: string; [key: string]: any };

    // עדכון סטטוס במסד הנתונים
    const subscription = await prisma.subscription.findFirst({
      where: { paymentId }
    });

    if (subscription) {
      const newStatus = paymentStatus.status === 'completed' ? 'active' : 
                       paymentStatus.status === 'failed' ? 'inactive' : 'pending';

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: newStatus }
      });

      await prisma.payment.updateMany({
        where: { subscriptionId: subscription.id },
        data: { 
          status: paymentStatus.status,
          transactionId: paymentStatus.transaction_id
        }
      });
    }

    return NextResponse.json({
      success: true,
      status: paymentStatus.status,
      subscriptionStatus: subscription?.status || 'not_found'
    });

  } catch (error) {
    console.error('שגיאה בבדיקת סטטוס תשלום:', error);
    return NextResponse.json(
      { error: 'שגיאה בבדיקת סטטוס תשלום' },
      { status: 500 }
    );
  }
}


