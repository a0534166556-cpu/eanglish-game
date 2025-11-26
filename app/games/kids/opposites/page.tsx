'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const OPPOSITES = [
  { word: 'big', opposite: 'small', wordHe: 'גדול', oppositeHe: 'קטן', emoji1: '🐘', emoji2: '🐁', explanation: 'Big (ביג) = גדול, Small (סמול) = קטן - כמו פיל ועכבר!' },
  { word: 'hot', opposite: 'cold', wordHe: 'חם', oppositeHe: 'קר', emoji1: '🔥', emoji2: '🧊', explanation: 'Hot (האט) = חם, Cold (קולד) = קר - כמו אש וקרח!' },
  { word: 'happy', opposite: 'sad', wordHe: 'שמח', oppositeHe: 'עצוב', emoji1: '😊', emoji2: '😢', explanation: 'Happy (האפי) = שמח, Sad (סאד) = עצוב - רגשות שונים!' },
  { word: 'up', opposite: 'down', wordHe: 'למעלה', oppositeHe: 'למטה', emoji1: '⬆️', emoji2: '⬇️', explanation: 'Up (אפ) = למעלה, Down (דאון) = למטה - כיוונים הפוכים!' },
  { word: 'fast', opposite: 'slow', wordHe: 'מהיר', oppositeHe: 'אטי', emoji1: '🐆', emoji2: '🐌', explanation: 'Fast (פאסט) = מהיר, Slow (סלואו) = אטי - כמו ברדלס וחילזון!' },
  { word: 'day', opposite: 'night', wordHe: 'יום', oppositeHe: 'לילה', emoji1: '☀️', emoji2: '🌙', explanation: 'Day (דיי) = יום, Night (נייט) = לילה - כשהשמש והירח זורחים!' },
  { word: 'clean', opposite: 'dirty', wordHe: 'נקי', oppositeHe: 'מלוכלך', emoji1: '✨', emoji2: '💩', explanation: 'Clean (קלין) = נקי, Dirty (דרטי) = מלוכלך - מצבים הפוכים!' },
  { word: 'wet', opposite: 'dry', wordHe: 'רטוב', oppositeHe: 'יבש', emoji1: '💧', emoji2: '🏜️', explanation: 'Wet (וֶט) = רטוב, Dry (דריי) = יבש - עם או בלי מים!' },
  { word: 'loud', opposite: 'quiet', wordHe: 'רועש', oppositeHe: 'שקט', emoji1: '📢', emoji2: '🤫', explanation: 'Loud (לאוד) = רועש, Quiet (קוויט) = שקט - רמות עוצמת קול!' },
  { word: 'old', opposite: 'young', wordHe: 'זקן', oppositeHe: 'צעיר', emoji1: '👴', emoji2: '👶', explanation: 'Old (אולד) = זקן, Young (יאנג) = צעיר - גילאים שונים!' },
  { word: 'tall', opposite: 'short', wordHe: 'גבוה', oppositeHe: 'נמוך', emoji1: '🦒', emoji2: '🐁', explanation: 'Tall (טול) = גבוה, Short (שורט) = נמוך - גבהים שונים!' },
  { word: 'heavy', opposite: 'light', wordHe: 'כבד', oppositeHe: 'קל', emoji1: '🏋️', emoji2: '🎈', explanation: 'Heavy (הבי) = כבד, Light (לייט) = קל - משקלים שונים!' },
  { word: 'full', opposite: 'empty', wordHe: 'מלא', oppositeHe: 'ריק', emoji1: '🥤', emoji2: '🫗', explanation: 'Full (פול) = מלא, Empty (אמפטי) = ריק - עם או בלי תוכן!' },
  { word: 'new', opposite: 'old', wordHe: 'חדש', oppositeHe: 'ישן', emoji1: '✨', emoji2: '📜', explanation: 'New (ניו) = חדש, Old (אולד) = ישן - גיל של דברים!' },
  { word: 'open', opposite: 'closed', wordHe: 'פתוח', oppositeHe: 'סגור', emoji1: '🚪', emoji2: '🔒', explanation: 'Open (אופן) = פתוח, Closed (קלוזד) = סגור - מצבי דלת!' },
];

export default function OppositesGame() {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [askingFor, setAskingFor] = useState<'word' | 'opposite'>('word');
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentPair = OPPOSITES[currentPairIndex];
  const questionWord = askingFor === 'word' ? currentPair.word : currentPair.opposite;
  const questionWordHe = askingFor === 'word' ? currentPair.wordHe : currentPair.oppositeHe;
  const questionEmoji = askingFor === 'word' ? currentPair.emoji1 : currentPair.emoji2;
  const correctAnswer = askingFor === 'word' ? currentPair.opposite : currentPair.word;

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentPairIndex, askingFor]);

  const generateOptions = () => {
    const correct = correctAnswer;
    const allWords = OPPOSITES.flatMap(p => [p.word, p.opposite]);
    const wrongOptions = allWords
      .filter(w => w !== correct && w !== questionWord)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(questionWord);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selectedWord: string) => {
    if (selectedWord === correctAnswer) {
      setFeedback('correct');
      setScore(score + 10);
      setShowExplanation(true);
      
      // דיבור "מצוין"
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

  const nextQuestion = () => {
    setFeedback(null);
    setShowExplanation(false);
    
    // החלף בין word ו-opposite
    if (askingFor === 'word') {
      setAskingFor('opposite');
    } else {
      setAskingFor('word');
      // עבור לזוג הבא
      if (currentPairIndex < OPPOSITES.length - 1) {
        setCurrentPairIndex(currentPairIndex + 1);
      } else {
        setCurrentPairIndex(0);
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-300 via-pink-300 to-red-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            ⚖️ ניגודים
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            מצא את ההפך של המילה!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          {/* ציון */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          {/* המילה */}
          <div className="text-center mb-12">
            <div className="text-8xl mb-6 animate-bounce">{questionEmoji}</div>
            <div className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600 mb-4">
              {questionWord}
            </div>
            <div className="text-3xl md:text-4xl text-gray-700 font-bold mb-6">
              {questionWordHe}
            </div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:scale-110 transition-all duration-200"
            >
              🔊 שמע שוב
            </button>
            <p className="text-2xl text-gray-700 mt-6 font-bold">מה ההפך של המילה?</p>
          </div>

          {/* כפתור דלג לשאלה הבאה */}
          <div className="text-center mb-6">
            <button
              onClick={nextQuestion}
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
                  feedback === 'correct' && option === correctAnswer
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option !== correctAnswer
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-purple-400 to-pink-500 hover:from-pink-500 hover:to-purple-400'
                }`}
              >
                <div className="text-4xl md:text-5xl font-bold text-white">
                  {option}
                </div>
              </button>
            ))}
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
                  <div className="text-xl text-blue-700 leading-relaxed mb-4">{currentPair.explanation}</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {currentPair.emoji1} {currentPair.word} ⟷ {currentPair.emoji2} {currentPair.opposite}
                  </div>
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
                  <div className="text-4xl font-bold text-yellow-900 mb-3">
                    {questionWord} ⟷ {correctAnswer}
                  </div>
                  <div className="text-2xl text-yellow-800">
                    {questionWordHe} ⟷ {askingFor === 'word' ? currentPair.oppositeHe : currentPair.wordHe}
                  </div>
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

