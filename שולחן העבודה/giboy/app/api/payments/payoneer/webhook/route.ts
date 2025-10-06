import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPaymentConfirmationEmail, sendPaymentFailureEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // בדיקת סוג האירוע
    const eventType = body.event_type;
    const paymentData = body.data;

    console.log('Payoneer Webhook received:', eventType, paymentData);

    switch (eventType) {
      case 'payment.completed':
        await handlePaymentCompleted(paymentData);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(paymentData);
        break;
      
      default:
        console.log('Unknown event type:', eventType);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('שגיאה בעיבוד Payoneer webhook:', error);
    return NextResponse.json(
      { error: 'שגיאה בעיבוד webhook' },
      { status: 500 }
    );
  }
}

async function handlePaymentCompleted(paymentData: any) {
  try {
    const { payment_id, amount, currency, metadata } = paymentData;
    
    // מציאת המנוי
    const subscription = await prisma.subscription.findFirst({
      where: { paymentId: payment_id },
      include: { user: true }
    });

    if (!subscription) {
      console.error('Subscription not found for payment:', payment_id);
      return;
    }

    // עדכון סטטוס המנוי
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { 
        status: 'active',
        startDate: new Date()
      }
    });

    // עדכון סטטוס התשלום
    await prisma.payment.updateMany({
      where: { subscriptionId: subscription.id },
      data: { 
        status: 'completed',
        transactionId: payment_id
      }
    });

    // שליחת מייל אישור
    if (subscription.user.email) {
      await sendPaymentConfirmationEmail(
        subscription.user.email,
        subscription.plan,
        amount,
        currency
      );
    }

    console.log('Payment completed successfully:', payment_id);

  } catch (error) {
    console.error('Error handling payment completed:', error);
  }
}

async function handlePaymentFailed(paymentData: any) {
  try {
    const { payment_id, amount, currency, metadata } = paymentData;
    
    // מציאת המנוי
    const subscription = await prisma.subscription.findFirst({
      where: { paymentId: payment_id },
      include: { user: true }
    });

    if (!subscription) {
      console.error('Subscription not found for payment:', payment_id);
      return;
    }

    // עדכון סטטוס המנוי
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'inactive' }
    });

    // עדכון סטטוס התשלום
    await prisma.payment.updateMany({
      where: { subscriptionId: subscription.id },
      data: { 
        status: 'failed',
        transactionId: payment_id
      }
    });

    // שליחת מייל כישלון
    if (subscription.user.email) {
      await sendPaymentFailureEmail(
        subscription.user.email,
        subscription.plan,
        amount,
        currency
      );
    }

    console.log('Payment failed:', payment_id);

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}


