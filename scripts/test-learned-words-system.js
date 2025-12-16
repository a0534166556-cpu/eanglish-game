const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLearnedWordsSystem() {
  try {
    console.log('🧪 Testing complete learned words system...\n');

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

    // בדוק מילים נלמדות קיימות
    const existingWords = await prisma.learnedWord.findMany({
      where: { userId: testUser.id },
      orderBy: { learnedAt: 'desc' },
      take: 10
    });

    console.log(`\n📚 Existing learned words: ${existingWords.length}`);
    existingWords.forEach(word => {
      console.log(`  ${word.word} - ${word.translation} (${word.gameName}, ${word.difficulty}) - ${word.accuracy}% accuracy`);
    });

    // סימולציה של שמירת מילה חדשה
    console.log('\n💾 Testing word saving...');
    
    const testWord = {
      userId: testUser.id,
      word: 'test-word-' + Date.now(),
      translation: 'מילה לבדיקה',
      gameName: 'TrueOrFalse',
      difficulty: 'easy',
      isCorrect: true
    };

    try {
      const response = await fetch('http://localhost:3000/api/learned-words/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testWord)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Save API failed: ${response.status} - ${errorText}`);
        return;
      }

      const result = await response.json();
      console.log('✅ Word saved successfully:', result);

      // בדוק שהמילה נשמרה
      const savedWord = await prisma.learnedWord.findUnique({
        where: { id: result.word.id }
      });

      if (savedWord) {
        console.log('✅ Word found in database:', savedWord);
      } else {
        console.log('❌ Word not found in database');
      }

    } catch (apiError) {
      console.log('❌ API call failed:', apiError.message);
    }

    // בדוק את ה-API של המילים הנלמדות
    console.log('\n🌐 Testing learned words API...');
    
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
          console.log(`  ${index + 1}. ${word.word} - ${word.translation} (${word.game}, ${word.difficulty}) - ${word.accuracy}%`);
        });
      }

    } catch (apiError) {
      console.log('❌ API call failed:', apiError.message);
    }

    // בדוק סטטיסטיקות
    console.log('\n📊 Database statistics:');
    
    const totalWords = await prisma.learnedWord.count();
    const userWords = await prisma.learnedWord.count({
      where: { userId: testUser.id }
    });
    const masteredWords = await prisma.learnedWord.count({
      where: { 
        userId: testUser.id,
        isMastered: true
      }
    });

    console.log(`  Total words in database: ${totalWords}`);
    console.log(`  User's words: ${userWords}`);
    console.log(`  Mastered words: ${masteredWords}`);

    // בדוק מילים לפי משחק
    const wordsByGame = await prisma.learnedWord.groupBy({
      by: ['gameName'],
      where: { userId: testUser.id },
      _count: { word: true }
    });

    console.log('\n🎮 Words by game:');
    wordsByGame.forEach(group => {
      console.log(`  ${group.gameName}: ${group._count.word} words`);
    });

    console.log('\n✅ Learned words system test completed!');

  } catch (error) {
    console.error('❌ Error testing learned words system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLearnedWordsSystem();


