'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const VEHICLES = [
  { word: 'car', he: 'מכונית', emoji: '🚗', explanation: 'Car (קאר) = מכונית - כלי תחבורה על ארבעה גלגלים!' },
  { word: 'bus', he: 'אוטובוס', emoji: '🚌', explanation: 'Bus (באס) = אוטובוס - רכב גדול להרבה אנשים!' },
  { word: 'truck', he: 'משאית', emoji: '🚚', explanation: 'Truck (טראק) = משאית - נושא משאות כבדים!' },
  { word: 'bicycle', he: 'אופניים', emoji: '🚲', explanation: 'Bicycle (בייסיקל) = אופניים - רוכבים עם שני גלגלים!' },
  { word: 'motorcycle', he: 'אופנוע', emoji: '🏍️', explanation: 'Motorcycle (מוטורסייקל) = אופנוע - אופניים עם מנוע!' },
  { word: 'train', he: 'רכבת', emoji: '🚂', explanation: 'Train (טריין) = רכבת - נוסעת על מסילות!' },
  { word: 'airplane', he: 'מטוס', emoji: '✈️', explanation: 'Airplane (אירפליין) = מטוס - עף בשמיים גבוה!' },
  { word: 'helicopter', he: 'מסוק', emoji: '🚁', explanation: 'Helicopter (הליקופטר) = מסוק - עף עם מדחף מסתובב!' },
  { word: 'boat', he: 'סירה', emoji: '⛵', explanation: 'Boat (בואט) = סירה - שט על המים!' },
  { word: 'ship', he: 'אונייה', emoji: '🚢', explanation: 'Ship (שיפ) = אונייה - סירה גדולה מאוד!' },
  { word: 'submarine', he: 'צוללת', emoji: '🔱', explanation: 'Submarine (סאבמרין) = צוללת - שט מתחת למים!' },
  { word: 'taxi', he: 'מונית', emoji: '🚕', explanation: 'Taxi (טקסי) = מונית - מכונית שנוסעים בה תמורת תשלום!' },
  { word: 'ambulance', he: 'אמבולנס', emoji: '🚑', explanation: 'Ambulance (אמבולנס) = אמבולנס - מסיע חולים לבית חולים!' },
  { word: 'fire truck', he: 'כבאית', emoji: '🚒', explanation: 'Fire truck (פייר טראק) = כבאית - מכבה שריפות!' },
  { word: 'police car', he: 'ניידת משטרה', emoji: '🚓', explanation: 'Police car (פוליס קאר) = ניידת משטרה - רכב של שוטרים!' },
  { word: 'scooter', he: 'קורקינט', emoji: '🛴', explanation: 'Scooter (סקוטר) = קורקינט - כלי תחבורה קטן וקל!' },
  { word: 'skateboard', he: 'סקייטבורד', emoji: '🛹', explanation: 'Skateboard (סקייטבורד) = סקייטבורד - לוח עם גלגלים!' },
  { word: 'rocket', he: 'רקטה', emoji: '🚀', explanation: 'Rocket (רוקט) = רקטה - טסה לחלל!' },
  { word: 'tractor', he: 'טרקטור', emoji: '🚜', explanation: 'Tractor (טרקטור) = טרקטור - עובד בשדות!' },
  { word: 'van', he: 'טנדר', emoji: '🚐', explanation: 'Van (ואן) = טנדר - רכב גדול לסחורה או נוסעים!' },
];

export default function VehiclesGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof VEHICLES>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentVehicle = VEHICLES[currentIndex];

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = VEHICLES[currentIndex];
    const wrongOptions = VEHICLES
      .filter((_, idx) => idx !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentVehicle.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: typeof VEHICLES[0]) => {
    if (selected.word === currentVehicle.word) {
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
    <main className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-300 to-teal-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            🚗 כלי תחבורה
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד שמות של כלי תחבורה באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="text-9xl mb-6 animate-bounce">{currentVehicle.emoji}</div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-12 py-6 rounded-full text-4xl font-bold shadow-xl hover:scale-110 transition-all duration-200 mb-4"
            >
              🔊 {currentVehicle.word}
            </button>
            <p className="text-2xl text-gray-700 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
            <p className="text-3xl text-gray-800 font-bold mt-6">איזה כלי תחבורה זה?</p>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentIndex < VEHICLES.length - 1) {
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
                  feedback === 'correct' && option.word === currentVehicle.word
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.word !== currentVehicle.word
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-cyan-500 hover:to-blue-400'
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
                  <div className="text-xl text-blue-700 leading-relaxed">{currentVehicle.explanation}</div>
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
                  <div className="text-6xl mb-3">{currentVehicle.emoji}</div>
                  <div className="text-3xl font-bold text-yellow-900 mb-2">{currentVehicle.word}</div>
                  <div className="text-2xl text-yellow-800">{currentVehicle.he}</div>
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











