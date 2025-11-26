'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SCHOOL = [
  { word: 'teacher', he: 'מורה', emoji: '👩‍🏫', explanation: 'Teacher (טיצ׳ר) = מורה - מלמד את התלמידים!' },
  { word: 'student', he: 'תלמיד', emoji: '🧑‍🎓', explanation: 'Student (סטודנט) = תלמיד - לומד בבית הספר!' },
  { word: 'classroom', he: 'כיתה', emoji: '🏫', explanation: 'Classroom (קלאסרום) = כיתה - החדר שבו לומדים!' },
  { word: 'book', he: 'ספר', emoji: '📚', explanation: 'Book (בוק) = ספר - קוראים ממנו שיעורים!' },
  { word: 'notebook', he: 'מחברת', emoji: '📓', explanation: 'Notebook (נוטבוק) = מחברת - כותבים בה!' },
  { word: 'pen', he: 'עט', emoji: '🖊️', explanation: 'Pen (פן) = עט - כותבים איתו!' },
  { word: 'pencil', he: 'עיפרון', emoji: '✏️', explanation: 'Pencil (פנסיל) = עיפרון - כותבים ומוחקים!' },
  { word: 'eraser', he: 'מחק', emoji: '🧽', explanation: 'Eraser (אירייזר) = מחק - מוחק טעויות!' },
  { word: 'ruler', he: 'סרגל', emoji: '📏', explanation: 'Ruler (רולר) = סרגל - מודדים איתו!' },
  { word: 'scissors', he: 'מספריים', emoji: '✂️', explanation: 'Scissors (סיזרס) = מספריים - גוזרים איתם!' },
  { word: 'glue', he: 'דבק', emoji: '🧴', explanation: 'Glue (גלו) = דבק - מדביקים איתו!' },
  { word: 'backpack', he: 'תיק גב', emoji: '🎒', explanation: 'Backpack (בקפק) = תיק גב - נושאים בו ציוד!' },
  { word: 'desk', he: 'שולחן', emoji: '🪑', explanation: 'Desk (דסק) = שולחן - יושבים ליד זה!' },
  { word: 'chair', he: 'כיסא', emoji: '🪑', explanation: 'Chair (צ׳ייר) = כיסא - יושבים עליו!' },
  { word: 'board', he: 'לוח', emoji: '📋', explanation: 'Board (בורד) = לוח - המורה כותב עליו!' },
  { word: 'chalk', he: 'גיר', emoji: '✍️', explanation: 'Chalk (צ׳וק) = גיר - כותבים איתו על הלוח!' },
  { word: 'marker', he: 'טוש', emoji: '🖍️', explanation: 'Marker (מרקר) = טוש - כותבים בצבע!' },
  { word: 'calculator', he: 'מחשבון', emoji: '🔢', explanation: 'Calculator (קלקולייטור) = מחשבון - עוזר בחשבון!' },
  { word: 'computer', he: 'מחשב', emoji: '💻', explanation: 'Computer (קומפיוטר) = מחשב - לומדים איתו!' },
  { word: 'paper', he: 'נייר', emoji: '📄', explanation: 'Paper (פייפר) = נייר - כותבים עליו!' },
  { word: 'crayon', he: 'עיפרון צבע', emoji: '🖍️', explanation: 'Crayon (קרייון) = עיפרון צבע - מציירים איתו!' },
  { word: 'paint', he: 'צבע', emoji: '🎨', explanation: 'Paint (פיינט) = צבע - מציירים בו!' },
  { word: 'test', he: 'מבחן', emoji: '📝', explanation: 'Test (טסט) = מבחן - בודקים מה למדנו!' },
  { word: 'homework', he: 'שיעורי בית', emoji: '📖', explanation: 'Homework (האומוורק) = שיעורי בית - תרגילים לבית!' },
  { word: 'lunch', he: 'ארוחת צהריים', emoji: '🍱', explanation: 'Lunch (לאנץ׳) = ארוחת צהריים - אוכלים בהפסקה!' },
  { word: 'recess', he: 'הפסקה', emoji: '⏰', explanation: 'Recess (ריסס) = הפסקה - זמן משחק!' },
  { word: 'bell', he: 'פעמון', emoji: '🔔', explanation: 'Bell (בל) = פעמון - מצלצל בין שיעורים!' },
  { word: 'locker', he: 'ארונית', emoji: '🔐', explanation: 'Locker (לוקר) = ארונית - שומרים בה דברים!' },
];

export default function SchoolGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof SCHOOL>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentItem = SCHOOL[currentIndex];

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = SCHOOL[currentIndex];
    const wrongOptions = SCHOOL
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

  const handleAnswer = (selected: typeof SCHOOL[0]) => {
    if (selected.word === currentItem.word) {
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
    <main className="min-h-screen bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            🏫 בבית הספר
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד מילים על בית הספר באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="text-9xl mb-6 animate-bounce">{currentItem.emoji}</div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-6 rounded-full text-4xl font-bold shadow-xl hover:scale-110 transition-all duration-200 mb-4"
            >
              🔊 {currentItem.word}
            </button>
            <p className="text-2xl text-gray-700 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
            <p className="text-3xl text-gray-800 font-bold mt-6">מה זה בבית הספר?</p>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentIndex < SCHOOL.length - 1) {
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
                  feedback === 'correct' && option.word === currentItem.word
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.word !== currentItem.word
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-blue-400 to-purple-500 hover:from-purple-500 hover:to-blue-400'
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
                🎉 יפה מאוד! נכון!
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











