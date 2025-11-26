'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const HOME_ITEMS = [
  { word: 'bed', he: 'מיטה', emoji: '🛏️', explanation: 'Bed (בד) = מיטה - המקום שבו אנחנו ישנים!' },
  { word: 'chair', he: 'כיסא', emoji: '🪑', explanation: 'Chair (צ׳ייר) = כיסא - יושבים עליו!' },
  { word: 'table', he: 'שולחן', emoji: '🍽️', explanation: 'Table (טייבל) = שולחן - אוכלים או כותבים עליו!' },
  { word: 'sofa', he: 'ספה', emoji: '🛋️', explanation: 'Sofa (סופה) = ספה - מושב נוח וגדול לסלון!' },
  { word: 'door', he: 'דלת', emoji: '🚪', explanation: 'Door (דור) = דלת - נכנסים דרכה לחדר!' },
  { word: 'window', he: 'חלון', emoji: '🪟', explanation: 'Window (ווינדו) = חלון - מסתכלים דרכו החוצה!' },
  { word: 'lamp', he: 'מנורה', emoji: '💡', explanation: 'Lamp (למפ) = מנורה - נותנת אור!' },
  { word: 'mirror', he: 'מראה', emoji: '🪞', explanation: 'Mirror (מירור) = מראה - רואים את עצמנו בו!' },
  { word: 'clock', he: 'שעון', emoji: '⏰', explanation: 'Clock (קלוק) = שעון - מראה איזו שעה!' },
  { word: 'television', he: 'טלוויזיה', emoji: '📺', explanation: 'Television (טלוויז׳ן) = טלוויזיה - צופים בתוכניות!' },
  { word: 'computer', he: 'מחשב', emoji: '💻', explanation: 'Computer (קומפיוטר) = מחשב - עובדים ומשחקים עליו!' },
  { word: 'phone', he: 'טלפון', emoji: '📱', explanation: 'Phone (פון) = טלפון - מדברים עם חברים!' },
  { word: 'refrigerator', he: 'מקרר', emoji: '🧊', explanation: 'Refrigerator (רפריג׳רייטר) = מקרר - שומר אוכל קר!' },
  { word: 'stove', he: 'תנור', emoji: '🍳', explanation: 'Stove (סטוב) = תנור - מבשלים עליו!' },
  { word: 'sink', he: 'כיור', emoji: '🚰', explanation: 'Sink (סינק) = כיור - שוטפים בו כלים!' },
  { word: 'toilet', he: 'אסלה', emoji: '🚽', explanation: 'Toilet (טוילט) = אסלה - נמצא בשירותים!' },
  { word: 'shower', he: 'מקלחת', emoji: '🚿', explanation: 'Shower (שאואר) = מקלחת - מתרחצים שם!' },
  { word: 'bathtub', he: 'אמבטיה', emoji: '🛁', explanation: 'Bathtub (באת׳טאב) = אמבטיה - מתרחצים בה במים!' },
  { word: 'towel', he: 'מגבת', emoji: '🧻', explanation: 'Towel (טאוול) = מגבת - מתנגבים איתה!' },
  { word: 'pillow', he: 'כרית', emoji: '🛌', explanation: 'Pillow (פילו) = כרית - שמים את הראש עליה!' },
  { word: 'blanket', he: 'שמיכה', emoji: '🛌', explanation: 'Blanket (בלנקט) = שמיכה - מתכסים איתה!' },
  { word: 'curtain', he: 'וילון', emoji: '🪟', explanation: 'Curtain (קרטין) = וילון - מכסה את החלון!' },
  { word: 'carpet', he: 'שטיח', emoji: '🧶', explanation: 'Carpet (קרפט) = שטיח - על הרצפה!' },
  { word: 'picture', he: 'תמונה', emoji: '🖼️', explanation: 'Picture (פיקצ׳ר) = תמונה - תלויה על הקיר!' },
  { word: 'book', he: 'ספר', emoji: '📚', explanation: 'Book (בוק) = ספר - קוראים אותו!' },
];

export default function HomeItemsGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof HOME_ITEMS>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentItem = HOME_ITEMS[currentIndex];

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = HOME_ITEMS[currentIndex];
    const wrongOptions = HOME_ITEMS
      .filter((_, idx) => idx !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentItem.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: typeof HOME_ITEMS[0]) => {
    if (selected.word === currentItem.word) {
      setFeedback('correct');
      setScore(score + 10);
      setShowExplanation(true);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('יפה מאוד!');
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
    <main className="min-h-screen bg-gradient-to-br from-amber-300 via-orange-300 to-rose-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            🏠 בבית
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד שמות של חפצים בבית באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          {/* ציון */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          {/* החפץ */}
          <div className="text-center mb-12">
            <div className="text-9xl mb-6 animate-bounce">{currentItem.emoji}</div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-amber-500 to-rose-600 text-white px-12 py-6 rounded-full text-4xl font-bold shadow-xl hover:scale-110 transition-all duration-200 mb-4"
            >
              🔊 {currentItem.word}
            </button>
            <p className="text-2xl text-gray-700 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
            <p className="text-3xl text-gray-800 font-bold mt-6">
              מה החפץ הזה?
            </p>
          </div>

          {/* כפתור דלג לשאלה הבאה */}
          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentIndex < HOME_ITEMS.length - 1) {
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
                  feedback === 'correct' && option.word === currentItem.word
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.word !== currentItem.word
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-amber-400 to-rose-500 hover:from-rose-500 hover:to-amber-400'
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
                🎉 מצוין! נכון!
              </div>
              {showExplanation && (
                <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mx-auto max-w-2xl animate-fade-in">
                  <div className="text-2xl font-bold text-blue-800 mb-2">💡 הסבר:</div>
                  <div className="text-xl text-blue-700 leading-relaxed">{currentItem.explanation}</div>
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
                  <div className="text-6xl mb-3">{currentItem.emoji}</div>
                  <div className="text-3xl font-bold text-yellow-900 mb-2">{currentItem.word}</div>
                  <div className="text-2xl text-yellow-800">{currentItem.he}</div>
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











