const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleAds() {
  try {
    console.log('Creating sample ads...');

    // יצירת פרסומות לדוגמה
    const sampleAds = [
      {
        title: 'פרסומת לדוגמה - למעלה',
        type: 'banner',
        position: 'top',
        imageUrl: 'https://via.placeholder.com/728x90/4F46E5/FFFFFF?text=Top+Banner+Ad',
        linkUrl: 'https://example.com',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ימים
        impressions: 0,
        clicks: 0,
        ctr: 0,
        earnings: 0
      },
      {
        title: 'פרסומת לדוגמה - למטה',
        type: 'banner',
        position: 'bottom',
        imageUrl: 'https://via.placeholder.com/728x90/059669/FFFFFF?text=Bottom+Banner+Ad',
        linkUrl: 'https://example.com',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        impressions: 0,
        clicks: 0,
        ctr: 0,
        earnings: 0
      },
      {
        title: 'פרסומת טבעית',
        type: 'native',
        position: 'inline',
        linkUrl: 'https://example.com',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        impressions: 0,
        clicks: 0,
        ctr: 0,
        earnings: 0
      },
      {
        title: 'פרסומת פופאפ',
        type: 'popup',
        position: 'floating',
        linkUrl: 'https://example.com',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        impressions: 0,
        clicks: 0,
        ctr: 0,
        earnings: 0
      }
    ];

    // מחיקת פרסומות קיימות (אופציונלי)
    await prisma.ad.deleteMany({});

    // יצירת הפרסומות
    for (const adData of sampleAds) {
      const ad = await prisma.ad.create({
        data: adData
      });
      console.log(`Created ad: ${ad.title} (${ad.position})`);
    }

    console.log('✅ Sample ads created successfully!');
    console.log('📊 You can now see ads on your website');
    console.log('🎯 Go to /admin/ads to manage them');

  } catch (error) {
    console.error('❌ Error creating sample ads:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleAds();
