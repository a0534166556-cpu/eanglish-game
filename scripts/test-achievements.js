const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAchievements() {
  try {
    console.log('🧪 Testing achievements system...\n');

    // 1. בדיקת הישגים קיימים
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' }
    });

    console.log(`📊 Total active achievements: ${achievements.length}`);
    
    const categories = {};
    achievements.forEach(achievement => {
      if (!categories[achievement.category]) {
        categories[achievement.category] = 0;
      }
      categories[achievement.category]++;
    });

    console.log('📈 Achievements by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} achievements`);
    });

    // 2. בדיקת משתמשים עם הישגים
    const usersWithAchievements = await prisma.userAchievement.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        achievement: {
          select: { name: true, category: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`\n👥 Recent user achievements (${usersWithAchievements.length}):`);
    usersWithAchievements.forEach(ua => {
      console.log(`  ${ua.user.name || ua.user.email} - ${ua.achievement.name} (${ua.progress}/${ua.achievement.requirement})`);
    });

    // 3. בדיקת הישגים שהושלמו
    const completedAchievements = await prisma.userAchievement.findMany({
      where: { isCompleted: true },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        achievement: {
          select: { name: true, reward: true, xpReward: true }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 10
    });

    console.log(`\n🏆 Recently completed achievements (${completedAchievements.length}):`);
    completedAchievements.forEach(ua => {
      console.log(`  ${ua.user.name || ua.user.email} - ${ua.achievement.name} (${ua.achievement.reward}💎, ${ua.achievement.xpReward}⭐)`);
    });

    // 4. בדיקת סטטיסטיקות משחקים
    const gameStats = await prisma.gameStat.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { gamesPlayed: 'desc' },
      take: 10
    });

    console.log(`\n🎮 Top players by games played:`);
    gameStats.forEach(stat => {
      const winRate = stat.gamesPlayed > 0 ? Math.round((stat.gamesWon / stat.gamesPlayed) * 100) : 0;
      console.log(`  ${stat.user.name || stat.user.email} - ${stat.gameName}: ${stat.gamesPlayed} games, ${stat.gamesWon} wins (${winRate}%)`);
    });

    // 5. בדיקת הישגים שלא מתעדכנים
    const problematicAchievements = await prisma.achievement.findMany({
      where: {
        isActive: true,
        userAchievements: {
          none: {}
        }
      }
    });

    if (problematicAchievements.length > 0) {
      console.log(`\n⚠️  Achievements with no progress (${problematicAchievements.length}):`);
      problematicAchievements.forEach(achievement => {
        console.log(`  ${achievement.name} (${achievement.category})`);
      });
    }

    // 6. בדיקת הישגים שכמעט הושלמו
    const almostCompleted = await prisma.userAchievement.findMany({
      where: {
        isCompleted: false,
        progress: {
          gte: 5 // לפחות 5 התקדמות
        }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        achievement: {
          select: { name: true, requirement: true }
        }
      },
      orderBy: { progress: 'desc' }
    });

    console.log(`\n🎯 Almost completed achievements (${almostCompleted.length}):`);
    almostCompleted.forEach(ua => {
      const percentage = Math.round((ua.progress / ua.achievement.requirement) * 100);
      console.log(`  ${ua.user.name || ua.user.email} - ${ua.achievement.name} (${ua.progress}/${ua.achievement.requirement} - ${percentage}%)`);
    });

    console.log('\n✅ Achievement system test completed!');

  } catch (error) {
    console.error('❌ Error testing achievements:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAchievements();


