import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// אתחול Stripe (בסביבת פיתוח - תוכל לשנות למפתחות אמיתיים)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, userEmail } = await request.json();

    if (!plan || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // מחירי התוכניות (בשקלים)
    const planPrices = {
      basic: 990,    // ₪9.90
      premium: 1990, // ₪19.90
      yearly: 19990  // ₪199.90
    };

    const amount = planPrices[plan as keyof typeof planPrices];
    if (!amount) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // יצירת Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // באגורות
      currency: 'ils',
      metadata: {
        plan: plan,
        userId: userId,
        userEmail: userEmail || 'user@example.com'
      },
      description: `מנוי ${plan} - Word Clash`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      currency: 'ils'
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}


