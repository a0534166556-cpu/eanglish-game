const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedData() {
  console.log('🌱 Starting to seed data...');

  // יצירת הישגים
  const achievements = [
    // הישגי משחקים
    {
      name: 'משחק ראשון',
      description: 'שחק במשחק הראשון שלך',
      icon: '🎮',
      category: 'games',
      requirement: 1,
      reward: 10
    },
    {
      name: 'ניצחון ראשון',
      description: 'נצח במשחק הראשון שלך',
      icon: '🏆',
      category: 'games',
      requirement: 1,
      reward: 20
    },
    {
      name: '10 משחקים',
      description: 'שחק ב-10 משחקים',
      icon: '🎯',
      category: 'games',
      requirement: 10,
      reward: 50
    },
    {
      name: '5 ניצחונות',
      description: 'נצח ב-5 משחקים',
      icon: '🥇',
      category: 'games',
      requirement: 5,
      reward: 75
    },
    {
      name: '100 משחקים',
      description: 'שחק ב-100 משחקים',
      icon: '💯',
      category: 'games',
      requirement: 100,
      reward: 200
    },
    {
      name: '50 ניצחונות',
      description: 'נצח ב-50 משחקים',
      icon: '👑',
      category: 'games',
      requirement: 50,
      reward: 300
    },
    // הישגי רצף
    {
      name: 'רצף יומי',
      description: 'שחק 3 ימים ברצף',
      icon: '🔥',
      category: 'streak',
      requirement: 3,
      reward: 100
    },
    {
      name: 'רצף שבועי',
      description: 'שחק 7 ימים ברצף',
      icon: '📅',
      category: 'streak',
      requirement: 7,
      reward: 250
    },
    // הישגי רמה
    {
      name: 'רמה 5',
      description: 'הגע לרמה 5',
      icon: '⭐',
      category: 'level',
      requirement: 5,
      reward: 150
    },
    {
      name: 'רמה 10',
      description: 'הגע לרמה 10',
      icon: '🌟',
      category: 'level',
      requirement: 10,
      reward: 400
    },
    // הישגים מיוחדים
    {
      name: 'מאסטר Word Clash',
      description: 'נצח ב-20 משחקי Word Clash',
      icon: '⚡',
      category: 'special',
      requirement: 20,
      reward: 500
    },
    {
      name: 'אוסף מושלם',
      description: 'קנה 50 פריטים בחנות',
      icon: '🛍️',
      category: 'special',
      requirement: 50,
      reward: 1000
    }
  ];

  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement
    });
  }

  console.log('✅ Achievements created');

  // יצירת פריטי חנות
  const shopItems = [
    // רהיטים
    {
      name: 'כיסא פשוט',
      description: 'כיסא נוח ופשוט',
      category: 'furniture',
      price: 50,
      icon: '🪑',
      rarity: 'common'
    },
    {
      name: 'שולחן עץ',
      description: 'שולחן עץ איכותי',
      category: 'furniture',
      price: 100,
      icon: '🪵',
      rarity: 'common'
    },
    {
      name: 'ספה נוחה',
      description: 'ספה נוחה לנוח עליה',
      category: 'furniture',
      price: 200,
      icon: '🛋️',
      rarity: 'rare'
    },
    {
      name: 'מיטה מלכותית',
      description: 'מיטה מפוארת ומלכותית',
      category: 'furniture',
      price: 500,
      icon: '🛏️',
      rarity: 'epic'
    },
    // קישוטים
    {
      name: 'צמח ירוק',
      description: 'צמח ירוק ויפה',
      category: 'decoration',
      price: 30,
      icon: '🌱',
      rarity: 'common'
    },
    {
      name: 'תמונה יפה',
      description: 'תמונה מעוצבת לקיר',
      category: 'decoration',
      price: 75,
      icon: '🖼️',
      rarity: 'common'
    },
    {
      name: 'פסל זהב',
      description: 'פסל זהב מפואר',
      category: 'decoration',
      price: 300,
      icon: '🏆',
      rarity: 'epic'
    },
    {
      name: 'דגל זהב',
      description: 'דגל זהב מלכותי',
      category: 'decoration',
      price: 150,
      icon: '🏳️',
      rarity: 'rare'
    },
    // רצפה
    {
      name: 'רצפת עץ',
      description: 'רצפת עץ חמימה',
      category: 'floor',
      price: 80,
      icon: '🟫',
      rarity: 'common'
    },
    {
      name: 'רצפת שיש',
      description: 'רצפת שיש מפוארת',
      category: 'floor',
      price: 250,
      icon: '⚪',
      rarity: 'rare'
    },
    {
      name: 'רצפת זהב',
      description: 'רצפת זהב מלכותית',
      category: 'floor',
      price: 600,
      icon: '🟨',
      rarity: 'legendary'
    },
    // קירות
    {
      name: 'קיר לבן',
      description: 'קיר לבן נקי',
      category: 'wall',
      price: 40,
      icon: '🧱',
      rarity: 'common'
    },
    {
      name: 'קיר כחול',
      description: 'קיר כחול רגוע',
      category: 'wall',
      price: 60,
      icon: '🔵',
      rarity: 'common'
    },
    {
      name: 'קיר זהב',
      description: 'קיר זהב מפואר',
      category: 'wall',
      price: 200,
      icon: '🟡',
      rarity: 'epic'
    },
    // תאורה
    {
      name: 'נורה פשוטה',
      description: 'נורה פשוטה ובהירה',
      category: 'lighting',
      price: 25,
      icon: '💡',
      rarity: 'common'
    },
    {
      name: 'נברשת יפה',
      description: 'נברשת מעוצבת ויפה',
      category: 'lighting',
      price: 120,
      icon: '🕯️',
      rarity: 'rare'
    },
    {
      name: 'נברשת זהב',
      description: 'נברשת זהב מלכותית',
      category: 'lighting',
      price: 400,
      icon: '✨',
      rarity: 'legendary'
    }
  ];

  for (const item of shopItems) {
    await prisma.shopItem.create({
      data: item
    });
  }

  console.log('✅ Shop items created');

  // יצירת פרסי משחקים
  const gameRewards = [
    // Word Clash
    { gameName: 'word-clash', action: 'win', diamonds: 10, coins: 50, points: 100 },
    { gameName: 'word-clash', action: 'complete', diamonds: 5, coins: 25, points: 50 },
    { gameName: 'word-clash', action: 'streak', diamonds: 20, coins: 100, points: 200 },
    
    // Multiple Choice
    { gameName: 'multiple-choice', action: 'win', diamonds: 8, coins: 40, points: 80 },
    { gameName: 'multiple-choice', action: 'complete', diamonds: 4, coins: 20, points: 40 },
    
    // True False
    { gameName: 'true-false', action: 'win', diamonds: 6, coins: 30, points: 60 },
    { gameName: 'true-false', action: 'complete', diamonds: 3, coins: 15, points: 30 },
    
    // Fill Blanks
    { gameName: 'fill-blanks', action: 'win', diamonds: 7, coins: 35, points: 70 },
    { gameName: 'fill-blanks', action: 'complete', diamonds: 3, coins: 15, points: 30 },
    
    // Sentence Scramble
    { gameName: 'sentence-scramble', action: 'win', diamonds: 6, coins: 30, points: 60 },
    { gameName: 'sentence-scramble', action: 'complete', diamonds: 3, coins: 15, points: 30 }
  ];

  for (const reward of gameRewards) {
    await prisma.gameReward.create({
      data: reward
    });
  }

  console.log('✅ Game rewards created');
  console.log('🎉 All data seeded successfully!');
}

seedData()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
