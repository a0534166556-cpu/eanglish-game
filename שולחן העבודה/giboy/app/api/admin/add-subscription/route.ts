import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId, email, plan, durationMonths } = await request.json();

    // Find user by userId or email
    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId }
      });
    } else if (email) {
      user = await prisma.user.findFirst({
        where: { email: email }
      });
    } else {
      return NextResponse.json(
        { error: 'userId or email is required' },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    });

    // Calculate end date
    const months = durationMonths || (plan === 'yearly' ? 12 : 1);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    // Plan prices
    const planPrices = {
      basic: 10.00,
      premium: 29.90,
      yearly: 299.90
    };

    const amount = planPrices[plan as keyof typeof planPrices] || 10.00;
    
    // Use upsert to update or create subscription
    const paymentId = existingSubscription 
      ? existingSubscription.paymentId 
      : `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan,
        status: 'active',
        startDate: new Date(),
        endDate,
        paymentMethod: 'admin',
        amount,
        currency: 'ILS',
        transactionId: `admin_${Date.now()}`,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        plan,
        status: 'active',
        startDate: new Date(),
        endDate,
        paymentId,
        paymentMethod: 'admin',
        amount,
        currency: 'ILS',
        transactionId: `admin_${Date.now()}`
      }
    });

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { subscriptionId: subscription.id },
      update: {
        amount,
        currency: 'ILS',
        paymentMethod: 'admin',
        status: 'completed',
        transactionId: `admin_${Date.now()}`,
        paymentDetails: JSON.stringify({
          plan,
          paymentMethod: 'admin',
          addedBy: 'admin',
          durationMonths: months
        }),
        updatedAt: new Date()
      },
      create: {
        subscriptionId: subscription.id,
        amount,
        currency: 'ILS',
        paymentMethod: 'admin',
        status: 'completed',
        transactionId: `admin_${Date.now()}`,
        paymentDetails: JSON.stringify({
          plan,
          paymentMethod: 'admin',
          addedBy: 'admin',
          durationMonths: months
        })
      }
    });

    console.log('Subscription added by admin:', {
      userId: user.id,
      email: user.email,
      plan,
      endDate
    });

    return NextResponse.json({
      success: true,
      message: `מנוי ${plan} נוסף בהצלחה למשתמש ${user.name} (${user.email})`,
      subscription: {
        id: subscription.id,
        userId: subscription.userId,
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate.toISOString(),
        paymentId: subscription.paymentId
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error: any) {
    console.error('Error adding subscription:', error);
    
    // Handle unique constraint violation (user already has subscription)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User already has a subscription. Use update instead.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to add subscription' },
      { status: 500 }
    );
  }
}

