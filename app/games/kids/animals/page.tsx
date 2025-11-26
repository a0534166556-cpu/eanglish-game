'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ANIMALS = [
  { word: 'elephant', he: 'פיל', emoji: '🐘', explanation: 'Elephant (אליפנט) = פיל - החיה הכי גדולה ביבשה, עם חדק ארוך!' },
  { word: 'lion', he: 'אריה', emoji: '🦁', explanation: 'Lion (לייאון) = אריה - מלך החיות, שואג בקול רם!' },
  { word: 'tiger', he: 'נמר', emoji: '🐯', explanation: 'Tiger (טייגר) = נמר - חתול גדול עם פסים!' },
  { word: 'bear', he: 'דוב', emoji: '🐻', explanation: 'Bear (בר) = דוב - חיה גדולה ופרוותית!' },
  { word: 'monkey', he: 'קוף', emoji: '🐵', explanation: 'Monkey (מאנקי) = קוף - אוהב בננות ומטפס על עצים!' },
  { word: 'giraffe', he: 'ג׳ירפה', emoji: '🦒', explanation: 'Giraffe (ג׳ירף) = ג׳ירפה - החיה הכי גבוהה עם צוואר ארוך!' },
  { word: 'zebra', he: 'זברה', emoji: '🦓', explanation: 'Zebra (זברה) = זברה - כמו סוס עם פסים שחור-לבן!' },
  { word: 'panda', he: 'פנדה', emoji: '🐼', explanation: 'Panda (פנדה) = פנדה - דוב שחור-לבן שאוכל במבוק!' },
  { word: 'koala', he: 'קואלה', emoji: '🐨', explanation: 'Koala (קואלה) = קואלה - חיה חמודה מאוסטרליה שחיה על עצים!' },
  { word: 'penguin', he: 'פינגווין', emoji: '🐧', explanation: 'Penguin (פנגווין) = פינגווין - ציפור שלא עפה אבל שוחה מצוין!' },
  { word: 'whale', he: 'לווייתן', emoji: '🐋', explanation: 'Whale (וויל) = לווייתן - החיה הכי גדולה בעולם, חיה בים!' },
  { word: 'dolphin', he: 'דולפין', emoji: '🐬', explanation: 'Dolphin (דולפין) = דולפין - יונק חכם ומהיר בים!' },
  { word: 'turtle', he: 'צב', emoji: '🐢', explanation: 'Turtle (טרטל) = צב - חיה איטית עם שריון קשה!' },
  { word: 'rabbit', he: 'ארנב', emoji: '🐰', explanation: 'Rabbit (רביט) = ארנב - קופץ מהר עם אוזניים ארוכות!' },
  { word: 'fox', he: 'שועל', emoji: '🦊', explanation: 'Fox (פוקס) = שועל - חיה חכמה ומהירה עם זנב עבה!' },
  { word: 'wolf', he: 'זאב', emoji: '🐺', explanation: 'Wolf (וולף) = זאב - כמו כלב גדול שחי בטבע!' },
  { word: 'deer', he: 'צבי', emoji: '🦌', explanation: 'Deer (דיר) = צבי - יש לו קרניים יפות!' },
  { word: 'camel', he: 'גמל', emoji: '🐪', explanation: 'Camel (קמל) = גמל - חי במדבר ויש לו גיבנת!' },
  { word: 'kangaroo', he: 'קנגרו', emoji: '🦘', explanation: 'Kangaroo (קנגרו) = קנגרו - קופץ גבוה ונושא תינוקות בכיס!' },
  { word: 'crocodile', he: 'תנין', emoji: '🐊', explanation: 'Crocodile (קרוקודייל) = תנין - זוחל גדול עם שיניים חדות!' },
];

export default function AnimalsGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof ANIMALS>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentAnimal = ANIMALS[currentIndex];

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = ANIMALS[currentIndex];
    const wrongOptions = ANIMALS
      .filter((_, idx) => idx !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentAnimal.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: typeof ANIMALS[0]) => {
    if (selected.word === currentAnimal.word) {
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
    <main className="min-h-screen bg-gradient-to-br from-green-300 via-teal-300 to-blue-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            🐘 בעלי חיים
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד שמות של בעלי חיים באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          {/* ציון */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          {/* החיה */}
          <div className="text-center mb-12">
            <div className="text-9xl mb-6 animate-bounce">{currentAnimal.emoji}</div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-12 py-6 rounded-full text-4xl font-bold shadow-xl hover:scale-110 transition-all duration-200 mb-4"
            >
              🔊 {currentAnimal.word}
            </button>
            <p className="text-2xl text-gray-700 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
            <p className="text-3xl text-gray-800 font-bold mt-6">
              איזו חיה זו?
            </p>
          </div>

          {/* כפתור דלג לשאלה הבאה */}
          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentIndex < ANIMALS.length - 1) {
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
                  feedback === 'correct' && option.word === currentAnimal.word
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.word !== currentAnimal.word
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400'
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
                🎉 כל הכבוד! נכון!
              </div>
              {showExplanation && (
                <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mx-auto max-w-2xl animate-fade-in">
                  <div className="text-2xl font-bold text-blue-800 mb-2">💡 הסבר:</div>
                  <div className="text-xl text-blue-700 leading-relaxed">{currentAnimal.explanation}</div>
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
                  <div className="text-6xl mb-3">{currentAnimal.emoji}</div>
                  <div className="text-3xl font-bold text-yellow-900 mb-2">{currentAnimal.word}</div>
                  <div className="text-2xl text-yellow-800">{currentAnimal.he}</div>
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















