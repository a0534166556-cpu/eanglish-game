'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ACTIONS = [
  { word: 'run', he: 'לרוץ', emoji: '🏃', explanation: 'Run (ראן) = לרוץ - לזוז מהר מאוד על הרגליים!' },
  { word: 'jump', he: 'לקפוץ', emoji: '🦘', explanation: 'Jump (ג׳אמפ) = לקפוץ - להתרומם מהקרקע!' },
  { word: 'walk', he: 'ללכת', emoji: '🚶', explanation: 'Walk (ווק) = ללכת - לזוז בצעדים רגילים!' },
  { word: 'eat', he: 'לאכול', emoji: '🍽️', explanation: 'Eat (איט) = לאכול - לשים אוכל בפה!' },
  { word: 'drink', he: 'לשתות', emoji: '🥤', explanation: 'Drink (דרינק) = לשתות - לשתות משקה!' },
  { word: 'sleep', he: 'לישון', emoji: '😴', explanation: 'Sleep (סליפ) = לישון - לנוח בלילה!' },
  { word: 'swim', he: 'לשחות', emoji: '🏊', explanation: 'Swim (סווים) = לשחות - לזוז במים!' },
  { word: 'fly', he: 'לעוף', emoji: '🦅', explanation: 'Fly (פליי) = לעוף - לזוז באוויר כמו ציפור!' },
  { word: 'dance', he: 'לרקוד', emoji: '💃', explanation: 'Dance (דאנס) = לרקוד - לזוז בקצב עם מוזיקה!' },
  { word: 'sing', he: 'לשיר', emoji: '🎤', explanation: 'Sing (סינג) = לשיר - להוציא צלילים יפים בקול!' },
  { word: 'read', he: 'לקרוא', emoji: '📖', explanation: 'Read (ריד) = לקרוא - להבין מילים בספר!' },
  { word: 'write', he: 'לכתוב', emoji: '✍️', explanation: 'Write (רייט) = לכתוב - לשים מילים על נייר!' },
  { word: 'draw', he: 'לצייר', emoji: '🎨', explanation: 'Draw (דרו) = לצייר - ליצור תמונות!' },
  { word: 'play', he: 'לשחק', emoji: '🎮', explanation: 'Play (פליי) = לשחק - להתעסק במשחקים ולהנות!' },
  { word: 'laugh', he: 'לצחוק', emoji: '😂', explanation: 'Laugh (לאף) = לצחוק - להוציא קולות כשמצחיק!' },
  { word: 'cry', he: 'לבכות', emoji: '😢', explanation: 'Cry (קריי) = לבכות - להוציא דמעות כשעצוב!' },
  { word: 'think', he: 'לחשוב', emoji: '🤔', explanation: 'Think (ת׳ינק) = לחשוב - להשתמש במוח!' },
  { word: 'talk', he: 'לדבר', emoji: '🗣️', explanation: 'Talk (טוק) = לדבר - להוציא מילים מהפה!' },
  { word: 'listen', he: 'להקשיב', emoji: '👂', explanation: 'Listen (ליסן) = להקשיב - לשים לב לצלילים!' },
  { word: 'look', he: 'להסתכל', emoji: '👀', explanation: 'Look (לוק) = להסתכל - להשתמש בעיניים לראות!' },
  { word: 'sit', he: 'לשבת', emoji: '🪑', explanation: 'Sit (סיט) = לשבת - לנוח על כיסא!' },
  { word: 'stand', he: 'לעמוד', emoji: '🧍', explanation: 'Stand (סטנד) = לעמוד - להיות זקוף על הרגליים!' },
  { word: 'climb', he: 'לטפס', emoji: '🧗', explanation: 'Climb (קליימב) = לטפס - לעלות למעלה!' },
  { word: 'throw', he: 'לזרוק', emoji: '🤾', explanation: 'Throw (ת׳רו) = לזרוק - לשלוח משהו באוויר!' },
  { word: 'catch', he: 'לתפוס', emoji: '🤲', explanation: 'Catch (קץ׳) = לתפוס - לאחוז במשהו שעף!' },
];

export default function ActionsGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof ACTIONS>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentAction = ACTIONS[currentIndex];

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = ACTIONS[currentIndex];
    const wrongOptions = ACTIONS
      .filter((_, idx) => idx !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentAction.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: typeof ACTIONS[0]) => {
    if (selected.word === currentAction.word) {
      setFeedback('correct');
      setScore(score + 10);
      setShowExplanation(true);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('מעולה!');
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
    <main className="min-h-screen bg-gradient-to-br from-purple-300 via-blue-300 to-cyan-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            🏃 פעולות
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד פעלים ופעולות באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          {/* ציון */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          {/* הפעולה */}
          <div className="text-center mb-12">
            <div className="text-9xl mb-6 animate-bounce">{currentAction.emoji}</div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-purple-500 to-cyan-600 text-white px-12 py-6 rounded-full text-4xl font-bold shadow-xl hover:scale-110 transition-all duration-200 mb-4"
            >
              🔊 {currentAction.word}
            </button>
            <p className="text-2xl text-gray-700 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
            <p className="text-3xl text-gray-800 font-bold mt-6">
              מה הפעולה הזו?
            </p>
          </div>

          {/* כפתור דלג לשאלה הבאה */}
          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentIndex < ACTIONS.length - 1) {
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
                  feedback === 'correct' && option.word === currentAction.word
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.word !== currentAction.word
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-purple-400 to-cyan-500 hover:from-cyan-500 hover:to-purple-400'
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
                🎉 יפה מאוד! נכון!
              </div>
              {showExplanation && (
                <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mx-auto max-w-2xl animate-fade-in">
                  <div className="text-2xl font-bold text-blue-800 mb-2">💡 הסבר:</div>
                  <div className="text-xl text-blue-700 leading-relaxed">{currentAction.explanation}</div>
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
                  <div className="text-6xl mb-3">{currentAction.emoji}</div>
                  <div className="text-3xl font-bold text-yellow-900 mb-2">{currentAction.word}</div>
                  <div className="text-2xl text-yellow-800">{currentAction.he}</div>
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



