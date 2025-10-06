'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const EMOTIONS = [
  { word: 'happy', he: 'שמח', emoji: '😊', explanation: 'Happy (האפי) = שמח - מרגיש טוב ומחייך!' },
  { word: 'sad', he: 'עצוב', emoji: '😢', explanation: 'Sad (סאד) = עצוב - מרגיש לא טוב ובוכה!' },
  { word: 'angry', he: 'כועס', emoji: '😠', explanation: 'Angry (אנגרי) = כועס - מרגיש רע ועצבני!' },
  { word: 'scared', he: 'מפוחד', emoji: '😨', explanation: 'Scared (סקרד) = מפוחד - מרגיש פחד!' },
  { word: 'excited', he: 'נרגש', emoji: '🤩', explanation: 'Excited (אקסייטד) = נרגש - מאוד שמח ומתרגש!' },
  { word: 'tired', he: 'עייף', emoji: '😴', explanation: 'Tired (טייירד) = עייף - רוצה לישון!' },
  { word: 'surprised', he: 'מופתע', emoji: '😲', explanation: 'Surprised (סרפרייזד) = מופתע - קרה משהו לא צפוי!' },
  { word: 'confused', he: 'מבולבל', emoji: '😕', explanation: 'Confused (קונפיוזד) = מבולבל - לא מבין!' },
  { word: 'bored', he: 'משועמם', emoji: '😑', explanation: 'Bored (בורד) = משועמם - אין מה לעשות!' },
  { word: 'shy', he: 'ביישן', emoji: '😳', explanation: 'Shy (שיי) = ביישן - מתבייש מאנשים!' },
  { word: 'proud', he: 'גאה', emoji: '😌', explanation: 'Proud (פראוד) = גאה - מרגיש טוב על עצמו!' },
  { word: 'worried', he: 'דואג', emoji: '😟', explanation: 'Worried (וורייד) = דואג - חושב על דברים רעים!' },
  { word: 'sick', he: 'חולה', emoji: '🤒', explanation: 'Sick (סיק) = חולה - לא מרגיש בריא!' },
  { word: 'hungry', he: 'רעב', emoji: '😋', explanation: 'Hungry (האנגרי) = רעב - צריך לאכול!' },
  { word: 'thirsty', he: 'צמא', emoji: '🥤', explanation: 'Thirsty (ת׳רסטי) = צמא - צריך לשתות!' },
  { word: 'sleepy', he: 'מנומנם', emoji: '🥱', explanation: 'Sleepy (סליפי) = מנומנם - רוצה לישון!' },
  { word: 'laughing', he: 'צוחק', emoji: '😂', explanation: 'Laughing (לאפינג) = צוחק - מצחיק מאוד!' },
  { word: 'crying', he: 'בוכה', emoji: '😭', explanation: 'Crying (קריינג) = בוכה - עצוב מאוד!' },
  { word: 'love', he: 'אהבה', emoji: '😍', explanation: 'Love (לאב) = אהבה - אוהב מישהו!' },
  { word: 'calm', he: 'רגוע', emoji: '😌', explanation: 'Calm (קאלם) = רגוע - שלו ולא עצבני!' },
];

export default function EmotionsGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof EMOTIONS>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentEmotion = EMOTIONS[currentIndex];

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = EMOTIONS[currentIndex];
    const wrongOptions = EMOTIONS
      .filter((_, idx) => idx !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentEmotion.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: typeof EMOTIONS[0]) => {
    if (selected.word === currentEmotion.word) {
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
    <main className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            😊 רגשות
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד מילים על רגשות באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="text-9xl mb-6 animate-bounce">{currentEmotion.emoji}</div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-yellow-500 to-purple-600 text-white px-12 py-6 rounded-full text-4xl font-bold shadow-xl hover:scale-110 transition-all duration-200 mb-4"
            >
              🔊 {currentEmotion.word}
            </button>
            <p className="text-2xl text-gray-700 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
            <p className="text-3xl text-gray-800 font-bold mt-6">איזה רגש זה?</p>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentIndex < EMOTIONS.length - 1) {
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
                  feedback === 'correct' && option.word === currentEmotion.word
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.word !== currentEmotion.word
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-purple-500 hover:to-yellow-400'
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
                🎉 נכון מאוד! מצוין!
              </div>
              {showExplanation && (
                <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mx-auto max-w-2xl animate-fade-in">
                  <div className="text-2xl font-bold text-blue-800 mb-2">💡 הסבר:</div>
                  <div className="text-xl text-blue-700 leading-relaxed">{currentEmotion.explanation}</div>
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
                  <div className="text-6xl mb-3">{currentEmotion.emoji}</div>
                  <div className="text-3xl font-bold text-yellow-900 mb-2">{currentEmotion.word}</div>
                  <div className="text-2xl text-yellow-800">{currentEmotion.he}</div>
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



