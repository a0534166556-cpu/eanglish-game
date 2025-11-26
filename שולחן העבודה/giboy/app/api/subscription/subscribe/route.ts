import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, paymentMethod, paymentDetails, bankTransfer } = await request.json();

    if (!plan || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // מחירי התוכניות
    const planPrices = {
      basic: 10.00,
      premium: 29.90,
      yearly: 299.90
    };

    const amount = planPrices[plan as keyof typeof planPrices] || 10.00;

    // בדיקת פרטי תשלום
    if (paymentMethod === 'card' && paymentDetails) {
      const { number, expiry, cvv, name } = paymentDetails;
      
      // בדיקות בסיסיות
      if (!number || !expiry || !cvv || !name) {
        return NextResponse.json(
          { error: 'Missing card details' },
          { status: 400 }
        );
      }
      
      // בדיקת מספר כרטיס (Luhn algorithm)
      const cardNumber = number.replace(/\s/g, '');
      if (cardNumber.length !== 16 || !isValidCardNumber(cardNumber)) {
        return NextResponse.json(
          { error: 'Invalid card number' },
          { status: 400 }
        );
      }
      
      // בדיקת תאריך תפוגה
      const [month, year] = expiry.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        return NextResponse.json(
          { error: 'Invalid expiry month' },
          { status: 400 }
        );
      }
      
      if (parseInt(year) < currentYear || 
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        return NextResponse.json(
          { error: 'Card expired' },
          { status: 400 }
        );
      }
    }

    // יצירת מנוי במסד הנתונים
    const endDate = plan === 'yearly' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // קביעת paymentId - אם זה PayPal, נשתמש ב-orderId
    const paymentId = paymentMethod === 'paypal' && paymentDetails?.orderId
      ? paymentDetails.orderId
      : `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // פרטי חשבון הבנק
    const bankAccount = '047312 בנק פאגי סניף 173';

    // קביעת transactionId - אם זה PayPal, נשתמש ב-captureId או orderId
    const transactionId = paymentMethod === 'paypal' 
      ? (paymentDetails?.captureId || paymentDetails?.orderId || null)
      : (bankTransfer?.transactionId || null);

    // יצירת המנוי
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'active',
        startDate: new Date(),
        endDate,
        paymentId,
        paymentMethod: paymentMethod || 'bank_transfer',
        amount,
        currency: 'ILS',
        bankAccount,
        transactionId: transactionId
      }
    });

    // יצירת רשומת תשלום
    const payment = await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount,
        currency: 'ILS',
        paymentMethod: paymentMethod || 'bank_transfer',
        status: 'completed',
        bankAccount,
        transactionId: bankTransfer?.transactionId || null,
        paymentDetails: JSON.stringify({
          plan,
          paymentMethod,
          cardDetails: paymentMethod === 'card' ? {
            last4: paymentDetails?.number?.slice(-4),
            expiry: paymentDetails?.expiry
          } : null,
          paypalDetails: paymentMethod === 'paypal' ? {
            orderId: paymentDetails?.orderId,
            captureId: paymentDetails?.captureId
          } : null,
          bankTransfer: bankTransfer || null
        })
      }
    });

    console.log('Subscription created:', subscription);
    console.log('Payment created:', payment);

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
      success: true,
      subscription: subscriptionData,
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        transactionId: payment.transactionId
      },
      message: 'המנוי נוצר בהצלחה!'
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// פונקציה לבדיקת מספר כרטיס (Luhn algorithm)
function isValidCardNumber(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}
