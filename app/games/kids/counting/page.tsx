'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COUNTING_ITEMS = [
  { number: 1, emoji: '🍎', name: 'תפוח', wordEn: 'one', explanation: 'One (וואן) = 1 - יש תפוח אחד!' },
  { number: 2, emoji: '🐶', name: 'כלב', wordEn: 'two', explanation: 'Two (טו) = 2 - יש שני כלבים!' },
  { number: 3, emoji: '⭐', name: 'כוכב', wordEn: 'three', explanation: 'Three (ת׳רי) = 3 - יש שלושה כוכבים!' },
  { number: 4, emoji: '🌸', name: 'פרח', wordEn: 'four', explanation: 'Four (פור) = 4 - יש ארבעה פרחים!' },
  { number: 5, emoji: '🚗', name: 'מכונית', wordEn: 'five', explanation: 'Five (פייב) = 5 - יש חמש מכוניות!' },
  { number: 6, emoji: '🎈', name: 'בלון', wordEn: 'six', explanation: 'Six (סיקס) = 6 - יש שישה בלונים!' },
  { number: 7, emoji: '🦋', name: 'פרפר', wordEn: 'seven', explanation: 'Seven (סבן) = 7 - יש שבעה פרפרים!' },
  { number: 8, emoji: '🍌', name: 'בננה', wordEn: 'eight', explanation: 'Eight (אייט) = 8 - יש שמונה בננות!' },
  { number: 9, emoji: '🐱', name: 'חתול', wordEn: 'nine', explanation: 'Nine (ניין) = 9 - יש תשעה חתולים!' },
  { number: 10, emoji: '🌈', name: 'קשת', wordEn: 'ten', explanation: 'Ten (טן) = 10 - יש עשר קשתות!' },
  { number: 1, emoji: '☀️', name: 'שמש', wordEn: 'one', explanation: 'One (וואן) = 1 - יש שמש אחת!' },
  { number: 2, emoji: '🌙', name: 'ירח', wordEn: 'two', explanation: 'Two (טו) = 2 - יש שני ירחים!' },
  { number: 3, emoji: '🍪', name: 'עוגייה', wordEn: 'three', explanation: 'Three (ת׳רי) = 3 - יש שלוש עוגיות!' },
  { number: 4, emoji: '🎁', name: 'מתנה', wordEn: 'four', explanation: 'Four (פור) = 4 - יש ארבע מתנות!' },
  { number: 5, emoji: '🍓', name: 'תות', wordEn: 'five', explanation: 'Five (פייב) = 5 - יש חמש תותים!' },
  { number: 6, emoji: '🐠', name: 'דג', wordEn: 'six', explanation: 'Six (סיקס) = 6 - יש שישה דגים!' },
  { number: 7, emoji: '🎵', name: 'תו מוזיקלי', wordEn: 'seven', explanation: 'Seven (סבן) = 7 - יש שבעה תווים!' },
  { number: 8, emoji: '🍕', name: 'פיצה', wordEn: 'eight', explanation: 'Eight (אייט) = 8 - יש שמונה פיצות!' },
  { number: 9, emoji: '🦆', name: 'ברווז', wordEn: 'nine', explanation: 'Nine (ניין) = 9 - יש תשעה ברוזים!' },
  { number: 10, emoji: '🎨', name: 'צבעים', wordEn: 'ten', explanation: 'Ten (טן) = 10 - יש עשרה צבעים!' },
];

export default function CountingGame() {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [displayEmojis, setDisplayEmojis] = useState<string[]>([]);
  const [options, setOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentItem = COUNTING_ITEMS[currentNumber - 1];

  useEffect(() => {
    // צור מערך של אמוג'ים לפי המספר
    const emojis = Array(currentNumber).fill(currentItem.emoji);
    setDisplayEmojis(emojis);
    
    // צור אפשרויות
    generateOptions();
    
    // הקרא את המספר
    speakNumber();
  }, [currentNumber]);

  const generateOptions = () => {
    const correct = currentNumber;
    const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const wrongOptions = allNumbers
      .filter(n => n !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort((a, b) => a - b);
    setOptions(allOptions);
  };

  const speakNumber = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentNumber.toString());
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.3;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selectedNumber: number) => {
    if (selectedNumber === currentNumber) {
      setFeedback('correct');
      setScore(score + 10);
      setShowExplanation(true);
      
      // דיבור "יפה מאוד"
      if ('speechSynthesis' in window) {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance('יפה מאוד! ספירה מעולה!');
          utterance.lang = 'he-IL';
          utterance.rate = 1.0;
          utterance.pitch = 1.3;
          window.speechSynthesis.speak(utterance);
        }, 200);
      }
      
      // לא עוברים אוטומטית - רק דרך הכפתור!
    } else {
      setFeedback('wrong');
      setShowExplanation(true);
      
      // לא סוגרים את ההסבר אוטומטית - רק דרך הכפתור!
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-300 via-green-300 to-blue-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            🔢 ספירה ומספרים
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            ספור את העצמים ובחר את המספר הנכון!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          {/* ציון */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          {/* הצגת העצמים */}
          <div className="text-center mb-8">
            <p className="text-2xl md:text-3xl font-bold text-gray-700 mb-6">
              כמה {currentItem.name} יש כאן?
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 min-h-[200px] items-center">
              {displayEmojis.map((emoji, index) => (
                <div
                  key={index}
                  className="text-6xl md:text-7xl animate-bounce"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {emoji}
                </div>
              ))}
            </div>
            <button
              onClick={speakNumber}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:scale-110 transition-all duration-200"
            >
              🔊 שמע את המספר
            </button>
          </div>

          {/* כפתור דלג לשאלה הבאה */}
          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentNumber < 10) {
                  setCurrentNumber(currentNumber + 1);
                } else {
                  setCurrentNumber(1);
                }
              }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:scale-110 transition-all duration-200"
            >
              ⏭️ שאלה הבאה
            </button>
          </div>

          {/* אפשרויות מספרים */}
          <div className="grid grid-cols-4 gap-4 md:gap-6 max-w-2xl mx-auto">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={feedback !== null}
                className={`p-6 md:p-8 rounded-2xl shadow-xl transition-all duration-200 transform hover:scale-110 ${
                  feedback === 'correct' && option === currentNumber
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-125 ring-8 ring-green-300'
                    : feedback === 'wrong' && option !== currentNumber
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-blue-400 to-purple-500 hover:from-purple-500 hover:to-blue-400'
                }`}
              >
                <div className="text-5xl md:text-6xl font-extrabold text-white">
                  {option}
                </div>
              </button>
            ))}
          </div>

          {/* משוב */}
          {feedback === 'correct' && (
            <div className="text-center mt-8">
              <div className="inline-block bg-green-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-xl mb-4 animate-bounce">
                🎉 כל הכבוד! {currentNumber} זה נכון!
              </div>
              {showExplanation && (
                <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mx-auto max-w-2xl animate-fade-in">
                  <div className="text-2xl font-bold text-blue-800 mb-2">💡 הסבר:</div>
                  <div className="text-xl text-blue-700 leading-relaxed mb-3">{currentItem.explanation}</div>
                  <div className="text-3xl font-bold text-blue-900 mb-4">{currentItem.number} = {currentItem.wordEn}</div>
                  <button
                    onClick={() => {
                      setFeedback(null);
                      setShowExplanation(false);
                      if (currentNumber < 10) {
                        setCurrentNumber(currentNumber + 1);
                      } else {
                        setCurrentNumber(1);
                      }
                    }}
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:scale-110 transition-all duration-200"
                  >
                    ➡️ שאלה הבאה
                  </button>
                </div>
              )}
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="text-center mt-8">
              <div className="inline-block bg-red-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-xl mb-4">
                😊 נסה שוב לספור!
              </div>
              {showExplanation && (
                <div className="bg-yellow-100 border-4 border-yellow-300 rounded-2xl p-6 mx-auto max-w-2xl">
                  <div className="text-2xl font-bold text-yellow-800 mb-2">התשובה הנכונה:</div>
                  <div className="text-5xl font-bold text-yellow-900 mb-3">{currentNumber} = {currentItem.wordEn}</div>
                  <div className="text-xl text-yellow-700 mb-4">ספור שוב את ה{currentItem.name}!</div>
                  <button
                    onClick={() => {
                      setFeedback(null);
                      setShowExplanation(false);
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:scale-110 transition-all duration-200"
                  >
                    ✅ הבנתי, נסה שוב
                  </button>
                </div>
              )}
            </div>
          )}

          {/* כפתור חזרה */}
          <div className="text-center mt-8">
            <Link href="/games/kids">
              <button className="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-gray-600 hover:to-gray-400 transition-all duration-200">
                ← חזרה
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

