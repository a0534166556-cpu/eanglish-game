import { NextRequest, NextResponse } from 'next/server';

// Payoneer API configuration
const PAYONEER_API_URL = 'https://api.payoneer.com/v4';
const PAYONEER_CLIENT_ID = process.env.PAYONEER_CLIENT_ID;
const PAYONEER_CLIENT_SECRET = process.env.PAYONEER_CLIENT_SECRET;

// Get access token
async function getAccessToken() {
  const response = await fetch(`${PAYONEER_API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: PAYONEER_CLIENT_ID!,
      client_secret: PAYONEER_CLIENT_SECRET!,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

// Create payment request
export async function POST(request: NextRequest) {
  try {
    const { amount, currency, description, userEmail } = await request.json();

    // Get access token
    const accessToken = await getAccessToken();

    // Create payment request
    const paymentData = {
      amount: amount,
      currency: currency || 'ILS',
      description: description || 'Word Clash Purchase',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      customer: {
        email: userEmail,
      },
    };

    const response = await fetch(`${PAYONEER_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        paymentUrl: result.payment_url,
        paymentId: result.id,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message || 'Payment creation failed',
      }, { status: 400 });
    }

  } catch (error) {
    // console.error('Payoneer payment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
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

    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYONEER_API_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      payment: result,
    });

  } catch (error) {
    // console.error('Payoneer payment status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
