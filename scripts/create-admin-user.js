const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('👑 Creating/Updating admin user...');

  const adminData = {
    email: 'a0534166556@gmail.com',
    name: 'יהונתן',
    password: '13300',
    diamonds: 1000000,
    coins: 1000000
  };

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email }
    });

    let user;

    if (existingUser) {
      console.log('📝 User exists, updating...');
      
      // Update existing user
      user = await prisma.user.update({
        where: { email: adminData.email },
        data: {
          name: adminData.name,
          password: hashedPassword,
          diamonds: adminData.diamonds,
          coins: adminData.coins,
          updatedAt: new Date()
        }
      });

      console.log(`✅ User updated: ${user.name} (${user.email})`);
    } else {
      console.log('🆕 Creating new user...');
      
      // Create new user
      user = await prisma.user.create({
        data: {
          email: adminData.email,
          name: adminData.name,
          password: hashedPassword,
          diamonds: adminData.diamonds,
          coins: adminData.coins,
          points: 0,
          level: 1,
          gamesPlayed: 0,
          gamesWon: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`✅ User created: ${user.name} (${user.email})`);
    }

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    });

    if (existingSubscription) {
      console.log('📝 Subscription exists, updating...');
      
      // Update subscription to be active for 1 year
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          status: 'active',
          plan: 'yearly',
          startDate: startDate,
          endDate: endDate,
          updatedAt: new Date()
        }
      });

      console.log('✅ Subscription updated: Active for 1 year');
    } else {
      console.log('🆕 Creating new subscription...');
      
      // Create new subscription
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'yearly',
          status: 'active',
          startDate: startDate,
          endDate: endDate,
          paymentId: `admin-${user.id}-${Date.now()}`,
          paymentMethod: 'admin',
          amount: 0,
          currency: 'ILS',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log('✅ Subscription created: Active for 1 year');
    }

    console.log('\n🎉 Admin user setup complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log(`💎 Diamonds: ${user.diamonds.toLocaleString()}`);
    console.log(`🪙 Coins: ${user.coins.toLocaleString()}`);
    console.log(`⭐ Subscription: Active (1 year)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

createAdminUser()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



