'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const BODY_PARTS = [
  { word: 'head', he: 'ראש', emoji: '🤕', explanation: 'Head (הד) = ראש - החלק העליון של הגוף, בו נמצא המוח!' },
  { word: 'eyes', he: 'עיניים', emoji: '👁️', explanation: 'Eyes (אייז) = עיניים - אנחנו רואים איתן!' },
  { word: 'nose', he: 'אף', emoji: '👃', explanation: 'Nose (נוז) = אף - אנחנו מריחים איתו!' },
  { word: 'mouth', he: 'פה', emoji: '👄', explanation: 'Mouth (מאות׳) = פה - אנחנו אוכלים ומדברים איתו!' },
  { word: 'ears', he: 'אוזניים', emoji: '👂', explanation: 'Ears (אירז) = אוזניים - אנחנו שומעים איתן!' },
  { word: 'hair', he: 'שיער', emoji: '💇', explanation: 'Hair (הייר) = שיער - גדל על הראש שלנו!' },
  { word: 'teeth', he: 'שיניים', emoji: '🦷', explanation: 'Teeth (טית׳) = שיניים - אנחנו לועסים איתן!' },
  { word: 'tongue', he: 'לשון', emoji: '👅', explanation: 'Tongue (טאנג) = לשון - אנחנו טועמים איתה!' },
  { word: 'neck', he: 'צוואר', emoji: '🧣', explanation: 'Neck (נק) = צוואר - מחבר את הראש לגוף!' },
  { word: 'shoulders', he: 'כתפיים', emoji: '💪', explanation: 'Shoulders (שולדרז) = כתפיים - בצדדים העליונים של הגוף!' },
  { word: 'arms', he: 'זרועות', emoji: '💪', explanation: 'Arms (ארמז) = זרועות - מהכתף עד היד!' },
  { word: 'hands', he: 'ידיים', emoji: '🙌', explanation: 'Hands (האנדז) = ידיים - אנחנו אוחזים איתן דברים!' },
  { word: 'fingers', he: 'אצבעות', emoji: '👆', explanation: 'Fingers (פינגרז) = אצבעות - 5 באצבעות בכל יד!' },
  { word: 'chest', he: 'חזה', emoji: '🫁', explanation: 'Chest (צ׳סט) = חזה - החלק הקדמי העליון של הגוף!' },
  { word: 'stomach', he: 'בטן', emoji: '🤰', explanation: 'Stomach (סטומק) = בטן - בו נמצא האוכל!' },
  { word: 'back', he: 'גב', emoji: '🔙', explanation: 'Back (בק) = גב - החלק האחורי של הגוף!' },
  { word: 'legs', he: 'רגליים', emoji: '🦵', explanation: 'Legs (לגז) = רגליים - אנחנו הולכים איתן!' },
  { word: 'knees', he: 'ברכיים', emoji: '🦵', explanation: 'Knees (ניז) = ברכיים - המפרק באמצע הרגל!' },
  { word: 'feet', he: 'כפות רגליים', emoji: '🦶', explanation: 'Feet (פיט) = כפות רגליים - אנחנו עומדים עליהן!' },
  { word: 'toes', he: 'אצבעות רגליים', emoji: '🦶', explanation: 'Toes (טוז) = אצבעות רגליים - 5 באצבעות בכל רגל!' },
];

export default function BodyPartsGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof BODY_PARTS>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentBodyPart = BODY_PARTS[currentIndex];

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = BODY_PARTS[currentIndex];
    const wrongOptions = BODY_PARTS
      .filter((_, idx) => idx !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentBodyPart.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: typeof BODY_PARTS[0]) => {
    if (selected.word === currentBodyPart.word) {
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
    <main className="min-h-screen bg-gradient-to-br from-red-300 via-orange-300 to-yellow-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            👃 חלקי הגוף
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד את חלקי הגוף באנגלית!
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
            <div className="text-9xl mb-6 animate-bounce">{currentBodyPart.emoji}</div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-6 rounded-full text-4xl font-bold shadow-xl hover:scale-110 transition-all duration-200 mb-4"
            >
              🔊 {currentBodyPart.word}
            </button>
            <p className="text-2xl text-gray-700 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
            <p className="text-3xl text-gray-800 font-bold mt-6">
              מה זה באנגלית?
            </p>
          </div>

          {/* כפתור דלג לשאלה הבאה */}
          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentIndex < BODY_PARTS.length - 1) {
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
                  feedback === 'correct' && option.word === currentBodyPart.word
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.word !== currentBodyPart.word
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-blue-400 to-purple-500 hover:from-purple-500 hover:to-blue-400'
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
                  <div className="text-xl text-blue-700 leading-relaxed">{currentBodyPart.explanation}</div>
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
                  <div className="text-6xl mb-3">{currentBodyPart.emoji}</div>
                  <div className="text-3xl font-bold text-yellow-900 mb-2">{currentBodyPart.word}</div>
                  <div className="text-2xl text-yellow-800">{currentBodyPart.he}</div>
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



