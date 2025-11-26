const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDiamondAchievements() {
  console.log('💎 Adding new diamond-only achievements...');

  const newAchievements = [
    // ========== הישגי למידה ומילים ==========
    {
      name: 'אוצר מילים',
      description: 'למד 10 מילים חדשות',
      icon: '📚',
      category: 'special',
      requirement: 10,
      reward: 50,
      difficulty: 'easy',
      xpReward: 0
    },
    {
      name: 'מילון אישי',
      description: 'למד 50 מילים חדשות',
      icon: '📖',
      category: 'special',
      requirement: 50,
      reward: 150,
      difficulty: 'medium',
      xpReward: 0
    },
    {
      name: 'מילון עשיר',
      description: 'למד 100 מילים חדשות',
      icon: '📚✨',
      category: 'special',
      requirement: 100,
      reward: 300,
      difficulty: 'hard',
      xpReward: 0
    },
    {
      name: 'מילון מושלם',
      description: 'למד 500 מילים חדשות',
      icon: '📚👑',
      category: 'special',
      requirement: 500,
      reward: 1000,
      difficulty: 'extreme',
      xpReward: 0
    },

    // ========== הישגי דיוק ==========
    {
      name: 'דיוק מתחיל',
      description: 'השג 80% דיוק ב-5 משחקים',
      icon: '🎯',
      category: 'games',
      requirement: 5,
      reward: 75,
      difficulty: 'easy',
      xpReward: 0
    },
    {
      name: 'דיוק מקצועי',
      description: 'השג 90% דיוק ב-10 משחקים',
      icon: '🎯✨',
      category: 'games',
      requirement: 10,
      reward: 200,
      difficulty: 'medium',
      xpReward: 0
    },
    {
      name: 'דיוק מושלם',
      description: 'השג 100% דיוק ב-5 משחקים',
      icon: '🎯👑',
      category: 'games',
      requirement: 5,
      reward: 500,
      difficulty: 'hard',
      xpReward: 0
    },

    // ========== הישגי מהירות ==========
    {
      name: 'מהיר וזריז',
      description: 'סיים 10 משחקים תוך פחות מ-2 דקות כל אחד',
      icon: '⚡',
      category: 'special',
      requirement: 10,
      reward: 100,
      difficulty: 'medium',
      xpReward: 0
    },
    {
      name: 'מהירות אור',
      description: 'סיים 20 משחקים תוך פחות מדקה כל אחד',
      icon: '💨',
      category: 'special',
      requirement: 20,
      reward: 300,
      difficulty: 'hard',
      xpReward: 0
    },

    // ========== הישגי רצף ==========
    {
      name: 'שבוע של למידה',
      description: 'שחק 7 ימים ברצף',
      icon: '📅',
      category: 'streak',
      requirement: 7,
      reward: 150,
      difficulty: 'medium',
      xpReward: 0
    },
    {
      name: 'חודש של למידה',
      description: 'שחק 30 ימים ברצף',
      icon: '📆',
      category: 'streak',
      requirement: 30,
      reward: 1000,
      difficulty: 'extreme',
      xpReward: 0
    },

    // ========== הישגי משחקים ספציפיים ==========
    {
      name: 'מומחה בחירה',
      description: 'נצח 10 משחקי בחירה מרובה',
      icon: '✅',
      category: 'games',
      requirement: 10,
      reward: 200,
      difficulty: 'medium',
      xpReward: 0
    },
    {
      name: 'מומחה השלמה',
      description: 'נצח 10 משחקי השלמת משפטים',
      icon: '✏️',
      category: 'games',
      requirement: 10,
      reward: 200,
      difficulty: 'medium',
      xpReward: 0
    },
    {
      name: 'מומחה זיכרון',
      description: 'נצח 10 משחקי זיכרון',
      icon: '🧠',
      category: 'games',
      requirement: 10,
      reward: 200,
      difficulty: 'medium',
      xpReward: 0
    },
    {
      name: 'מומחה אמת/שקר',
      description: 'נצח 10 משחקי אמת/שקר',
      icon: '✓✗',
      category: 'games',
      requirement: 10,
      reward: 200,
      difficulty: 'medium',
      xpReward: 0
    },
    {
      name: 'מומחה ערבוב',
      description: 'נצח 10 משחקי ערבוב משפטים',
      icon: '🔀',
      category: 'games',
      requirement: 10,
      reward: 200,
      difficulty: 'medium',
      xpReward: 0
    },

    // ========== הישגי שיפור ==========
    {
      name: 'משתפר',
      description: 'שפר את הציון שלך ב-50% ב-5 משחקים',
      icon: '📈',
      category: 'special',
      requirement: 5,
      reward: 150,
      difficulty: 'medium',
      xpReward: 0
    },
    {
      name: 'משתפר מתמיד',
      description: 'שפר את הציון שלך ב-100% ב-10 משחקים',
      icon: '📈✨',
      category: 'special',
      requirement: 10,
      reward: 400,
      difficulty: 'hard',
      xpReward: 0
    },

    // ========== הישגי ניקוד ==========
    {
      name: 'צובר נקודות',
      description: 'השג 500 נקודות במשחק אחד',
      icon: '⭐',
      category: 'special',
      requirement: 1,
      reward: 100,
      difficulty: 'medium',
      xpReward: 0
    },
    {
      name: 'מלך הנקודות',
      description: 'השג 1000 נקודות במשחק אחד',
      icon: '⭐👑',
      category: 'special',
      requirement: 1,
      reward: 500,
      difficulty: 'hard',
      xpReward: 0
    },

    // ========== הישגי משחקים יומיים ==========
    {
      name: 'משחק יומי',
      description: 'שחק משחק אחד בכל יום במשך 5 ימים',
      icon: '🌅',
      category: 'streak',
      requirement: 5,
      reward: 100,
      difficulty: 'easy',
      xpReward: 0
    },
    {
      name: 'משחק יומי מתמיד',
      description: 'שחק משחק אחד בכל יום במשך 14 ימים',
      icon: '🌅✨',
      category: 'streak',
      requirement: 14,
      reward: 400,
      difficulty: 'hard',
      xpReward: 0
    },

    // ========== הישגי משחקים מרובים ==========
    {
      name: 'מרתון משחקים',
      description: 'שחק 10 משחקים ביום אחד',
      icon: '🏃',
      category: 'special',
      requirement: 1,
      reward: 200,
      difficulty: 'medium',
      xpReward: 0
    },
    {
      name: 'מרתון אגדי',
      description: 'שחק 20 משחקים ביום אחד',
      icon: '🏃💨',
      category: 'special',
      requirement: 1,
      reward: 600,
      difficulty: 'extreme',
      xpReward: 0
    },

    // ========== הישגי ניצחונות רצופים ==========
    {
      name: 'ניצחון רצוף',
      description: 'נצח 3 משחקים ברצף',
      icon: '🔥',
      category: 'games',
      requirement: 3,
      reward: 100,
      difficulty: 'easy',
      xpReward: 0
    },
    {
      name: 'ניצחון רצוף ארוך',
      description: 'נצח 10 משחקים ברצף',
      icon: '🔥✨',
      category: 'games',
      requirement: 10,
      reward: 500,
      difficulty: 'hard',
      xpReward: 0
    },

    // ========== הישגי משחקים שונים ==========
    {
      name: 'מגוון משחקים',
      description: 'שחק 5 סוגי משחקים שונים',
      icon: '🎲',
      category: 'games',
      requirement: 5,
      reward: 150,
      difficulty: 'medium',
      xpReward: 0
    },
    {
      name: 'מגוון רחב',
      description: 'שחק 10 סוגי משחקים שונים',
      icon: '🎲✨',
      category: 'games',
      requirement: 10,
      reward: 400,
      difficulty: 'hard',
      xpReward: 0
    },

    // ========== הישגי זמן ==========
    {
      name: 'לומד מסור',
      description: 'שחק 30 דקות ביום אחד',
      icon: '⏰',
      category: 'special',
      requirement: 1,
      reward: 100,
      difficulty: 'medium',
      xpReward: 0
    },
    {
      name: 'לומד מסור מאוד',
      description: 'שחק שעה ביום אחד',
      icon: '⏰✨',
      category: 'special',
      requirement: 1,
      reward: 300,
      difficulty: 'hard',
      xpReward: 0
    }
  ];

  console.log(`📊 Total new achievements to add: ${newAchievements.length}`);
  console.log(`   Easy: ${newAchievements.filter(a => a.difficulty === 'easy').length}`);
  console.log(`   Medium: ${newAchievements.filter(a => a.difficulty === 'medium').length}`);
  console.log(`   Hard: ${newAchievements.filter(a => a.difficulty === 'hard').length}`);
  console.log(`   Extreme: ${newAchievements.filter(a => a.difficulty === 'extreme').length}`);

  let added = 0;
  let skipped = 0;

  for (const achievement of newAchievements) {
    try {
      // Check if achievement already exists
      const existing = await prisma.achievement.findFirst({
        where: { name: achievement.name }
      });

      if (existing) {
        console.log(`⏭️  Skipping "${achievement.name}" - already exists`);
        skipped++;
        continue;
      }

      await prisma.achievement.create({
        data: achievement
      });
      console.log(`✅ Added: ${achievement.icon} ${achievement.name} (${achievement.difficulty}) - ${achievement.reward} 💎 (0 XP)`);
      added++;
    } catch (error) {
      console.error(`❌ Error adding "${achievement.name}":`, error.message);
    }
  }

  console.log(`\n🎉 Achievements added successfully!`);
  console.log(`   ✅ Added: ${added}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📊 Total in database: ${added + skipped}`);
}

async function main() {
  try {
    // Test connection first
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    await addDiamondAchievements();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

main();




