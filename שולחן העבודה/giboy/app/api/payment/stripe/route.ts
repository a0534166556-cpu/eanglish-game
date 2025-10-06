import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Stripe configuration - only initialize if key exists
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
  : null;

// Create Stripe Checkout Session
export async function POST(request: NextRequest) {
  try {
    const { amount, currency, description, diamonds, coins } = await request.json();

    if (!stripe) {
      return NextResponse.json({
        success: false,
        error: 'Stripe is not configured'
      }, { status: 500 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid amount'
      }, { status: 400 });
    }

    // יצירת Checkout Session אמיתי
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: description || 'חבילת יהלומים ומטבעות',
              description: `${diamonds || 0} יהלומים + ${coins || 0} מטבעות`,
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/cancel`,
      metadata: {
        diamonds: diamonds?.toString() || '0',
        coins: coins?.toString() || '0',
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    });

  } catch (error: any) {
    console.error('Stripe payment error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'שגיאה ביצירת התשלום',
    }, { status: 500 });
  }
}

// Get payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({
        success: false,
        error: 'Payment ID is required',
      }, { status: 400 });
    }

    // Simulate payment status check
    return NextResponse.json({
      success: true,
      payment: {
        id: paymentId,
        status: 'succeeded',
        amount: 100,
        currency: 'ils',
        created_at: new Date().toISOString()
      },
    });

  } catch (error) {
    // console.error('Stripe payment status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

