'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const LETTERS = [
  { upper: 'A', lower: 'a' },
  { upper: 'B', lower: 'b' },
  { upper: 'C', lower: 'c' },
  { upper: 'D', lower: 'd' },
  { upper: 'E', lower: 'e' },
  { upper: 'F', lower: 'f' },
  { upper: 'G', lower: 'g' },
  { upper: 'H', lower: 'h' },
  { upper: 'I', lower: 'i' },
  { upper: 'J', lower: 'j' },
  { upper: 'K', lower: 'k' },
  { upper: 'L', lower: 'l' },
  { upper: 'M', lower: 'm' },
  { upper: 'N', lower: 'n' },
  { upper: 'O', lower: 'o' },
  { upper: 'P', lower: 'p' },
  { upper: 'Q', lower: 'q' },
  { upper: 'R', lower: 'r' },
  { upper: 'S', lower: 's' },
  { upper: 'T', lower: 't' },
  { upper: 'U', lower: 'u' },
  { upper: 'V', lower: 'v' },
  { upper: 'W', lower: 'w' },
  { upper: 'X', lower: 'x' },
  { upper: 'Y', lower: 'y' },
  { upper: 'Z', lower: 'z' },
];

export default function LettersMatchGame() {
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentLetter = LETTERS[currentLetterIndex];

  useEffect(() => {
    generateOptions();
  }, [currentLetterIndex]);

  const generateOptions = () => {
    const correct = LETTERS[currentLetterIndex].lower; // האות הקטנה הנכונה
    // בחר 3 אותיות גדולות שגויות
    const wrongOptions = LETTERS
      .filter((_, idx) => idx !== currentLetterIndex)
      .map(l => l.upper) // אותיות גדולות!
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const handleAnswer = (selectedLower: string) => {
    if (selectedLower === currentLetter.lower) {
      setFeedback('correct');
      setScore(score + 10);
      setShowExplanation(true);
      
      // דיבור "יפה מאוד"
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('יפה מאוד!');
        utterance.lang = 'he-IL';
        utterance.rate = 1.0;
        utterance.pitch = 1.3;
        window.speechSynthesis.speak(utterance);
      }
      
      // לא עוברים אוטומטית - רק דרך הכפתור!
    } else {
      setFeedback('wrong');
      setShowExplanation(true);
      
      // דיבור "נסה שוב"
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('נסה שוב');
        utterance.lang = 'he-IL';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
      
      // לא סוגרים את ההסבר אוטומטית - רק דרך הכפתור!
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-blue-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            🔤 התאמת אותיות גדולות וקטנות
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            התאם את האות הגדולה לאות הקטנה שלה!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          {/* ציון */}
          <div className="flex justify-between items-center mb-8">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full text-2xl font-bold shadow-lg">
              ⭐ {score}
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
              סיבוב {gamesPlayed + 1}
            </div>
          </div>

          {/* האות הגדולה */}
          <div className="text-center mb-12">
            <div className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4 animate-pulse">
              {currentLetter.upper}
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-700">
              מצא את האות הקטנה!
            </p>
          </div>

          {/* אפשרויות */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
            {options.map((option, index) => {
              // בדוק אם האות היא קטנה או גדולה
              const isLowerCase = option === option.toLowerCase();
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={feedback !== null}
                  className={`py-12 md:py-16 rounded-3xl shadow-xl transition-all duration-200 transform hover:scale-105 ${
                    feedback === 'correct' && option === currentLetter.lower
                      ? 'bg-gradient-to-r from-green-400 to-green-600 text-white scale-110'
                      : feedback === 'wrong' && option !== currentLetter.lower
                      ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500'
                      : 'bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:from-purple-500 hover:to-blue-400'
                  }`}
                >
                  <div className="text-8xl md:text-9xl font-bold">
                    {option}
                  </div>
                </button>
              );
            })}
          </div>

          {/* כפתור דלג לשאלה הבאה */}
          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentLetterIndex < LETTERS.length - 1) {
                  setCurrentLetterIndex(currentLetterIndex + 1);
                } else {
                  setCurrentLetterIndex(0);
                  setGamesPlayed(gamesPlayed + 1);
                }
              }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:scale-110 transition-all duration-200"
            >
              ⏭️ שאלה הבאה
            </button>
          </div>

          {/* משוב */}
          {feedback === 'correct' && (
            <div className="text-center mb-6">
              <div className="inline-block bg-green-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-xl mb-4 animate-bounce">
                🎉 כל הכבוד! נכון!
              </div>
              {showExplanation && (
                <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mx-auto max-w-2xl animate-fade-in">
                  <div className="text-2xl font-bold text-blue-800 mb-2">💡 הסבר:</div>
                  <div className="text-xl text-blue-700 leading-relaxed mb-4">
                    האות הגדולה <span className="text-5xl font-bold uppercase inline-block mx-2">{currentLetter.upper}</span> שווה לאות הקטנה <span className="text-5xl font-bold lowercase inline-block mx-2">{currentLetter.lower}</span>
                  </div>
                  <div className="text-lg text-blue-600">
                    Big {currentLetter.upper} = small {currentLetter.lower}
                  </div>
                  <button
                    onClick={() => {
                      setFeedback(null);
                      setShowExplanation(false);
                      if (currentLetterIndex < LETTERS.length - 1) {
                        setCurrentLetterIndex(currentLetterIndex + 1);
                      } else {
                        setCurrentLetterIndex(0);
                        setGamesPlayed(gamesPlayed + 1);
                      }
                    }}
                    className="mt-4 bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:scale-110 transition-all duration-200"
                  >
                    ➡️ שאלה הבאה
                  </button>
                </div>
              )}
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="text-center mb-6">
              <div className="inline-block bg-red-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-xl mb-4">
                😊 נסה שוב!
              </div>
              {showExplanation && (
                <div className="bg-yellow-100 border-4 border-yellow-300 rounded-2xl p-6 mx-auto max-w-2xl">
                  <div className="text-2xl font-bold text-yellow-800 mb-2">התשובה הנכונה:</div>
                  <div className="text-6xl font-bold text-yellow-900 mb-3">
                    <span className="uppercase">{currentLetter.upper}</span> → <span className="lowercase">{currentLetter.lower}</span>
                  </div>
                  <button
                    onClick={() => {
                      setFeedback(null);
                      setShowExplanation(false);
                    }}
                    className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:scale-110 transition-all duration-200"
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

