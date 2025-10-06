const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addHouseItems() {
  console.log('🏠 Adding beautiful house items...');

  const shopItems = [
    // רהיטים - Furniture
    {
      name: 'כורסת עור מפוארת',
      description: 'כורסה יוקרתית מעור איטלקי אמיתי עם תפרים מוזהבים',
      category: 'furniture',
      price: 150,
      icon: '🪑',
      rarity: 'epic'
    },
    {
      name: 'ספה מודרנית מעוצבת',
      description: 'ספה תלת-מושבית עם ריפוד קטיפה רך ונוח',
      category: 'furniture',
      price: 250,
      icon: '🛋️',
      rarity: 'rare'
    },
    {
      name: 'מיטה זוגית מלכותית',
      description: 'מיטה מפוארת מעץ מלא עם חריטות מיוחדות',
      category: 'furniture',
      price: 400,
      icon: '🛏️',
      rarity: 'legendary'
    },
    {
      name: 'שולחן אוכל מעץ אלון',
      description: 'שולחן אוכל מעץ אלון מלא ל-6 סועדים',
      category: 'furniture',
      price: 200,
      icon: '🪵',
      rarity: 'rare'
    },
    {
      name: 'כיסא בר מודרני',
      description: 'כיסא בר בעיצוב מודרני עם משענת גב מרופדת',
      category: 'furniture',
      price: 80,
      icon: '🪑',
      rarity: 'common'
    },
    {
      name: 'ארון ספרים מעץ אגוז',
      description: 'ארון ספרים יפהפה מעץ אגוז עם 5 מדפים',
      category: 'furniture',
      price: 180,
      icon: '📚',
      rarity: 'rare'
    },
    {
      name: 'שידת עץ וינטאג׳',
      description: 'שידה מעוצבת בסגנון וינטאג׳ עם 4 מגירות',
      category: 'furniture',
      price: 120,
      icon: '🗄️',
      rarity: 'common'
    },
    {
      name: 'שולחן קפה עגול',
      description: 'שולחן קפה אלגנטי עם משטח זכוכית',
      category: 'furniture',
      price: 90,
      icon: '☕',
      rarity: 'common'
    },
    {
      name: 'כורסת נדנדה',
      description: 'כורסת נדנדה נוחה ורגועה לפינת קריאה',
      category: 'furniture',
      price: 110,
      icon: '🪑',
      rarity: 'rare'
    },
    {
      name: 'מזנון מודרני',
      description: 'מזנון מעוצב עם דלתות זכוכית ומדפי תצוגה',
      category: 'furniture',
      price: 160,
      icon: '🪟',
      rarity: 'rare'
    },

    // קישוטים - Decoration
    {
      name: 'צמח מונסטרה גדול',
      description: 'עציץ עם צמח מונסטרה ירוק ומרשים',
      category: 'decoration',
      price: 60,
      icon: '🌿',
      rarity: 'common'
    },
    {
      name: 'פיקוס בנימינה',
      description: 'עץ פיקוס בנימינה בעציץ קרמי מעוצב',
      category: 'decoration',
      price: 80,
      icon: '🌳',
      rarity: 'rare'
    },
    {
      name: 'קקטוס מעוצב',
      description: 'קקטוס יפהפה בעציץ קרמי צבעוני',
      category: 'decoration',
      price: 30,
      icon: '🌵',
      rarity: 'common'
    },
    {
      name: 'תמונת קיר אבסטרקטית',
      description: 'ציור אבסטרקטי צבעוני במסגרת זהב',
      category: 'decoration',
      price: 100,
      icon: '🖼️',
      rarity: 'rare'
    },
    {
      name: 'תמונת נוף הרים',
      description: 'צילום פנורמי של הרים מושלגים',
      category: 'decoration',
      price: 90,
      icon: '🏔️',
      rarity: 'common'
    },
    {
      name: 'מראה מעוצבת גדולה',
      description: 'מראה גדולה במסגרת זהב בארוק',
      category: 'decoration',
      price: 150,
      icon: '🪞',
      rarity: 'epic'
    },
    {
      name: 'אגרטל קרמי מעוצב',
      description: 'אגרטל קרמי בעבודת יד עם פרחים יבשים',
      category: 'decoration',
      price: 50,
      icon: '🏺',
      rarity: 'common'
    },
    {
      name: 'שעון קיר וינטאג׳',
      description: 'שעון קיר גדול בסגנון וינטאג׳ עם מספרים רומיים',
      category: 'decoration',
      price: 120,
      icon: '🕰️',
      rarity: 'rare'
    },
    {
      name: 'פסל אומנותי',
      description: 'פסל מודרני מברונזה',
      category: 'decoration',
      price: 200,
      icon: '🗿',
      rarity: 'epic'
    },
    {
      name: 'כרית נוי מעוצבת',
      description: 'כרית נוי צבעונית עם רקמה מיוחדת',
      category: 'decoration',
      price: 40,
      icon: '🛋️',
      rarity: 'common'
    },
    {
      name: 'שטיח פרסי מפואר',
      description: 'שטיח פרסי אותנטי בעבודת יד',
      category: 'decoration',
      price: 300,
      icon: '🧶',
      rarity: 'legendary'
    },
    {
      name: 'וילון קטיפה מלכותי',
      description: 'וילון קטיפה עבה בצבע בורדו מלכותי',
      category: 'decoration',
      price: 130,
      icon: '🎭',
      rarity: 'rare'
    },

    // תאורה - Lighting
    {
      name: 'נורת אדיסון עתיקה',
      description: 'נורת אדיסון בסגנון וינטאג׳ עם אור חם',
      category: 'lighting',
      price: 50,
      icon: '💡',
      rarity: 'common'
    },
    {
      name: 'מנורת רצפה מודרנית',
      description: 'מנורת רצפה בעיצוב מינימליסטי',
      category: 'lighting',
      price: 90,
      icon: '🕯️',
      rarity: 'common'
    },
    {
      name: 'נברשת קריסטל יוקרתית',
      description: 'נברשת קריסטל מרהיבה עם 12 נורות',
      category: 'lighting',
      price: 400,
      icon: '✨',
      rarity: 'legendary'
    },
    {
      name: 'מנורת שולחן מעוצבת',
      description: 'מנורת שולחן בעיצוב ארט-דקו',
      category: 'lighting',
      price: 70,
      icon: '🔦',
      rarity: 'common'
    },
    {
      name: 'ספוט תקרה LED',
      description: 'ספוט תקרה מודרני עם אור לבן חם',
      category: 'lighting',
      price: 60,
      icon: '💡',
      rarity: 'common'
    },
    {
      name: 'נברשת תעשייתית',
      description: 'נברשת בסגנון לופט תעשייתי',
      category: 'lighting',
      price: 150,
      icon: '🏭',
      rarity: 'rare'
    },
    {
      name: 'רצועת LED צבעונית',
      description: 'תאורת LED עם שליטה מרחוק ו-16 מיליון צבעים',
      category: 'lighting',
      price: 80,
      icon: '🌈',
      rarity: 'rare'
    },

    // קירות - Walls
    {
      name: 'טפט פרחוני רומנטי',
      description: 'טפט עם דוגמת פרחים עדינה',
      category: 'wall',
      price: 100,
      icon: '🌸',
      rarity: 'common'
    },
    {
      name: 'טפט גאומטרי מודרני',
      description: 'טפט עם דוגמה גאומטרית בצבעים נועזים',
      category: 'wall',
      price: 120,
      icon: '🔷',
      rarity: 'rare'
    },
    {
      name: 'לבנים חשופות',
      description: 'קיר לבנים אדומות בסגנון לופט',
      category: 'wall',
      price: 150,
      icon: '🧱',
      rarity: 'rare'
    },
    {
      name: 'קיר עץ מחופה',
      description: 'ציפוי עץ טבעי למראה חם ונעים',
      category: 'wall',
      price: 180,
      icon: '🪵',
      rarity: 'epic'
    },
    {
      name: 'קיר בטון מוחלק',
      description: 'גימור בטון מוחלק במראה תעשייתי',
      category: 'wall',
      price: 140,
      icon: '⬜',
      rarity: 'rare'
    },

    // רצפה - Floor
    {
      name: 'פרקט עץ אלון',
      description: 'פרקט עץ אלון טבעי במראה קלאסי',
      category: 'floor',
      price: 200,
      icon: '🟫',
      rarity: 'rare'
    },
    {
      name: 'אריחי שיש מבריק',
      description: 'אריחי שיש לבן מבריק ומפואר',
      category: 'floor',
      price: 250,
      icon: '⬜',
      rarity: 'epic'
    },
    {
      name: 'למינציה מעוצבת',
      description: 'למינציה איכותית דמוי עץ',
      category: 'floor',
      price: 120,
      icon: '🟤',
      rarity: 'common'
    },
    {
      name: 'שטיח פרווה לבן',
      description: 'שטיח פרווה רך ולבן למראה יוקרתי',
      category: 'floor',
      price: 180,
      icon: '🤍',
      rarity: 'rare'
    },
    {
      name: 'אריחי קרמיקה מעוצבים',
      description: 'אריחים עם דוגמה מרוקאית צבעונית',
      category: 'floor',
      price: 160,
      icon: '🔶',
      rarity: 'rare'
    },
    {
      name: 'רצפת בטון מוחלק',
      description: 'רצפת בטון מוחלק בסגנון מינימליסטי',
      category: 'floor',
      price: 140,
      icon: '⬜',
      rarity: 'common'
    },
    {
      name: 'פרקט אגוז אמריקאי',
      description: 'פרקט אגוז איכותי בגוון כהה ועמוק',
      category: 'floor',
      price: 280,
      icon: '🟫',
      rarity: 'epic'
    }
  ];

  let added = 0;
  let skipped = 0;

  for (const item of shopItems) {
    try {
      // Check if item already exists
      const existing = await prisma.shopItem.findFirst({
        where: {
          name: item.name,
          category: item.category
        }
      });

      if (existing) {
        console.log(`⏭️  Skipping existing item: ${item.name}`);
        skipped++;
        continue;
      }

      await prisma.shopItem.create({
        data: item
      });
      console.log(`✅ Added: ${item.name} (${item.category}) - ${item.price} 💎`);
      added++;
    } catch (error) {
      console.error(`❌ Error adding ${item.name}:`, error.message);
    }
  }

  console.log(`\n🎉 Done! Added ${added} items, skipped ${skipped} existing items.`);
}

addHouseItems()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



