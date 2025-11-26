const { PrismaClient } = require('@prisma/client');
const { 
  calculateLevelRequirements, 
  canLevelUp, 
  calculateLevelProgress,
  calculateTotalScore 
} = require('../lib/rankSystem.ts');

const prisma = new PrismaClient();

async function testLevelSystem() {
  try {
    console.log('🧪 Testing new level system...\n');

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
    console.log(`📊 Current stats: Level ${testUser.level}, ${testUser.points} points, ${testUser.gamesPlayed} games, ${testUser.gamesWon} wins`);

    // בדוק דרישות לרמות שונות
    console.log('\n📈 Level requirements:');
    for (let level = 1; level <= 10; level++) {
      const requirements = calculateLevelRequirements(level);
      console.log(`  Level ${level}: ${requirements.pointsNeeded} points, ${requirements.gamesNeeded} games, ${requirements.winsNeeded} wins, ${requirements.achievementsNeeded} achievements`);
    }

    // בדוק אם המשתמש יכול לעלות רמה
    console.log('\n🎯 Current user level up check:');
    const canLevel = canLevelUp({
      points: testUser.points,
      gamesWon: testUser.gamesWon,
      gamesPlayed: testUser.gamesPlayed,
      level: testUser.level,
      achievementsXP: 0
    });

    console.log(`  Can level up: ${canLevel ? '✅ Yes' : '❌ No'}`);

    // חשב התקדמות לרמה הבאה
    const levelProgress = calculateLevelProgress({
      points: testUser.points,
      gamesWon: testUser.gamesWon,
      gamesPlayed: testUser.gamesPlayed,
      level: testUser.level,
      achievementsXP: 0
    });

    console.log(`\n📊 Level progress for level ${testUser.level + 1}:`);
    console.log(`  Overall progress: ${levelProgress.progress}%`);
    console.log(`  Points: ${levelProgress.current.points} / ${levelProgress.requirements.pointsNeeded} (${Math.round((levelProgress.current.points / levelProgress.requirements.pointsNeeded) * 100)}%)`);
    console.log(`  Games: ${levelProgress.current.games} / ${levelProgress.requirements.gamesNeeded} (${Math.round((levelProgress.current.games / levelProgress.requirements.gamesNeeded) * 100)}%)`);
    console.log(`  Wins: ${levelProgress.current.wins} / ${levelProgress.requirements.winsNeeded} (${Math.round((levelProgress.current.wins / levelProgress.requirements.winsNeeded) * 100)}%)`);
    console.log(`  Achievements: ${levelProgress.current.achievements} / ${levelProgress.requirements.achievementsNeeded} (${Math.round((levelProgress.current.achievements / levelProgress.requirements.achievementsNeeded) * 100)}%)`);

    // בדוק כמה משחקים/ניצחונות צריך לעלות רמה
    console.log('\n🎮 What user needs to level up:');
    const requirements = levelProgress.requirements;
    const neededPoints = Math.max(0, requirements.pointsNeeded - levelProgress.current.points);
    const neededGames = Math.max(0, requirements.gamesNeeded - levelProgress.current.games);
    const neededWins = Math.max(0, requirements.winsNeeded - levelProgress.current.wins);
    const neededAchievements = Math.max(0, requirements.achievementsNeeded - levelProgress.current.achievements);

    console.log(`  Points needed: ${neededPoints}`);
    console.log(`  Games needed: ${neededGames}`);
    console.log(`  Wins needed: ${neededWins}`);
    console.log(`  Achievements needed: ${neededAchievements}`);

    // בדוק דוגמאות לרמות גבוהות
    console.log('\n🔥 High level examples:');
    const highLevels = [5, 10, 15, 20];
    highLevels.forEach(level => {
      const req = calculateLevelRequirements(level);
      console.log(`  Level ${level}: ${req.pointsNeeded} points, ${req.gamesNeeded} games, ${req.winsNeeded} wins, ${req.achievementsNeeded} achievements`);
    });

    // בדוק את הנוסחה האקספוננציאלית
    console.log('\n📈 Exponential growth check:');
    for (let level = 1; level <= 5; level++) {
      const multiplier = Math.pow(1.5, level - 1);
      const points = Math.floor(100 * multiplier);
      const games = Math.floor(5 * multiplier);
      const wins = Math.floor(3 * multiplier);
      const achievements = Math.floor(2 * multiplier);
      
      console.log(`  Level ${level}: Multiplier ${multiplier.toFixed(2)}x -> ${points} points, ${games} games, ${wins} wins, ${achievements} achievements`);
    }

    console.log('\n✅ Level system test completed!');

  } catch (error) {
    console.error('❌ Error testing level system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLevelSystem();


