const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addEvenMoreAchievements() {
  console.log('🏆 Adding even more achievements...');

  const moreAchievements = [
    // ========== הישגי סדרות ניצחונות ==========
    {
      name: 'סדרת ניצחונות',
      description: 'נצח 5 משחקים ברצף',
      icon: '🔥',
      category: 'games',
      requirement: 5,
      reward: 150,
      difficulty: 'easy',
      xpReward: 750
    },
    {
      name: 'סדרה לוהטת',
      description: 'נצח 10 משחקים ברצף',
      icon: '🔥🔥',
      category: 'games',
      requirement: 10,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'בלתי מנוצח',
      description: 'נצח 25 משחקים ברצף',
      icon: '🔥🔥🔥',
      category: 'games',
      requirement: 25,
      reward: 1000,
      difficulty: 'hard',
      xpReward: 10000
    },
    {
      name: 'אגדת הניצחונות',
      description: 'נצח 50 משחקים ברצף',
      icon: '🔥👑',
      category: 'games',
      requirement: 50,
      reward: 3000,
      difficulty: 'extreme',
      xpReward: 30000
    },

    // ========== הישגי רמות קושי ==========
    {
      name: 'מנצח קל',
      description: 'נצח 50 משחקים ברמה קלה',
      icon: '🟢',
      category: 'level',
      requirement: 50,
      reward: 200,
      difficulty: 'easy',
      xpReward: 1000
    },
    {
      name: 'מנצח בינוני',
      description: 'נצח 50 משחקים ברמה בינונית',
      icon: '🟡',
      category: 'level',
      requirement: 50,
      reward: 400,
      difficulty: 'medium',
      xpReward: 4000
    },
    {
      name: 'מנצח קשה',
      description: 'נצח 50 משחקים ברמה קשה',
      icon: '🟠',
      category: 'level',
      requirement: 50,
      reward: 800,
      difficulty: 'hard',
      xpReward: 8000
    },
    {
      name: 'מנצח אקסטרים',
      description: 'נצח 50 משחקים ברמה אקסטרים',
      icon: '🔴',
      category: 'level',
      requirement: 50,
      reward: 1500,
      difficulty: 'extreme',
      xpReward: 15000
    },

    // ========== הישגי מהירות תגובה ==========
    {
      name: 'תגובה מהירה',
      description: 'ענה על 10 שאלות תוך שנייה כל אחת',
      icon: '⚡💨',
      category: 'special',
      requirement: 10,
      reward: 200,
      difficulty: 'medium',
      xpReward: 2000
    },
    {
      name: 'רפלקס מושלם',
      description: 'ענה על 50 שאלות תוך שנייה כל אחת',
      icon: '⚡👑',
      category: 'special',
      requirement: 50,
      reward: 800,
      difficulty: 'hard',
      xpReward: 8000
    },
    {
      name: 'מהירות על',
      description: 'ענה על 100 שאלות תוך שנייה כל אחת',
      icon: '⚡💎',
      category: 'special',
      requirement: 100,
      reward: 2000,
      difficulty: 'extreme',
      xpReward: 20000
    },

    // ========== הישגי תשובות נכונות ==========
    {
      name: 'מתחיל חכם',
      description: 'ענה נכון על 50 שאלות',
      icon: '✅',
      category: 'special',
      requirement: 50,
      reward: 100,
      difficulty: 'easy',
      xpReward: 500
    },
    {
      name: 'מומחה תשובות',
      description: 'ענה נכון על 250 שאלות',
      icon: '✅✅',
      category: 'special',
      requirement: 250,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'גאון תשובות',
      description: 'ענה נכון על 1000 שאלות',
      icon: '✅👑',
      category: 'special',
      requirement: 1000,
      reward: 1000,
      difficulty: 'hard',
      xpReward: 10000
    },
    {
      name: 'אלוהי התשובות',
      description: 'ענה נכון על 5000 שאלות',
      icon: '✅💎',
      category: 'special',
      requirement: 5000,
      reward: 5000,
      difficulty: 'extreme',
      xpReward: 50000
    },

    // ========== הישגי ימי השבוע ==========
    {
      name: 'שחקן יום ראשון',
      description: 'שחק 20 משחקים בימי ראשון',
      icon: '📅1️⃣',
      category: 'special',
      requirement: 20,
      reward: 150,
      difficulty: 'easy',
      xpReward: 750
    },
    {
      name: 'שחקן יום שני',
      description: 'שחק 20 משחקים בימי שני',
      icon: '📅2️⃣',
      category: 'special',
      requirement: 20,
      reward: 150,
      difficulty: 'easy',
      xpReward: 750
    },
    {
      name: 'שחקן יום שלישי',
      description: 'שחק 20 משחקים בימי שלישי',
      icon: '📅3️⃣',
      category: 'special',
      requirement: 20,
      reward: 150,
      difficulty: 'easy',
      xpReward: 750
    },
    {
      name: 'שחקן יום רביעי',
      description: 'שחק 20 משחקים בימי רביעי',
      icon: '📅4️⃣',
      category: 'special',
      requirement: 20,
      reward: 150,
      difficulty: 'easy',
      xpReward: 750
    },
    {
      name: 'שחקן יום חמישי',
      description: 'שחק 20 משחקים בימי חמישי',
      icon: '📅5️⃣',
      category: 'special',
      requirement: 20,
      reward: 150,
      difficulty: 'easy',
      xpReward: 750
    },
    {
      name: 'שחקן יום שישי',
      description: 'שחק 20 משחקים בימי שישי',
      icon: '📅6️⃣',
      category: 'special',
      requirement: 20,
      reward: 150,
      difficulty: 'easy',
      xpReward: 750
    },
    {
      name: 'שחקן יום שבת',
      description: 'שחק 20 משחקים בימי שבת',
      icon: '📅7️⃣',
      category: 'special',
      requirement: 20,
      reward: 150,
      difficulty: 'easy',
      xpReward: 750
    },
    {
      name: 'שחקן כל השבוע',
      description: 'שחק לפחות פעם בכל יום בשבוע',
      icon: '📅✨',
      category: 'special',
      requirement: 1,
      reward: 500,
      difficulty: 'medium',
      xpReward: 5000
    },

    // ========== הישגי עונות השנה ==========
    {
      name: 'שחקן אביב',
      description: 'שחק 50 משחקים באביב',
      icon: '🌸',
      category: 'special',
      requirement: 50,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'שחקן קיץ',
      description: 'שחק 50 משחקים בקיץ',
      icon: '☀️',
      category: 'special',
      requirement: 50,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'שחקן סתיו',
      description: 'שחק 50 משחקים בסתיו',
      icon: '🍂',
      category: 'special',
      requirement: 50,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'שחקן חורף',
      description: 'שחק 50 משחקים בחורף',
      icon: '❄️',
      category: 'special',
      requirement: 50,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'שחקן כל העונות',
      description: 'שחק בכל עונות השנה',
      icon: '🌈',
      category: 'special',
      requirement: 1,
      reward: 1000,
      difficulty: 'hard',
      xpReward: 10000
    },

    // ========== הישגי חודשים ==========
    {
      name: 'שחקן ינואר',
      description: 'שחק 30 משחקים בינואר',
      icon: '🗓️1',
      category: 'special',
      requirement: 30,
      reward: 200,
      difficulty: 'medium',
      xpReward: 2000
    },
    {
      name: 'שחקן פברואר',
      description: 'שחק 30 משחקים בפברואר',
      icon: '🗓️2',
      category: 'special',
      requirement: 30,
      reward: 200,
      difficulty: 'medium',
      xpReward: 2000
    },
    {
      name: 'שחקן כל השנה',
      description: 'שחק לפחות פעם בכל חודש בשנה',
      icon: '🗓️✨',
      category: 'special',
      requirement: 1,
      reward: 2000,
      difficulty: 'hard',
      xpReward: 20000
    },

    // ========== הישגי קומבו ==========
    {
      name: 'קומבו x5',
      description: 'ענה נכון על 5 שאלות ברצף',
      icon: '🎯5',
      category: 'games',
      requirement: 5,
      reward: 100,
      difficulty: 'easy',
      xpReward: 500
    },
    {
      name: 'קומבו x10',
      description: 'ענה נכון על 10 שאלות ברצף',
      icon: '🎯10',
      category: 'games',
      requirement: 10,
      reward: 250,
      difficulty: 'medium',
      xpReward: 2500
    },
    {
      name: 'קומבו x25',
      description: 'ענה נכון על 25 שאלות ברצף',
      icon: '🎯25',
      category: 'games',
      requirement: 25,
      reward: 700,
      difficulty: 'hard',
      xpReward: 7000
    },
    {
      name: 'קומבו x50',
      description: 'ענה נכון על 50 שאלות ברצף',
      icon: '🎯50',
      category: 'games',
      requirement: 50,
      reward: 2000,
      difficulty: 'extreme',
      xpReward: 20000
    },
    {
      name: 'קומבו x100',
      description: 'ענה נכון על 100 שאלות ברצף',
      icon: '🎯💯',
      category: 'games',
      requirement: 100,
      reward: 5000,
      difficulty: 'extreme',
      xpReward: 50000
    },

    // ========== הישגי תחרותיות ==========
    {
      name: 'מתחרה',
      description: 'השתתף ב-10 תחרויות',
      icon: '🏁',
      category: 'special',
      requirement: 10,
      reward: 200,
      difficulty: 'easy',
      xpReward: 1000
    },
    {
      name: 'אלוף תחרויות',
      description: 'זכה ב-5 תחרויות',
      icon: '🏆',
      category: 'special',
      requirement: 5,
      reward: 500,
      difficulty: 'medium',
      xpReward: 5000
    },
    {
      name: 'מלך התחרויות',
      description: 'זכה ב-25 תחרויות',
      icon: '👑🏆',
      category: 'special',
      requirement: 25,
      reward: 2500,
      difficulty: 'extreme',
      xpReward: 25000
    },

    // ========== הישגי שיתוף ==========
    {
      name: 'משתף',
      description: 'שתף 5 תוצאות',
      icon: '📤',
      category: 'special',
      requirement: 5,
      reward: 100,
      difficulty: 'easy',
      xpReward: 500
    },
    {
      name: 'משפיען',
      description: 'שתף 25 תוצאות',
      icon: '📣',
      category: 'special',
      requirement: 25,
      reward: 400,
      difficulty: 'medium',
      xpReward: 4000
    },
    {
      name: 'כוכב רשת',
      description: 'שתף 100 תוצאות',
      icon: '⭐📱',
      category: 'special',
      requirement: 100,
      reward: 1500,
      difficulty: 'hard',
      xpReward: 15000
    },

    // ========== הישגי משוב ==========
    {
      name: 'נותן משוב',
      description: 'שלח 5 הערות משוב',
      icon: '💬',
      category: 'special',
      requirement: 5,
      reward: 150,
      difficulty: 'easy',
      xpReward: 750
    },
    {
      name: 'משפר המערכת',
      description: 'שלח 20 הערות משוב',
      icon: '💡',
      category: 'special',
      requirement: 20,
      reward: 500,
      difficulty: 'medium',
      xpReward: 5000
    },

    // ========== הישגי אתגרים יומיים ==========
    {
      name: 'משלים אתגרים',
      description: 'השלם 10 אתגרים יומיים',
      icon: '📋',
      category: 'special',
      requirement: 10,
      reward: 200,
      difficulty: 'easy',
      xpReward: 1000
    },
    {
      name: 'מאסטר אתגרים',
      description: 'השלם 50 אתגרים יומיים',
      icon: '📋✨',
      category: 'special',
      requirement: 50,
      reward: 800,
      difficulty: 'medium',
      xpReward: 8000
    },
    {
      name: 'אלוף האתגרים',
      description: 'השלם 200 אתגרים יומיים',
      icon: '📋👑',
      category: 'special',
      requirement: 200,
      reward: 3000,
      difficulty: 'extreme',
      xpReward: 30000
    },

    // ========== הישגי פרופיל ==========
    {
      name: 'מעצב פרופיל',
      description: 'התאם את הפרופיל שלך',
      icon: '🎨',
      category: 'special',
      requirement: 1,
      reward: 50,
      difficulty: 'easy',
      xpReward: 250
    },
    {
      name: 'אספן אווטרים',
      description: 'קנה 5 אווטרים',
      icon: '👤',
      category: 'special',
      requirement: 5,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },
    {
      name: 'אספן תגים',
      description: 'קנה 5 תגים',
      icon: '🏷️',
      category: 'special',
      requirement: 5,
      reward: 300,
      difficulty: 'medium',
      xpReward: 3000
    },

    // ========== הישגי דירוגים ==========
    {
      name: 'טופ 100',
      description: 'הגע לטופ 100 בדירוג',
      icon: '🥉',
      category: 'special',
      requirement: 1,
      reward: 500,
      difficulty: 'medium',
      xpReward: 5000
    },
    {
      name: 'טופ 50',
      description: 'הגע לטופ 50 בדירוג',
      icon: '🥈',
      category: 'special',
      requirement: 1,
      reward: 1000,
      difficulty: 'hard',
      xpReward: 10000
    },
    {
      name: 'טופ 10',
      description: 'הגע לטופ 10 בדירוג',
      icon: '🥇',
      category: 'special',
      requirement: 1,
      reward: 2500,
      difficulty: 'extreme',
      xpReward: 25000
    },
    {
      name: 'מספר 1',
      description: 'הגע למקום הראשון בדירוג',
      icon: '👑🥇',
      category: 'special',
      requirement: 1,
      reward: 10000,
      difficulty: 'extreme',
      xpReward: 100000
    }
  ];

  console.log(`📊 Total new achievements to add: ${moreAchievements.length}`);
  console.log(`   Easy: ${moreAchievements.filter(a => a.difficulty === 'easy').length}`);
  console.log(`   Medium: ${moreAchievements.filter(a => a.difficulty === 'medium').length}`);
  console.log(`   Hard: ${moreAchievements.filter(a => a.difficulty === 'hard').length}`);
  console.log(`   Extreme: ${moreAchievements.filter(a => a.difficulty === 'extreme').length}`);

  let added = 0;
  let skipped = 0;

  for (const achievement of moreAchievements) {
    try {
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

  console.log(`\n🎉 Even more achievements added successfully!`);
  console.log(`   ✅ Added: ${added}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📊 Total new achievements: ${added}`);
}

async function main() {
  try {
    await addEvenMoreAchievements();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

