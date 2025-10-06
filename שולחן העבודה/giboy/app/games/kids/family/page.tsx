'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const FAMILY = [
  { word: 'mother', he: 'אמא', emoji: '👩', explanation: 'Mother (מאדר) = אמא - האישה שילדה אותך!' },
  { word: 'mom', he: 'אמא', emoji: '🤱', explanation: 'Mom (מאם) = אמא - דרך חיבה לקרוא לאמא!' },
  { word: 'father', he: 'אבא', emoji: '👨', explanation: 'Father (פאדר) = אבא - הגבר שהוא ההורה שלך!' },
  { word: 'dad', he: 'אבא', emoji: '👨‍🍼', explanation: 'Dad (דאד) = אבא - דרך חיבה לקרוא לאבא!' },
  { word: 'parents', he: 'הורים', emoji: '👨‍👩‍👧', explanation: 'Parents (פרנטס) = הורים - אמא ואבא ביחד!' },
  { word: 'brother', he: 'אח', emoji: '👦', explanation: 'Brother (ברדר) = אח - בן של ההורים שלך!' },
  { word: 'sister', he: 'אחות', emoji: '👧', explanation: 'Sister (סיסטר) = אחות - בת של ההורים שלך!' },
  { word: 'baby', he: 'תינוק', emoji: '👶', explanation: 'Baby (בייבי) = תינוק - ילד קטן מאוד!' },
  { word: 'son', he: 'בן', emoji: '👦', explanation: 'Son (סאן) = בן - ילד של ההורים!' },
  { word: 'daughter', he: 'בת', emoji: '👧', explanation: 'Daughter (דוטר) = בת - ילדה של ההורים!' },
  { word: 'grandmother', he: 'סבתא', emoji: '👵', explanation: 'Grandmother (גרנדמאדר) = סבתא - אמא של ההורים!' },
  { word: 'grandma', he: 'סבתא', emoji: '👵', explanation: 'Grandma (גרנדמה) = סבתא - דרך חיבה לקרוא לסבתא!' },
  { word: 'grandfather', he: 'סבא', emoji: '👴', explanation: 'Grandfather (גרנדפאדר) = סבא - אבא של ההורים!' },
  { word: 'grandpa', he: 'סבא', emoji: '👴', explanation: 'Grandpa (גרנדפה) = סבא - דרך חיבה לקרוא לסבא!' },
  { word: 'uncle', he: 'דוד', emoji: '👨‍🦱', explanation: 'Uncle (אנקל) = דוד - אח של ההורים!' },
  { word: 'aunt', he: 'דודה', emoji: '👩‍🦰', explanation: 'Aunt (אנט) = דודה - אחות של ההורים!' },
  { word: 'cousin', he: 'בן דוד', emoji: '👦', explanation: 'Cousin (קאזין) = בן דוד - ילד של הדוד או הדודה!' },
  { word: 'family', he: 'משפחה', emoji: '👨‍👩‍👧‍👦', explanation: 'Family (פמילי) = משפחה - כל האנשים שאתה אוהב!' },
];

export default function FamilyGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof FAMILY>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentMember = FAMILY[currentIndex];

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = FAMILY[currentIndex];
    const wrongOptions = FAMILY
      .filter((_, idx) => idx !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentMember.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: typeof FAMILY[0]) => {
    if (selected.word === currentMember.word) {
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
    <main className="min-h-screen bg-gradient-to-br from-pink-300 via-rose-300 to-red-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            👨‍👩‍👧‍👦 משפחה
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד מילים על המשפחה באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="text-9xl mb-6 animate-bounce">{currentMember.emoji}</div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-pink-500 to-red-600 text-white px-12 py-6 rounded-full text-4xl font-bold shadow-xl hover:scale-110 transition-all duration-200 mb-4"
            >
              🔊 {currentMember.word}
            </button>
            <p className="text-2xl text-gray-700 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
            <p className="text-3xl text-gray-800 font-bold mt-6">מי זה במשפחה?</p>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentIndex < FAMILY.length - 1) {
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
                  feedback === 'correct' && option.word === currentMember.word
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.word !== currentMember.word
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-pink-400 to-red-500 hover:from-red-500 hover:to-pink-400'
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
                  <div className="text-xl text-blue-700 leading-relaxed">{currentMember.explanation}</div>
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
                  <div className="text-6xl mb-3">{currentMember.emoji}</div>
                  <div className="text-3xl font-bold text-yellow-900 mb-2">{currentMember.word}</div>
                  <div className="text-2xl text-yellow-800">{currentMember.he}</div>
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



