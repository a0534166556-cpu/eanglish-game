const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearUserItems() {
  try {
    const email = 'a0534166556@gmail.com';
    
    console.log('🧹 מנקה אווטארים ותגים...');
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        ownedAvatars: null,
        avatarId: null,
        ownedTags: null,
        selectedTag: null
      }
    });

    console.log('✅ נוקה בהצלחה!');
    console.log('עכשיו תוכל לקנות אווטארים ותגים מחדש.');

  } catch (error) {
    console.error('❌ שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearUserItems();











