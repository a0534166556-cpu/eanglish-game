'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const BIG_NUMBERS = [
  { number: 11, word: 'eleven', he: 'אחד עשרה', emoji: '1️⃣1️⃣', explanation: 'Eleven (אילבן) = 11 - אחד אחרי עשרה!' },
  { number: 12, word: 'twelve', he: 'שתיים עשרה', emoji: '1️⃣2️⃣', explanation: 'Twelve (טוולב) = 12 - תריסר!' },
  { number: 13, word: 'thirteen', he: 'שלוש עשרה', emoji: '1️⃣3️⃣', explanation: 'Thirteen (ת׳רטין) = 13 - שלושה עשר!' },
  { number: 14, word: 'fourteen', he: 'ארבע עשרה', emoji: '1️⃣4️⃣', explanation: 'Fourteen (פורטין) = 14 - ארבעה עשר!' },
  { number: 15, word: 'fifteen', he: 'חמש עשרה', emoji: '1️⃣5️⃣', explanation: 'Fifteen (פיפטין) = 15 - חמישה עשר!' },
  { number: 16, word: 'sixteen', he: 'שש עשרה', emoji: '1️⃣6️⃣', explanation: 'Sixteen (סיקסטין) = 16 - שישה עשר!' },
  { number: 17, word: 'seventeen', he: 'שבע עשרה', emoji: '1️⃣7️⃣', explanation: 'Seventeen (סבנטין) = 17 - שבעה עשר!' },
  { number: 18, word: 'eighteen', he: 'שמונה עשרה', emoji: '1️⃣8️⃣', explanation: 'Eighteen (אייטין) = 18 - שמונה עשר!' },
  { number: 19, word: 'nineteen', he: 'תשע עשרה', emoji: '1️⃣9️⃣', explanation: 'Nineteen (ניינטין) = 19 - תשעה עשר!' },
  { number: 20, word: 'twenty', he: 'עשרים', emoji: '2️⃣0️⃣', explanation: 'Twenty (טוונטי) = 20 - עשרים!' },
  { number: 30, word: 'thirty', he: 'שלושים', emoji: '3️⃣0️⃣', explanation: 'Thirty (ת׳רטי) = 30 - שלושים!' },
  { number: 40, word: 'forty', he: 'ארבעים', emoji: '4️⃣0️⃣', explanation: 'Forty (פורטי) = 40 - ארבעים!' },
  { number: 50, word: 'fifty', he: 'חמישים', emoji: '5️⃣0️⃣', explanation: 'Fifty (פיפטי) = 50 - חמישים!' },
  { number: 60, word: 'sixty', he: 'שישים', emoji: '6️⃣0️⃣', explanation: 'Sixty (סיקסטי) = 60 - שישים!' },
  { number: 70, word: 'seventy', he: 'שבעים', emoji: '7️⃣0️⃣', explanation: 'Seventy (סבנטי) = 70 - שבעים!' },
  { number: 80, word: 'eighty', he: 'שמונים', emoji: '8️⃣0️⃣', explanation: 'Eighty (אייטי) = 80 - שמונים!' },
  { number: 90, word: 'ninety', he: 'תשעים', emoji: '9️⃣0️⃣', explanation: 'Ninety (ניינטי) = 90 - תשעים!' },
  { number: 100, word: 'hundred', he: 'מאה', emoji: '💯', explanation: 'Hundred (הנדרד) = 100 - מאה!' },
];

export default function NumbersBigGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof BIG_NUMBERS>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentNumber = BIG_NUMBERS[currentIndex];

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = BIG_NUMBERS[currentIndex];
    const wrongOptions = BIG_NUMBERS
      .filter((_, idx) => idx !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentNumber.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: typeof BIG_NUMBERS[0]) => {
    if (selected.number === currentNumber.number) {
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
    <main className="min-h-screen bg-gradient-to-br from-emerald-300 via-lime-300 to-yellow-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            🔢 מספרים גדולים
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד מספרים גדולים באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="text-9xl mb-6 animate-bounce">{currentNumber.emoji}</div>
            <div className="text-8xl font-bold text-purple-600 mb-6">{currentNumber.number}</div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-emerald-500 to-lime-600 text-white px-12 py-6 rounded-full text-4xl font-bold shadow-xl hover:scale-110 transition-all duration-200 mb-4"
            >
              🔊 {currentNumber.word}
            </button>
            <p className="text-2xl text-gray-700 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
            <p className="text-3xl text-gray-800 font-bold mt-6">איזה מספר זה?</p>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentIndex < BIG_NUMBERS.length - 1) {
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

          <div className="grid grid-cols-2 gap-6 md:gap-8 mb-8">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={feedback !== null}
                className={`p-8 md:p-10 rounded-3xl shadow-xl transition-all duration-200 transform hover:scale-105 ${
                  feedback === 'correct' && option.number === currentNumber.number
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.number !== currentNumber.number
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-emerald-400 to-lime-500 hover:from-lime-500 hover:to-emerald-400'
                }`}
              >
                <div className="text-6xl mb-3">{option.emoji}</div>
                <div className="text-2xl md:text-3xl font-bold text-white">{option.he}</div>
              </button>
            ))}
          </div>

          {feedback === 'correct' && (
            <div className="text-center mb-6">
              <div className="inline-block bg-green-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-xl mb-4 animate-bounce">
                🎉 מצוין! נכון!
              </div>
              {showExplanation && (
                <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mx-auto max-w-2xl animate-fade-in">
                  <div className="text-2xl font-bold text-blue-800 mb-2">💡 הסבר:</div>
                  <div className="text-xl text-blue-700 leading-relaxed">{currentNumber.explanation}</div>
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
                  <div className="text-6xl mb-3">{currentNumber.emoji}</div>
                  <div className="text-5xl font-bold text-yellow-900 mb-2">{currentNumber.number}</div>
                  <div className="text-3xl font-bold text-yellow-900 mb-2">{currentNumber.word}</div>
                  <div className="text-2xl text-yellow-800">{currentNumber.he}</div>
                </div>
              )}
            </div>
          )}

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



