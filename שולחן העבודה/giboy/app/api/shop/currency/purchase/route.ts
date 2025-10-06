import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, packageId, paymentMethod, cardDetails, amount, currency } = await request.json();

    if (!userId || !packageId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate payment method
    if (paymentMethod === 'card' && cardDetails) {
      // Basic validation
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        return NextResponse.json(
          { error: 'Invalid card details' },
          { status: 400 }
        );
      }
    }

    // Currency packages
    const packages = {
      starter: { diamonds: 100, coins: 1000, bonus: 0 },
      popular: { diamonds: 500, coins: 5000, bonus: 50 },
      premium: { diamonds: 1200, coins: 12000, bonus: 200 },
      ultimate: { diamonds: 3000, coins: 30000, bonus: 1000 }
    };

    const selectedPackage = packages[packageId as keyof typeof packages];
    if (!selectedPackage) {
      return NextResponse.json(
        { error: 'Invalid package' },
        { status: 400 }
      );
    }

    // In a real application, you would integrate with a payment processor here
    // For now, we'll simulate a successful payment
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update user's currency
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        diamonds: {
          increment: selectedPackage.diamonds + selectedPackage.bonus
        },
        coins: {
          increment: selectedPackage.coins
        }
      }
    });

    // Log the purchase (in a real app, you'd save this to a transactions table)
    console.log(`Purchase completed: User ${userId} bought ${packageId} package for $${amount}`);

    return NextResponse.json({
      success: true,
      message: 'Purchase completed successfully',
      user: {
        diamonds: updatedUser.diamonds,
        coins: updatedUser.coins
      }
    });

  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}
