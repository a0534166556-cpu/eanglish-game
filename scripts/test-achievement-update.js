const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAchievementUpdate() {
  try {
    console.log('🧪 Testing achievement update system...\n');

    // מצא משתמש לבדיקה
    const testUser = await prisma.user.findFirst({
      where: {
        email: {
          contains: '@'
        }
      }
    });

    if (!testUser) {
      console.log('❌ No test user found');
      return;
    }

    console.log(`👤 Testing with user: ${testUser.name || testUser.email}`);

    // בדוק הישגים לפני
    const beforeAchievements = await prisma.userAchievement.findMany({
      where: { userId: testUser.id },
      include: {
        achievement: {
          select: { name: true, category: true, requirement: true }
        }
      }
    });

    console.log(`\n📊 Achievements before test (${beforeAchievements.length}):`);
    beforeAchievements.forEach(ua => {
      const percentage = Math.round((ua.progress / ua.achievement.requirement) * 100);
      console.log(`  ${ua.achievement.name}: ${ua.progress}/${ua.achievement.requirement} (${percentage}%)`);
    });

    // סימולציה של משחק
    console.log('\n🎮 Simulating game completion...');
    
    const gameData = {
      userId: testUser.id,
      gameName: 'TestGame',
      score: 100,
      won: true
    };

    // קריאה ל-API של עדכון הישגים
    const response = await fetch('http://localhost:3000/api/achievements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ API call failed: ${response.status} - ${errorText}`);
      return;
    }

    const result = await response.json();
    console.log('✅ API response:', result);

    // המתן קצת לעדכון
    await new Promise(resolve => setTimeout(resolve, 1000));

    // בדוק הישגים אחרי
    const afterAchievements = await prisma.userAchievement.findMany({
      where: { userId: testUser.id },
      include: {
        achievement: {
          select: { name: true, category: true, requirement: true }
        }
      }
    });

    console.log(`\n📊 Achievements after test (${afterAchievements.length}):`);
    afterAchievements.forEach(ua => {
      const percentage = Math.round((ua.progress / ua.achievement.requirement) * 100);
      console.log(`  ${ua.achievement.name}: ${ua.progress}/${ua.achievement.requirement} (${percentage}%)`);
    });

    // השוואה
    console.log('\n🔄 Changes detected:');
    let changesFound = false;
    
    afterAchievements.forEach(after => {
      const before = beforeAchievements.find(b => b.achievementId === after.achievementId);
      if (!before || before.progress !== after.progress) {
        changesFound = true;
        const beforeProgress = before ? before.progress : 0;
        console.log(`  ${after.achievement.name}: ${beforeProgress} → ${after.progress} (+${after.progress - beforeProgress})`);
      }
    });

    if (!changesFound) {
      console.log('  No changes detected - this might indicate an issue');
    }

    // בדוק הישגים שהושלמו
    const newlyCompleted = afterAchievements.filter(after => {
      const before = beforeAchievements.find(b => b.achievementId === after.achievementId);
      return after.isCompleted && (!before || !before.isCompleted);
    });

    if (newlyCompleted.length > 0) {
      console.log(`\n🏆 Newly completed achievements (${newlyCompleted.length}):`);
      newlyCompleted.forEach(ua => {
        console.log(`  ${ua.achievement.name} - Rewards: ${ua.achievement.reward}💎, ${ua.achievement.xpReward}⭐`);
      });
    }

    console.log('\n✅ Achievement update test completed!');

  } catch (error) {
    console.error('❌ Error testing achievement update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAchievementUpdate();


