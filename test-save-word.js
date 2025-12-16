// בדיקה מהירה לשמירת מילה
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSaveWord() {
  try {
    // מצא משתמש
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('❌ אין משתמש');
      return;
    }
    
    console.log('✅ משתמש נמצא:', user.email);
    
    // שמור מילה לדוגמה
    const word = await prisma.learnedWord.create({
      data: {
        userId: user.id,
        word: 'sky',
        translation: 'שמיים',
        gameName: 'TrueOrFalse',
        difficulty: 'easy',
        timesSeen: 1,
        timesCorrect: 1,
        accuracy: 100
      }
    });
    
    console.log('✅ מילה נשמרה:', word);
    
    // בדוק שהמילה נשמרה
    const savedWords = await prisma.learnedWord.findMany({
      where: { userId: user.id }
    });
    
    console.log(`✅ סה"כ מילים שמורות: ${savedWords.length}`);
    savedWords.forEach(w => {
      console.log(`  - ${w.word} (${w.translation}) - ${w.accuracy}%`);
    });
    
  } catch (error) {
    console.error('❌ שגיאה:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSaveWord();


