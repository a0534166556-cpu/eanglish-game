const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Try a simple query
    const count = await prisma.achievement.count();
    console.log(`📊 Found ${count} achievements in database`);
    
    const shopCount = await prisma.shopItem.count();
    console.log(`🛍️  Found ${shopCount} shop items in database`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.message.includes('P1001') || error.message.includes('connection')) {
      console.error('\n💡 Connection error detected!');
      console.error('💡 Possible issues:');
      console.error('   1. MySQL server is not running');
      console.error('   2. DATABASE_URL in .env is incorrect');
      console.error('   3. Network/firewall blocking connection');
      console.error('   4. Railway database might be paused or unavailable');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

