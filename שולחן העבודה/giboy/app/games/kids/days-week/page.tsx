'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const DAYS = [
  { word: 'sunday', he: 'יום ראשון', emoji: '1️⃣', explanation: 'Sunday (סאנדיי) = יום ראשון - היום הראשון בשבוע!' },
  { word: 'monday', he: 'יום שני', emoji: '2️⃣', explanation: 'Monday (מאנדיי) = יום שני - היום אחרי יום ראשון!' },
  { word: 'tuesday', he: 'יום שלישי', emoji: '3️⃣', explanation: 'Tuesday (טיוזדיי) = יום שלישי - היום השלישי בשבוע!' },
  { word: 'wednesday', he: 'יום רביעי', emoji: '4️⃣', explanation: 'Wednesday (וונזדיי) = יום רביעי - אמצע השבוע!' },
  { word: 'thursday', he: 'יום חמישי', emoji: '5️⃣', explanation: 'Thursday (ת׳רזדיי) = יום חמישי - עוד יום אחד עד סוף השבוע!' },
  { word: 'friday', he: 'יום שישי', emoji: '6️⃣', explanation: 'Friday (פריידיי) = יום שישי - ערב שבת, סוף שבוע!' },
  { word: 'saturday', he: 'יום שבת', emoji: '7️⃣', explanation: 'Saturday (סאטרדיי) = יום שבת - יום מנוחה!' },
];

export default function DaysWeekGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof DAYS>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentDay = DAYS[currentIndex];

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = DAYS[currentIndex];
    const wrongOptions = DAYS
      .filter((_, idx) => idx !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentDay.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: typeof DAYS[0]) => {
    if (selected.word === currentDay.word) {
      setFeedback('correct');
      setScore(score + 10);
      setShowExplanation(true);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('נכון מאוד!');
        utterance.lang = 'he-IL';
        utterance.rate = 1.0;
        utterance.pitch = 1.3;
        window.speechSynthesis.speak(utterance);
      }
    } else {
      setFeedback('wrong');
      setShowExplanation(true);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            📅 ימי השבוע
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד את ימות השבוע באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          {/* ציון */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          {/* היום */}
          <div className="text-center mb-12">
            <div className="text-9xl mb-6 animate-bounce">{currentDay.emoji}</div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-12 py-6 rounded-full text-4xl font-bold shadow-xl hover:scale-110 transition-all duration-200 mb-4"
            >
              🔊 {currentDay.word}
            </button>
            <p className="text-2xl text-gray-700 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
            <p className="text-3xl text-gray-800 font-bold mt-6">
              איזה יום זה?
            </p>
          </div>

          {/* כפתור דלג לשאלה הבאה */}
          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentIndex < DAYS.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                } else {
                  setCurrentIndex(0);
                }
              }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:scale-110 transition-all duration-200"
            >
              ⏭️ שאלה הבאה
            </button>
          </div>

          {/* אפשרויות */}
          <div className="grid grid-cols-2 gap-6 md:gap-8 mb-8">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={feedback !== null}
                className={`p-8 md:p-10 rounded-3xl shadow-xl transition-all duration-200 transform hover:scale-105 ${
                  feedback === 'correct' && option.word === currentDay.word
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.word !== currentDay.word
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-purple-500 hover:to-indigo-400'
                }`}
              >
                <div className="text-6xl mb-3">{option.emoji}</div>
                <div className="text-2xl md:text-3xl font-bold text-white">{option.he}</div>
              </button>
            ))}
          </div>

          {/* משוב */}
          {feedback === 'correct' && (
            <div className="text-center mb-6">
              <div className="inline-block bg-green-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-xl mb-4 animate-bounce">
                🎉 מעולה! נכון!
              </div>
              {showExplanation && (
                <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mx-auto max-w-2xl animate-fade-in">
                  <div className="text-2xl font-bold text-blue-800 mb-2">💡 הסבר:</div>
                  <div className="text-xl text-blue-700 leading-relaxed">{currentDay.explanation}</div>
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
                  <div className="text-6xl mb-3">{currentDay.emoji}</div>
                  <div className="text-3xl font-bold text-yellow-900 mb-2">{currentDay.word}</div>
                  <div className="text-2xl text-yellow-800">{currentDay.he}</div>
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



