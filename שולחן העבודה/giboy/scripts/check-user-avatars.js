const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserAvatars() {
  try {
    const email = 'a0534166556@gmail.com'; // המייל של המנהל
    
    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (user) {
      console.log('📊 נתוני משתמש:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`👤 שם: ${user.name}`);
      console.log(`📧 מייל: ${user.email}`);
      console.log(`🪙 מטבעות: ${user.coins}`);
      console.log(`💎 יהלומים: ${user.diamonds}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🎭 אווטארים שיש לו:');
      if (user.ownedAvatars) {
        try {
          const avatars = JSON.parse(user.ownedAvatars);
          console.log(avatars);
        } catch (e) {
          console.log('שגיאה בפירוק JSON:', user.ownedAvatars);
        }
      } else {
        console.log('אין אווטארים');
      }
      
      console.log('\n🏷️ תגים שיש לו:');
      if (user.ownedTags) {
        try {
          const tags = JSON.parse(user.ownedTags);
          console.log(tags);
        } catch (e) {
          console.log('שגיאה בפירוק JSON:', user.ownedTags);
        }
      } else {
        console.log('אין תגים');
      }
      
      console.log('\n✨ אווטאר נבחר:', user.avatarId || 'אין');
      console.log('🎫 תג נבחר:', user.selectedTag || 'אין');
    } else {
      console.log('❌ משתמש לא נמצא');
    }

  } catch (error) {
    console.error('❌ שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserAvatars();



