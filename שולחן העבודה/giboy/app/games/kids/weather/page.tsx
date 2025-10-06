'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const WEATHER = [
  { word: 'sunny', he: 'שמשי', emoji: '☀️', explanation: 'Sunny (סאני) = שמשי - יום עם הרבה שמש!' },
  { word: 'cloudy', he: 'מעונן', emoji: '☁️', explanation: 'Cloudy (קלאודי) = מעונן - השמיים מלאים עננים!' },
  { word: 'rainy', he: 'גשום', emoji: '🌧️', explanation: 'Rainy (רייני) = גשום - יורד גשם מהשמיים!' },
  { word: 'snowy', he: 'מושלג', emoji: '❄️', explanation: 'Snowy (סנואי) = מושלג - יורד שלג לבן!' },
  { word: 'windy', he: 'סוער', emoji: '💨', explanation: 'Windy (ווינדי) = סוער - הרוח נושבת חזק!' },
  { word: 'stormy', he: 'סוער', emoji: '⛈️', explanation: 'Stormy (סטורמי) = סוער - סופה עם רעמים וברקים!' },
  { word: 'hot', he: 'חם', emoji: '🔥', explanation: 'Hot (האט) = חם - מזג אוויר חם מאוד!' },
  { word: 'cold', he: 'קר', emoji: '🧊', explanation: 'Cold (קולד) = קר - מזג אוויר קר מאוד!' },
  { word: 'warm', he: 'חמים', emoji: '🌡️', explanation: 'Warm (וורם) = חמים - נעים, לא חם מדי!' },
  { word: 'cool', he: 'קריר', emoji: '🍃', explanation: 'Cool (קול) = קריר - נעים, לא קר מדי!' },
  { word: 'foggy', he: 'ערפילי', emoji: '🌫️', explanation: 'Foggy (פוגי) = ערפילי - קשה לראות בגלל ערפל!' },
  { word: 'rainbow', he: 'קשת בענן', emoji: '🌈', explanation: 'Rainbow (ריינבואו) = קשת בענן - צבעים יפים בשמיים!' },
  { word: 'thunder', he: 'רעם', emoji: '⚡', explanation: 'Thunder (ת׳אנדר) = רעם - קול חזק מהשמיים!' },
  { word: 'lightning', he: 'ברק', emoji: '⚡', explanation: 'Lightning (לייטנינג) = ברק - אור חזק בשמיים!' },
  { word: 'hurricane', he: 'הוריקן', emoji: '🌀', explanation: 'Hurricane (הריקיין) = הוריקן - סופה חזקה מאוד!' },
];

export default function WeatherGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof WEATHER>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentWeather = WEATHER[currentIndex];

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = WEATHER[currentIndex];
    const wrongOptions = WEATHER
      .filter((_, idx) => idx !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWeather.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: typeof WEATHER[0]) => {
    if (selected.word === currentWeather.word) {
      setFeedback('correct');
      setScore(score + 10);
      setShowExplanation(true);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('כל הכבוד!');
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
    <main className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-300 to-indigo-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            ☀️ מזג אוויר
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד מילים על מזג האוויר באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          {/* ציון */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          {/* מזג האוויר */}
          <div className="text-center mb-12">
            <div className="text-9xl mb-6 animate-bounce">{currentWeather.emoji}</div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-12 py-6 rounded-full text-4xl font-bold shadow-xl hover:scale-110 transition-all duration-200 mb-4"
            >
              🔊 {currentWeather.word}
            </button>
            <p className="text-2xl text-gray-700 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
            <p className="text-3xl text-gray-800 font-bold mt-6">
              מה מזג האוויר?
            </p>
          </div>

          {/* כפתור דלג לשאלה הבאה */}
          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentIndex < WEATHER.length - 1) {
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
                  feedback === 'correct' && option.word === currentWeather.word
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.word !== currentWeather.word
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-sky-400 to-blue-500 hover:from-blue-500 hover:to-sky-400'
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
                  <div className="text-xl text-blue-700 leading-relaxed">{currentWeather.explanation}</div>
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
                  <div className="text-6xl mb-3">{currentWeather.emoji}</div>
                  <div className="text-3xl font-bold text-yellow-900 mb-2">{currentWeather.word}</div>
                  <div className="text-2xl text-yellow-800">{currentWeather.he}</div>
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



