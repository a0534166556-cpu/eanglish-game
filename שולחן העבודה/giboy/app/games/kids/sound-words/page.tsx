'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const WORDS = [
  { word: 'cat', he: 'חתול', emoji: '🐱', explanation: 'Cat (קט) = חתול - חיית מחמד פרוותית שאומרת "מיאו"!' },
  { word: 'dog', he: 'כלב', emoji: '🐶', explanation: 'Dog (דוג) = כלב - חיית מחמד חברותית שנובחת "האו האו"!' },
  { word: 'bird', he: 'ציפור', emoji: '🐦', explanation: 'Bird (ברד) = ציפור - עפה בשמיים ושרה!' },
  { word: 'fish', he: 'דג', emoji: '🐟', explanation: 'Fish (פיש) = דג - שוחה במים!' },
  { word: 'apple', he: 'תפוח', emoji: '🍎', explanation: 'Apple (אפל) = תפוח - פרי טעים אדום או ירוק!' },
  { word: 'banana', he: 'בננה', emoji: '🍌', explanation: 'Banana (בננה) = בננה - פרי צהוב שקופים אוהבים!' },
  { word: 'car', he: 'מכונית', emoji: '🚗', explanation: 'Car (קאר) = מכונית - אנחנו נוסעים בה על הכביש!' },
  { word: 'tree', he: 'עץ', emoji: '🌳', explanation: 'Tree (טרי) = עץ - צמח גבוה עם עלים!' },
  { word: 'sun', he: 'שמש', emoji: '☀️', explanation: 'Sun (סאן) = שמש - בהיר וחם בשמיים!' },
  { word: 'moon', he: 'ירח', emoji: '🌙', explanation: 'Moon (מון) = ירח - זורח בלילה!' },
  { word: 'star', he: 'כוכב', emoji: '⭐', explanation: 'Star (סטאר) = כוכב - מנצנץ בשמיים בלילה!' },
  { word: 'ball', he: 'כדור', emoji: '⚽', explanation: 'Ball (בול) = כדור - צעצוע עגול ששמשחקים איתו!' },
  { word: 'book', he: 'ספר', emoji: '📖', explanation: 'Book (בוק) = ספר - אנחנו קוראים ממנו סיפורים!' },
  { word: 'cup', he: 'כוס', emoji: '🥤', explanation: 'Cup (קאפ) = כוס - אנחנו שותים ממנה!' },
  { word: 'hat', he: 'כובע', emoji: '🎩', explanation: 'Hat (האט) = כובע - אנחנו לובשים אותו על הראש!' },
  { word: 'shoe', he: 'נעל', emoji: '👟', explanation: 'Shoe (שו) = נעל - אנחנו נועלים אותה על הרגליים!' },
  { word: 'flower', he: 'פרח', emoji: '🌸', explanation: 'Flower (פלאוור) = פרח - יפה ומריח טוב!' },
  { word: 'house', he: 'בית', emoji: '🏠', explanation: 'House (האוס) = בית - המקום שבו אנחנו גרים!' },
  { word: 'rain', he: 'גשם', emoji: '🌧️', explanation: 'Rain (ריין) = גשם - מים שיורדים מהעננים!' },
  { word: 'snow', he: 'שלג', emoji: '❄️', explanation: 'Snow (סנואו) = שלג - לבן וקר בחורף!' },
  { word: 'heart', he: 'לב', emoji: '❤️', explanation: 'Heart (הארט) = לב - מייצג אהבה!' },
  { word: 'smile', he: 'חיוך', emoji: '😊', explanation: 'Smile (סמייל) = חיוך - כשאתה שמח!' },
  { word: 'hand', he: 'יד', emoji: '✋', explanation: 'Hand (האנד) = יד - אנחנו מנופפים ואוחזים איתה!' },
  { word: 'foot', he: 'רגל', emoji: '🦶', explanation: 'Foot (פוט) = רגל - אנחנו הולכים איתה!' },
  { word: 'eye', he: 'עין', emoji: '👁️', explanation: 'Eye (איי) = עין - אנחנו רואים איתה!' },
  { word: 'lion', he: 'אריה', emoji: '🦁', explanation: 'Lion (לייאון) = אריה - מלך החיות!' },
  { word: 'elephant', he: 'פיל', emoji: '🐘', explanation: 'Elephant (אליפנט) = פיל - החיה הכי גדולה!' },
  { word: 'butterfly', he: 'פרפר', emoji: '🦋', explanation: 'Butterfly (באטרפליי) = פרפר - עף עם כנפיים צבעוניות!' },
  { word: 'bee', he: 'דבורה', emoji: '🐝', explanation: 'Bee (בי) = דבורה - עושה דבש!' },
  { word: 'rabbit', he: 'ארנב', emoji: '🐰', explanation: 'Rabbit (רביט) = ארנב - קופץ מהר!' },
  { word: 'bear', he: 'דוב', emoji: '🐻', explanation: 'Bear (בר) = דוב - חיה גדולה ופרוותית!' },
  { word: 'fox', he: 'שועל', emoji: '🦊', explanation: 'Fox (פוקס) = שועל - חכם ומהיר!' },
  { word: 'frog', he: 'צפרדע', emoji: '🐸', explanation: 'Frog (פרוג) = צפרדע - קופץ ואומר "קרק"!' },
  { word: 'turtle', he: 'צב', emoji: '🐢', explanation: 'Turtle (טרטל) = צב - איטי עם שריון!' },
  { word: 'cookie', he: 'עוגייה', emoji: '🍪', explanation: 'Cookie (קוקי) = עוגייה - מתוקה וטעימה!' },
  { word: 'cake', he: 'עוגה', emoji: '🍰', explanation: 'Cake (קייק) = עוגה - קינוח מתוק!' },
  { word: 'pizza', he: 'פיצה', emoji: '🍕', explanation: 'Pizza (פיצה) = פיצה - אוכל טעים!' },
  { word: 'ice cream', he: 'גלידה', emoji: '🍦', explanation: 'Ice cream (אייס קרים) = גלידה - קפואה ומתוקה!' },
  { word: 'orange', he: 'תפוז', emoji: '🍊', explanation: 'Orange (אורנג׳) = תפוז - פרי כתום ועסיסי!' },
  { word: 'strawberry', he: 'תות', emoji: '🍓', explanation: 'Strawberry (סטרוברי) = תות - פרי אדום ומתוק!' },
  { word: 'grapes', he: 'ענבים', emoji: '🍇', explanation: 'Grapes (גרייפס) = ענבים - קטנים ומתוקים!' },
  { word: 'watermelon', he: 'אבטיח', emoji: '🍉', explanation: 'Watermelon (וואטרמלון) = אבטיח - גדול וירוק מבחוץ!' },
  { word: 'carrot', he: 'גזר', emoji: '🥕', explanation: 'Carrot (קרוט) = גזר - ירק כתום!' },
  { word: 'tomato', he: 'עגבנייה', emoji: '🍅', explanation: 'Tomato (טומייטו) = עגבנייה - אדומה ועסיסית!' },
];

export default function SoundWordsGame() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof WORDS>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentWord = WORDS[currentWordIndex];

  useEffect(() => {
    generateOptions();
  }, [currentWordIndex]);

  const generateOptions = () => {
    const correct = WORDS[currentWordIndex];
    const wrongOptions = WORDS
      .filter((_, idx) => idx !== currentWordIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selectedWord: typeof WORDS[0]) => {
    if (selectedWord.word === currentWord.word) {
      setFeedback('correct');
      setScore(score + 10);
      setShowExplanation(true);
      
      // דיבור "נכון מאוד"
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('נכון מאוד!');
        utterance.lang = 'he-IL';
        utterance.rate = 1.0;
        utterance.pitch = 1.3;
        window.speechSynthesis.speak(utterance);
      }
      
      // לא עוברים אוטומטית - רק דרך הכפתור!
    } else {
      setFeedback('wrong');
      setShowExplanation(true);
      
      // דיבור "לא נכון"
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('לא נכון, נסה שוב');
        utterance.lang = 'he-IL';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
      
      // לא סוגרים את ההסבר אוטומטית - רק דרך הכפתור!
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-300 to-pink-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            🔊 צליל המילה
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            הקשב למילה ובחר את התמונה הנכונה!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          {/* ציון */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          {/* כפתור השמעה */}
          <div className="text-center mb-12">
            <button
              onClick={speakWord}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-8 rounded-full text-2xl font-bold shadow-xl hover:from-purple-600 hover:to-blue-500 transition-all duration-200 hover:scale-110 transform"
            >
              🔊 שמע את המילה
            </button>
            <p className="text-lg text-gray-600 mt-4 font-bold">לחץ כדי לשמוע שוב!</p>
          </div>

          {/* אפשרויות תמונות */}
          {/* כפתור דלג לשאלה הבאה */}
          <div className="text-center mb-6">
            <button
              onClick={() => {
                setFeedback(null);
                setShowExplanation(false);
                if (currentWordIndex < WORDS.length - 1) {
                  setCurrentWordIndex(currentWordIndex + 1);
                } else {
                  setCurrentWordIndex(0);
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
                className={`p-8 md:p-12 rounded-3xl shadow-xl transition-all duration-200 transform hover:scale-105 ${
                  feedback === 'correct' && option.word === currentWord.word
                    ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                    : feedback === 'wrong' && option.word !== currentWord.word
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                    : 'bg-gradient-to-r from-pink-400 to-purple-500 hover:from-purple-500 hover:to-pink-400'
                }`}
              >
                <div className="text-8xl md:text-9xl mb-4">{option.emoji}</div>
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
                  <div className="text-xl text-blue-700 leading-relaxed mb-4">{currentWord.explanation}</div>
                  <button
                    onClick={() => {
                      setFeedback(null);
                      setShowExplanation(false);
                      if (currentWordIndex < WORDS.length - 1) {
                        setCurrentWordIndex(currentWordIndex + 1);
                      } else {
                        setCurrentWordIndex(0);
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
            <div className="text-center mb-6">
              <div className="inline-block bg-red-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-xl mb-4">
                😊 נסה שוב!
              </div>
              {showExplanation && (
                <div className="bg-yellow-100 border-4 border-yellow-300 rounded-2xl p-6 mx-auto max-w-2xl">
                  <div className="text-2xl font-bold text-yellow-800 mb-2">התשובה הנכונה:</div>
                  <div className="text-4xl mb-2">{currentWord.emoji}</div>
                  <div className="text-3xl font-bold text-yellow-900 mb-4">{currentWord.word} = {currentWord.he}</div>
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

