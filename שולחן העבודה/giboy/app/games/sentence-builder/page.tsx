'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type QuestionBank = {
  [key: string]: { sentence: string; words: string[]; lang: string; }[];
};

const QUESTION_BANK: QuestionBank = {
  easy: [
    { sentence: 'The dog is barking.', words: ['The', 'dog', 'is', 'barking.'], lang: 'en' },
    { sentence: 'I like apples.', words: ['I', 'like', 'apples.'], lang: 'en' },
    { sentence: 'The cat is sleeping.', words: ['The', 'cat', 'is', 'sleeping.'], lang: 'en' },
    { sentence: 'She reads books.', words: ['She', 'reads', 'books.'], lang: 'en' },
    { sentence: 'We play games.', words: ['We', 'play', 'games.'], lang: 'en' },
    { sentence: 'The sun is bright.', words: ['The', 'sun', 'is', 'bright.'], lang: 'en' },
    { sentence: 'I eat breakfast.', words: ['I', 'eat', 'breakfast.'], lang: 'en' },
    { sentence: 'The car is red.', words: ['The', 'car', 'is', 'red.'], lang: 'en' },
    { sentence: 'He walks to school.', words: ['He', 'walks', 'to', 'school.'], lang: 'en' },
    { sentence: 'The book is good.', words: ['The', 'book', 'is', 'good.'], lang: 'en' },
    { sentence: 'החתול יושב על הכיסא.', words: ['החתול', 'יושב', 'על', 'הכיסא.'], lang: 'he' },
    { sentence: 'הילד קורא ספר.', words: ['הילד', 'קורא', 'ספר.'], lang: 'he' },
    { sentence: 'הכלב רץ בגן.', words: ['הכלב', 'רץ', 'בגן.'], lang: 'he' },
    { sentence: 'אני אוהב שוקולד.', words: ['אני', 'אוהב', 'שוקולד.'], lang: 'he' },
    { sentence: 'השמש זורחת.', words: ['השמש', 'זורחת.'], lang: 'he' },
    { sentence: 'הילדה שותה מים.', words: ['הילדה', 'שותה', 'מים.'], lang: 'he' },
    { sentence: 'המכונית כחולה.', words: ['המכונית', 'כחולה.'], lang: 'he' },
    { sentence: 'אנחנו משחקים כדורגל.', words: ['אנחנו', 'משחקים', 'כדורגל.'], lang: 'he' },
    { sentence: 'הספר מעניין.', words: ['הספר', 'מעניין.'], lang: 'he' },
    { sentence: 'הילד הולך לבית הספר.', words: ['הילד', 'הולך', 'לבית', 'הספר.'], lang: 'he' },
  ],
  medium: [
    { sentence: 'The sun is shining in the sky.', words: ['The', 'sun', 'is', 'shining', 'in', 'the', 'sky.'], lang: 'en' },
    { sentence: 'She is reading a book.', words: ['She', 'is', 'reading', 'a', 'book.'], lang: 'en' },
    { sentence: 'I am learning English today.', words: ['I', 'am', 'learning', 'English', 'today.'], lang: 'en' },
    { sentence: 'The children are playing happily.', words: ['The', 'children', 'are', 'playing', 'happily.'], lang: 'en' },
    { sentence: 'My mother cooks delicious food.', words: ['My', 'mother', 'cooks', 'delicious', 'food.'], lang: 'en' },
    { sentence: 'The teacher explains the lesson clearly.', words: ['The', 'teacher', 'explains', 'the', 'lesson', 'clearly.'], lang: 'en' },
    { sentence: 'We are going to the park tomorrow.', words: ['We', 'are', 'going', 'to', 'the', 'park', 'tomorrow.'], lang: 'en' },
    { sentence: 'The computer is working perfectly.', words: ['The', 'computer', 'is', 'working', 'perfectly.'], lang: 'en' },
    { sentence: 'I drink coffee every morning.', words: ['I', 'drink', 'coffee', 'every', 'morning.'], lang: 'en' },
    { sentence: 'The flowers are blooming beautifully.', words: ['The', 'flowers', 'are', 'blooming', 'beautifully.'], lang: 'en' },
    { sentence: 'She wears a blue dress today.', words: ['She', 'wears', 'a', 'blue', 'dress', 'today.'], lang: 'en' },
    { sentence: 'The bus arrives at eight o\'clock.', words: ['The', 'bus', 'arrives', 'at', 'eight', 'o\'clock.'], lang: 'en' },
    { sentence: 'I listen to music when I study.', words: ['I', 'listen', 'to', 'music', 'when', 'I', 'study.'], lang: 'en' },
    { sentence: 'The library has many interesting books.', words: ['The', 'library', 'has', 'many', 'interesting', 'books.'], lang: 'en' },
    { sentence: 'My father drives to work every day.', words: ['My', 'father', 'drives', 'to', 'work', 'every', 'day.'], lang: 'en' },
    { sentence: 'אני אוהב ללמוד אנגלית.', words: ['אני', 'אוהב', 'ללמוד', 'אנגלית.'], lang: 'he' },
    { sentence: 'המורה מסבירה את השיעור בבירור.', words: ['המורה', 'מסבירה', 'את', 'השיעור', 'בבירור.'], lang: 'he' },
    { sentence: 'אנחנו הולכים לפארק מחר.', words: ['אנחנו', 'הולכים', 'לפארק', 'מחר.'], lang: 'he' },
    { sentence: 'המחשב עובד בצורה מושלמת.', words: ['המחשב', 'עובד', 'בצורה', 'מושלמת.'], lang: 'he' },
    { sentence: 'אני שותה קפה כל בוקר.', words: ['אני', 'שותה', 'קפה', 'כל', 'בוקר.'], lang: 'he' },
    { sentence: 'הפרחים פורחים בצורה יפה.', words: ['הפרחים', 'פורחים', 'בצורה', 'יפה.'], lang: 'he' },
    { sentence: 'היא לובשת שמלה כחולה היום.', words: ['היא', 'לובשת', 'שמלה', 'כחולה', 'היום.'], lang: 'he' },
    { sentence: 'האוטובוס מגיע בשמונה.', words: ['האוטובוס', 'מגיע', 'בשמונה.'], lang: 'he' },
    { sentence: 'אני מאזין למוזיקה כשאני לומד.', words: ['אני', 'מאזין', 'למוזיקה', 'כשאני', 'לומד.'], lang: 'he' },
    { sentence: 'הספרייה יש הרבה ספרים מעניינים.', words: ['הספרייה', 'יש', 'הרבה', 'ספרים', 'מעניינים.'], lang: 'he' },
    { sentence: 'אבא שלי נוסע לעבודה כל יום.', words: ['אבא', 'שלי', 'נוסע', 'לעבודה', 'כל', 'יום.'], lang: 'he' },
    { sentence: 'הילדים משחקים בשמחה.', words: ['הילדים', 'משחקים', 'בשמחה.'], lang: 'he' },
    { sentence: 'אמא שלי מבשלת אוכל טעים.', words: ['אמא', 'שלי', 'מבשלת', 'אוכל', 'טעים.'], lang: 'he' },
    { sentence: 'השמש זורחת בשמים בבירור.', words: ['השמש', 'זורחת', 'בשמים', 'בבירור.'], lang: 'he' },
    { sentence: 'המורה מסבירה את השיעור בבירור.', words: ['המורה', 'מסבירה', 'את', 'השיעור', 'בבירור.'], lang: 'he' },
  ],
  hard: [
    { sentence: 'The teacher is explaining the lesson.', words: ['The', 'teacher', 'is', 'explaining', 'the', 'lesson.'], lang: 'en' },
    { sentence: 'They are playing football in the park.', words: ['They', 'are', 'playing', 'football', 'in', 'the', 'park.'], lang: 'en' },
    { sentence: 'I have been studying English for three years.', words: ['I', 'have', 'been', 'studying', 'English', 'for', 'three', 'years.'], lang: 'en' },
    { sentence: 'The weather is becoming colder every day.', words: ['The', 'weather', 'is', 'becoming', 'colder', 'every', 'day.'], lang: 'en' },
    { sentence: 'My grandmother told me an interesting story.', words: ['My', 'grandmother', 'told', 'me', 'an', 'interesting', 'story.'], lang: 'en' },
    { sentence: 'The students are preparing for their final exam.', words: ['The', 'students', 'are', 'preparing', 'for', 'their', 'final', 'exam.'], lang: 'en' },
    { sentence: 'We should visit the museum during our vacation.', words: ['We', 'should', 'visit', 'the', 'museum', 'during', 'our', 'vacation.'], lang: 'en' },
    { sentence: 'The doctor recommended eating healthy food daily.', words: ['The', 'doctor', 'recommended', 'eating', 'healthy', 'food', 'daily.'], lang: 'en' },
    { sentence: 'I will be traveling to Europe next summer.', words: ['I', 'will', 'be', 'traveling', 'to', 'Europe', 'next', 'summer.'], lang: 'en' },
    { sentence: 'The construction workers are building a new bridge.', words: ['The', 'construction', 'workers', 'are', 'building', 'a', 'new', 'bridge.'], lang: 'en' },
    { sentence: 'Scientists discovered a new planet in our galaxy.', words: ['Scientists', 'discovered', 'a', 'new', 'planet', 'in', 'our', 'galaxy.'], lang: 'en' },
    { sentence: 'The restaurant serves delicious food from different countries.', words: ['The', 'restaurant', 'serves', 'delicious', 'food', 'from', 'different', 'countries.'], lang: 'en' },
    { sentence: 'My brother graduated from university last month.', words: ['My', 'brother', 'graduated', 'from', 'university', 'last', 'month.'], lang: 'en' },
    { sentence: 'The children were playing hide and seek in the garden.', words: ['The', 'children', 'were', 'playing', 'hide', 'and', 'seek', 'in', 'the', 'garden.'], lang: 'en' },
    { sentence: 'I have been working on this project for several weeks.', words: ['I', 'have', 'been', 'working', 'on', 'this', 'project', 'for', 'several', 'weeks.'], lang: 'en' },
    { sentence: 'המשפחה יושבת לאכול ארוחת ערב.', words: ['המשפחה', 'יושבת', 'לאכול', 'ארוחת', 'ערב.'], lang: 'he' },
    { sentence: 'הילדים בונים מגדל מחול.', words: ['הילדים', 'בונים', 'מגדל', 'מחול.'], lang: 'he' },
    { sentence: 'אני לומד אנגלית כבר שלוש שנים.', words: ['אני', 'לומד', 'אנגלית', 'כבר', 'שלוש', 'שנים.'], lang: 'he' },
    { sentence: 'המזג אויר נעשה קר יותר כל יום.', words: ['המזג', 'אויר', 'נעשה', 'קר', 'יותר', 'כל', 'יום.'], lang: 'he' },
    { sentence: 'סבתא שלי סיפרה לי סיפור מעניין.', words: ['סבתא', 'שלי', 'סיפרה', 'לי', 'סיפור', 'מעניין.'], lang: 'he' },
    { sentence: 'התלמידים מתכוננים לבחינה הסופית שלהם.', words: ['התלמידים', 'מתכוננים', 'לבחינה', 'הסופית', 'שלהם.'], lang: 'he' },
    { sentence: 'אנחנו צריכים לבקר במוזיאון במהלך החופשה.', words: ['אנחנו', 'צריכים', 'לבקר', 'במוזיאון', 'במהלך', 'החופשה.'], lang: 'he' },
    { sentence: 'הרופא המליץ לאכול אוכל בריא יומי.', words: ['הרופא', 'המליץ', 'לאכול', 'אוכל', 'בריא', 'יומי.'], lang: 'he' },
    { sentence: 'אני אסע לאירופה בקיץ הבא.', words: ['אני', 'אסע', 'לאירופה', 'בקיץ', 'הבא.'], lang: 'he' },
    { sentence: 'פועלי הבנייה בונים גשר חדש.', words: ['פועלי', 'הבנייה', 'בונים', 'גשר', 'חדש.'], lang: 'he' },
    { sentence: 'מדענים גילו כוכב לכת חדש בגלקסיה שלנו.', words: ['מדענים', 'גילו', 'כוכב', 'לכת', 'חדש', 'בגלקסיה', 'שלנו.'], lang: 'he' },
    { sentence: 'המסעדה מגישה אוכל טעים ממדינות שונות.', words: ['המסעדה', 'מגישה', 'אוכל', 'טעים', 'ממדינות', 'שונות.'], lang: 'he' },
    { sentence: 'אח שלי סיים את האוניברסיטה בחודש שעבר.', words: ['אח', 'שלי', 'סיים', 'את', 'האוניברסיטה', 'בחודש', 'שעבר.'], lang: 'he' },
    { sentence: 'הילדים שיחקו מחבואים בגן.', words: ['הילדים', 'שיחקו', 'מחבואים', 'בגן.'], lang: 'he' },
    { sentence: 'אני עובד על הפרויקט הזה כבר כמה שבועות.', words: ['אני', 'עובד', 'על', 'הפרויקט', 'הזה', 'כבר', 'כמה', 'שבועות.'], lang: 'he' },
    { sentence: 'המורה מסבירה את השיעור בצורה מפורטת.', words: ['המורה', 'מסבירה', 'את', 'השיעור', 'בצורה', 'מפורטת.'], lang: 'he' },
    { sentence: 'התלמידים לומדים מתמטיקה ברמה גבוהה.', words: ['התלמידים', 'לומדים', 'מתמטיקה', 'ברמה', 'גבוהה.'], lang: 'he' },
    { sentence: 'המשפחה נסעה לחופשה בחו"ל.', words: ['המשפחה', 'נסעה', 'לחופשה', 'בחו"ל.'], lang: 'he' },
    { sentence: 'הרופא בדק את המטופל בקפידה.', words: ['הרופא', 'בדק', 'את', 'המטופל', 'בקפידה.'], lang: 'he' },
    { sentence: 'הפועלים בנו בניין חדש במרכז העיר.', words: ['הפועלים', 'בנו', 'בניין', 'חדש', 'במרכז', 'העיר.'], lang: 'he' },
  ],
};

const DIFFICULTIES = [
  { key: 'easy', label: 'קל', count: 10 },
  { key: 'medium', label: 'בינוני', count: 15 },
  { key: 'hard', label: 'קשה', count: 20 },
];

const SHOP_ITEMS = [
  { id: 'hint', name: 'רמז', icon: '💡' },
  { id: 'extra_time', name: 'תוספת זמן', icon: '⏰' },
  { id: 'skip', name: 'דילוג', icon: '⏭️' },
];

function shuffle(arr: string[]) {
  // Fisher-Yates shuffle algorithm
  const shuffled = arr.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Drag & Drop helpers
function arrayMove<T>(arr: T[], from: number, to: number) {
  const copy = arr.slice();
  const [removed] = copy.splice(from, 1);
  copy.splice(to, 0, removed);
  return copy;
}

function SentenceBuilderGame() {
  const searchParams = useSearchParams();
  const levelParam = searchParams?.get('level') || 'easy';
  
  const levelMap: Record<string, string> = {
    beginner: 'easy',
    intermediate: 'medium',
    advanced: 'hard',
    extreme: 'hard',
    easy: 'easy',
    medium: 'medium',
    hard: 'hard',
  };
  
  const [difficulty, setDifficulty] = useState(levelMap[levelParam] || 'easy');
  const [questions, setQuestions] = useState(QUESTION_BANK['easy']);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [highScore, setHighScore] = useState<number | null>(null);
  const [newHighScore, setNewHighScore] = useState(false);
  const correctAudio = useRef<HTMLAudioElement | null>(null);
  const wrongAudio = useRef<HTMLAudioElement | null>(null);
  const finishAudio = useRef<HTMLAudioElement | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [hiddenWords, setHiddenWords] = useState<string[]>([]);
  const [timer, setTimer] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  // Drag & Drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState<{score: number, name: string, date: string, time: number}[]>([]);
  const [playerImg, setPlayerImg] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [activeItems, setActiveItems] = useState<string[]>([]);

  useEffect(() => {
    const allQuestions = QUESTION_BANK[difficulty];
    const difficultyConfig = DIFFICULTIES.find(d => d.key === difficulty);
    const questionCount = difficultyConfig?.count || allQuestions.length;
    
    // בחירת שאלות רנדומליות לפי כמות הרמה
    const selectedQuestions = allQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);
    
    setQuestions(selectedQuestions);
    setCurrent(0);
    setSelected([]);
    setScore(0);
    setFinished(false);
    setShowResult(false);
    setShuffled(shuffle(selectedQuestions[0].words));
    setNewHighScore(false);
    setHintUsed(false);
    setHiddenWords([]);
    setTimer(0);
    setShowTransition(false);
    setShowCorrect(false);
    const hs = localStorage.getItem(`sentence-builder-highscore-${difficulty}`);
    setHighScore(hs ? parseInt(hs) : null);
    setAttempts(Number(localStorage.getItem(`sb-attempts-${difficulty}`) || 0));
    setTotalTime(Number(localStorage.getItem(`sb-totalTime-${difficulty}`) || 0));
    setCorrectCount(Number(localStorage.getItem(`sb-correctCount-${difficulty}`) || 0));
    const lb = localStorage.getItem(`sb-leaderboard-${difficulty}`);
    setLeaderboard(lb ? JSON.parse(lb) : []);
    setPlayerImg(localStorage.getItem('sb-playerImg') || '');
    setPlayerName(localStorage.getItem('sb-playerName') || '');
    try {
      const inv = JSON.parse(localStorage.getItem('quiz-inventory') || '{}');
      setInventory(inv);
    } catch {}
  }, [difficulty]);

  useEffect(() => {
    const mappedLevel = levelMap[levelParam] || 'easy';
    setDifficulty(mappedLevel);
  }, [levelParam]);

  useEffect(() => {
    setShuffled(shuffle(questions[current].words));
    setSelected([]);
    setShowResult(false);
    setHintUsed(false);
    setHiddenWords([]);
    setTimer(0);
    setShowTransition(false);
    setShowCorrect(false);
  }, [current, questions]);

  useEffect(() => {
    if (!finished) {
      const interval = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [finished, current]);

  useEffect(() => {
    if (finished && finishAudio.current) {
      finishAudio.current.currentTime = 0;
      finishAudio.current.play();
    }
  }, [finished]);

  useEffect(() => {
    if (finished) {
      if (!highScore || score > highScore) {
        setNewHighScore(true);
        setHighScore(score);
        localStorage.setItem(`sentence-builder-highscore-${difficulty}`, score.toString());
        setTimeout(() => setNewHighScore(false), 3500);
      }
      localStorage.setItem(`sb-attempts-${difficulty}`, String(attempts + 1));
      localStorage.setItem(`sb-totalTime-${difficulty}`, String(totalTime + timer * questions.length));
      localStorage.setItem(`sb-correctCount-${difficulty}`, String(correctCount + (score > 0 ? 1 : 0)));
      
      // עדכון ניקוד במסד נתונים - השתמש ב-update-stats API
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        
        // הגבל את הניקוד המקסימלי למשחק - מקסימום 1000 נקודות
        const maxScorePerGame = 1000;
        const cappedScore = Math.min(score, maxScorePerGame);
        
        // עדכון ניקוד במסד נתונים דרך update-stats API
        fetch('/api/games/update-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            gameName: 'sentence-builder',
            score: cappedScore,
            won: score > 0,
            correctAnswers: score > 0 ? 1 : 0,
            totalQuestions: 1
          })
        }).then(async (response) => {
          if (response.ok) {
            const data = await response.json();
            // עדכון localStorage עם הנתונים המעודכנים
            if (data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          }
        }).catch(error => {
          console.error('Error updating stats:', error);
        });
      }
      
      // Leaderboard
      if (score > 0) {
        const entry = { score, name: playerName || 'שחקן', date: new Date().toLocaleDateString(), time: timer * questions.length };
        const lb = leaderboard.concat(entry).sort((a, b) => b.score - a.score).slice(0, 5);
        setLeaderboard(lb);
        localStorage.setItem(`sb-leaderboard-${difficulty}`, JSON.stringify(lb));
      }
    }
  }, [finished, score, highScore, difficulty, attempts, totalTime, timer, questions, correctCount, playerName, leaderboard]);

  useEffect(() => {
    function syncInventory() {
      try {
        const inv = JSON.parse(localStorage.getItem('shop-inventory') || '{}');
        setInventory(inv);
      } catch {}
    }
    window.addEventListener('storage', syncInventory);
    window.addEventListener('focus', syncInventory);
    return () => {
      window.removeEventListener('storage', syncInventory);
      window.removeEventListener('focus', syncInventory);
    };
  }, []);

  const handleSelect = (word: string) => {
    if (selected.includes(word) || hiddenWords.includes(word)) return;
    setSelected([...selected, word]);
  };

  const handleRemoveSelected = (idx: number) => {
    setSelected(selected.filter((_, i) => i !== idx));
  };

  const handleHint = () => {
    if (hintUsed || finished) return;
    const correctWords = questions[current].words;
    const wrongs = shuffled.filter(w => !correctWords.includes(w) && !selected.includes(w) && !hiddenWords.includes(w));
    if (wrongs.length > 0) {
      setHiddenWords([...hiddenWords, wrongs[0]]);
      setHintUsed(true);
    }
  };

  const handleCheck = () => {
    const correct = selected.join(' ') === questions[current].words.join(' ');
    setShowResult(true);
    if (correct) {
      const bonus = Math.max(0, 5 - timer * 0.5);
      setScore((s) => s + 10 + Math.round(bonus));
      if (correctAudio.current) {
        correctAudio.current.currentTime = 0;
        correctAudio.current.play();
      }
    } else {
      setScore((s) => Math.max(0, s - 2)); // עונש של 2 נקודות על טעות
      setShowCorrect(true);
      if (wrongAudio.current) {
        wrongAudio.current.currentTime = 0;
        wrongAudio.current.play();
      }
    }
    setTimeout(() => {
      setShowResult(false);
      setShowCorrect(false);
      setTimer(0);
      setHintUsed(false);
      setHiddenWords([]);
      if (current === questions.length - 1) {
        setShowTransition(true);
        setTimeout(() => {
          setShowTransition(false);
          setFinished(true);
        }, 400);
      } else {
        setShowTransition(true);
        setTimeout(() => {
          setShowTransition(false);
          setCurrent((c) => c + 1);
        }, 400);
      }
    }, 1400);
  };

  const restart = () => {
    setCurrent(0);
    setSelected([]);
    setScore(0);
    setFinished(false);
    setShowResult(false);
    setShuffled(shuffle(questions[0].words));
    setNewHighScore(false);
  };

  const getMedal = () => {
    if (score >= questions.length * 100) {
      return { icon: '🥇', label: 'מצוין!' };
    } else if (score >= questions.length * 80) {
      return { icon: '🥈', label: 'כל הכבוד!' };
    } else if (score > 0) {
      return { icon: '🥉', label: 'יפה מאוד!' };
    } else {
      return { icon: '🎯', label: 'נסה שוב!' };
    }
  };

  // handle drag events for selected words
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent<HTMLSpanElement>, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setSelected((prev) => arrayMove(prev, draggedIdx, idx));
    setDraggedIdx(idx);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  function useShopItem(itemId: string) {
    if (!inventory[itemId] || inventory[itemId] <= 0) return;
    setInventory(inv => {
      const newInv = { ...inv, [itemId]: inv[itemId] - 1 };
      localStorage.setItem('quiz-inventory', JSON.stringify(newInv));
      return newInv;
    });
    setActiveItems(items => [...items, itemId]);
    switch (itemId) {
      case 'hint':
        handleHint();
        break;
      case 'extra_time':
        setTimer(t => t - 10); // subtract 10 seconds (adds time)
        break;
      case 'skip':
        if (current < questions.length - 1) {
          setCurrent(c => c + 1);
          setSelected([]);
          setShowResult(false);
          setHintUsed(false);
          setHiddenWords([]);
          setTimer(0);
        } else {
          setFinished(true);
        }
        break;
      case 'score_boost':
        // Add bonus points for current question
        setScore(prev => prev + 50);
        break;
    }
    setTimeout(() => setActiveItems(items => items.filter(i => i !== itemId)), 1000);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-400 via-green-200 to-blue-700 flex flex-col items-center justify-center p-4">
      <audio ref={correctAudio} src="https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b7bfa.mp3" preload="auto" />
      <audio ref={wrongAudio} src="https://cdn.pixabay.com/audio/2022/03/16/audio_115cfae7b7.mp3" preload="auto" />
      <audio ref={finishAudio} src="https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b7bfa.mp3" preload="auto" />
      {newHighScore && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-yellow-400 text-white text-2xl font-bold px-8 py-4 rounded-full shadow-xl border-4 border-yellow-600">
            שיא חדש!
          </div>
        </div>
      )}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white bg-opacity-70 rounded-full px-4 py-2 shadow-lg z-10">
        {playerImg ? (
          <img src={playerImg} alt="avatar" className="w-8 h-8 rounded-full" />
        ) : (
          <span className="text-2xl">👤</span>
        )}
        <span className="font-bold text-blue-700">{playerName || 'שחקן'}</span>
      </div>
      <div className="max-w-xl w-full mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 text-center mb-6 drop-shadow-lg">סדר את המשפט</h1>
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.key}
              onClick={() => setDifficulty(d.key)}
              className={`px-6 py-2 rounded-full font-bold shadow transition-all duration-200 text-lg
                ${difficulty === d.key ? 'bg-blue-600 text-white scale-105' : 'bg-white text-blue-700 hover:bg-blue-100'}`}
              disabled={difficulty === d.key}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center mb-6">
          <div className="bg-blue-100 rounded-xl px-6 py-2 text-lg font-bold text-blue-700 shadow">ניקוד: {score}</div>
          <div className="bg-green-100 rounded-xl px-6 py-2 text-lg font-bold text-green-700 shadow">שאלה: {current + 1}/{questions.length}</div>
          <div className="bg-pink-100 rounded-xl px-6 py-2 text-lg font-bold text-pink-700 shadow">זמן: {timer} שנ׳</div>
          <div className="flex flex-wrap gap-2 ml-2">
            {/* כפתור רמז */}
            {inventory['hint'] > 0 && !hintUsed && (
              <button
                onClick={() => useShopItem('hint')}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow hover:from-orange-500 hover:to-yellow-400 transition-all duration-200 text-sm"
              >
                💡 רמז ({inventory['hint']})
              </button>
            )}
            {/* כפתור דילוג */}
            {inventory['skip'] > 0 && (
              <button
                onClick={() => useShopItem('skip')}
                className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-full font-bold shadow hover:from-blue-600 hover:to-blue-400 transition-all duration-200 text-sm"
              >
                ⏭️ דלג ({inventory['skip']})
              </button>
            )}
            {/* כפתור תוספת זמן */}
            {inventory['extra_time'] > 0 && (
              <button
                onClick={() => useShopItem('extra_time')}
                className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-full font-bold shadow hover:from-green-600 hover:to-green-400 transition-all duration-200 text-sm"
              >
                ⏰ זמן ({inventory['extra_time']})
              </button>
            )}
            {/* כפתור בונוס ניקוד */}
            {inventory['score_boost'] > 0 && (
              <button
                onClick={() => useShopItem('score_boost')}
                className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-4 py-2 rounded-full font-bold shadow hover:from-purple-600 hover:to-purple-400 transition-all duration-200 text-sm"
              >
                🚀 בונוס ({inventory['score_boost']})
              </button>
            )}
          </div>
          {highScore !== null && (
            <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold shadow ml-2">
              שיא אישי: {highScore} נק׳
            </span>
          )}
        </div>
        {!finished ? (
          <div className={`transition-opacity duration-400 ${showTransition ? 'opacity-0' : 'opacity-100'}`}> 
            <div className="flex flex-col items-center mb-6">
              <span className="mb-2">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 20.5V22h1.5l11.06-11.06-1.5-1.5L2 20.5z" fill="#2563eb"/>
                  <path d="M21.71 6.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#60a5fa"/>
                </svg>
              </span>
              <div className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-4 bg-blue-50 rounded-xl px-4 py-3 shadow">
                סדר את המילים למשפט נכון
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-4 min-h-[48px]">
              {selected.map((word, idx) => (
                <span
                  key={idx}
                  className={`bg-green-200 text-green-900 px-4 py-2 rounded-xl font-bold text-lg shadow animate-fade-in cursor-pointer hover:bg-green-300 ${draggedIdx === idx ? 'ring-4 ring-blue-400' : ''}`}
                  onClick={() => handleRemoveSelected(idx)}
                  title="הסר מילה"
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={() => setDraggedIdx(idx)}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (target && target instanceof HTMLSpanElement && target.dataset.idx) {
                      const overIdx = Number(target.dataset.idx);
                      if (overIdx !== idx) {
                        setSelected((prev) => arrayMove(prev, idx, overIdx));
                        setDraggedIdx(overIdx);
                      }
                    }
                  }}
                  onTouchEnd={handleDragEnd}
                  data-idx={idx}
                >
                  {word}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {shuffled.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(word)}
                  className={`px-6 py-3 rounded-xl font-bold text-lg shadow transition-all duration-200
                    ${selected.includes(word) || hiddenWords.includes(word) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105'}`}
                  disabled={selected.includes(word) || hiddenWords.includes(word)}
                >
                  {word}
                </button>
              ))}
            </div>
            <button
              onClick={handleCheck}
              disabled={selected.length !== questions[current].words.length}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mb-4 disabled:opacity-50"
            >
              בדוק
            </button>
            {showResult && (
              <div className="text-center mb-4 animate-fade-in">
                {selected.join(' ') === questions[current].words.join(' ') ? (
                  <span className="inline-block bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow animate-bounce">תשובה נכונה! 🎉</span>
                ) : (
                  <span className="inline-block bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow animate-shake">נסה שוב</span>
                )}
              </div>
            )}
            {showCorrect && (
              <div className="text-center mb-2 animate-fade-in">
                <span className="inline-block bg-blue-200 text-blue-900 px-4 py-2 rounded-full font-bold shadow">התשובה הנכונה: {questions[current].sentence}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center animate-fade-in">
            <div className="flex flex-col items-center mb-4">
              <span className="text-5xl mb-2">{getMedal().icon}</span>
              <div className="text-2xl font-bold text-blue-700">{getMedal().label}</div>
            </div>
            <div className="text-lg font-bold text-blue-700 mb-2">ניקוד סופי: {score}</div>
            <div className="mb-6">
              <div className="text-lg font-bold text-gray-700 mb-2">המשפטים שלמדת:</div>
              <ul className="text-right space-y-2">
                {questions.map((q, idx) => (
                  <li key={idx} className="bg-blue-50 rounded-lg px-4 py-2 shadow flex flex-wrap items-center justify-between">
                    <span className="font-bold text-blue-700">{q.sentence}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <div className="text-lg font-bold text-gray-700 mb-2">טבלת שיאים ({DIFFICULTIES.find(d=>d.key===difficulty)?.label}):</div>
              <ul className="space-y-1 mb-2">
                {leaderboard.length === 0 && <li className="text-gray-400">אין שיאים עדיין</li>}
                {leaderboard.map((entry, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-blue-50 rounded-lg px-4 py-1 shadow">
                    <span className="font-bold text-blue-700">{idx+1}. {entry.name}</span>
                    <span className="text-blue-900">{entry.score} נק׳</span>
                    <span className="text-xs text-gray-500">{entry.date}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-center gap-2 mb-2">
                <input
                  className="border rounded px-2 py-1 text-sm"
                  placeholder="הכנס שם (לא חובה)"
                  value={playerName}
                  onChange={e => { setPlayerName(e.target.value); localStorage.setItem('sb-playerName', e.target.value); }}
                  maxLength={12}
                />
                <span className="text-xs text-gray-400">שם יוצג בשיאים</span>
              </div>
            </div>
            <div className="mb-6">
              <div className="text-lg font-bold text-gray-700 mb-2">הסטטיסטיקות שלך ({DIFFICULTIES.find(d=>d.key===difficulty)?.label}):</div>
              <div className="flex flex-col gap-1 items-center">
                <span>מספר ניסיונות: <b>{attempts + 1}</b></span>
                <span>אחוזי הצלחה: <b>{((correctCount + (score > 0 ? 1 : 0)) / (attempts + 1) * 100).toFixed(0)}%</b></span>
                <span>זמן ממוצע: <b>{((totalTime + timer * questions.length) / (attempts + 1)).toFixed(1)} שנ׳</b></span>
              </div>
            </div>
            <button onClick={restart} className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4">
              שחק שוב
            </button>
          </div>
        )}
      </div>
      <div className="fixed bottom-4 left-4 flex flex-col gap-2 z-50">
        {SHOP_ITEMS.map(item => (
          inventory[item.id] > 0 && !finished && (
            <button
              key={item.id}
              onClick={() => useShopItem(item.id)}
              disabled={activeItems.includes(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg text-lg
                ${activeItems.includes(item.id) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-300 to-blue-200 text-blue-900 hover:from-blue-400 hover:to-green-200'}`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span>{item.name}</span>
              <span className="text-sm">({inventory[item.id]})</span>
            </button>
          )
        ))}
      </div>
    </main>
  );
}

export default function SentenceBuilderGameWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SentenceBuilderGame />
    </Suspense>
  );
} 