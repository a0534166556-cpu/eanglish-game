const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeFloorItems() {
  try {
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    console.log('🗑️  Removing floor items...');
    const deleted = await prisma.shopItem.deleteMany({
      where: { category: 'floor' }
    });
    
    console.log(`✅ Deleted ${deleted.count} floor items from database`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

removeFloorItems();

