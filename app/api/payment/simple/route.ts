import { NextRequest, NextResponse } from 'next/server';

// Simple payment simulation - for testing purposes
export async function POST(request: NextRequest) {
  try {
    const { amount, currency, description, userEmail } = await request.json();

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

    // Simulate success (90% success rate for testing)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: 'התשלום הושלם בהצלחה!',
        amount: amount,
        currency: currency,
        userEmail: userEmail
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'התשלום נכשל. אנא נסה שוב.',
      }, { status: 400 });
    }

  } catch (error) {
    // console.error('Payment error:', error);
    return NextResponse.json({
      success: false,
      error: 'שגיאה פנימית בשרת',
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
        status: 'completed',
        amount: 100,
        currency: 'ILS',
        created_at: new Date().toISOString()
      },
    });

  } catch (error) {
    // console.error('Payment status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

