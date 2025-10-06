'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SHAPES = [
  { name: 'circle', he: 'עיגול', svg: '○', color: '#FF6B9D', explanation: 'Circle (סרקל) = עיגול - צורה עגולה כמו כדור!' },
  { name: 'square', he: 'ריבוע', svg: '□', color: '#4ECDC4', explanation: 'Square (סקוור) = ריבוע - יש לו 4 צלעות שוות!' },
  { name: 'triangle', he: 'משולש', svg: '△', color: '#FFD93D', explanation: 'Triangle (טריאנגל) = משולש - יש לו 3 פינות!' },
  { name: 'star', he: 'כוכב', svg: '★', color: '#A8E6CF', explanation: 'Star (סטאר) = כוכב - מנצנץ בשמיים!' },
  { name: 'heart', he: 'לב', svg: '♥', color: '#FF6B9D', explanation: 'Heart (הארט) = לב - צורת האהבה!' },
  { name: 'rectangle', he: 'מלבן', svg: '▭', color: '#95E1D3', explanation: 'Rectangle (רקטנגל) = מלבן - כמו ריבוע ארוך!' },
  { name: 'oval', he: 'אליפסה', svg: '⬭', color: '#FECA57', explanation: 'Oval (אובל) = אליפסה - כמו עיגול מתוח!' },
  { name: 'diamond', he: 'מעוין', svg: '◆', color: '#C7CEEA', explanation: 'Diamond (דיימונד) = מעוין - כמו ריבוע מוטה!' },
];

const COLORS = [
  { name: 'red', he: 'אדום', color: '#FF0000', emoji: '🔴', explanation: 'Red (רד) = אדום - צבע של תפוחים וכבאיות!' },
  { name: 'blue', he: 'כחול', color: '#0000FF', emoji: '🔵', explanation: 'Blue (בלו) = כחול - צבע של השמיים והים!' },
  { name: 'green', he: 'ירוק', color: '#00FF00', emoji: '🟢', explanation: 'Green (גרין) = ירוק - צבע של דשא ועלים!' },
  { name: 'yellow', he: 'צהוב', color: '#FFFF00', emoji: '🟡', explanation: 'Yellow (ילו) = צהוב - צבע של השמש והבננות!' },
  { name: 'orange', he: 'כתום', color: '#FFA500', emoji: '🟠', explanation: 'Orange (אורנג׳) = כתום - צבע של תפוזים וגזר!' },
  { name: 'purple', he: 'סגול', color: '#800080', emoji: '🟣', explanation: 'Purple (פרפל) = סגול - תערובת של אדום וכחול!' },
  { name: 'pink', he: 'ורוד', color: '#FFC0CB', emoji: '🩷', explanation: 'Pink (פינק) = ורוד - אדום בהיר, צבע של פרחים!' },
  { name: 'brown', he: 'חום', color: '#8B4513', emoji: '🟤', explanation: 'Brown (בראון) = חום - צבע של שוקולד ועץ!' },
  { name: 'black', he: 'שחור', color: '#000000', emoji: '⚫', explanation: 'Black (בלאק) = שחור - הצבע הכי כהה, כמו הלילה!' },
  { name: 'white', he: 'לבן', color: '#FFFFFF', emoji: '⚪', explanation: 'White (וויט) = לבן - צבע של שלג ועננים!' },
  { name: 'gray', he: 'אפור', color: '#808080', emoji: '🔘', explanation: 'Gray (גריי) = אפור - תערובת של שחור ולבן!' },
];

type GameMode = 'shapes' | 'colors';

export default function ShapesColorsGame() {
  const [gameMode, setGameMode] = useState<GameMode>('shapes');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentItems = gameMode === 'shapes' ? SHAPES : COLORS;
  const currentItem = currentItems[currentIndex];

  useEffect(() => {
    generateOptions();
    speakItem();
  }, [currentIndex, gameMode]);

  const generateOptions = () => {
    const items = gameMode === 'shapes' ? SHAPES : COLORS;
    const correct = items[currentIndex];
    const wrongOptions = items
      .filter((_, idx) => idx !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakItem = () => {
    if ('speechSynthesis' in window) {
      const text = gameMode === 'shapes' ? `Find the ${currentItem.name}` : `Find ${currentItem.name}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.3;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selectedItem: any) => {
    if (selectedItem.name === currentItem.name) {
      setFeedback('correct');
      setScore(score + 10);
      setShowExplanation(true);
      
      // דיבור "כל הכבוד"
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('כל הכבוד! נכון!');
        utterance.lang = 'he-IL';
        utterance.rate = 1.0;
        utterance.pitch = 1.4;
        window.speechSynthesis.speak(utterance);
      }
      
      // לא עוברים אוטומטית - רק דרך הכפתור!
    } else {
      setFeedback('wrong');
      setShowExplanation(true);
      
      // לא סוגרים את ההסבר אוטומטית - רק דרך הכפתור!
    }
  };

  const switchMode = () => {
    setGameMode(gameMode === 'shapes' ? 'colors' : 'shapes');
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-300 via-pink-300 to-purple-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            🎨 צורות וצבעים
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            זהה צורות וצבעים באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          {/* כפתורי מצב משחק */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={switchMode}
              className={`px-8 py-4 rounded-full text-xl font-bold shadow-lg transition-all duration-200 ${
                gameMode === 'shapes'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
              }`}
            >
              🔷 צורות
            </button>
            <button
              onClick={switchMode}
              className={`px-8 py-4 rounded-full text-xl font-bold shadow-lg transition-all duration-200 ${
                gameMode === 'colors'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
              }`}
            >
              🌈 צבעים
            </button>
          </div>

          {/* ציון */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          {/* הצגת הצורה/צבע */}
          <div className="text-center mb-12">
            <button
              onClick={speakItem}
              className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:scale-110 transition-all duration-200"
            >
              🔊 שמע שוב
            </button>
            
            {gameMode === 'shapes' ? (
              <div className="text-9xl font-bold mb-4" style={{ color: currentItem.color }}>
                {'svg' in currentItem ? currentItem.svg : currentItem.emoji}
              </div>
            ) : (
              <div className="text-9xl mb-4 animate-pulse">
                {'emoji' in currentItem ? currentItem.emoji : '🎨'}
              </div>
            )}
            
            <p className="text-3xl font-bold text-gray-700">
              Find the {currentItem.name}!
            </p>
            <p className="text-2xl text-gray-600 mt-2">
              מצא את ה{currentItem.he}!
            </p>
          </div>

          {/* כפתור דלג לשאלה הבאה */}
          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                const items = gameMode === 'shapes' ? SHAPES : COLORS;
                if (currentIndex < items.length - 1) {
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
          <div className="grid grid-cols-2 gap-6 md:gap-8">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={feedback !== null}
                className={`p-8 md:p-10 rounded-3xl shadow-xl transition-all duration-200 transform hover:scale-105 ${
                  feedback === 'correct' && option.name === currentItem.name
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.name !== currentItem.name
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-pink-400 to-purple-500 hover:from-purple-500 hover:to-pink-400'
                }`}
              >
                {gameMode === 'shapes' ? (
                  <>
                    <div className="text-8xl font-bold mb-3" style={{ color: option.color }}>
                      {option.svg}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white">{option.he}</div>
                  </>
                ) : (
                  <>
                    <div className="text-8xl mb-3">{option.emoji}</div>
                    <div className="text-2xl md:text-3xl font-bold text-white">{option.he}</div>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* משוב */}
          {feedback === 'correct' && (
            <div className="text-center mt-8">
              <div className="inline-block bg-green-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-xl mb-4 animate-bounce">
                🎉 מעולה! נכון!
              </div>
              {showExplanation && (
                <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mx-auto max-w-2xl animate-fade-in">
                  <div className="text-2xl font-bold text-blue-800 mb-2">💡 הסבר:</div>
                  <div className="text-xl text-blue-700 leading-relaxed mb-4">{currentItem.explanation}</div>
                  <button
                    onClick={() => {
                      setFeedback(null);
                      setShowExplanation(false);
                      const items = gameMode === 'shapes' ? SHAPES : COLORS;
                      if (currentIndex < items.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                      } else {
                        setCurrentIndex(0);
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
                😊 נסה שוב!
              </div>
              {showExplanation && (
                <div className="bg-yellow-100 border-4 border-yellow-300 rounded-2xl p-6 mx-auto max-w-2xl">
                  <div className="text-2xl font-bold text-yellow-800 mb-2">התשובה הנכונה:</div>
                  <div className="text-4xl font-bold text-yellow-900 mb-2">
                    {gameMode === 'shapes' ? ('svg' in currentItem ? currentItem.svg : '🔷') : ('emoji' in currentItem ? currentItem.emoji : '🎨')} {currentItem.he}
                  </div>
                  <div className="text-2xl text-yellow-800 mb-4">{currentItem.name}</div>
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

