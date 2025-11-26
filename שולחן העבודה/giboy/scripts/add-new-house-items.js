const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addNewHouseItems() {
  console.log('🏠 Adding 10 new beautiful house items...');

  const newItems = [
    // רהיטים יפים
    {
      name: 'כורסת ערסל נוחה',
      description: 'כורסת ערסל מעוצבת עם כרית רכה - מושלמת לקריאה',
      category: 'furniture',
      price: 180,
      icon: '🪴',
      rarity: 'rare'
    },
    {
      name: 'שולחן עבודה מודרני',
      description: 'שולחן עבודה מינימליסטי עם מגירות נסתרות',
      category: 'furniture',
      price: 220,
      icon: '🖥️',
      rarity: 'rare'
    },
    {
      name: 'פינת ישיבה מפוארת',
      description: 'פינת ישיבה נוחה עם 3 כריות רכות וצבעוניות',
      category: 'furniture',
      price: 320,
      icon: '🛋️✨',
      rarity: 'epic'
    },
    
    // קישוטים יפים
    {
      name: 'עץ בונסאי מעוצב',
      description: 'עץ בונסאי יפני מעוצב בקפידה - מוסיף אווירה שלווה',
      category: 'decoration',
      price: 150,
      icon: '🌳',
      rarity: 'rare'
    },
    {
      name: 'אקווריום דגים צבעוני',
      description: 'אקווריום מעוצב עם דגים צבעוניים ותאורה כחולה',
      category: 'decoration',
      price: 280,
      icon: '🐠',
      rarity: 'epic'
    },
    {
      name: 'פסל ברונזה אמנותי',
      description: 'פסל ברונזה מעוצב בסגנון מודרני - יצירת אמנות אמיתית',
      category: 'decoration',
      price: 350,
      icon: '🗿',
      rarity: 'legendary'
    },
    
    // תאורה יפה
    {
      name: 'מנורת רצפה עיצובית',
      description: 'מנורת רצפה מודרנית עם גוף מתכת ונורה חכמה',
      category: 'lighting',
      price: 140,
      icon: '💡✨',
      rarity: 'rare'
    },
    {
      name: 'נברשת קריסטל מפוארת',
      description: 'נברשת קריסטל עם 20 נרות וזגוגיות צבעוניות',
      category: 'lighting',
      price: 500,
      icon: '💎',
      rarity: 'legendary'
    },
    
    // קירות יפים
    {
      name: 'טפט קיר עם נוף',
      description: 'טפט קיר עם תמונת נוף ים שלווה - מוסיף מרחב',
      category: 'wall',
      price: 200,
      icon: '🌊',
      rarity: 'rare'
    },
    {
      name: 'גלריית תמונות מעוצבת',
      description: 'גלריית תמונות עם מסגרות זהב - מושלמת לתמונות משפחתיות',
      category: 'wall',
      price: 180,
      icon: '🖼️✨',
      rarity: 'epic'
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

    await addNewHouseItems();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

main();




