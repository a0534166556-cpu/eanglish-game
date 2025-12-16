const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMoreAchievements() {
  console.log('🏆 Adding more diverse achievements...');

  const newAchievements = [
    // ========== הישגי זמן ומהירות ==========
    {
      name: 'מהיר כברק',
      description: 'סיים משחק תוך פחות מ-30 שניות',
      icon: '⚡',
      category: 'special',
      requirement: 1,
      reward: 100,
      difficulty: 'medium',
      xpReward: 500
    },
    {
      name: 'מהירות אור',
      description: 'סיים 10 משחקים תוך פחות מדקה כל אחד',
      icon: '💨',
      category: 'special',
      requirement: 10,
      reward: 300,
      difficulty: 'hard',
      xpReward: 3000
    },
    {
      name: 'מרתון למידה',
      description: 'שחק 3 שעות ברצף',
      icon: '🏃',
      category: 'special',
      requirement: 1,
      reward: 500,
      difficulty: 'hard',
      xpReward: 5000
    },

    // ========== הישגי דיוק ומצוינות ==========
    {
      name: 'דיוק מושלם',
      description: 'השג 100% דיוק ב-10 משחקים',
      icon: '🎯',
      category: 'games',
      requirement: 10,
      reward: 200,
      difficulty: 'medium',
      xpReward: 2000
    },
    {
      name: 'מלך הדיוק',
      description: 'השג 100% דיוק ב-50 משחקים',
      icon: '👑🎯',
      category: 'games',
      requirement: 50,
      reward: 1000,
      difficulty: 'extreme',
      xpReward: 10000
    },
    {
      name: 'ללא טעויות',
      description: 'עבור 20 משחקים ברצף ללא טעות אחת',
      icon: '✨',
      category: 'games',
      requirement: 20,
      reward: 800,
      difficulty: 'hard',
      xpReward: 8000
    },

    // ========== הישגי משחקים ספציפיים ==========
    {
      name: 'מאסטר בחירה מרובה',
      description: 'שחק 100 משחקי בחירה מרובה',
      icon: '🎲',
      category: 'games',
      requirement: 100,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'מלך נכון/לא נכון',
      description: 'שחק 100 משחקי נכון/לא נכון',
      icon: '✅❌',
      category: 'games',
      requirement: 100,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'גאון השלמת משפטים',
      description: 'שחק 100 משחקי השלמת משפטים',
      icon: '📝',
      category: 'games',
      requirement: 100,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'מומחה סידור משפטים',
      description: 'שחק 100 משחקי סידור משפטים',
      icon: '🔀',
      category: 'games',
      requirement: 100,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'אמן תיאור תמונות',
      description: 'שחק 100 משחקי תיאור תמונה',
      icon: '🖼️',
      category: 'games',
      requirement: 100,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },

    // ========== הישגי קהילה וחברים ==========
    {
      name: 'חבר טוב',
      description: 'שחק 10 משחקים מרובי משתתפים',
      icon: '👥',
      category: 'special',
      requirement: 10,
      reward: 150,
      difficulty: 'easy',
      xpReward: 750
    },
    {
      name: 'שחקן חברתי',
      description: 'שחק 50 משחקים מרובי משתתפים',
      icon: '🤝',
      category: 'special',
      requirement: 50,
      reward: 400,
      difficulty: 'medium',
      xpReward: 4000
    },
    {
      name: 'מלך הקהילה',
      description: 'שחק 200 משחקים מרובי משתתפים',
      icon: '👑👥',
      category: 'special',
      requirement: 200,
      reward: 1500,
      difficulty: 'extreme',
      xpReward: 15000
    },

    // ========== הישגי שעות משחק ==========
    {
      name: 'לילה לבן',
      description: 'שחק בין 00:00 ל-06:00',
      icon: '🌙',
      category: 'special',
      requirement: 10,
      reward: 200,
      difficulty: 'medium',
      xpReward: 2000
    },
    {
      name: 'משכים קום',
      description: 'שחק 20 משחקים בין 05:00 ל-08:00',
      icon: '🌅',
      category: 'special',
      requirement: 20,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'לוחם סוף שבוע',
      description: 'שחק 50 משחקים בסופי שבוע',
      icon: '🎉',
      category: 'special',
      requirement: 50,
      reward: 400,
      difficulty: 'hard',
      xpReward: 4000
    },

    // ========== הישגי נקודות ותוצאות ==========
    {
      name: 'צובר נקודות',
      description: 'צבור 10,000 נקודות',
      icon: '💯',
      category: 'level',
      requirement: 10000,
      reward: 500,
      difficulty: 'medium',
      xpReward: 5000
    },
    {
      name: 'מיליונר נקודות',
      description: 'צבור 100,000 נקודות',
      icon: '💎💯',
      category: 'level',
      requirement: 100000,
      reward: 2000,
      difficulty: 'extreme',
      xpReward: 20000
    },
    {
      name: 'תוצאה מושלמת',
      description: 'השג תוצאה מושלמת ב-20 משחקים',
      icon: '💯✨',
      category: 'games',
      requirement: 20,
      reward: 600,
      difficulty: 'hard',
      xpReward: 6000
    },

    // ========== הישגי למידה ==========
    {
      name: 'תלמיד מצטיין',
      description: 'למד 100 מילים חדשות',
      icon: '📖',
      category: 'special',
      requirement: 100,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'מורה פרטי',
      description: 'למד 500 מילים חדשות',
      icon: '👨‍🏫',
      category: 'special',
      requirement: 500,
      reward: 1000,
      difficulty: 'hard',
      xpReward: 10000
    },
    {
      name: 'אנציקלופדיה חיה',
      description: 'למד 2000 מילים חדשות',
      icon: '📚🧠',
      category: 'special',
      requirement: 2000,
      reward: 3000,
      difficulty: 'extreme',
      xpReward: 30000
    },

    // ========== הישגי התמדה מיוחדים ==========
    {
      name: 'חודש זהב',
      description: 'שחק כל יום במשך חודש',
      icon: '🥇',
      category: 'streak',
      requirement: 30,
      reward: 500,
      difficulty: 'medium',
      xpReward: 5000
    },
    {
      name: 'שנת זהב',
      description: 'שחק כל יום במשך שנה שלמה',
      icon: '🏆🥇',
      category: 'streak',
      requirement: 365,
      reward: 10000,
      difficulty: 'extreme',
      xpReward: 100000
    },
    {
      name: 'נאמן לתמיד',
      description: 'שחק כל יום במשך שנתיים',
      icon: '💎🏆',
      category: 'streak',
      requirement: 730,
      reward: 20000,
      difficulty: 'extreme',
      xpReward: 200000
    },

    // ========== הישגי אוסף ורכישות ==========
    {
      name: 'קונה חכם',
      description: 'קנה 5 פריטים בחנות',
      icon: '🛒',
      category: 'special',
      requirement: 5,
      reward: 50,
      difficulty: 'easy',
      xpReward: 250
    },
    {
      name: 'אוהב קניות',
      description: 'קנה 25 פריטים בחנות',
      icon: '🛍️',
      category: 'special',
      requirement: 25,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'אוסף יוקרתי',
      description: 'קנה 100 פריטים בחנות',
      icon: '💎🛍️',
      category: 'special',
      requirement: 100,
      reward: 1500,
      difficulty: 'hard',
      xpReward: 15000
    },

    // ========== הישגי מטבעות ויהלומים ==========
    {
      name: 'חוסך קטן',
      description: 'צבור 10,000 מטבעות',
      icon: '🪙',
      category: 'special',
      requirement: 10000,
      reward: 100,
      difficulty: 'easy',
      xpReward: 500
    },
    {
      name: 'חוסך גדול',
      description: 'צבור 100,000 מטבעות',
      icon: '💰',
      category: 'special',
      requirement: 100000,
      reward: 500,
      difficulty: 'medium',
      xpReward: 5000
    },
    {
      name: 'אוצר יהלומים',
      description: 'צבור 5,000 יהלומים',
      icon: '💎',
      category: 'special',
      requirement: 5000,
      reward: 2000,
      difficulty: 'hard',
      xpReward: 20000
    },

    // ========== הישגי אתגרים מיוחדים ==========
    {
      name: 'מקסימליסט',
      description: 'השג את הציון המקסימלי ב-5 משחקים שונים',
      icon: '🌟',
      category: 'games',
      requirement: 5,
      reward: 400,
      difficulty: 'hard',
      xpReward: 4000
    },
    {
      name: 'רב-תחומי',
      description: 'שחק לפחות 20 משחקים מכל סוג',
      icon: '🎭',
      category: 'games',
      requirement: 1,
      reward: 1000,
      difficulty: 'hard',
      xpReward: 10000
    },
    {
      name: 'מומחה כולל',
      description: 'נצח לפחות 100 פעמים בכל סוג משחק',
      icon: '👑🎮',
      category: 'games',
      requirement: 1,
      reward: 5000,
      difficulty: 'extreme',
      xpReward: 50000
    },

    // ========== הישגי שיפור אישי ==========
    {
      name: 'משתפר',
      description: 'שפר את הציון שלך ב-50% ב-10 משחקים',
      icon: '📈',
      category: 'special',
      requirement: 10,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'אלוף השיפור',
      description: 'שפר את הציון שלך ב-100% ב-20 משחקים',
      icon: '🚀',
      category: 'special',
      requirement: 20,
      reward: 800,
      difficulty: 'hard',
      xpReward: 8000
    },
    {
      name: 'מהפכן',
      description: 'שפר את הציון שלך ב-200% ב-50 משחקים',
      icon: '💫',
      category: 'special',
      requirement: 50,
      reward: 2000,
      difficulty: 'extreme',
      xpReward: 20000
    },

    // ========== הישגי בוקר/ערב/לילה ==========
    {
      name: 'ינשוף לילה',
      description: 'שחק 30 משחקים אחרי חצות',
      icon: '🦉',
      category: 'special',
      requirement: 30,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'שחקן צהריים',
      description: 'שחק 50 משחקים בין 12:00 ל-15:00',
      icon: '☀️',
      category: 'special',
      requirement: 50,
      reward: 250,
      difficulty: 'medium',
      xpReward: 2500
    },
    {
      name: 'שחקן ערב',
      description: 'שחק 50 משחקים בין 18:00 ל-22:00',
      icon: '🌆',
      category: 'special',
      requirement: 50,
      reward: 250,
      difficulty: 'medium',
      xpReward: 2500
    },

    // ========== הישגי מיוחדים ונדירים ==========
    {
      name: 'יום הולדת שמח',
      description: 'שחק ביום ההולדת שלך',
      icon: '🎂',
      category: 'special',
      requirement: 1,
      reward: 500,
      difficulty: 'easy',
      xpReward: 2500
    },
    {
      name: 'חוגג שנה',
      description: 'שחק במשך שנה מיום ההרשמה',
      icon: '🎉',
      category: 'special',
      requirement: 1,
      reward: 1000,
      difficulty: 'hard',
      xpReward: 10000
    },
    {
      name: 'ותיק אמיתי',
      description: 'שחק במשך 3 שנים מיום ההרשמה',
      icon: '🎖️',
      category: 'special',
      requirement: 1,
      reward: 5000,
      difficulty: 'extreme',
      xpReward: 50000
    },

    // ========== הישגי מסירות ==========
    {
      name: 'מסור למטרה',
      description: 'השלם 100 משחקים ללא יציאה באמצע',
      icon: '💪',
      category: 'games',
      requirement: 100,
      reward: 400,
      difficulty: 'medium',
      xpReward: 4000
    },
    {
      name: 'לא מוותר',
      description: 'השלם 500 משחקים ללא יציאה באמצע',
      icon: '🔥💪',
      category: 'games',
      requirement: 500,
      reward: 1500,
      difficulty: 'hard',
      xpReward: 15000
    },
    {
      name: 'נחישות פלדה',
      description: 'השלם 1000 משחקים ללא יציאה באמצע',
      icon: '⚔️💎',
      category: 'games',
      requirement: 1000,
      reward: 5000,
      difficulty: 'extreme',
      xpReward: 50000
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
      console.log(`✅ Added: ${achievement.icon} ${achievement.name} (${achievement.difficulty}) - ${achievement.reward} 💎, ${achievement.xpReward} XP`);
      added++;
    } catch (error) {
      console.error(`❌ Error adding "${achievement.name}":`, error.message);
    }
  }

  console.log(`\n🎉 New achievements added successfully!`);
  console.log(`   ✅ Added: ${added}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📊 Total new achievements: ${added}`);
}

async function main() {
  try {
    await addMoreAchievements();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

