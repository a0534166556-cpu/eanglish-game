'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useAuthUser from '@/lib/useAuthUser';
import { getTranslationWithFallback } from '@/lib/translations';

const WORD_BANK = [
  // Easy — מילים שימושיות לחיי יום־יום
  { id: 1, en: 'Hello', he: 'שלום', level: 'easy' },
  { id: 2, en: 'Please', he: 'בבקשה', level: 'easy' },
  { id: 3, en: 'Thanks', he: 'תודה', level: 'easy' },
  { id: 4, en: 'Sorry', he: 'סליחה', level: 'easy' },
  { id: 5, en: 'Yes', he: 'כן', level: 'easy' },
  { id: 6, en: 'No', he: 'לא', level: 'easy' },
  { id: 7, en: 'Water', he: 'מים', level: 'easy' },
  { id: 8, en: 'Food', he: 'אוכל', level: 'easy' },
  { id: 9, en: 'School', he: 'בית ספר', level: 'easy' },
  { id: 10, en: 'Teacher', he: 'מורה', level: 'easy' },
  { id: 11, en: 'Friend', he: 'חבר', level: 'easy' },
  { id: 12, en: 'Family', he: 'משפחה', level: 'easy' },
  { id: 13, en: 'Home', he: 'בית', level: 'easy' },
  { id: 14, en: 'Book', he: 'ספר', level: 'easy' },
  { id: 15, en: 'Pen', he: 'עט', level: 'easy' },
  { id: 16, en: 'Phone', he: 'טלפון', level: 'easy' },
  { id: 17, en: 'Door', he: 'דלת', level: 'easy' },
  { id: 18, en: 'Window', he: 'חלון', level: 'easy' },
  { id: 19, en: 'Chair', he: 'כיסא', level: 'easy' },
  { id: 20, en: 'Table', he: 'שולחן', level: 'easy' },
  { id: 21, en: 'Morning', he: 'בוקר', level: 'easy' },
  { id: 22, en: 'Night', he: 'לילה', level: 'easy' },
  { id: 23, en: 'Today', he: 'היום', level: 'easy' },
  { id: 24, en: 'Tomorrow', he: 'מחר', level: 'easy' },
  { id: 25, en: 'Yesterday', he: 'אתמול', level: 'easy' },
  { id: 26, en: 'Happy', he: 'שמח', level: 'easy' },
  { id: 27, en: 'Hungry', he: 'רעב', level: 'easy' },
  { id: 28, en: 'Tired', he: 'עייף', level: 'easy' },
  { id: 29, en: 'Big', he: 'גדול', level: 'easy' },
  { id: 30, en: 'Small', he: 'קטן', level: 'easy' },
  { id: 31, en: 'Open', he: 'לפתוח', level: 'easy' },
  { id: 32, en: 'Close', he: 'לסגור', level: 'easy' },
  { id: 33, en: 'Come', he: 'לבוא', level: 'easy' },
  { id: 34, en: 'Go', he: 'ללכת', level: 'easy' },
  { id: 35, en: 'Eat', he: 'לאכול', level: 'easy' },
  { id: 36, en: 'Drink', he: 'לשתות', level: 'easy' },
  { id: 37, en: 'Read', he: 'לקרוא', level: 'easy' },
  { id: 38, en: 'Write', he: 'לכתוב', level: 'easy' },
  { id: 39, en: 'Listen', he: 'להקשיב', level: 'easy' },
  { id: 40, en: 'Speak', he: 'לדבר', level: 'easy' },
  // Medium — שיחה יומיומית ולימודים
  { id: 41, en: 'Appointment', he: 'תור / פגישה', level: 'medium' },
  { id: 42, en: 'Homework', he: 'שיעורי בית', level: 'medium' },
  { id: 43, en: 'Lesson', he: 'שיעור', level: 'medium' },
  { id: 44, en: 'Question', he: 'שאלה', level: 'medium' },
  { id: 45, en: 'Answer', he: 'תשובה', level: 'medium' },
  { id: 46, en: 'Practice', he: 'תרגול', level: 'medium' },
  { id: 47, en: 'Remember', he: 'לזכור', level: 'medium' },
  { id: 48, en: 'Forget', he: 'לשכוח', level: 'medium' },
  { id: 49, en: 'Explain', he: 'להסביר', level: 'medium' },
  { id: 50, en: 'Understand', he: 'להבין', level: 'medium' },
  { id: 51, en: 'Repeat', he: 'לחזור', level: 'medium' },
  { id: 52, en: 'Decide', he: 'להחליט', level: 'medium' },
  { id: 53, en: 'Arrive', he: 'להגיע', level: 'medium' },
  { id: 54, en: 'Leave', he: 'לעזוב', level: 'medium' },
  { id: 55, en: 'Borrow', he: 'לשאול', level: 'medium' },
  { id: 56, en: 'Lend', he: 'להשאיל', level: 'medium' },
  { id: 57, en: 'Order', he: 'להזמין', level: 'medium' },
  { id: 58, en: 'Receipt', he: 'קבלה', level: 'medium' },
  { id: 59, en: 'Ticket', he: 'כרטיס', level: 'medium' },
  { id: 60, en: 'Station', he: 'תחנה', level: 'medium' },
  { id: 61, en: 'Airport', he: 'שדה תעופה', level: 'medium' },
  { id: 62, en: 'Hospital', he: 'בית חולים', level: 'medium' },
  { id: 63, en: 'Pharmacy', he: 'בית מרקחת', level: 'medium' },
  { id: 64, en: 'Grocery', he: 'מכולת', level: 'medium' },
  { id: 65, en: 'Schedule', he: 'לוח זמנים', level: 'medium' },
  { id: 66, en: 'Deadline', he: 'תאריך אחרון', level: 'medium' },
  { id: 67, en: 'Meeting', he: 'פגישה', level: 'medium' },
  { id: 68, en: 'Message', he: 'הודעה', level: 'medium' },
  { id: 69, en: 'Password', he: 'סיסמה', level: 'medium' },
  { id: 70, en: 'Internet', he: 'אינטרנט', level: 'medium' },
  { id: 71, en: 'Useful', he: 'שימושי', level: 'medium' },
  { id: 72, en: 'Important', he: 'חשוב', level: 'medium' },
  { id: 73, en: 'Careful', he: 'זהיר', level: 'medium' },
  { id: 74, en: 'Polite', he: 'מנומס', level: 'medium' },
  { id: 75, en: 'Early', he: 'מוקדם', level: 'medium' },
  { id: 76, en: 'Late', he: 'מאוחר', level: 'medium' },
  { id: 77, en: 'Often', he: 'לעיתים קרובות', level: 'medium' },
  { id: 78, en: 'Never', he: 'אף פעם', level: 'medium' },
  { id: 79, en: 'Usually', he: 'בדרך כלל', level: 'medium' },
  { id: 80, en: 'Sometimes', he: 'לפעמים', level: 'medium' },
  // Hard — אוצר מילים לימודי וביטויים
  { id: 81, en: 'Improve', he: 'לשפר', level: 'hard' },
  { id: 82, en: 'Suggest', he: 'להציע', level: 'hard' },
  { id: 83, en: 'Prefer', he: 'להעדיף', level: 'hard' },
  { id: 84, en: 'Advice', he: 'עצה', level: 'hard' },
  { id: 85, en: 'Feedback', he: 'משוב', level: 'hard' },
  { id: 86, en: 'Vocabulary', he: 'אוצר מילים', level: 'hard' },
  { id: 87, en: 'Grammar', he: 'דקדוק', level: 'hard' },
  { id: 88, en: 'Pronounce', he: 'להגות', level: 'hard' },
  { id: 89, en: 'Confident', he: 'בטוח בעצמו', level: 'hard' },
  { id: 90, en: 'Reliable', he: 'אמין', level: 'hard' },
  { id: 91, en: 'Available', he: 'זמין', level: 'hard' },
  { id: 92, en: 'Necessary', he: 'הכרחי', level: 'hard' },
  { id: 93, en: 'Experience', he: 'ניסיון', level: 'hard' },
  { id: 94, en: 'Opportunity', he: 'הזדמנות', level: 'hard' },
  { id: 95, en: 'Challenge', he: 'אתגר', level: 'hard' },
  { id: 96, en: 'Solution', he: 'פתרון', level: 'hard' },
  { id: 97, en: 'Conversation', he: 'שיחה', level: 'hard' },
  { id: 98, en: 'Interview', he: 'ראיון', level: 'hard' },
  { id: 99, en: 'Application', he: 'בקשה / טופס', level: 'hard' },
  { id: 100, en: 'Instruction', he: 'הוראה', level: 'hard' },
  { id: 101, en: 'Requirement', he: 'דרישה', level: 'hard' },
  { id: 102, en: 'Achievement', he: 'הישג', level: 'hard' },
  { id: 103, en: 'Progress', he: 'התקדמות', level: 'hard' },
  { id: 104, en: 'Focus', he: 'להתמקד', level: 'hard' },
  { id: 105, en: 'Organize', he: 'לארגן', level: 'hard' },
  { id: 106, en: 'Compare', he: 'להשוות', level: 'hard' },
  { id: 107, en: 'Describe', he: 'לתאר', level: 'hard' },
  { id: 108, en: 'Discuss', he: 'לדון', level: 'hard' },
  { id: 109, en: 'Persuade', he: 'לשכנע', level: 'hard' },
  { id: 110, en: 'Apologize', he: 'להתנצל', level: 'hard' },
  { id: 111, en: 'Compliment', he: 'מחמאה', level: 'hard' },
  { id: 112, en: 'Complaint', he: 'תלונה', level: 'hard' },
  { id: 113, en: 'Reservation', he: 'הזמנה מראש', level: 'hard' },
  { id: 114, en: 'Directions', he: 'הוראות הגעה', level: 'hard' },
  { id: 115, en: 'Traffic', he: 'תנועה', level: 'hard' },
  { id: 116, en: 'Weather', he: 'מזג אוויר', level: 'hard' },
  { id: 117, en: 'Temperature', he: 'טמפרטורה', level: 'hard' },
  { id: 118, en: 'Neighbor', he: 'שכן', level: 'hard' },
  { id: 119, en: 'Colleague', he: 'עמית לעבודה', level: 'hard' },
  { id: 120, en: 'Customer', he: 'לקוח', level: 'hard' },
];


function getRandomPairs(count: number, level: string = 'easy') {
  const levelWords = WORD_BANK.filter(word => word.level === level);
  if (levelWords.length === 0) {
    console.warn(`No words found for level: ${level}`);
    return [];
  }
  const shuffled = [...levelWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, levelWords.length));
}

const difficulties = [
  { key: 'easy', label: 'קל', count: 6, timer: null },
  { key: 'medium', label: 'בינוני', count: 10, timer: null },
  { key: 'hard', label: 'קשה', count: 14, timer: null },
  { key: 'extreme', label: 'אקסטרים', count: 20, timer: 90 },
];

// Emoji reactions for the game
const EMOJI_REACTIONS = [
  { emoji: '😊', name: 'שמח', color: 'bg-yellow-100 hover:bg-yellow-200' },
  { emoji: '😢', name: 'עצוב', color: 'bg-blue-100 hover:bg-blue-200' },
  { emoji: '😠', name: 'כועס', color: 'bg-red-100 hover:bg-red-200' },
  { emoji: '😍', name: 'מאוהב', color: 'bg-pink-100 hover:bg-pink-200' },
  { emoji: '🤔', name: 'חושב', color: 'bg-gray-100 hover:bg-gray-200' },
  { emoji: '😴', name: 'עייף', color: 'bg-purple-100 hover:bg-purple-200' },
  { emoji: '🎉', name: 'מחגג', color: 'bg-green-100 hover:bg-green-200' },
  { emoji: '😱', name: 'מפוחד', color: 'bg-orange-100 hover:bg-orange-200' },
  { emoji: '🤯', name: 'מופתע', color: 'bg-indigo-100 hover:bg-indigo-200' },
  { emoji: '😎', name: 'מגניב', color: 'bg-cyan-100 hover:bg-cyan-200' },
];

function shuffle(array: any[]) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <svg width="100vw" height="100vh">
        {[...Array(80)].map((_, i) => (
          <circle
            key={i}
            cx={Math.random() * window.innerWidth}
            cy={Math.random() * window.innerHeight}
            r={Math.random() * 6 + 2}
            fill={`hsl(${Math.random() * 360}, 80%, 60%)`}
            opacity={0.7}
          />
        ))}
      </svg>
    </div>
  );
}

const IMAGE_MAP: Record<string, string> = {
  Dog: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=128&q=80',
  Cat: 'https://images.unsplash.com/photo-1518715308788-3005759c61d3?auto=format&fit=facearea&w=128&q=80',
  Apple: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg',
  Book: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Book_icon_2.png',
  Car: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Toyota_Yaris_001.jpg',
  Sun: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Sun_white.jpg',
  Chair: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Chair_icon.png',
  Table: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Table_icon.png',
  Window: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Window_icon.png',
  Tree: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Tree_icon.png',
  Mountain: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Mountain_icon.png',
  River: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/River_icon.png',
  Computer: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Computer_icon.png',
  Teacher: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Teacher_icon.png',
  Flower: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Flower_icon.png',
  Bird: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Bird_icon.png',
  Phone: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Phone_icon.png',
  House: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/House_icon.png',
  Water: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Water_icon.png',
  Pen: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Pen_icon.png',
  School: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/School_icon.png',
  Fish: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Fish_icon.png',
  Milk: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Milk_icon.png',
  Egg: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Egg_icon.png',
  Road: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Road_icon.png',
  Clock: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Clock_icon.png',
  Shoe: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Shoe_icon.png',
  Hat: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Hat_icon.png',
  Bed: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Bed_icon.png',
  Door: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Door_icon.png',
};

function getMistakeStats(): Record<number, number> {
  try {
    return JSON.parse(localStorage.getItem('mp-mistakes') || '{}');
  } catch {
    return {};
  }
}

function addMistake(id: number) {
  const stats = getMistakeStats();
  stats[id] = (stats[id] || 0) + 1;
  localStorage.setItem('mp-mistakes', JSON.stringify(stats));
}

function pickPairs(all: { id: number; en: string; he: string; }[], count: number) {
  const stats = getMistakeStats();
  
  // מערבב את כל הזוגות כדי לקבל זוגות שונים בכל פעם
  const shuffledAll = [...all].sort(() => Math.random() - 0.5);
  
  // לוקח רק כמה זוגות עם שגיאות (אם יש)
  const mistakePairs = shuffledAll.filter((p) => stats[p.id] > 0);
  const boostedCount = Math.min(3, mistakePairs.length); // רק 3 זוגות עם שגיאות
  const boosted = mistakePairs.slice(0, boostedCount);

  // לוקח זוגות אקראיים מהשאר
  const remainingPairs = shuffledAll.filter((p) => !boosted.includes(p));
  const randomRest = remainingPairs.slice(0, count - boosted.length);
  
  // מערבב הכל יחד
  return [...boosted, ...randomRest].sort(() => Math.random() - 0.5);
}

export default function MatchingPairsWrapper() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <MatchingPairs />
    </Suspense>
  );
}

function MatchingPairs() {
  const searchParams = useSearchParams();
  const { user } = useAuthUser();
  const levelParam = searchParams?.get('level') || 'easy';
  // Map level names to difficulty keys
  const levelMap: Record<string, string> = {
    beginner: 'easy',
    intermediate: 'medium', 
    advanced: 'hard',
    extreme: 'extreme'
  };
  const mappedLevel = levelMap[levelParam] || 'easy';
  const [difficulty, setDifficulty] = useState(mappedLevel);
  const [cards, setCards] = useState<any[]>([]); // התחל עם מערך ריק כדי שהאופציה תופיע
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastMatch, setLastMatch] = useState<'success' | 'fail' | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [newHighScore, setNewHighScore] = useState(false);
  const [highScore, setHighScore] = useState<{score: number, moves: number, timer: number} | null>(null);
  const [extremeTimeLeft, setExtremeTimeLeft] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);
  const clickAudio = useRef<HTMLAudioElement | null>(null);
  const [hintActive, setHintActive] = useState<number[] | null>(null);
  const [pairs, setPairs] = useState<{id: number, en: string, he: string}[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [hasShowSolution, setHasShowSolution] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState<string>('');
  const [emojiHistory, setEmojiHistory] = useState<{emoji: string, timestamp: number}[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [learnedWordsList, setLearnedWordsList] = useState<Array<{word: string, translation: string}>>([]);
  const [useLearnedWords, setUseLearnedWords] = useState(false);
  const [learnedWordsData, setLearnedWordsData] = useState<Array<{word: string, translation: string}>>([]);
  const [loadingLearnedWords, setLoadingLearnedWords] = useState(false);
  const [selectedWordsCount, setSelectedWordsCount] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<Array<{id: number, en: string, he: string, level: string}>>([]);
  const [showWordSelector, setShowWordSelector] = useState(false);

  // הישגים למשחק Matching Pairs
  const MATCHING_ACHIEVEMENTS = [
    { id: 'first_match', name: 'זוג ראשון', icon: '🎯', description: 'התאם זוג ראשון', reward: 50 },
    { id: 'perfect_game', name: 'משחק מושלם', icon: '💯', description: 'השלם משחק ללא טעויות', reward: 500 },
    { id: 'speed_demon', name: 'מהיר וזריז', icon: '⚡', description: 'השלם משחק תוך 60 שניות', reward: 300 },
    { id: 'efficiency_master', name: 'מאסטר יעילות', icon: '🎯', description: 'השלם משחק עם פחות מ-20 מהלכים', reward: 400 },
    { id: 'extreme_challenger', name: 'מאתגר אקסטרים', icon: '💀', description: 'השלם משחק ברמת אקסטרים', reward: 600 },
    { id: 'matching_legend', name: 'אגדת זוגות', icon: '👑', description: 'השלם 50 משחקי זוגות', reward: 1000 },
    { id: 'hint_master', name: 'מאסטר רמזים', icon: '💡', description: 'השתמש ברמז 10 פעמים', reward: 200 },
    { id: 'solution_seeker', name: 'מחפש פתרון', icon: '🔍', description: 'השתמש בפתרון 5 פעמים', reward: 150 },
    { id: 'emoji_enthusiast', name: 'משוגע אימוג\'י', icon: '😄', description: 'שלח 20 אימוג\'י', reward: 100 },
    { id: 'time_pressure', name: 'לחץ זמן', icon: '⏰', description: 'השלם משחק עם פחות מ-10 שניות נותרות', reward: 500 },
  ];

  // פונקציה לשליחת אימוג'י
  const sendEmoji = (emoji: string) => {
    setCurrentEmoji(emoji);
    setEmojiHistory(prev => [...prev, { emoji, timestamp: Date.now() }]);
    setShowEmojiPicker(false);
    
    // הסר את האימוג'י אחרי 3 שניות
    setTimeout(() => {
      setCurrentEmoji('');
    }, 3000);
  };

  // פונקציה לניקוי היסטוריית אימוג'ים ישנים
  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiHistory(prev => 
        prev.filter(item => Date.now() - item.timestamp < 10000) // שמור רק 10 שניות אחרונות
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // טען מילים שנלמדו מה-API
  const loadLearnedWords = async () => {
    if (!user) {
      console.log('Cannot load learned words - no user logged in');
      return;
    }
    
    try {
      setLoadingLearnedWords(true);
      const response = await fetch(`/api/learned-words?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load learned words');
      }
      
      const data = await response.json();
      const words = data.learnedWords || [];
      
      setLearnedWordsData(words);
      console.log('Loaded learned words:', words.length);
      
      // אם יש כמות נבחרת, אתחל את המילים שנבחרו
      if (selectedWordsCount !== null) {
        const pairs = words.map((w: any, index: number) => ({
          id: index + 1,
          en: w.word,
          he: w.translation || w.word,
          level: w.difficulty || 'easy'
        }));
        setSelectedWords([...pairs].sort(() => Math.random() - 0.5));
      }
    } catch (error) {
      console.error('Error loading learned words:', error);
      setLearnedWordsData([]);
    } finally {
      setLoadingLearnedWords(false);
    }
  };

  // טען מילים שנלמדו כשהמשתמש מחליף למצב learned words
  useEffect(() => {
    if (useLearnedWords && user && learnedWordsData.length === 0 && !loadingLearnedWords) {
      loadLearnedWords();
    }
  }, [useLearnedWords, user]);
  
  // לא מתחיל אוטומטית - המשתמש צריך ללחוץ על כפתור "התחל משחק"

  // אתחול המשחק לפי רמת קושי
  const initGame = (diff = difficulty) => {
    console.log('Initializing game with difficulty:', diff);
    const diffObj = difficulties.find((d) => d.key === diff) || difficulties[0];
    console.log('Difficulty object:', diffObj);
    
    let selectedPairs: any[] = [];
    
    if (useLearnedWords && learnedWordsData.length > 0) {
      // השתמש במילים שנלמדו
      console.log('Using learned words mode');
      
      // קודם כל בדוק אם יש מילים שנבחרו ספציפית
      let availableWords: Array<{id: number, en: string, he: string, level: string}>;
      if (selectedWords.length > 0) {
        // אם יש מילים שנבחרו ספציפית, השתמש בהן
        availableWords = selectedWords;
      } else if (selectedWordsCount !== null) {
        // אם יש כמות נבחרת, בחר אקראית מהמילים
        const allWords = learnedWordsData.map((w: any, index: number) => ({
          id: index + 1,
          en: w.word,
          he: w.translation || w.word,
          level: w.difficulty || 'easy'
        }));
        availableWords = [...allWords].sort(() => Math.random() - 0.5).slice(0, selectedWordsCount);
      } else {
        // אחרת, השתמש בכל המילים
        availableWords = learnedWordsData.map((w: any, index: number) => ({
          id: index + 1,
          en: w.word,
          he: w.translation || w.word,
          level: w.difficulty || 'easy'
        }));
      }
      
      console.log('Available learned words:', availableWords.length);
      
      if (availableWords.length === 0) {
        alert('אין מילים שנלמדו עדיין! אנא שחק במשחקים אחרים כדי ללמוד מילים.');
        return;
      }
      
      // בחר מילים אקראיות מהמילים שנלמדו
      const maxPairs = Math.min(diffObj.count, Math.floor(availableWords.length / 2));
      selectedPairs = availableWords
        .sort(() => Math.random() - 0.5)
        .slice(0, maxPairs);
      
      console.log('Selected pairs from learned words:', selectedPairs.length);
    } else {
      // השתמש במילים הרגילות
      console.log('Using regular word bank');
    const levelWords = WORD_BANK.filter(word => word.level === diff);
    console.log('Available words for level:', levelWords.length);
    
    // בחר מילים אקראיות
      selectedPairs = levelWords
      .sort(() => Math.random() - 0.5)
      .slice(0, diffObj.count);
    
    console.log('Selected pairs:', selectedPairs);
    }
    
    if (selectedPairs.length === 0) {
      alert('אין מספיק מילים למשחק. אנא בחר רמת קושי אחרת או שחק במשחקים אחרים כדי ללמוד מילים.');
      return;
    }
    
    // צור כרטיסים
    const allCards = shuffle([
      ...selectedPairs.map((p, i) => ({ id: i * 2, text: p.en, pair: i })),
      ...selectedPairs.map((p, i) => ({ id: i * 2 + 1, text: p.he, pair: i })),
    ]);
    
    console.log('All cards:', allCards);
    setCards(allCards);
    setPairs(selectedPairs);
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setMoves(0);
    setGameOver(false);
    setShowConfetti(false);
    setLastMatch(null);
    setShowSolution(false);
    setNewHighScore(false);
    setLearnedWordsList([]);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (diffObj.key === 'extreme') {
      setExtremeTimeLeft(diffObj.timer);
      setTimer(diffObj.timer!);
      intervalRef.current = setInterval(() => {
        setExtremeTimeLeft((t) => {
          if (t === null) return null;
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setGameOver(true);
            setShowConfetti(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      setExtremeTimeLeft(null);
      setTimer(0);
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
  };

  // טען שיאים מה-localStorage
  useEffect(() => {
    const diffKey = `matching-pairs-highscore-${difficulty}`;
    const hs = localStorage.getItem(diffKey);
    if (hs) setHighScore(JSON.parse(hs));
    else setHighScore(null);
  }, [difficulty]);

  useEffect(() => {
    // כאשר הפרמטר משתנה, עדכן את רמת הקושי (אבל אל תתחיל את המשחק אוטומטית)
    console.log('Level param changed:', levelParam);
    setDifficulty(mappedLevel);
    // אל תתחיל את המשחק אוטומטית - המשתמש צריך לבחור מצב משחק
    // initGame(mappedLevel);
    // eslint-disable-next-line
  }, [levelParam]);

  // פונקציה לחילוץ מילים אנגליות
  const extractEnglishWords = (text: string): string[] => {
    if (!text) return [];
    const englishWords = text.match(/[A-Za-z]+/g) || [];
    return englishWords
      .map(word => word.toLowerCase())
      .filter(word => 
        word.length > 2 && 
        !['the', 'and', 'is', 'are', 'was', 'were', 'has', 'have', 'had', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from'].includes(word)
      );
  };

  // אסוף את כל המילים מכל הזוגות במשחק
  const collectAllWordsFromGame = () => {
    const wordsMap = new Map<string, string>();
    
    if (!pairs || pairs.length === 0) {
      return [];
    }
    
    pairs.forEach((pair) => {
      // הוסף את המילה האנגלית
      if (pair.en) {
        const enWord = pair.en.toLowerCase();
        if (!wordsMap.has(enWord)) {
          wordsMap.set(enWord, pair.he || enWord);
        }
      }
    });
    
    return Array.from(wordsMap.entries()).map(([word, translation]) => ({
      word,
      translation: translation || word
    }));
  };

  const saveLearnedWord = async (word: string, translation: string, isCorrect: boolean) => {
    if (!user) {
      console.log('Cannot save word - no user logged in');
      return;
    }
    
    try {
      const response = await fetch('/api/learned-words/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          word: word,
          translation: translation,
          gameName: 'MatchingPairs',
          difficulty: difficulty,
          isCorrect: isCorrect
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Failed to save word "${word}":`, response.status, errorData);
        throw new Error(`Failed to save word: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to save learned word "${word}":`, error);
      throw error;
    }
  };

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      // זה סוף המשחק - אסוף את כל המילים לפני סיום המשחק
      console.log('Game finished! Collecting words...');
      const allWords = collectAllWordsFromGame();
      console.log('All collected words:', allWords);
      
      // עדכן את ה-state עם המילים
      setLearnedWordsList(allWords);
      
      // שמור את כל המילים (רק אם המשתמש מחובר ולא משחק עם מילים שנלמדו)
      // בדוק אילו מילים כבר קיימות במסד הנתונים לפני השמירה
      if (user && allWords.length > 0 && !useLearnedWords) {
        console.log('User is logged in, checking existing words before saving...');
        (async () => {
          try {
            // טען את כל המילים הקיימות של המשתמש
            const existingWordsResponse = await fetch(`/api/learned-words?userId=${user.id}`);
            if (!existingWordsResponse.ok) {
              throw new Error('Failed to fetch existing words');
            }
            const existingWordsData = await existingWordsResponse.json();
            const existingWords = existingWordsData.learnedWords || [];
            
            // צור Set של מילים קיימות (בכל המשחקים) לבדיקה מהירה
            const existingWordsSet = new Set(
              existingWords.map((w: any) => w.word.toLowerCase())
            );
            
            // סנן רק את המילים החדשות (שאינן קיימות בכל המשחקים)
            const newWords = allWords.filter(wordData => {
              return !existingWordsSet.has(wordData.word.toLowerCase());
            });
            
            console.log(`Found ${existingWords.length} existing words, ${newWords.length} new words to save`);
            
            // הצג את כל המילים שלמד במשחק (לא רק החדשות)
            // אבל שמור רק את המילים החדשות
            setLearnedWordsList(allWords);
            
            // שמור רק את המילים החדשות
            if (newWords.length > 0) {
              console.log('Saving', newWords.length, 'new words to database...');
              const savePromises = newWords.map(wordData => 
          saveLearnedWord(wordData.word, wordData.translation, true)
        );
              const results = await Promise.allSettled(savePromises);
          const successful = results.filter((r: any) => r.status === 'fulfilled').length;
          const failed = results.filter((r: any) => r.status === 'rejected').length;
          console.log(`Words save completed: ${successful} successful, ${failed} failed`);
            } else {
              console.log('No new words to save - all words already exist');
            }
          } catch (error) {
            console.error('Error checking/saving words:', error);
            // במקרה של שגיאה, נסה לשמור את כל המילים (fallback)
            const savePromises = allWords.map(wordData => 
              saveLearnedWord(wordData.word, wordData.translation, true)
            );
            Promise.allSettled(savePromises).catch(err => 
              console.error('Error in fallback save:', err)
            );
          }
        })();
      }
      
      setGameOver(true);
      setShowConfetti(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [matched, cards, pairs, user]);


  // בדוק שיא חדש
  useEffect(() => {
    if (gameOver && showConfetti) {
      if (successAudio.current) {
        successAudio.current.currentTime = 0;
        successAudio.current.play();
      }
      const diffKey = `matching-pairs-highscore-${difficulty}`;
      const hs = localStorage.getItem(diffKey);
      const newScore = { score, moves, timer };
      let isNew = false;
      if (!hs) isNew = true;
      else {
        const prev = JSON.parse(hs);
        if (
          score > prev.score ||
          (score === prev.score && moves < prev.moves) ||
          (score === prev.score && moves === prev.moves && timer < prev.timer)
        ) isNew = true;
      }
      if (isNew) {
        localStorage.setItem(diffKey, JSON.stringify(newScore));
        setHighScore(newScore);
        setNewHighScore(true);
        setTimeout(() => setNewHighScore(false), 3500);
      }
    }
  }, [gameOver, showConfetti, score, moves, timer, difficulty]);

  const handleFlip = (idx: number) => {
    if (
      flipped.length === 2 ||
      flipped.includes(idx) ||
      matched.includes(idx) ||
      showSolution ||
      (hintActive && !hintActive.includes(idx))
    ) return;
    if (clickAudio.current) {
      clickAudio.current.currentTime = 0;
      clickAudio.current.play();
    }
    setFlipped((prev) => [...prev, idx]);
    setMoves((m) => m + 1);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].pair === cards[second].pair && first !== second) {
        setMatched((prev) => [...prev, first, second]);
        setScore((s) => s + 10);
        setLastMatch('success');
        
        // שמור מילה נלמדת - רק אם המשחק לא עם מילים שנלמדו
        if (!useLearnedWords) {
        const card = cards[first];
        if (card && card.text) {
          // אם זה קלף אנגלי, שמור את המילה האנגלית
          if (card.lang === 'en') {
            saveLearnedWord(card.text, WORD_BANK.find(w => w.en === card.text)?.he || card.text, true);
          }
          // אם זה קלף עברי, חפש את המילה האנגלית המתאימה
          else if (card.lang === 'he') {
            const englishWord = WORD_BANK.find(w => w.he === card.text);
            if (englishWord) {
              saveLearnedWord(englishWord.en, card.text, true);
              }
            }
          }
        }
        
        // השמע רק את קובץ ההקלטה המקורי
        if (successAudio.current) {
          successAudio.current.currentTime = 0;
          successAudio.current.play();
        }
        
        setTimeout(() => setLastMatch(null), 1200);
      } else {
        setScore((s) => Math.max(0, s - 2)); // עונש של 2 נקודות על טעות
        setLastMatch('fail');
        
        // שמור מילה שנענתה לא נכון - רק אם המשחק לא עם מילים שנלמדו
        if (!useLearnedWords) {
        const card = cards[first];
        if (card && card.text) {
          if (card.lang === 'en') {
            saveLearnedWord(card.text, WORD_BANK.find(w => w.en === card.text)?.he || card.text, false);
          } else if (card.lang === 'he') {
            const englishWord = WORD_BANK.find(w => w.he === card.text);
            if (englishWord) {
              saveLearnedWord(englishWord.en, card.text, false);
              }
            }
          }
        }
        
        if (failAudio.current) {
          failAudio.current.currentTime = 0;
          failAudio.current.play();
        }
        setTimeout(() => setLastMatch(null), 900);
      }
      setTimeout(() => setFlipped([]), 900);
    }
  }, [flipped, cards, difficulty]);

  const restart = () => {
    initGame(difficulty);
  };

  const handleShowSolution = () => {
    setShowSolution(true);
    setFlipped(cards.map((_, idx) => idx));
    setTimeout(() => {
      setShowSolution(false);
      setFlipped([]);
    }, 3500);
  };

  // פונקציה חדשה להצגת כל הכרטיסים ל-2 שניות
  const handleShowAll = () => {
    setShowSolution(true);
    setFlipped(cards.map((_, idx) => idx));
    setTimeout(() => {
      setShowSolution(false);
      setFlipped([]);
    }, 2000); // 2 שניות בלבד
  };


  // טען את האינבנטורי מהחנות
  useEffect(() => {
    const loadInventory = () => {
      try {
        const inventoryStr = localStorage.getItem('quiz-inventory');
        if (inventoryStr) {
          const inventoryData = JSON.parse(inventoryStr);
          setInventory(inventoryData);
          setHasShowSolution(inventoryData.some((item: any) => item.name === 'show_solution'));
        }
      } catch (error) {
        console.error('Failed to load inventory:', error);
      }
    };

    loadInventory();

    // האזן לשינויים באינבנטורי
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'quiz-inventory') {
        loadInventory();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-400 via-blue-300 to-blue-700 flex flex-col items-center justify-center p-4">
      {/* נגן צלילים */}
      <audio ref={successAudio} src="/voise/הצלחה.dat" preload="auto" />
      <audio ref={failAudio} src="/voise/כשלון.dat" preload="auto" />
      <audio ref={clickAudio} src="https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b7bfa.mp3" preload="auto" />
      {showConfetti && <Confetti />}
      {newHighScore && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-yellow-400 text-white text-2xl font-bold px-8 py-4 rounded-full shadow-xl border-4 border-yellow-600">
            שיא חדש!
          </div>
        </div>
      )}
      <div className="max-w-2xl w-full mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-6 drop-shadow-lg">משחק הזיכרון בקובייה</h1>
        
        {/* בחירת מצב משחק - רגיל או מילים שנלמדו */}
        {cards.length === 0 && (
          <div className="mb-6 bg-white bg-opacity-90 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">בחר מצב משחק:</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setUseLearnedWords(false);
                  initGame();
                }}
                className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  !useLearnedWords
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎮 משחק רגיל
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    alert('אנא התחבר כדי לשחק עם המילים שלמדת');
                    return;
                  }
                  setUseLearnedWords(true);
                  if (learnedWordsData.length === 0) {
                    loadLearnedWords();
                  }
                }}
                disabled={!user || loadingLearnedWords}
                className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  useLearnedWords
                    ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loadingLearnedWords ? (
                  '⏳ טוען מילים...'
                ) : (
                  <>
                    📚 משחק עם מילים שנלמדו
                    {learnedWordsData.length > 0 && (
                      <span className="block text-sm mt-1">({learnedWordsData.length} מילים זמינות)</span>
                    )}
                  </>
                )}
              </button>
              
              {/* כפתור התחל משחק - רק כשמשחקים עם מילים שנלמדו */}
              {useLearnedWords && learnedWordsData.length > 0 && !loadingLearnedWords && cards.length === 0 && (
                <button
                  onClick={() => {
                    if (showWordSelector && selectedWords.length === 0) {
                      alert('אנא בחר לפחות מילה אחת למשחק.');
                      return;
                    }
                    initGame();
                  }}
                  disabled={showWordSelector && selectedWords.length === 0}
                  className="mt-4 w-full bg-gradient-to-r from-green-400 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:from-green-500 hover:to-blue-600 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  התחל משחק
                </button>
              )}
              {!user && (
                <p className="text-sm text-gray-600 text-center mt-2">
                  💡 התחבר כדי לשחק עם המילים שלמדת
                </p>
              )}
            </div>
            
            {/* בחירת רמת קושי - רק אם לא במצב מילים שנלמדו */}
            {/* בחירת כמות מילים (רק אם יש מילים שנלמדו) */}
            {useLearnedWords && learnedWordsData.length > 0 && !loadingLearnedWords && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <label className="block text-sm font-bold text-blue-800 mb-2 text-center">
                  בחר מילים למשחק:
                </label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 justify-center">
                    <input
                      type="radio"
                      id="all-words-mp"
                      name="word-selection-mp"
                      checked={selectedWordsCount === null && selectedWords.length === 0 && !showWordSelector}
                      onChange={() => {
                        setSelectedWordsCount(null);
                        setSelectedWords([]);
                        setShowWordSelector(false);
                      }}
                      className="w-5 h-5"
                    />
                    <label htmlFor="all-words-mp" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      כל המילים ({learnedWordsData.length})
                    </label>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <input
                      type="radio"
                      id="custom-count-mp"
                      name="word-selection-mp"
                      checked={selectedWordsCount !== null && selectedWords.length === 0 && !showWordSelector}
                      onChange={() => {
                        const count = Math.min(40, learnedWordsData.length);
                        setSelectedWordsCount(count);
                        setSelectedWords([]);
                        setShowWordSelector(false);
                      }}
                      className="w-5 h-5"
                    />
                    <label htmlFor="custom-count-mp" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      כמות אקראית:
                    </label>
                    {selectedWordsCount !== null && selectedWords.length === 0 && !showWordSelector && (
                      <input
                        type="number"
                        min="1"
                        max={learnedWordsData.length}
                        value={selectedWordsCount}
                        onChange={(e) => {
                          const count = parseInt(e.target.value) || 1;
                          const maxCount = Math.min(count, learnedWordsData.length);
                          setSelectedWordsCount(maxCount);
                          setSelectedWords([]);
                        }}
                        className="w-20 px-2 py-1 border-2 border-blue-300 rounded-lg text-center font-bold"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <input
                      type="radio"
                      id="select-words-mp"
                      name="word-selection-mp"
                      checked={showWordSelector || selectedWords.length > 0}
                      onChange={() => {
                        setSelectedWordsCount(null);
                        setShowWordSelector(true);
                        if (selectedWords.length === 0) {
                          setSelectedWords([]);
                        }
                      }}
                      className="w-5 h-5"
                    />
                    <label htmlFor="select-words-mp" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      בחר מילים ספציפיות
                    </label>
                  </div>
                  {selectedWordsCount !== null && selectedWords.length === 0 && !showWordSelector && (
                    <p className="text-xs text-gray-600 text-center mt-2">
                      המילים נבחרות אקראית מתוך {learnedWordsData.length} מילים זמינות
                    </p>
                  )}
                  {selectedWords.length > 0 && (
                    <p className="text-xs text-green-600 text-center mt-2 font-bold">
                      נבחרו {selectedWords.length} מילים
                    </p>
                  )}
                </div>
                
                {/* רשימת בחירת מילים */}
                {(showWordSelector || selectedWords.length > 0) && (
                  <div className="mt-4 max-h-60 overflow-y-auto border-2 border-blue-300 rounded-lg p-3 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {learnedWordsData.map((wordData, index) => {
                        const isSelected = selectedWords.some(w => w.en.toLowerCase() === wordData.word.toLowerCase());
                        return (
                          <label
                            key={index}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-100 ${
                              isSelected ? 'bg-blue-200' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const pair = {
                                    id: index + 1,
                                    en: wordData.word,
                                    he: wordData.translation || wordData.word,
                                    level: (wordData as any).difficulty || 'easy'
                                  };
                                  setSelectedWords([...selectedWords, pair]);
                                  setSelectedWordsCount(null);
                                  setShowWordSelector(true);
                                } else {
                                  setSelectedWords(selectedWords.filter(w => w.en.toLowerCase() !== wordData.word.toLowerCase()));
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm font-semibold text-gray-800">{wordData.word}</span>
                            <span className="text-xs text-gray-600">({getTranslationWithFallback(wordData.word, undefined, wordData.translation)})</span>
                          </label>
                        );
                      })}
                    </div>
                    {selectedWords.length > 0 && (
                      <div className="mt-3 flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedWords([]);
                            setShowWordSelector(false);
                          }}
                          className="px-4 py-1 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600"
                        >
                          נקה בחירה
                        </button>
                        <button
                          onClick={() => {
                            const allPairs = learnedWordsData.map((w: any, index: number) => ({
                              id: index + 1,
                              en: w.word,
                              he: w.translation || w.word,
                              level: (w as any).difficulty || 'easy'
                            }));
                            setSelectedWords(allPairs);
                            setShowWordSelector(true);
                          }}
                          className="px-4 py-1 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600"
                        >
                          בחר הכל
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {!useLearnedWords && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">רמת קושי:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {difficulties.map((diff) => (
                    <button
                      key={diff.key}
                      onClick={() => {
                        setDifficulty(diff.key);
                        initGame(diff.key);
                      }}
                      className={`px-4 py-2 rounded-xl font-bold shadow transition-all ${
                        difficulty === diff.key
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-105'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
          <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-blue-700 shadow">ניקוד: {score}</div>
          <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-green-700 shadow">מהלכים: {moves}</div>
          <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-pink-700 shadow">
            {difficulty === 'extreme' ? `זמן: ${extremeTimeLeft ?? 0} שניות` : `זמן: ${timer} שניות`}
          </div>
          {/* כפתור הצג הכל - חדש! */}
          <button
            onClick={handleShowAll}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold shadow hover:from-orange-500 hover:to-yellow-400 transition-all duration-200 hover:scale-105"
            disabled={showSolution}
          >
            👁️ הצג הכל
          </button>
          {hasShowSolution && (
          <button
            onClick={handleShowSolution}
            className="bg-gradient-to-r from-purple-400 to-blue-500 text-white px-6 py-2 rounded-full font-bold shadow hover:from-blue-500 hover:to-purple-400 transition-all duration-200"
            disabled={showSolution}
          >
            הצג פתרון
          </button>
          )}
        </div>
        {highScore && (
          <div className="mb-4 text-center">
            <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold shadow">
              שיא אישי: {highScore.score} נק׳ | {highScore.moves} מהלכים | {highScore.timer} שניות
            </span>
          </div>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
          {cards.map((card, idx) => {
            const isFlipped =
              flipped.includes(idx) ||
              matched.includes(idx) ||
              showSolution ||
              (hintActive ? hintActive.includes(idx) : false);
            const isJustFlipped = flipped.includes(idx);
            const isMatched = matched.includes(idx);
            // האם יש תמונה?
            const imgSrc = IMAGE_MAP[card.text] || null;
            return (
              <div
                key={card.id}
                className={`perspective h-24 sm:h-28 md:h-32`}
              >
                <button
                  className={`relative w-full h-full rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold shadow-lg transition-all duration-500 select-none
                    ${isFlipped ? 'bg-gradient-to-r from-blue-400 to-green-400 text-white scale-105' : 'bg-white text-blue-700 hover:bg-blue-100'}
                    ${isMatched && lastMatch === 'success' ? 'animate-pulse ring-4 ring-green-400' : ''}
                    ${isMatched && lastMatch !== 'success' ? 'opacity-60' : ''}
                    ${(hintActive && hintActive.includes(idx)) ? 'ring-4 ring-yellow-400' : ''}`}
                  onClick={() => handleFlip(idx)}
                  disabled={isFlipped || flipped.length === 2 || matched.includes(idx) || showSolution || (hintActive ? !hintActive.includes(idx) : false)}
                  style={{ cursor: isFlipped ? 'default' : 'pointer', transformStyle: 'preserve-3d', position: 'relative' }}
                >
                  {/* צד קדמי */}
                  <span
                    className="block w-full h-full absolute inset-0 flex flex-col items-center justify-center transition-all duration-500"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
                      direction: 'rtl',
                    }}
                  >
                    {imgSrc && (
                      <img src={imgSrc} alt={card.text} className="w-10 h-10 mb-1 rounded-full object-cover border-2 border-white shadow" />
                    )}
                    {card.text}
                  </span>
                  {/* צד אחורי */}
                  <span
                    className="block w-full h-full absolute inset-0 flex items-center justify-center transition-all duration-500"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      direction: 'rtl',
                    }}
                  >
                    ?
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        {lastMatch === 'success' && (
          <div className="text-center mb-4 animate-fade-in">
            <span className="inline-block bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow">זוג נכון!</span>
          </div>
        )}
        {lastMatch === 'fail' && (
          <div className="text-center mb-4 animate-fade-in">
            <span className="inline-block bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow">לא נכון, נסה שוב!</span>
          </div>
        )}
        
        {/* מערכת אימוג'ים */}
        <div className="fixed bottom-4 right-4 z-50">
          {/* כפתור פתיחת אימוג'ים */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-2xl p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="שלח אימוג'י"
          >
            😊
          </button>
          
          {/* בחירת אימוג'ים */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-xl p-4 grid grid-cols-5 gap-2 animate-fade-in">
              {EMOJI_REACTIONS.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => sendEmoji(reaction.emoji)}
                  className={`${reaction.color} p-2 rounded-full text-2xl hover:scale-110 transition-all duration-200`}
                  title={reaction.name}
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          )}
          
          {/* אימוג'י נוכחי */}
          {currentEmoji && (
            <div className="absolute bottom-20 right-0 text-4xl animate-bounce">
              {currentEmoji}
            </div>
          )}
          
          {/* היסטוריית אימוג'ים */}
          {emojiHistory.length > 0 && (
            <div className="absolute bottom-24 right-0 space-y-1">
              {emojiHistory.slice(-3).map((item, index) => (
                <div
                  key={index}
                  className="text-2xl animate-fade-in opacity-70"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    transform: `translateX(${index * 10}px)`
                  }}
                >
                  {item.emoji}
                </div>
              ))}
            </div>
          )}
        </div>
        {gameOver && (
          <div className="text-center mt-6 animate-fade-in">
            <div className="text-2xl font-bold text-white mb-4">כל הכבוד! סיימת את המשחק 🎉</div>
            <div className="text-lg font-bold text-white mb-2">
              ניקוד סופי: {score}
              {difficulty === 'extreme' && extremeTimeLeft !== null && extremeTimeLeft > 0 && (
                <span> | בונוס זמן: {extremeTimeLeft * 10} נק׳</span>
              )}
              {' '}| מהלכים: {moves} | זמן: {difficulty === 'extreme' ? (difficulties.find(d=>d.key==='extreme')!.timer! - (extremeTimeLeft ?? 0)) : timer} שניות
            </div>
            
            {/* רשימת המילים שנלמדו */}
            {learnedWordsList && learnedWordsList.length > 0 && (
              <div className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 המילים שלמדת במשחק הזה:</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                  {learnedWordsList.map((wordData, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-md border border-blue-200">
                      <div className="font-bold text-blue-700 text-lg">{wordData.word}</div>
                      <div className="text-sm text-gray-600">{wordData.translation}</div>
                    </div>
                  ))}
                </div>
                {user && (
                  <div className="mt-4 text-sm text-gray-600">
                    ✅ המילים נשמרו בדף המילים שנלמדו
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={restart} className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200">
                שחק שוב
              </button>
              {user && learnedWordsList && learnedWordsList.length > 0 && (
                <a
                  href="/learned-words"
                  className="px-8 py-3 bg-gradient-to-r from-indigo-400 to-purple-500 text-white rounded-full text-xl font-bold shadow-lg hover:from-indigo-500 hover:to-purple-600 transition-transform transform hover:scale-105"
                >
                  📚 צפה בכל המילים
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`
        .perspective { perspective: 800px; }
        button[style*='preserve-3d'] { transform-style: preserve-3d; }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0,-15px,0); }
          70% { transform: translate3d(0,-7px,0); }
          90% { transform: translate3d(0,-2px,0); }
        }
        
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-bounce { animation: bounce 1s ease-in-out; }
      `}</style>
    </main>
  );
} 
