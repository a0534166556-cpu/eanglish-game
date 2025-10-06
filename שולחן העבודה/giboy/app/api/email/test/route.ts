import { NextRequest, NextResponse } from 'next/server';
import { 
  sendWelcomeEmail, 
  sendPaymentConfirmationEmail, 
  sendPaymentFailureEmail,
  sendPasswordResetEmail,
  sendSubscriptionExpiryEmail 
} from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { type, email, name, plan, amount, currency, token, daysLeft } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'חסר כתובת מייל' },
        { status: 400 }
      );
    }

    let result = false;

    switch (type) {
      case 'welcome':
        if (!name) {
          return NextResponse.json(
            { error: 'חסר שם משתמש' },
            { status: 400 }
          );
        }
        result = await sendWelcomeEmail(email, name);
        break;

      case 'payment_success':
        if (!plan || !amount) {
          return NextResponse.json(
            { error: 'חסרים פרטי תשלום' },
            { status: 400 }
          );
        }
        result = await sendPaymentConfirmationEmail(email, plan, amount, currency || 'ILS');
        break;

      case 'payment_failure':
        if (!plan || !amount) {
          return NextResponse.json(
            { error: 'חסרים פרטי תשלום' },
            { status: 400 }
          );
        }
        result = await sendPaymentFailureEmail(email, plan, amount, currency || 'ILS');
        break;

      case 'password_reset':
        if (!token) {
          return NextResponse.json(
            { error: 'חסר טוקן איפוס' },
            { status: 400 }
          );
        }
        result = await sendPasswordResetEmail(email, token);
        break;

      case 'subscription_expiry':
        if (!plan || daysLeft === undefined) {
          return NextResponse.json(
            { error: 'חסרים פרטי מנוי' },
            { status: 400 }
          );
        }
        result = await sendSubscriptionExpiryEmail(email, plan, daysLeft);
        break;

      default:
        return NextResponse.json(
          { error: 'סוג מייל לא תקף' },
          { status: 400 }
        );
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `מייל ${type} נשלח בהצלחה ל-${email}`
      });
    } else {
      return NextResponse.json(
        { error: 'שגיאה בשליחת המייל' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      { error: 'שגיאה פנימית' },
      { status: 500 }
    );
  }
}


