import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, word, translation, gameName, difficulty, isCorrect } = await request.json();

    if (!userId || !word || !gameName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // חפש מילה קיימת
    const existingWord = await prisma.learnedWord.findUnique({
      where: {
        userId_word_gameName: {
          userId,
          word,
          gameName
        }
      }
    });

    if (existingWord) {
      // עדכן מילה קיימת
      const newTimesSeen = existingWord.timesSeen + 1;
      const newTimesCorrect = existingWord.timesCorrect + (isCorrect ? 1 : 0);
      const newAccuracy = (newTimesCorrect / newTimesSeen) * 100;
      const isMastered = newAccuracy >= 80 && newTimesSeen >= 3;

      // עדכן את התרגום רק אם:
      // 1. יש תרגום חדש
      // 2. התרגום החדש טוב יותר (לא רק המילה עצמה, לא ריק, לא "המילה X באנגלית")
      // 3. התרגום הקיים לא טוב (ריק, המילה עצמה, או "המילה X באנגלית")
      let translationToUpdate = existingWord.translation;
      if (translation && 
          translation !== word && 
          translation.trim() !== '' &&
          !translation.includes('המילה') &&
          !translation.includes('באנגלית')) {
        // אם התרגום הקיים לא טוב, עדכן אותו
        if (!existingWord.translation || 
            existingWord.translation === word || 
            existingWord.translation.includes('המילה') ||
            existingWord.translation.includes('באנגלית')) {
          translationToUpdate = translation;
        }
        // אם התרגום החדש הוא מילה אחת (לא משפט), עדכן אותו
        else if (translation.split(/\s+/).length === 1) {
          translationToUpdate = translation;
        }
      }

      const updatedWord = await prisma.learnedWord.update({
        where: { id: existingWord.id },
        data: {
          timesSeen: newTimesSeen,
          timesCorrect: newTimesCorrect,
          accuracy: newAccuracy,
          lastSeen: new Date(),
          isMastered,
          translation: translationToUpdate
        }
      });

      return NextResponse.json({
        success: true,
        word: updatedWord,
        isNew: false
      });
    } else {
      // צור מילה חדשה
      const newWord = await prisma.learnedWord.create({
        data: {
          userId,
          word,
          translation: translation || word,
          gameName,
          difficulty: difficulty || 'easy',
          timesSeen: 1,
          timesCorrect: isCorrect ? 1 : 0,
          accuracy: isCorrect ? 100 : 0,
          learnedAt: new Date(),
          lastSeen: new Date(),
          isMastered: false
        }
      });

      return NextResponse.json({
        success: true,
        word: newWord,
        isNew: true
      });
    }

  } catch (error) {
    console.error('Error saving learned word:', error);
    return NextResponse.json(
      { error: 'Failed to save learned word' },
      { status: 500 }
    );
  }
}


