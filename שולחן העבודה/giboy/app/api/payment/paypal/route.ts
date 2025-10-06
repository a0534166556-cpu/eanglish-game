import { NextRequest, NextResponse } from 'next/server';

// PayPal REST API base URLs
const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

// Create PayPal order
export async function POST(request: NextRequest) {
  try {
    const { amount, currency, description, diamonds, coins } = await request.json();

    // Get access token
    const accessToken = await getPayPalAccessToken();

    // Create order
    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency || 'USD',
            value: amount.toFixed(2),
          },
          description: description || `${diamonds || 0} יהלומים + ${coins || 0} מטבעות`,
        }],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/cancel`,
          brand_name: 'Giboy English Games',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('PayPal order creation error:', errorData);
      throw new Error('Failed to create PayPal order');
    }

    const orderData = await orderResponse.json();

    // Get approval URL
    const approvalUrl = orderData.links.find((link: any) => link.rel === 'approve')?.href;

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      approvalUrl: approvalUrl,
      clientId: process.env.PAYPAL_CLIENT_ID,
    });

  } catch (error: any) {
    console.error('PayPal payment error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'שגיאה ביצירת התשלום',
    }, { status: 500 });
  }
}

// Capture PayPal order (after user approval)
export async function PUT(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    // Get access token
    const accessToken = await getPayPalAccessToken();

    // Capture the order
    const captureResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json();
      console.error('PayPal capture error:', errorData);
      throw new Error('Failed to capture PayPal payment');
    }

    const captureData = await captureResponse.json();

    return NextResponse.json({
      success: true,
      captureId: captureData.id,
      status: captureData.status,
      details: captureData,
    });

  } catch (error: any) {
    console.error('PayPal capture error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'שגיאה בביצוע התשלום',
    }, { status: 500 });
  }
}

