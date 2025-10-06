'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CLOTHES = [
  { word: 'shirt', he: 'חולצה', emoji: '👕', explanation: 'Shirt (שרט) = חולצה - לובשים על החלק העליון!' },
  { word: 't-shirt', he: 'טישרט', emoji: '👕', explanation: 'T-shirt (טי-שרט) = טישרט - חולצה קצרה!' },
  { word: 'pants', he: 'מכנסיים', emoji: '👖', explanation: 'Pants (פנטס) = מכנסיים - לובשים על הרגליים!' },
  { word: 'dress', he: 'שמלה', emoji: '👗', explanation: 'Dress (דרס) = שמלה - בגד אחד לבנות!' },
  { word: 'skirt', he: 'חצאית', emoji: '👗', explanation: 'Skirt (סקרט) = חצאית - כמו מכנסיים אבל פתוח!' },
  { word: 'shoes', he: 'נעליים', emoji: '👟', explanation: 'Shoes (שוז) = נעליים - נועלים על הרגליים!' },
  { word: 'socks', he: 'גרביים', emoji: '🧦', explanation: 'Socks (סוקס) = גרביים - תחת הנעליים!' },
  { word: 'coat', he: 'מעיל', emoji: '🧥', explanation: 'Coat (קואוט) = מעיל - לובשים כשקר!' },
  { word: 'jacket', he: 'ז׳קט', emoji: '🧥', explanation: 'Jacket (ג׳קט) = ז׳קט - מעיל קצר!' },
  { word: 'hat', he: 'כובע', emoji: '🎩', explanation: 'Hat (האט) = כובע - על הראש!' },
  { word: 'cap', he: 'כובע מצחייה', emoji: '🧢', explanation: 'Cap (קאפ) = כובע מצחייה - עם מצחייה!' },
  { word: 'gloves', he: 'כפפות', emoji: '🧤', explanation: 'Gloves (גלאבס) = כפפות - על הידיים כשקר!' },
  { word: 'scarf', he: 'צעיף', emoji: '🧣', explanation: 'Scarf (סקארף) = צעיף - על הצוואר כשקר!' },
  { word: 'sweater', he: 'סוודר', emoji: '🧶', explanation: 'Sweater (סוויטר) = סוודר - חם ונעים!' },
  { word: 'boots', he: 'מגפיים', emoji: '🥾', explanation: 'Boots (בוטס) = מגפיים - נעליים גבוהות!' },
  { word: 'sandals', he: 'סנדלים', emoji: '👡', explanation: 'Sandals (סנדלס) = סנדלים - נעליים פתוחות!' },
  { word: 'belt', he: 'חגורה', emoji: '👔', explanation: 'Belt (בלט) = חגורה - מחזיק את המכנסיים!' },
  { word: 'tie', he: 'עניבה', emoji: '👔', explanation: 'Tie (טיי) = עניבה - לובשים עם חליפה!' },
  { word: 'jeans', he: 'ג׳ינס', emoji: '👖', explanation: 'Jeans (ג׳ינס) = ג׳ינס - מכנסיים כחולים!' },
  { word: 'shorts', he: 'מכנסיים קצרים', emoji: '🩳', explanation: 'Shorts (שורטס) = מכנסיים קצרים - לקיץ!' },
  { word: 'pajamas', he: 'פיג׳מה', emoji: '🛌', explanation: 'Pajamas (פג׳מס) = פיג׳מה - לובשים לישון!' },
  { word: 'swimsuit', he: 'בגד ים', emoji: '🩱', explanation: 'Swimsuit (סוויםסוט) = בגד ים - לובשים בים!' },
  { word: 'raincoat', he: 'מעיל גשם', emoji: '☔', explanation: 'Raincoat (ריינקואוט) = מעיל גשם - כשיורד גשם!' },
  { word: 'uniform', he: 'מדים', emoji: '🎽', explanation: 'Uniform (יוניפורם) = מדים - בגדים של בית ספר!' },
];

export default function ClothesGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof CLOTHES>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentCloth = CLOTHES[currentIndex];

  useEffect(() => {
    generateOptions();
    speakWord();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = CLOTHES[currentIndex];
    const wrongOptions = CLOTHES
      .filter((_, idx) => idx !== currentIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentCloth.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selected: typeof CLOTHES[0]) => {
    if (selected.word === currentCloth.word) {
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
    <main className="min-h-screen bg-gradient-to-br from-teal-300 via-cyan-300 to-blue-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            👕 בגדים
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד שמות של בגדים באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="text-9xl mb-6 animate-bounce">{currentCloth.emoji}</div>
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-12 py-6 rounded-full text-4xl font-bold shadow-xl hover:scale-110 transition-all duration-200 mb-4"
            >
              🔊 {currentCloth.word}
            </button>
            <p className="text-2xl text-gray-700 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
            <p className="text-3xl text-gray-800 font-bold mt-6">איזה בגד זה?</p>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentIndex < CLOTHES.length - 1) {
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
                  feedback === 'correct' && option.word === currentCloth.word
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.word !== currentCloth.word
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-teal-400 to-blue-500 hover:from-blue-500 hover:to-teal-400'
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
                🎉 מצוין! נכון!
              </div>
              {showExplanation && (
                <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mx-auto max-w-2xl animate-fade-in">
                  <div className="text-2xl font-bold text-blue-800 mb-2">💡 הסבר:</div>
                  <div className="text-xl text-blue-700 leading-relaxed">{currentCloth.explanation}</div>
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
                  <div className="text-6xl mb-3">{currentCloth.emoji}</div>
                  <div className="text-3xl font-bold text-yellow-900 mb-2">{currentCloth.word}</div>
                  <div className="text-2xl text-yellow-800">{currentCloth.he}</div>
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



