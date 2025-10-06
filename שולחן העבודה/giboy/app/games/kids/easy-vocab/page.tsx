'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const EASY_WORDS = [
  { word: 'mom', he: 'אמא', emoji: '👩', explanation: 'Mom (מאם) = אמא - ככה קוראים לאימא שלך!' },
  { word: 'dad', he: 'אבא', emoji: '👨', explanation: 'Dad (דאד) = אבא - ככה קוראים לאבא שלך!' },
  { word: 'yes', he: 'כן', emoji: '✅', explanation: 'Yes (יס) = כן - כשאתה מסכים!' },
  { word: 'no', he: 'לא', emoji: '❌', explanation: 'No (נואו) = לא - כשאתה לא מסכים!' },
  { word: 'hi', he: 'שלום', emoji: '👋', explanation: 'Hi (היי) = שלום - ככה אנחנו מברכים אנשים!' },
  { word: 'bye', he: 'ביי', emoji: '👋', explanation: 'Bye (בייי) = ביי - אנחנו אומרים את זה כשעוזבים!' },
  { word: 'bed', he: 'מיטה', emoji: '🛏️', explanation: 'Bed (בד) = מיטה - המקום שבו אנחנו ישנים בלילה!' },
  { word: 'toy', he: 'צעצוע', emoji: '🧸', explanation: 'Toy (טוי) = צעצוע - משהו כיפי לשחק איתו!' },
  { word: 'milk', he: 'חלב', emoji: '🥛', explanation: 'Milk (מילק) = חלב - משקה לבן שמגיע מפרות!' },
  { word: 'water', he: 'מים', emoji: '💧', explanation: 'Water (וואטר) = מים - מה שאנחנו שותים כשצמאים!' },
  { word: 'red', he: 'אדום', emoji: '🔴', explanation: 'Red (רד) = אדום - הצבע של תפוחים וכבאיות!' },
  { word: 'blue', he: 'כחול', emoji: '🔵', explanation: 'Blue (בלו) = כחול - הצבע של השמיים!' },
  { word: 'green', he: 'ירוק', emoji: '🟢', explanation: 'Green (גרין) = ירוק - הצבע של דשא ועלים!' },
  { word: 'yellow', he: 'צהוב', emoji: '🟡', explanation: 'Yellow (ילו) = צהוב - הצבע של השמש!' },
  { word: 'big', he: 'גדול', emoji: '📏', explanation: 'Big (ביג) = גדול - משהו גדול מאוד!' },
  { word: 'small', he: 'קטן', emoji: '🔬', explanation: 'Small (סמול) = קטן - משהו זעיר!' },
  { word: 'happy', he: 'שמח', emoji: '😊', explanation: 'Happy (האפי) = שמח - כשמרגישים טוב ומחייכים!' },
  { word: 'sad', he: 'עצוב', emoji: '😢', explanation: 'Sad (סאד) = עצוב - כשבא לבכות!' },
  { word: 'hot', he: 'חם', emoji: '🔥', explanation: 'Hot (האט) = חם - חם מאוד, כמו אש!' },
  { word: 'cold', he: 'קר', emoji: '🧊', explanation: 'Cold (קולד) = קר - קר מאוד, כמו קרח!' },
  { word: 'up', he: 'למעלה', emoji: '⬆️', explanation: 'Up (אפ) = למעלה - לכיוון השמיים!' },
  { word: 'down', he: 'למטה', emoji: '⬇️', explanation: 'Down (דאון) = למטה - לכיוון הקרקע!' },
  { word: 'cat', he: 'חתול', emoji: '🐱', explanation: 'Cat (קט) = חתול - חיית מחמד פרוותית שאומרת מיאו!' },
  { word: 'dog', he: 'כלב', emoji: '🐶', explanation: 'Dog (דוג) = כלב - חיית מחמד חברותית שנובחת!' },
  { word: 'sun', he: 'שמש', emoji: '☀️', explanation: 'Sun (סאן) = שמש - האור הבהיר בשמיים!' },
  { word: 'moon', he: 'ירח', emoji: '🌙', explanation: 'Moon (מון) = ירח - האור שרואים בלילה!' },
  { word: 'star', he: 'כוכב', emoji: '⭐', explanation: 'Star (סטאר) = כוכב - אורות מנצנצים בשמי הלילה!' },
  { word: 'car', he: 'מכונית', emoji: '🚗', explanation: 'Car (קאר) = מכונית - מה שנוסעים בו על הכבישים!' },
  { word: 'ball', he: 'כדור', emoji: '⚽', explanation: 'Ball (בול) = כדור - צעצוע עגול שבועטים או זורקים!' },
  { word: 'book', he: 'ספר', emoji: '📖', explanation: 'Book (בוק) = ספר - אנחנו קוראים ממנו סיפורים!' },
  { word: 'tree', he: 'עץ', emoji: '🌳', explanation: 'Tree (טרי) = עץ - צמח גבוה עם עלים!' },
  { word: 'house', he: 'בית', emoji: '🏠', explanation: 'House (האוס) = בית - המקום שבו אנחנו גרים!' },
  { word: 'shoe', he: 'נעל', emoji: '👟', explanation: 'Shoe (שו) = נעל - מה שנועלים על הרגליים!' },
  { word: 'hand', he: 'יד', emoji: '✋', explanation: 'Hand (האנד) = יד - אנחנו משתמשים בה כדי לאחוז דברים!' },
  { word: 'eye', he: 'עין', emoji: '👁️', explanation: 'Eye (איי) = עין - אנחנו משתמשים בה כדי לראות!' },
  { word: 'nose', he: 'אף', emoji: '👃', explanation: 'Nose (נוז) = אף - אנחנו משתמשים בו כדי להריח!' },
  { word: 'ear', he: 'אוזן', emoji: '👂', explanation: 'Ear (איר) = אוזן - אנחנו משתמשים בה כדי לשמוע!' },
  { word: 'mouth', he: 'פה', emoji: '👄', explanation: 'Mouth (מאות׳) = פה - אנחנו משתמשים בו כדי לאכול ולדבר!' },
  { word: 'apple', he: 'תפוח', emoji: '🍎', explanation: 'Apple (אפל) = תפוח - פרי אדום או ירוק!' },
  { word: 'banana', he: 'בננה', emoji: '🍌', explanation: 'Banana (בננה) = בננה - פרי צהוב מעוקל!' },
  { word: 'flower', he: 'פרח', emoji: '🌸', explanation: 'Flower (פלאוור) = פרח - יפה ומריח טוב!' },
  { word: 'bird', he: 'ציפור', emoji: '🐦', explanation: 'Bird (ברד) = ציפור - חיה שיכולה לעוף!' },
  { word: 'fish', he: 'דג', emoji: '🐟', explanation: 'Fish (פיש) = דג - חיה שחיה במים!' },
  { word: 'chair', he: 'כיסא', emoji: '🪑', explanation: 'Chair (צ׳ייר) = כיסא - מה שיושבים עליו!' },
  { word: 'table', he: 'שולחן', emoji: '🪑', explanation: 'Table (טייבל) = שולחן - המקום שבו אנחנו אוכלים!' },
  { word: 'cup', he: 'כוס', emoji: '🥤', explanation: 'Cup (קאפ) = כוס - אנחנו שותים ממנה!' },
  { word: 'hat', he: 'כובע', emoji: '🎩', explanation: 'Hat (האט) = כובע - אנחנו לובשים אותו על הראש!' },
  { word: 'bag', he: 'תיק', emoji: '🎒', explanation: 'Bag (באג) = תיק - אנחנו נושאים בו דברים!' },
  { word: 'pen', he: 'עט', emoji: '🖊️', explanation: 'Pen (פן) = עט - אנחנו כותבים איתו!' },
  { word: 'door', he: 'דלת', emoji: '🚪', explanation: 'Door (דור) = דלת - אנחנו פותחים אותה כדי להיכנס!' },
  { word: 'window', he: 'חלון', emoji: '🪟', explanation: 'Window (ווינדו) = חלון - אנחנו מסתכלים דרכו!' },
];

export default function EasyVocabGame() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof EASY_WORDS>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showingWord, setShowingWord] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentWord = EASY_WORDS[currentWordIndex];

  useEffect(() => {
    // הצג את המילה ל-3 שניות
    setShowingWord(true);
    speakWord();
    
    const timer = setTimeout(() => {
      setShowingWord(false);
      generateOptions();
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentWordIndex]);

  const generateOptions = () => {
    const correct = EASY_WORDS[currentWordIndex];
    const wrongOptions = EASY_WORDS
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
      utterance.rate = 0.7;
      utterance.pitch = 1.3;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (selectedWord: typeof EASY_WORDS[0]) => {
    if (selectedWord.word === currentWord.word) {
      setFeedback('correct');
      setScore(score + 10);
      setShowExplanation(true);
      
      // דיבור "מצוין"
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('מצוין!');
        utterance.lang = 'he-IL';
        utterance.rate = 1.0;
        utterance.pitch = 1.4;
        window.speechSynthesis.speak(utterance);
      }
      
      // לא עוברים אוטומטית - רק דרך הכפתור!
    } else {
      setFeedback('wrong');
      setShowExplanation(true);
      
      // לא סוגרים את ההסבר אוטומטית - רק דרך הכפתור!
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-300 via-blue-300 to-purple-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            📖 מילים ראשונות
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            למד מילים פשוטות באנגלית!
          </p>
        </div>

        <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12">
          {/* ציון */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
              ⭐ {score}
            </div>
          </div>

          {showingWord ? (
            /* הצגת המילה */
            <div className="text-center py-16">
              <div className="text-9xl mb-8 animate-bounce">{currentWord.emoji}</div>
              <div className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
                {currentWord.word}
              </div>
              <div className="text-3xl md:text-4xl text-gray-700 font-bold">
                {currentWord.he}
              </div>
              <button
                onClick={speakWord}
                className="mt-8 bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:scale-110 transition-all duration-200"
              >
                🔊 שמע שוב
              </button>
            </div>
          ) : (
            /* שאלה - בחר את התרגום */
            <>
              <div className="text-center mb-8">
                <button
                  onClick={speakWord}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-10 py-6 rounded-full text-2xl font-bold shadow-xl hover:scale-110 transition-all duration-200"
                >
                  🔊 שמע שוב
                </button>
              </div>

              <p className="text-3xl font-bold text-center text-gray-700 mb-8">
                מה המילה שמשמעה?
              </p>

              {/* כפתור דלג לשאלה הבאה */}
              <div className="text-center mb-6">
                <button
                  onClick={() => {
                    setFeedback(null);
                    setShowExplanation(false);
                    setShowingWord(true);
                    if (currentWordIndex < EASY_WORDS.length - 1) {
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

              <div className="grid grid-cols-2 gap-6 md:gap-8">
                {options.map((option, index) => {
                  const isCorrect = feedback === 'correct' && option.word === currentWord.word;
                  const isWrong = feedback === 'wrong' && option.word !== currentWord.word;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={feedback !== null}
                      className={`p-6 md:p-10 rounded-3xl shadow-xl transition-all duration-200 transform hover:scale-105 ${
                        isCorrect
                          ? 'bg-gradient-to-r from-green-400 to-green-600 scale-110 ring-8 ring-green-300'
                          : isWrong
                          ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                          : 'bg-gradient-to-r from-pink-400 to-purple-500 hover:from-purple-500 hover:to-pink-400'
                      }`}
                    >
                      <div className="text-6xl md:text-7xl mb-3">{option.emoji}</div>
                      <div className="text-2xl md:text-3xl font-bold text-white">{option.he}</div>
                    </button>
                  );
                })}
              </div>

              {/* משוב */}
              {feedback === 'correct' && (
                <div className="text-center mt-8">
                  <div className="inline-block bg-green-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-xl mb-4 animate-bounce">
                    🎉 מצוין! נכון!
                  </div>
                  {showExplanation && (
                    <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mx-auto max-w-2xl animate-fade-in">
                      <div className="text-2xl font-bold text-blue-800 mb-2">💡 הסבר:</div>
                      <div className="text-xl text-blue-700 leading-relaxed mb-4">{currentWord.explanation}</div>
                      <button
                        onClick={() => {
                          setFeedback(null);
                          setShowExplanation(false);
                          if (currentWordIndex < EASY_WORDS.length - 1) {
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
                <div className="text-center mt-8">
                  <div className="inline-block bg-red-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-xl mb-4">
                    😊 נסה שוב!
                  </div>
                  {showExplanation && (
                    <div className="bg-yellow-100 border-4 border-yellow-300 rounded-2xl p-6 mx-auto max-w-2xl">
                      <div className="text-2xl font-bold text-yellow-800 mb-2">התשובה הנכונה היא:</div>
                      <div className="text-3xl font-bold text-yellow-900 mb-4">{currentWord.emoji} {currentWord.he} = {currentWord.word}</div>
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
            </>
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

