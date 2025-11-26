const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addAchievements() {
  console.log('🏆 Adding comprehensive achievements system...');

  const achievements = [
    // ========== הישגים קלים (Easy) - 5-50 נקודות ==========
    // משחקים בסיסיים
    {
      name: 'צעדים ראשונים',
      description: 'שחק את המשחק הראשון שלך',
      icon: '🎮',
      category: 'games',
      requirement: 1,
      reward: 10,
      difficulty: 'easy',
      xpReward: 50
    },
    {
      name: 'מתחיל נלהב',
      description: 'שחק 5 משחקים',
      icon: '🎯',
      category: 'games',
      requirement: 5,
      reward: 25,
      difficulty: 'easy',
      xpReward: 100
    },
    {
      name: 'שחקן פעיל',
      description: 'שחק 10 משחקים',
      icon: '🎲',
      category: 'games',
      requirement: 10,
      reward: 50,
      difficulty: 'easy',
      xpReward: 200
    },
    {
      name: 'ניצחון ראשון',
      description: 'נצח במשחק הראשון שלך',
      icon: '🏅',
      category: 'games',
      requirement: 1,
      reward: 15,
      difficulty: 'easy',
      xpReward: 75
    },
    {
      name: 'מנצח מתמיד',
      description: 'נצח ב-5 משחקים',
      icon: '🥇',
      category: 'games',
      requirement: 5,
      reward: 40,
      difficulty: 'easy',
      xpReward: 150
    },

    // רצף יומי קל
    {
      name: 'יום ראשון',
      description: 'שחק יום אחד ברצף',
      icon: '📅',
      category: 'streak',
      requirement: 1,
      reward: 10,
      difficulty: 'easy',
      xpReward: 50
    },
    {
      name: 'שלושה ימים',
      description: 'שחק 3 ימים ברצף',
      icon: '🔥',
      category: 'streak',
      requirement: 3,
      reward: 30,
      difficulty: 'easy',
      xpReward: 100
    },
    {
      name: 'שבוע שלם',
      description: 'שחק 7 ימים ברצף',
      icon: '📆',
      category: 'streak',
      requirement: 7,
      reward: 75,
      difficulty: 'easy',
      xpReward: 250
    },

    // רמות קלות
    {
      name: 'עולה במדרגות',
      description: 'הגע לרמה 2',
      icon: '⬆️',
      category: 'level',
      requirement: 2,
      reward: 20,
      difficulty: 'easy',
      xpReward: 100
    },
    {
      name: 'רמה 5',
      description: 'הגע לרמה 5',
      icon: '⭐',
      category: 'level',
      requirement: 5,
      reward: 50,
      difficulty: 'easy',
      xpReward: 200
    },

    // ========== הישגים בינוניים (Medium) - 100-300 נקודות ==========
    // משחקים
    {
      name: 'שחקן מנוסה',
      description: 'שחק 25 משחקים',
      icon: '🎪',
      category: 'games',
      requirement: 25,
      reward: 100,
      difficulty: 'medium',
      xpReward: 500
    },
    {
      name: 'חובב משחקים',
      description: 'שחק 50 משחקים',
      icon: '🎭',
      category: 'games',
      requirement: 50,
      reward: 200,
      difficulty: 'medium',
      xpReward: 1000
    },
    {
      name: 'מקצוען',
      description: 'שחק 100 משחקים',
      icon: '🎨',
      category: 'games',
      requirement: 100,
      reward: 300,
      difficulty: 'medium',
      xpReward: 2000
    },
    {
      name: 'מנצח מוכח',
      description: 'נצח ב-10 משחקים',
      icon: '🥈',
      category: 'games',
      requirement: 10,
      reward: 100,
      difficulty: 'medium',
      xpReward: 500
    },
    {
      name: 'אלוף זירה',
      description: 'נצח ב-25 משחקים',
      icon: '🏆',
      category: 'games',
      requirement: 25,
      reward: 200,
      difficulty: 'medium',
      xpReward: 1000
    },
    {
      name: 'מאסטר המשחקים',
      description: 'נצח ב-50 משחקים',
      icon: '👑',
      category: 'games',
      requirement: 50,
      reward: 300,
      difficulty: 'medium',
      xpReward: 2000
    },

    // רצף בינוני
    {
      name: 'שבועיים רצופים',
      description: 'שחק 14 ימים ברצף',
      icon: '🔥🔥',
      category: 'streak',
      requirement: 14,
      reward: 150,
      difficulty: 'medium',
      xpReward: 750
    },
    {
      name: 'חודש שלם',
      description: 'שחק 30 ימים ברצף',
      icon: '📅✨',
      category: 'streak',
      requirement: 30,
      reward: 300,
      difficulty: 'medium',
      xpReward: 1500
    },

    // רמות בינוניות
    {
      name: 'רמה 10',
      description: 'הגע לרמה 10',
      icon: '🌟',
      category: 'level',
      requirement: 10,
      reward: 150,
      difficulty: 'medium',
      xpReward: 750
    },
    {
      name: 'רמה 15',
      description: 'הגע לרמה 15',
      icon: '💫',
      category: 'level',
      requirement: 15,
      reward: 250,
      difficulty: 'medium',
      xpReward: 1250
    },
    {
      name: 'רמה 20',
      description: 'הגע לרמה 20',
      icon: '✨',
      category: 'level',
      requirement: 20,
      reward: 300,
      difficulty: 'medium',
      xpReward: 1500
    },

    // מיוחדים בינוניים
    {
      name: 'אוהב אנגלית',
      description: 'ענה נכון על 100 שאלות',
      icon: '📚',
      category: 'special',
      requirement: 100,
      reward: 200,
      difficulty: 'medium',
      xpReward: 1000
    },
    {
      name: 'מילים מילים',
      description: 'למד 50 מילים חדשות',
      icon: '📖',
      category: 'special',
      requirement: 50,
      reward: 150,
      difficulty: 'medium',
      xpReward: 750
    },
    {
      name: 'קונה נלהב',
      description: 'קנה 10 פריטים בחנות',
      icon: '🛍️',
      category: 'special',
      requirement: 10,
      reward: 100,
      difficulty: 'medium',
      xpReward: 500
    },

    // ========== הישגים קשים (Hard) - 500-1000 נקודות ==========
    // משחקים קשים
    {
      name: 'שחקן ותיק',
      description: 'שחק 200 משחקים',
      icon: '🎯🎯',
      category: 'games',
      requirement: 200,
      reward: 500,
      difficulty: 'hard',
      xpReward: 5000
    },
    {
      name: 'מכור למשחקים',
      description: 'שחק 500 משחקים',
      icon: '🎮💎',
      category: 'games',
      requirement: 500,
      reward: 1000,
      difficulty: 'hard',
      xpReward: 10000
    },
    {
      name: 'אלוף אמיתי',
      description: 'נצח ב-100 משחקים',
      icon: '🏆💫',
      category: 'games',
      requirement: 100,
      reward: 750,
      difficulty: 'hard',
      xpReward: 7500
    },
    {
      name: 'אגדה חיה',
      description: 'נצח ב-200 משחקים',
      icon: '👑✨',
      category: 'games',
      requirement: 200,
      reward: 1000,
      difficulty: 'hard',
      xpReward: 10000
    },

    // רצף קשה
    {
      name: 'חודשיים רצופים',
      description: 'שחק 60 ימים ברצף',
      icon: '🔥💎',
      category: 'streak',
      requirement: 60,
      reward: 600,
      difficulty: 'hard',
      xpReward: 6000
    },
    {
      name: 'שלושה חודשים',
      description: 'שחק 90 ימים ברצף',
      icon: '🔥🔥🔥',
      category: 'streak',
      requirement: 90,
      reward: 900,
      difficulty: 'hard',
      xpReward: 9000
    },

    // רמות קשות
    {
      name: 'רמה 30',
      description: 'הגע לרמה 30',
      icon: '🌟💎',
      category: 'level',
      requirement: 30,
      reward: 500,
      difficulty: 'hard',
      xpReward: 5000
    },
    {
      name: 'רמה 40',
      description: 'הגע לרמה 40',
      icon: '⭐💫',
      category: 'level',
      requirement: 40,
      reward: 750,
      difficulty: 'hard',
      xpReward: 7500
    },
    {
      name: 'רמה 50',
      description: 'הגע לרמה 50',
      icon: '✨👑',
      category: 'level',
      requirement: 50,
      reward: 1000,
      difficulty: 'hard',
      xpReward: 10000
    },

    // מיוחדים קשים
    {
      name: 'מומחה אנגלית',
      description: 'ענה נכון על 500 שאלות',
      icon: '📚👑',
      category: 'special',
      requirement: 500,
      reward: 750,
      difficulty: 'hard',
      xpReward: 7500
    },
    {
      name: 'אוצר מילים ענק',
      description: 'למד 200 מילים חדשות',
      icon: '📖💎',
      category: 'special',
      requirement: 200,
      reward: 600,
      difficulty: 'hard',
      xpReward: 6000
    },
    {
      name: 'אספן מקצועי',
      description: 'קנה 50 פריטים בחנות',
      icon: '🛍️👑',
      category: 'special',
      requirement: 50,
      reward: 800,
      difficulty: 'hard',
      xpReward: 8000
    },
    {
      name: 'מאסטר Word Clash',
      description: 'נצח ב-50 משחקי Word Clash',
      icon: '⚔️💎',
      category: 'special',
      requirement: 50,
      reward: 700,
      difficulty: 'hard',
      xpReward: 7000
    },
    {
      name: 'מלך התיאורים',
      description: 'השלם 100 משחקי תיאור תמונה',
      icon: '🖼️👑',
      category: 'special',
      requirement: 100,
      reward: 650,
      difficulty: 'hard',
      xpReward: 6500
    },

    // ========== הישגים אקסטרים (Extreme) - 1500-5000 נקודות ==========
    // משחקים אקסטרים
    {
      name: 'מיתוס המשחקים',
      description: 'שחק 1000 משחקים',
      icon: '🎮🌟💎',
      category: 'games',
      requirement: 1000,
      reward: 2500,
      difficulty: 'extreme',
      xpReward: 25000
    },
    {
      name: 'אלוהי המשחקים',
      description: 'שחק 2500 משחקים',
      icon: '🎮⚡👑',
      category: 'games',
      requirement: 2500,
      reward: 5000,
      difficulty: 'extreme',
      xpReward: 50000
    },
    {
      name: 'מלך הניצחונות',
      description: 'נצח ב-500 משחקים',
      icon: '🏆🌟💎',
      category: 'games',
      requirement: 500,
      reward: 3000,
      difficulty: 'extreme',
      xpReward: 30000
    },
    {
      name: 'אלוהי הניצחון',
      description: 'נצח ב-1000 משחקים',
      icon: '👑⚡💫',
      category: 'games',
      requirement: 1000,
      reward: 5000,
      difficulty: 'extreme',
      xpReward: 50000
    },
    {
      name: 'דיוק מושלם',
      description: 'השג 100% דיוק ב-50 משחקים',
      icon: '🎯💯',
      category: 'games',
      requirement: 50,
      reward: 2000,
      difficulty: 'extreme',
      xpReward: 20000
    },

    // רצף אקסטרים
    {
      name: 'חצי שנה רצופה',
      description: 'שחק 180 ימים ברצף',
      icon: '🔥🔥🔥💎',
      category: 'streak',
      requirement: 180,
      reward: 2000,
      difficulty: 'extreme',
      xpReward: 20000
    },
    {
      name: 'שנה שלמה',
      description: 'שחק 365 ימים ברצף',
      icon: '🔥👑⚡',
      category: 'streak',
      requirement: 365,
      reward: 5000,
      difficulty: 'extreme',
      xpReward: 50000
    },
    {
      name: 'נצחי',
      description: 'שחק 500 ימים ברצף',
      icon: '🔥💫🌟',
      category: 'streak',
      requirement: 500,
      reward: 7500,
      difficulty: 'extreme',
      xpReward: 75000
    },

    // רמות אקסטרים
    {
      name: 'רמה 75',
      description: 'הגע לרמה 75',
      icon: '🌟💎👑',
      category: 'level',
      requirement: 75,
      reward: 2000,
      difficulty: 'extreme',
      xpReward: 20000
    },
    {
      name: 'רמה 100',
      description: 'הגע לרמה 100 - הרמה המקסימלית!',
      icon: '⚡💫🏆',
      category: 'level',
      requirement: 100,
      reward: 5000,
      difficulty: 'extreme',
      xpReward: 50000
    },

    // מיוחדים אקסטרים
    {
      name: 'פרופסור אנגלית',
      description: 'ענה נכון על 2000 שאלות',
      icon: '📚🎓💎',
      category: 'special',
      requirement: 2000,
      reward: 3000,
      difficulty: 'extreme',
      xpReward: 30000
    },
    {
      name: 'אוצר מילים אגדי',
      description: 'למד 1000 מילים חדשות',
      icon: '📖👑⚡',
      category: 'special',
      requirement: 1000,
      reward: 2500,
      difficulty: 'extreme',
      xpReward: 25000
    },
    {
      name: 'אספן אגדי',
      description: 'קנה 200 פריטים בחנות',
      icon: '🛍️💎🌟',
      category: 'special',
      requirement: 200,
      reward: 3500,
      difficulty: 'extreme',
      xpReward: 35000
    },
    {
      name: 'אלוהי Word Clash',
      description: 'נצח ב-200 משחקי Word Clash',
      icon: '⚔️👑💫',
      category: 'special',
      requirement: 200,
      reward: 2800,
      difficulty: 'extreme',
      xpReward: 28000
    },
    {
      name: 'מיליונר מטבעות',
      description: 'צבור מיליון מטבעות',
      icon: '💰👑💎',
      category: 'special',
      requirement: 1000000,
      reward: 4000,
      difficulty: 'extreme',
      xpReward: 40000
    },
    {
      name: 'מלך היהלומים',
      description: 'צבור 10,000 יהלומים',
      icon: '💎👑⚡',
      category: 'special',
      requirement: 10000,
      reward: 5000,
      difficulty: 'extreme',
      xpReward: 50000
    },
    {
      name: 'אוסף מושלם',
      description: 'קנה את כל הפריטים בחנות',
      icon: '🎁💫🌟',
      category: 'special',
      requirement: 1,
      reward: 7500,
      difficulty: 'extreme',
      xpReward: 75000
    },
    {
      name: 'מאסטר כל המשחקים',
      description: 'נצח לפחות 50 פעמים בכל סוג משחק',
      icon: '🎮🏆💎',
      category: 'special',
      requirement: 1,
      reward: 6000,
      difficulty: 'extreme',
      xpReward: 60000
    },
    {
      name: 'אגדת הלמידה',
      description: 'השלם את כל הרמות בכל המשחקים',
      icon: '📚👑⚡',
      category: 'special',
      requirement: 1,
      reward: 10000,
      difficulty: 'extreme',
      xpReward: 100000
    }
  ];

  console.log(`📊 Total achievements to add: ${achievements.length}`);
  console.log(`   Easy: ${achievements.filter(a => a.difficulty === 'easy').length}`);
  console.log(`   Medium: ${achievements.filter(a => a.difficulty === 'medium').length}`);
  console.log(`   Hard: ${achievements.filter(a => a.difficulty === 'hard').length}`);
  console.log(`   Extreme: ${achievements.filter(a => a.difficulty === 'extreme').length}`);

  let added = 0;
  let skipped = 0;

  for (const achievement of achievements) {
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
      console.log(`✅ Added: ${achievement.icon} ${achievement.name} (${achievement.difficulty}) - ${achievement.reward} 💎`);
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
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    await addAchievements();
  } catch (error) {
    console.error('❌ Error:', error);
    if (error.message.includes('connection')) {
      console.error('💡 Connection error - check your DATABASE_URL in .env file');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

