// Script to add subscription to a user
// Usage: node scripts/add-subscription.js <email> <plan> [durationMonths]
// Example: node scripts/add-subscription.js a0534166566@gmail.com premium 12

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSubscription() {
  try {
    const email = process.argv[2];
    const plan = process.argv[3] || 'premium';
    const durationMonths = parseInt(process.argv[4]) || 12;

    if (!email) {
      console.error('❌ Error: Email is required');
      console.log('Usage: node scripts/add-subscription.js <email> <plan> [durationMonths]');
      console.log('Example: node scripts/add-subscription.js a0534166566@gmail.com premium 12');
      process.exit(1);
    }

    console.log(`🔍 Looking for user with email: ${email}`);

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);

    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    });

    // Calculate end date
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Plan prices
    const planPrices = {
      basic: 10.00,
      premium: 29.90,
      yearly: 299.90
    };

    const amount = planPrices[plan] || 29.90;

    // Use upsert to update or create subscription
    const paymentId = existingSubscription 
      ? existingSubscription.paymentId 
      : `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`📝 Creating/updating subscription: ${plan} for ${durationMonths} months`);

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
    await prisma.payment.upsert({
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
          durationMonths: durationMonths
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
          durationMonths: durationMonths
        })
      }
    });

    console.log('✅ Subscription added successfully!');
    console.log(`   User: ${user.name} (${user.email})`);
    console.log(`   Plan: ${plan}`);
    console.log(`   Duration: ${durationMonths} months`);
    console.log(`   End Date: ${endDate.toLocaleString('he-IL')}`);
    console.log(`   Status: active`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2002') {
      console.error('   User already has a subscription. It was updated.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addSubscription();


