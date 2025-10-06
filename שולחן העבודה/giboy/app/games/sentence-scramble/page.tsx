"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import useAuthUser from '@/lib/useAuthUser';

const SENTENCES = [
  // English - Easy
  { id: 1, lang: "en", text: "I love to play football", he: "אני אוהב לשחק כדורגל" },
  { id: 2, lang: "en", text: "The cat is sleeping on the sofa", he: "החתול ישן על הספה" },
  { id: 3, lang: "en", text: "She drinks a cup of tea every morning", he: "היא שותה כוס תה כל בוקר" },
  { id: 4, lang: "en", text: "We are going to the park", he: "אנחנו הולכים לפארק" },
  { id: 5, lang: "en", text: "He reads a book every night", he: "הוא קורא ספר כל לילה" },
  { id: 6, lang: "en", text: "My favorite color is blue", he: "הצבע האהוב עליי הוא כחול" },
  { id: 7, lang: "en", text: "The sun is shining brightly today", he: "השמש זורחת היום בבהירות" },
  { id: 8, lang: "en", text: "Please close the window", he: "בבקשה סגור את החלון" },
  { id: 9, lang: "en", text: "They are eating lunch together", he: "הם אוכלים ארוחת צהריים יחד" },
  { id: 10, lang: "en", text: "Can you help me with my homework", he: "אתה יכול לעזור לי עם שיעורי הבית?" },
  { id: 11, lang: "en", text: "I like to eat pizza", he: "אני אוהב לאכול פיצה" },
  { id: 12, lang: "en", text: "The dog is playing in the garden", he: "הכלב משחק בגינה" },
  { id: 13, lang: "en", text: "She is singing a beautiful song", he: "היא שרה שיר יפה" },
  { id: 14, lang: "en", text: "We have a new car", he: "יש לנו מכונית חדשה" },
  { id: 15, lang: "en", text: "The children are playing outside", he: "הילדים משחקים בחוץ" },
  { id: 16, lang: "en", text: "I want to learn English", he: "אני רוצה ללמוד אנגלית" },
  { id: 17, lang: "en", text: "He is watching television now", he: "הוא צופה בטלוויזיה עכשיו" },
  { id: 18, lang: "en", text: "The weather is very nice today", he: "מזג האוויר נעים היום" },
  { id: 19, lang: "en", text: "They live in a big house", he: "הם גרים בבית גדול" },
  { id: 20, lang: "en", text: "She likes to dance and sing", he: "היא אוהבת לרקוד ולשיר" },
  
  // Easy level - Additional sentences (21-40)
  { id: 21, lang: "en", text: "The cat is sleeping on the bed", he: "החתול ישן על המיטה" },
  { id: 22, lang: "en", text: "I like to eat ice cream", he: "אני אוהב לאכול גלידה" },
  { id: 23, lang: "en", text: "The dog is playing with a ball", he: "הכלב משחק עם כדור" },
  { id: 24, lang: "en", text: "She is reading a book", he: "היא קוראת ספר" },
  { id: 25, lang: "en", text: "The sun is shining brightly", he: "השמש זורחת בבהירות" },
  { id: 26, lang: "en", text: "I want to go to the park", he: "אני רוצה ללכת לפארק" },
  { id: 27, lang: "en", text: "The bird is flying in the sky", he: "הציפור עפה בשמים" },
  { id: 28, lang: "en", text: "He is drinking a glass of water", he: "הוא שותה כוס מים" },
  { id: 29, lang: "en", text: "The flower is very beautiful", he: "הפרח יפה מאוד" },
  { id: 30, lang: "en", text: "I need to buy some milk", he: "אני צריך לקנות חלב" },
  { id: 31, lang: "en", text: "The car is parked outside", he: "המכונית חונה בחוץ" },
  { id: 32, lang: "en", text: "She is wearing a red dress", he: "היא לובשת שמלה אדומה" },
  { id: 33, lang: "en", text: "The tree is very tall", he: "העץ גבוה מאוד" },
  { id: 34, lang: "en", text: "I like to play football", he: "אני אוהב לשחק כדורגל" },
  { id: 35, lang: "en", text: "The baby is sleeping peacefully", he: "התינוק ישן בשלווה" },
  { id: 36, lang: "en", text: "He is writing a letter", he: "הוא כותב מכתב" },
  { id: 37, lang: "en", text: "The moon is full tonight", he: "הירח מלא הלילה" },
  { id: 38, lang: "en", text: "I want to learn English", he: "אני רוצה ללמוד אנגלית" },
  { id: 39, lang: "en", text: "The fish is swimming in the pond", he: "הדג שוחה בבריכה" },
  { id: 40, lang: "en", text: "She is cooking dinner", he: "היא מבשלת ארוחת ערב" },

  // English - Medium
  { id: 41, lang: "en", text: "The students are studying for their exam", he: "התלמידים לומדים למבחן שלהם" },
  { id: 42, lang: "en", text: "We should protect the environment", he: "אנחנו צריכים להגן על הסביבה" },
  { id: 43, lang: "en", text: "I enjoy listening to classical music", he: "אני נהנה להאזין למוזיקה קלאסית" },
  { id: 44, lang: "en", text: "The teacher explains the lesson clearly", he: "המורה מסביר את השיעור בצורה ברורה" },
  { id: 45, lang: "en", text: "They are planning a summer vacation", he: "הם מתכננים חופשת קיץ" },
  { id: 46, lang: "en", text: "She works at a large company", he: "היא עובדת בחברה גדולה" },
  { id: 47, lang: "en", text: "We need to finish this project today", he: "אנחנו צריכים לסיים את הפרויקט היום" },
  { id: 48, lang: "en", text: "The museum has many interesting exhibits", he: "במוזיאון יש הרבה תערוכות מעניינות" },
  { id: 49, lang: "en", text: "He practices piano every afternoon", he: "הוא מתאמן בפסנתר כל אחר הצהריים" },
  { id: 50, lang: "en", text: "The restaurant serves delicious food", he: "המסעדה מגישה אוכל טעים" },
  { id: 51, lang: "en", text: "We should meet at the coffee shop", he: "אנחנו צריכים להיפגש בבית הקפה" },
  { id: 52, lang: "en", text: "The movie starts in ten minutes", he: "הסרט מתחיל בעוד עשר דקות" },
  { id: 53, lang: "en", text: "She speaks three different languages", he: "היא מדברת שלוש שפות שונות" },
  { id: 54, lang: "en", text: "The library has many good books", he: "בספריה יש הרבה ספרים טובים" },
  { id: 55, lang: "en", text: "We celebrate his birthday next week", he: "אנחנו חוגגים את יום ההולדת שלו בשבוע הבא" },
  { id: 56, lang: "en", text: "The doctor is examining the patient", he: "הרופא בודק את החולה" },
  { id: 57, lang: "en", text: "I need to prepare for the interview", he: "אני צריך להתכונן לראיון" },
  { id: 58, lang: "en", text: "The weather forecast predicts rain", he: "תחזית מזג האוויר חוזה גשם" },
  { id: 59, lang: "en", text: "She is learning to play the guitar", he: "היא לומדת לנגן בגיטרה" },
  { id: 60, lang: "en", text: "The traffic is heavy this morning", he: "התנועה כבדה הבוקר" },
  { id: 61, lang: "en", text: "We should book our hotel in advance", he: "אנחנו צריכים להזמין את המלון מראש" },
  { id: 62, lang: "en", text: "The computer is running very slowly", he: "המחשב רץ מאוד לאט" },
  { id: 63, lang: "en", text: "I enjoy reading science fiction novels", he: "אני נהנה לקרוא רומנים מדע בדיוני" },
  { id: 64, lang: "en", text: "The meeting has been postponed until tomorrow", he: "הפגישה נדחתה למחר" },
  { id: 65, lang: "en", text: "She is applying for a new job", he: "היא מגישה מועמדות לעבודה חדשה" },
  { id: 66, lang: "en", text: "The children are playing in the garden", he: "הילדים משחקים בגינה" },
  { id: 67, lang: "en", text: "I need to update my resume", he: "אני צריך לעדכן את הקורות חיים שלי" },
  { id: 68, lang: "en", text: "The store is having a big sale", he: "החנות עושה מכירה גדולה" },
  { id: 69, lang: "en", text: "We should save money for the future", he: "אנחנו צריכים לחסוך כסף לעתיד" },
  { id: 70, lang: "en", text: "The train is delayed by thirty minutes", he: "הרכבת מתעכבת בשלושים דקות" },

  // English - Hard
  { id: 36, lang: "en", text: "The scientists are conducting important research", he: "המדענים עורכים מחקר חשוב" },
  { id: 37, lang: "en", text: "Global warming affects our planet significantly", he: "ההתחממות הגלובלית משפיעה משמעותית על כוכב הלכת שלנו" },
  { id: 38, lang: "en", text: "Technology has changed our lives dramatically", he: "הטכנולוגיה שינתה את חיינו באופן דרמטי" },
  { id: 39, lang: "en", text: "The company launched a new product yesterday", he: "החברה השיקה מוצר חדש אתמול" },
  { id: 40, lang: "en", text: "We must preserve our natural resources", he: "אנחנו חייבים לשמור על המשאבים הטבעיים שלנו" },
  { id: 41, lang: "en", text: "The professor published an interesting article", he: "הפרופסור פרסם מאמר מעניין" },
  { id: 42, lang: "en", text: "Students should develop critical thinking skills", he: "על תלמידים לפתח מיומנויות חשיבה ביקורתית" },
  { id: 43, lang: "en", text: "The government announced new regulations today", he: "הממשלה הודיעה על תקנות חדשות היום" },
  { id: 44, lang: "en", text: "Renewable energy becomes increasingly important", he: "אנרגיה מתחדשת הופכת לחשובה יותר ויותר" },
  { id: 45, lang: "en", text: "The artist created a masterpiece", he: "האמן יצר יצירת מופת" },

  // Hebrew - Easy
  { id: 101, lang: "he", text: "אני אוהב ללמוד אנגלית" },
  { id: 102, lang: "he", text: "החתול יושב על הכיסא" },
  { id: 103, lang: "he", text: "הילדה שותה מים קרים" },
  { id: 104, lang: "he", text: "אנחנו הולכים לים" },
  { id: 105, lang: "he", text: "הוא משחק כדורגל עם חברים" },
  { id: 106, lang: "he", text: "היום השמש זורחת" },
  { id: 107, lang: "he", text: "האם תוכל לעזור לי" },
  { id: 108, lang: "he", text: "הספר מונח על השולחן" },
  { id: 109, lang: "he", text: "הם אוכלים ארוחת צהריים" },
  { id: 110, lang: "he", text: "בבקשה סגור את החלון" },
  { id: 111, lang: "he", text: "אני רוצה גלידה" },
  { id: 112, lang: "he", text: "הכלב רץ בגינה" },
  { id: 113, lang: "he", text: "היא קוראת ספר מעניין" },
  { id: 114, lang: "he", text: "אנחנו נוסעים לטיול" },
  { id: 115, lang: "he", text: "הילדים משחקים בחוץ" },
  { id: 116, lang: "he", text: "השמיים כחולים היום" },
  { id: 117, lang: "he", text: "אני אוהב לשחק כדורסל" },
  { id: 118, lang: "he", text: "היא שרה שיר יפה" },
  { id: 119, lang: "he", text: "הוא צופה בטלוויזיה" },
  { id: 120, lang: "he", text: "אנחנו הולכים למסעדה" },

  // Hebrew - Medium
  { id: 121, lang: "he", text: "התלמידים לומדים למבחן חשוב" },
  { id: 122, lang: "he", text: "המורה מסבירה את השיעור" },
  { id: 123, lang: "he", text: "אנחנו מתכננים טיול משפחתי" },
  { id: 124, lang: "he", text: "היא עובדת בחברת הייטק" },
  { id: 125, lang: "he", text: "הוא מנגן על פסנתר" },
  { id: 126, lang: "he", text: "המוזיאון מציג תערוכה חדשה" },
  { id: 127, lang: "he", text: "אנחנו צריכים לסיים את הפרויקט" },
  { id: 128, lang: "he", text: "היא מדברת שלוש שפות" },
  { id: 129, lang: "he", text: "הספרייה פתוחה כל יום" },
  { id: 130, lang: "he", text: "אנחנו חוגגים יום הולדת" },
  { id: 131, lang: "he", text: "המסעדה מגישה אוכל טעים" },
  { id: 132, lang: "he", text: "הסרט מתחיל בשמונה בערב" },
  { id: 133, lang: "he", text: "הם נפגשים בבית קפה" },
  { id: 134, lang: "he", text: "היא כותבת סיפור מעניין" },
  { id: 135, lang: "he", text: "אנחנו שומרים על הסביבה" },

  // Hebrew - Hard
  { id: 136, lang: "he", text: "המדענים עורכים מחקר חשוב" },
  { id: 137, lang: "he", text: "הטכנולוגיה משנה את חיינו" },
  { id: 138, lang: "he", text: "החברה השיקה מוצר חדש" },
  { id: 139, lang: "he", text: "אנחנו מפתחים תוכנה חדשנית" },
  { id: 140, lang: "he", text: "הממשלה הודיעה על רפורמה" },
  { id: 141, lang: "he", text: "הפרופסור פרסם מאמר מדעי" },
  { id: 142, lang: "he", text: "אנרגיה מתחדשת חשובה לעתיד" },
  { id: 143, lang: "he", text: "התלמידים מפתחים חשיבה ביקורתית" },
  { id: 144, lang: "he", text: "האמן יצר יצירת אמנות" },
  { id: 145, lang: "he", text: "החוקרים גילו תגלית חדשה" }
];

const difficulties = [
  { key: "easy", label: "קל", min: 0, max: 4, count: 15 },
  { key: "medium", label: "בינוני", min: 5, max: 7, count: 20 },
  { key: "hard", label: "קשה", min: 8, max: 9, count: 25 },
];

const levelLabels: Record<string, { label: string, icon: string, color: string }> = {
  easy: { label: 'קל', icon: '🌱', color: 'from-green-400 to-green-600' },
  medium: { label: 'בינוני', icon: '🌿', color: 'from-yellow-400 to-yellow-600' },
  hard: { label: 'קשה', icon: '🌳', color: 'from-purple-400 to-purple-600' },
  extreme: { label: 'אקסטרים', icon: '🔥', color: 'from-red-500 to-yellow-600' },
};

const levelMap: Record<string, string> = {
  beginner: 'easy',
  intermediate: 'medium',
  advanced: 'hard',
  extreme: 'extreme',
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
};

function shuffle(arr: string[]) {
  return arr
    .map((v) => ({ v, s: Math.random() }))
    .sort((a, b) => a.s - b.s)
    .map(({ v }) => v);
}

function getMistakeStats() {
  try {
    return JSON.parse(localStorage.getItem('ss-mistakes') || '{}');
  } catch {
    return {};
  }
}

function addMistake(id: number) {
  const stats = getMistakeStats();
  stats[id] = (stats[id] || 0) + 1;
  localStorage.setItem('ss-mistakes', JSON.stringify(stats));
}

function pickSentences(all: typeof SENTENCES, lang: string, count: number) {
  const pool = all.filter((s: typeof SENTENCES[number]) => s.lang === lang);
  const stats = getMistakeStats();
  const sorted = [...pool].sort((a, b) => (stats[b.id] || 0) - (stats[a.id] || 0));
  const boosted = sorted.filter((s: typeof SENTENCES[number]) => stats[s.id] > 0).slice(0, 5);
  const rest = pool.filter((s: typeof SENTENCES[number]) => !boosted.includes(s));
  const randomRest = rest.sort(() => Math.random() - 0.5).slice(0, count - boosted.length);
  return [...boosted, ...randomRest].sort(() => Math.random() - 0.5);
}

export default function SentenceScrambleWrapper() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <SentenceScramble />
    </Suspense>
  );
}

function SentenceScramble() {
  const { user } = useAuthUser();
  const searchParams = useSearchParams();
  const levelParam = searchParams?.get('level') || 'easy';
  const mappedLevel = levelMap[levelParam] || 'easy';
  const [difficulty, setDifficulty] = useState(mappedLevel);
  const [lang, setLang] = useState<"en" | "he">("en");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<typeof SENTENCES>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const progress = questions.length > 0 ? ((currentIdx) / questions.length) * 100 : 0;
  const isRTL = lang === 'he';
  const selectedContainerRef = useRef<HTMLDivElement>(null);
  const successAudio = useRef<HTMLAudioElement>(null);
  const failAudio = useRef<HTMLAudioElement>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [inventory, setInventory] = useState<{[key: string]: number}>({});
  const [hintMsg, setHintMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started]);

  useEffect(() => {
    const diff = difficulties.find((d) => d.key === difficulty)!;
    // Filter sentences by difficulty level
    const levelSentences = SENTENCES.filter(s => {
      if (difficulty === 'easy') return s.id >= 1 && s.id <= 70;
      if (difficulty === 'medium') return s.id >= 71 && s.id <= 100;
      if (difficulty === 'hard') return s.id >= 101 && s.id <= 130;
      return true; // fallback
    });
    setQuestions(pickSentences(levelSentences, lang, diff.count));
    setCurrentIdx(0);
    setScore(0);
    setTimer(0);
    setGameOver(false);
    setFeedback(null);
    setStarted(false);
    setSelected([]);
    setScrambled([]);
  }, [difficulty, lang]);

  useEffect(() => {
    if (questions.length > 0 && started) {
      const words = questions[currentIdx].text.split(" ");
      setScrambled(shuffle(words));
      setSelected([]);
    }
  }, [currentIdx, questions, started]);

  useEffect(() => {
    try {
      const inv = JSON.parse(localStorage.getItem('quiz-inventory') || '{}');
      setInventory(inv);
      console.log('Loaded inventory from localStorage (sentence-scramble):', inv);
    } catch {
      console.log('Failed to load inventory from localStorage (sentence-scramble)');
    }
  }, []);

  const handleSelect = (word: string, idx: number) => {
    setSelected((prev) => [...prev, word]);
    setScrambled((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUnselect = (idx: number) => {
    setScrambled((prev) => [...prev, selected[idx]]);
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCheck = () => {
    if (selected.join(' ') === questions[currentIdx].text) {
      setScore((s) => s + 10);
      setFeedback('נכון!');
      if (successAudio.current) {
        successAudio.current.currentTime = 0;
        successAudio.current.play();
      }
    } else {
      setScore((s) => Math.max(0, s - 2)); // עונש של 2 נקודות על טעות
      addMistake(questions[currentIdx].id);
      setFeedback('לא נכון');
      if (failAudio.current) {
        failAudio.current.currentTime = 0;
        failAudio.current.play();
      }
    }
    setShowAnswer(true);
  };

  const handleNext = async () => {
    setFeedback(null);
    setShowAnswer(false);
    if (currentIdx === questions.length - 1) {
      setGameOver(true);
      if (user) {
        try {
          await fetch('/api/games/update-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              gameName: 'SentenceScramble',
              score: score,
              time: timer,
            }),
          });
        } catch (error) {
          console.error('Failed to update game stats:', error);
        }
      }
    } else {
      setCurrentIdx((c) => c + 1);
    }
  };

  const startGame = () => {
    setStarted(true);
    setTimer(0);
    setScore(0);
    setCurrentIdx(0);
    setGameOver(false);
    setFeedback(null);
  };

  const restart = () => {
    setStarted(false);
    setCurrentIdx(0);
    setScore(0);
    setTimer(0);
    setGameOver(false);
    setFeedback(null);
    setSelected([]);
    setScrambled([]);
  };

  // Drag & Drop handlers
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => e.preventDefault();
  const handleDrop = (idx: number) => {
    if (draggedIdx === null || draggedIdx === idx) return;
    const newSelected = [...selected];
    const [removed] = newSelected.splice(draggedIdx, 1);
    newSelected.splice(idx, 0, removed);
    setSelected(newSelected);
    setDraggedIdx(null);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  const handleHint = () => {
    if ((inventory['hint'] || 0) <= 0 || gameOver) return;
    setShowAnswer(true);
    setHintMsg('💡 השתמשת ברמז! המשפט הנכון מוצג למטה.');
    setInventory(inv => {
      const newInv = { ...inv, hint: (inv['hint'] || 0) - 1 };
      localStorage.setItem('quiz-inventory', JSON.stringify(newInv));
      return newInv;
    });
    setTimeout(() => setHintMsg(null), 2000);
  };

  return (
    <main className={`min-h-screen bg-gradient-to-br from-pink-200 via-blue-200 to-green-200 flex flex-col items-center justify-center p-4 ${isRTL ? 'rtl' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}>
      <audio ref={successAudio} src="/voise/הצלחה.dat" preload="auto" />
      <audio ref={failAudio} src="/voise/כשלון.dat" preload="auto" />
      <div className="max-w-2xl w-full mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 text-center drop-shadow-lg flex items-center gap-4">
            הזזת מילים
            <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xl shadow bg-gradient-to-r ${levelLabels[difficulty].color} text-white ml-4`}>
              <span className="text-2xl">{levelLabels[difficulty].icon}</span> {levelLabels[difficulty].label}
            </span>
          </h1>
        </div>
        {/* Progress Bar */}
        {started && questions.length > 0 && (
          <div className="w-full h-3 bg-blue-100 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
        {!started && (
          <div className="flex flex-col gap-4 items-center mb-8">
            <div className="flex gap-4">
              {difficulties.map((d) => (
                <button key={d.key} onClick={() => setDifficulty(d.key)} className={`px-6 py-2 rounded-full font-bold shadow text-lg ${difficulty===d.key?'bg-blue-600 text-white scale-105':'bg-white text-blue-700 hover:bg-blue-100'}`}>{d.label}</button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setLang('en')} className={`px-6 py-2 rounded-full font-bold shadow text-lg ${lang==='en'?'bg-green-600 text-white scale-105':'bg-white text-green-700 hover:bg-green-100'}`}>English</button>
              <button onClick={() => setLang('he')} className={`px-6 py-2 rounded-full font-bold shadow text-lg ${lang==='he'?'bg-pink-600 text-white scale-105':'bg-white text-pink-700 hover:bg-pink-100'}`}>עברית</button>
            </div>
            <button onClick={startGame} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4">התחל</button>
          </div>
        )}
        {started && !gameOver && questions.length > 0 && (
          <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-blue-700 shadow">ניקוד: {score}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-green-700 shadow">שאלה: {currentIdx+1}/{questions.length}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-pink-700 shadow">זמן: {timer} שניות</div>
            </div>
            <div className="mb-6">
              <div className="text-xl font-bold text-center mb-2">סדר את המילים למשפט נכון:</div>
              <div ref={selectedContainerRef} className={`flex flex-wrap gap-2 justify-center mb-4 min-h-[48px] ${isRTL ? 'flex-row-reverse' : ''}`}
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                {selected.map((word, idx) => (
                  <button
                    key={idx}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleUnselect(idx)}
                    className={`bg-blue-400 text-white px-4 py-2 rounded-full font-bold shadow hover:bg-blue-600 transition-all duration-150 text-lg
                      ${draggedIdx === idx ? 'ring-4 ring-yellow-400 scale-110' : ''}
                      ${feedback === 'נכון!' ? 'animate-correct' : ''}
                      ${feedback && feedback !== 'נכון!' ? 'animate-wrong' : ''}`}
                  >{word}</button>
                ))}
              </div>
              <div className={`flex flex-wrap gap-2 justify-center ${isRTL ? 'flex-row-reverse' : ''}`} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                {scrambled.map((word, idx) => (
                  <button key={idx} onClick={() => handleSelect(word, idx)} className="bg-white text-blue-700 px-4 py-2 rounded-full font-bold shadow hover:bg-blue-100 transition-all duration-150 text-lg border border-blue-200">{word}</button>
                ))}
              </div>
            </div>
            {!showAnswer && (
              <div className="flex justify-center mb-4">
                <button onClick={handleCheck} disabled={selected.length !== questions[currentIdx]?.text.split(' ').length || selected.length === 0} className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 disabled:opacity-50">בדוק</button>
              </div>
            )}
            {showAnswer && (
              <div className="flex flex-col items-center gap-4 mb-4 animate-fade-in">
                {feedback && (
                  <div className={`text-center text-2xl font-bold ${feedback==='נכון!'?'text-green-600':'text-red-500'}`}>{feedback}</div>
                )}
                <div className="text-center text-lg font-bold text-blue-700">{questions[currentIdx].text}</div>
                {questions[currentIdx].he && (
                  <div className="text-center text-md font-bold text-purple-700">{questions[currentIdx].he}</div>
                )}
                <button onClick={handleNext} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200">המשך</button>
              </div>
            )}
            {getMistakeStats()[questions[currentIdx].id] > 0 && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-bold align-middle">💡 חיזוק אישי</span>
            )}
            <button
              onClick={handleHint}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold shadow hover:from-orange-500 hover:to-yellow-400 transition-all duration-200 ml-2"
              disabled={(inventory['hint'] || 0) <= 0 || gameOver}
            >
              💡 רמז ({inventory['hint'] || 0})
            </button>
            {hintMsg && (
              <div className="text-center text-yellow-700 font-bold animate-fade-in mt-2">{hintMsg}</div>
            )}
          </>
        )}
        {gameOver && (
          <div className="text-center mt-6 animate-fade-in">
            <div className="text-2xl font-bold text-blue-700 mb-4">כל הכבוד! סיימת את כל המשפטים 🎉</div>
            <div className="text-lg font-bold text-green-700 mb-2">ניקוד סופי: {score} | זמן: {timer} שניות</div>
            <button onClick={restart} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4">שחק שוב</button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
        @keyframes correct { 0%,100%{background:#60d394;} 50%{background:#38b000;} }
        .animate-correct { animation: correct 0.7s; }
        @keyframes wrong { 0%,100%{background:#f87171;} 50%{background:#dc2626;} }
        .animate-wrong { animation: wrong 0.7s; }
      `}</style>
    </main>
  );
} 