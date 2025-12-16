const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMoreHouseItems() {
  console.log('🏠 Adding 10 more beautiful house items...');

  const newItems = [
    // רהיטים יוקרתיים
    {
      name: 'כורסת ערסל מודרנית',
      description: 'כורסת ערסל מעוצבת עם תמיכה ארגונומית מושלמת',
      category: 'furniture',
      price: 180,
      icon: '🪑',
      rarity: 'rare'
    },
    {
      name: 'שולחן עבודה מקצועי',
      description: 'שולחן עבודה רחב מעץ מלא עם מגירות מובנות',
      category: 'furniture',
      price: 220,
      icon: '🪵',
      rarity: 'epic'
    },
    {
      name: 'ארון בגדים מלכותי',
      description: 'ארון בגדים מפואר עם מראות ומגירות נסתרות',
      category: 'furniture',
      price: 350,
      icon: '👔',
      rarity: 'legendary'
    },
    
    // קישוטים יפים
    {
      name: 'וילון קטיפה מפואר',
      description: 'וילון קטיפה כבד עם תחרה זהובה',
      category: 'decoration',
      price: 120,
      icon: '🪟',
      rarity: 'rare'
    },
    {
      name: 'מראה זהב מעוצבת',
      description: 'מראה גדולה עם מסגרת זהב מעוצבת',
      category: 'decoration',
      price: 150,
      icon: '🪞',
      rarity: 'epic'
    },
    {
      name: 'פסל אמנותי מודרני',
      description: 'פסל ברונזה מעוצב בסגנון מודרני',
      category: 'decoration',
      price: 200,
      icon: '🗿',
      rarity: 'epic'
    },
    {
      name: 'אגרטל פורצלן מעוטר',
      description: 'אגרטל פורצלן סיני עם ציורים מסורתיים',
      category: 'decoration',
      price: 100,
      icon: '🏺',
      rarity: 'rare'
    },
    
    // תאורה יפה
    {
      name: 'נברשת קריסטל מפוארת',
      description: 'נברשת קריסטל עם 12 נרות וזגוגיות צבעוניות',
      category: 'lighting',
      price: 400,
      icon: '💎',
      rarity: 'legendary'
    },
    {
      name: 'מנורת שולחן עיצובית',
      description: 'מנורת שולחן מודרנית עם בסיס שיש',
      category: 'lighting',
      price: 90,
      icon: '💡',
      rarity: 'common'
    },
    
    // קירות
    {
      name: 'טפט קיר מוזהב',
      description: 'טפט קיר עם דוגמאות זהב מעוצבות',
      category: 'wall',
      price: 130,
      icon: '🖼️',
      rarity: 'rare'
    }
  ];

  console.log(`📊 Total new items to add: ${newItems.length}`);

  let added = 0;
  let skipped = 0;

  for (const item of newItems) {
    try {
      // Check if item already exists
      const existing = await prisma.shopItem.findFirst({
        where: { name: item.name }
      });

      if (existing) {
        console.log(`⏭️  Skipping "${item.name}" - already exists`);
        skipped++;
        continue;
      }

      await prisma.shopItem.create({
        data: item
      });
      console.log(`✅ Added: ${item.icon} ${item.name} (${item.rarity}) - ${item.price} 💎`);
      added++;
    } catch (error) {
      console.error(`❌ Error adding "${item.name}":`, error.message);
    }
  }

  console.log(`\n🎉 Items added successfully!`);
  console.log(`   ✅ Added: ${added}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
}

async function main() {
  try {
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    await addMoreHouseItems();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

main();

