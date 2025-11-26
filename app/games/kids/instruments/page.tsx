'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const INSTRUMENTS = [
  { word: 'piano', he: 'פסנתר', emoji: '🎹', explanation: 'Piano (פיאנו) = פסנתר - כלי נגינה עם מקלדת לבנה ושחורה!' },
  { word: 'guitar', he: 'גיטרה', emoji: '🎸', explanation: 'Guitar (גיטאר) = גיטרה - כלי נגינה עם מיתרים!' },
  { word: 'drums', he: 'תופים', emoji: '🥁', explanation: 'Drums (דראמס) = תופים - מכים עליהם עם מקלות!' },
  { word: 'violin', he: 'כינור', emoji: '🎻', explanation: 'Violin (ויילין) = כינור - מנגנים עם קשת!' },
  { word: 'trumpet', he: 'חצוצרה', emoji: '🎺', explanation: 'Trumpet (טראמפט) = חצוצרה - כלי נשיפה נחושתי!' },
  { word: 'flute', he: 'חליל', emoji: '🪈', explanation: 'Flute (פלוט) = חליל - כלי נשיפה ארוך!' },
  { word: 'saxophone', he: 'סקסופון', emoji: '🎷', explanation: 'Saxophone (סקסופון) = סקסופון - כלי נגינה של ג׳אז!' },
  { word: 'microphone', he: 'מיקרופון', emoji: '🎤', explanation: 'Microphone (מייקרופון) = מיקרופון - שרים לתוכו!' },
  { word: 'tambourine', he: 'טמבורין', emoji: '🪇', explanation: 'Tambourine (טמברין) = טמבורין - מכשיר קצב עגול!' },
  { word: 'harmonica', he: 'מפוחית', emoji: '🎶', explanation: 'Harmonica (הרמוניקה) = מפוחית - כלי נשיפה קטן!' },
  { word: 'accordion', he: 'אקורדיון', emoji: '🪗', explanation: 'Accordion (אקורדיון) = אקורדיון - כלי נגינה שמושכים ודוחפים!' },
  { word: 'xylophone', he: 'קסילופון', emoji: '🎼', explanation: 'Xylophone (קסילופון) = קסילופון - מכים על פסים צבעוניים!' },
  { word: 'harp', he: 'נבל', emoji: '🎶', explanation: 'Harp (הארפ) = נבל - כלי נגינה עם מיתרים גבוה!' },
  { word: 'banjo', he: 'בנג׳ו', emoji: '🪕', explanation: 'Banjo (בנג׳ו) = בנג׳ו - כמו גיטרה עגולה!' },
  { word: 'organ', he: 'אורגן', emoji: '🎹', explanation: 'Organ (אורגן) = אורגן - פסנתר גדול עם צינורות!' },
  { word: 'cello', he: 'צ׳לו', emoji: '🎻', explanation: 'Cello (צ׳לו) = צ׳לו - כינור גדול שיושבים איתו!' },
  { word: 'clarinet', he: 'קלרינט', emoji: '🎶', explanation: 'Clarinet (קלרינט) = קלרינט - כלי נשיפה עם חורים!' },
  { word: 'trombone', he: 'טרומבון', emoji: '🎺', explanation: 'Trombone (טרומבון) = טרומבון - חצוצרה עם צינור נע!' },
  { word: 'cymbals', he: 'מצלתיים', emoji: '🥁', explanation: 'Cymbals (סימבלס) = מצלתיים - שני דיסקים שמכים אותם ביחד!' },
  { word: 'triangle', he: 'משולש מתכת', emoji: '🔺', explanation: 'Triangle (טריאנגל) = משולש - כלי הקשה משולש!' },
];

export default function InstrumentsGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof INSTRUMENTS>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentInstrument = INSTRUMENTS[currentIndex];

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = INSTRUMENTS[currentIndex];
    const wrongOptions = INSTRUMENTS
      .filter((_, idx) => idx !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentInstrument.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: typeof INSTRUMENTS[0]) => {
    if (selected.word === currentInstrument.word) {
      setFeedback('correct');
      setScore(score + 10);
      setShowExplanation(true);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('מצוין!');
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
    <main className="min-h-screen bg-gradient-to-br from-violet-300 via-purple-300 to-fuchsia-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            🎵 כלי נגינה
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד שמות של כלי נגינה באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="text-9xl mb-6 animate-bounce">{currentInstrument.emoji}</div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white px-12 py-6 rounded-full text-4xl font-bold shadow-xl hover:scale-110 transition-all duration-200 mb-4"
            >
              🔊 {currentInstrument.word}
            </button>
            <p className="text-2xl text-gray-700 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
            <p className="text-3xl text-gray-800 font-bold mt-6">איזה כלי נגינה זה?</p>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentIndex < INSTRUMENTS.length - 1) {
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
                  feedback === 'correct' && option.word === currentInstrument.word
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.word !== currentInstrument.word
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-violet-400 to-fuchsia-500 hover:from-fuchsia-500 hover:to-violet-400'
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
                🎉 כל הכבוד! נכון!
              </div>
              {showExplanation && (
                <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mx-auto max-w-2xl animate-fade-in">
                  <div className="text-2xl font-bold text-blue-800 mb-2">💡 הסבר:</div>
                  <div className="text-xl text-blue-700 leading-relaxed">{currentInstrument.explanation}</div>
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
                  <div className="text-6xl mb-3">{currentInstrument.emoji}</div>
                  <div className="text-3xl font-bold text-yellow-900 mb-2">{currentInstrument.word}</div>
                  <div className="text-2xl text-yellow-800">{currentInstrument.he}</div>
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











