const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLearnedWords() {
  try {
    console.log('🧪 Testing learned words system...\n');

    // מצא משתמש לבדיקה
    const testUser = await prisma.user.findFirst({
      where: {
        email: {
          contains: '@'
        }
      },
      include: {
        gameStat: true
      }
    });

    if (!testUser) {
      console.log('❌ No test user found');
      return;
    }

    console.log(`👤 Testing with user: ${testUser.name || testUser.email}`);
    console.log(`📊 User stats: ${testUser.gamesPlayed} games played, ${testUser.gamesWon} wins`);

    // בדוק סטטיסטיקות משחקים
    console.log(`\n🎮 Game statistics (${testUser.gameStat.length}):`);
    testUser.gameStat.forEach(stat => {
      console.log(`  ${stat.gameName}: ${stat.gamesPlayed} games, ${stat.gamesWon} wins, avg score: ${stat.averageScore}`);
    });

    // סימולציה של קריאה ל-API
    console.log('\n🌐 Testing API call...');
    
    try {
      const response = await fetch(`http://localhost:3000/api/learned-words?userId=${testUser.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        console.log(`❌ API call failed: ${response.status} - ${data.error}`);
        return;
      }

      console.log('✅ API response received');
      console.log(`📚 Learned words: ${data.learnedWords?.length || 0}`);
      console.log(`📈 Game stats: ${data.gameStats?.length || 0}`);
      
      if (data.userStats) {
        console.log(`👤 User stats:`, data.userStats);
      }

      // הצג מילים לדוגמה
      if (data.learnedWords && data.learnedWords.length > 0) {
        console.log('\n📝 Sample learned words:');
        data.learnedWords.slice(0, 5).forEach((word, index) => {
          console.log(`  ${index + 1}. ${word.word} - ${word.translation} (${word.game}, ${word.difficulty})`);
        });
      }

      // הצג סטטיסטיקות משחקים
      if (data.gameStats && data.gameStats.length > 0) {
        console.log('\n🎯 Game statistics:');
        data.gameStats.forEach(stat => {
          console.log(`  ${stat.gameName}: ${stat.totalWords} words, ${stat.correctWords} correct (${stat.accuracy}%)`);
        });
      }

    } catch (apiError) {
      console.log('❌ API call failed:', apiError.message);
    }

    // בדוק אם יש משחקים ללא מילים
    const gamesWithoutWords = testUser.gameStat.filter(stat => 
      !['TrueOrFalse', 'FillInTheBlanks', 'MultipleChoice', 'SentenceScramble', 'picture-description-duel'].includes(stat.gameName)
    );

    if (gamesWithoutWords.length > 0) {
      console.log('\n⚠️  Games without word support:');
      gamesWithoutWords.forEach(stat => {
        console.log(`  ${stat.gameName}: ${stat.gamesPlayed} games`);
      });
    }

    console.log('\n✅ Learned words system test completed!');

  } catch (error) {
    console.error('❌ Error testing learned words:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLearnedWords();


