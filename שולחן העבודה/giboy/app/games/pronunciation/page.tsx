"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation';

type Question = {
  id: number;
  lang: string;
  category: string;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
  link?: string;
};

const QUESTIONS = [
  // Grammar
  { id: 1, lang: "en", category: "grammar", text: "Choose the correct word: 'She ____ to school every day.'", options: ["go", "goes", "going", "went"], answer: 1, explanation: "With he/she/it, we add -s to the verb in present simple." },
  { id: 2, lang: "en", category: "grammar", text: "Which is the past tense of 'run'?", options: ["ran", "runned", "running", "runs"], answer: 0, explanation: "The past tense of 'run' is 'ran'." },
  { id: 3, lang: "en", category: "grammar", text: "What is the plural of 'child'?", options: ["childs", "children", "childes", "childrens"], answer: 1, explanation: "The plural of 'child' is 'children'." },
  // Vocabulary
  { id: 10, lang: "en", category: "vocab", text: "Which word means 'happy'?", options: ["sad", "angry", "joyful", "tired"], answer: 2, explanation: "'Joyful' means 'happy'." },
  { id: 11, lang: "en", category: "vocab", text: "What is the opposite of 'hot'?", options: ["cold", "warm", "cool", "boiling"], answer: 0, explanation: "The opposite of 'hot' is 'cold'." },
  // Reading
  { id: 20, lang: "en", category: "reading", text: "Read: 'Tom has a red ball.' What color is Tom's ball?", options: ["blue", "green", "red", "yellow"], answer: 2, explanation: "The ball is red." },
  // Holidays
  { id: 30, lang: "en", category: "holidays", text: "Which holiday is in December?", options: ["Easter", "Hanukkah", "Passover", "Sukkot"], answer: 1, explanation: "Hanukkah is in December." },
  // Nature
  { id: 40, lang: "en", category: "nature", text: "Which is a tree?", options: ["rose", "oak", "carrot", "cat"], answer: 1, explanation: "Oak is a tree." },
  // Technology
  { id: 50, lang: "en", category: "technology", text: "Which device is used to call someone?", options: ["phone", "book", "pen", "table"], answer: 0, explanation: "A phone is used to call." },
  // Emotions
  { id: 60, lang: "en", category: "emotions", text: "Which face shows sadness?", options: ["😊", "😢", "😡", "😃"], answer: 1, explanation: "😢 is sad." },
  // Transport
  { id: 70, lang: "en", category: "transport", text: "Which is a means of transport?", options: ["bus", "apple", "shoe", "book"], answer: 0, explanation: "Bus is a means of transport." },
  // Animals
  { id: 80, lang: "en", category: "animals", text: "Which animal barks?", options: ["Cat", "Dog", "Cow", "Bird"], answer: 1, explanation: "Dogs bark." },
  // Food
  { id: 90, lang: "en", category: "food", text: "Which is a fruit?", options: ["Carrot", "Apple", "Potato", "Lettuce"], answer: 1, explanation: "Apple is a fruit." },
  // School
  { id: 100, lang: "en", category: "school", text: "Who teaches students?", options: ["doctor", "teacher", "driver", "chef"], answer: 1, explanation: "A teacher teaches students." },
  // Family
  { id: 110, lang: "en", category: "family", text: "Who is your mother's mother?", options: ["aunt", "grandmother", "sister", "cousin"], answer: 1, explanation: "Grandmother is your mother's mother." },
  // Health
  { id: 120, lang: "en", category: "health", text: "Who helps sick people?", options: ["teacher", "doctor", "driver", "chef"], answer: 1, explanation: "A doctor helps sick people." },
  // Sports
  { id: 130, lang: "en", category: "sports", text: "Which sport uses a racket?", options: ["Soccer", "Tennis", "Basketball", "Swimming"], answer: 1, explanation: "Tennis uses a racket." },
  // Colors
  { id: 140, lang: "en", category: "colors", text: "What color do you get by mixing red and blue?", options: ["Green", "Purple", "Orange", "Yellow"], answer: 1, explanation: "Red + Blue = Purple." },
  // Hebrew - Grammar
  { id: 201, lang: "he", category: "grammar", text: "בחר את המילה הנכונה: 'היא ____ לבית הספר כל יום.'", options: ["הולך", "הולכת", "הולכים", "הולכות"], answer: 1, explanation: "הנושא הוא נקבה יחידה, לכן הולכת." },
  { id: 202, lang: "he", category: "grammar", text: "מה צורת העבר של 'רץ'?", options: ["רץ", "רצה", "רצים", "רצות"], answer: 0, explanation: "'רץ' היא גם צורת עבר וגם הווה." },
  // Hebrew - Vocabulary
  { id: 210, lang: "he", category: "vocab", text: "מה ההפך מ'חם'?", options: ["קר", "חמים", "רותח", "קיץ"], answer: 0, explanation: "ההפך מ'חם' הוא 'קר'." },
  // Hebrew - Reading
  { id: 220, lang: "he", category: "reading", text: "קרא: 'החתול יושב על הכיסא.' איפה החתול?", options: ["על השולחן", "על הכיסא", "על המיטה", "על הרצפה"], answer: 1, explanation: "החתול על הכיסא." },
  // Hebrew - Holidays
  { id: 230, lang: "he", category: "holidays", text: "איזה חג חל בדצמבר?", options: ["פסח", "חנוכה", "סוכות", "פורים"], answer: 1, explanation: "חנוכה בדצמבר." },
  // Hebrew - Nature
  { id: 240, lang: "he", category: "nature", text: "איזה עץ הוא עץ?", options: ["ורד", "אלון", "גזר", "חתול"], answer: 1, explanation: "אלון הוא עץ." },
  // Hebrew - Technology
  { id: 250, lang: "he", category: "technology", text: "באיזה מכשיר מתקשרים?", options: ["טלפון", "ספר", "עט", "שולחן"], answer: 0, explanation: "טלפון משמש לתקשורת." },
  // Hebrew - Emotions
  { id: 260, lang: "he", category: "emotions", text: "איזה פרצוף מראה עצב?", options: ["😊", "😢", "😡", "😃"], answer: 1, explanation: "😢 זה עצוב." },
  // Hebrew - Transport
  { id: 270, lang: "he", category: "transport", text: "מהו אמצעי תחבורה?", options: ["אוטובוס", "תפוח", "נעל", "ספר"], answer: 0, explanation: "אוטובוס הוא אמצעי תחבורה." },
  // Hebrew - Animals
  { id: 280, lang: "he", category: "animals", text: "איזה בעל חיים נובח?", options: ["חתול", "כלב", "פרה", "ציפור"], answer: 1, explanation: "כלב נובח." },
  // Hebrew - Food
  { id: 290, lang: "he", category: "food", text: "מהו פרי?", options: ["גזר", "תפוח", "תפוח אדמה", "חסה"], answer: 1, explanation: "תפוח הוא פרי." },
  // Hebrew - School
  { id: 300, lang: "he", category: "school", text: "מי מלמד תלמידים?", options: ["רופא", "מורה", "נהג", "טבח"], answer: 1, explanation: "מורה מלמד תלמידים." },
  // Hebrew - Family
  { id: 310, lang: "he", category: "family", text: "מי אמא של אמא שלך?", options: ["דודה", "סבתא", "אחות", "בת דודה"], answer: 1, explanation: "סבתא היא אמא של אמא." },
  // Hebrew - Health
  { id: 320, lang: "he", category: "health", text: "מי עוזר לאנשים חולים?", options: ["מורה", "רופא", "נהג", "טבח"], answer: 1, explanation: "רופא עוזר לאנשים חולים." },
  // Hebrew - Sports
  { id: 330, lang: "he", category: "sports", text: "איזה ספורט משחקים עם מחבט?", options: ["כדורגל", "טניס", "כדורסל", "שחייה"], answer: 1, explanation: "טניס משחקים עם מחבט." },
  // Hebrew - Colors
  { id: 340, lang: "he", category: "colors", text: "איזה צבע מתקבל מערבוב אדום וכחול?", options: ["ירוק", "סגול", "כתום", "צהוב"], answer: 1, explanation: "אדום וכחול יוצרים סגול." },
];

const difficulties = [
  { key: "easy", label: "קל", count: 5 },
  { key: "medium", label: "בינוני", count: 10 },
  { key: "hard", label: "קשה", count: 15 },
  { key: "veryhard", label: "מאוד קשה", count: 20 },
];

const levelMap = {
  beginner: 'easy',
  intermediate: 'medium',
  advanced: 'hard',
  extreme: 'hard',
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
};

const CATEGORIES = [
  { key: "all", label: "הכל", icon: "🌈" },
  { key: "grammar", label: "דקדוק", icon: "📚" },
  { key: "geography", label: "גיאוגרפיה", icon: "🌍" },
  { key: "animals", label: "בעלי חיים", icon: "🐾" },
  { key: "colors", label: "צבעים", icon: "🎨" },
  { key: "food", label: "אוכל", icon: "🍎" },
  { key: "sports", label: "ספורט", icon: "🏅" },
  { key: "science", label: "מדע", icon: "🔬" },
];

function getMistakeStats() {
  try {
    return JSON.parse(localStorage.getItem('mixed-mistakes') || '{}');
  } catch {
    return {};
  }
}
function addMistake(id: string) {
  const stats = getMistakeStats();
  stats[id] = (stats[id] || 0) + 1;
  localStorage.setItem('mixed-mistakes', JSON.stringify(stats));
}
function pickQuestions(all: Question[], lang: string, count: number, category?: string, difficulty?: string) {
  let pool = all.filter(q => q.lang === lang);
  if (category && category !== "all") pool = pool.filter(q => q.category === category);
  const stats = getMistakeStats();
  const sorted = [...pool].sort((a: Question, b: Question) => (stats[b.id] || 0) - (stats[a.id] || 0));
  const boosted = sorted.filter(q => stats[q.id] > 0).slice(0, 5);
  const rest = pool.filter(q => !boosted.includes(q));
  const randomRest = rest.sort(() => Math.random() - 0.5).slice(0, count - boosted.length);
  return [...boosted, ...randomRest].sort(() => Math.random() - 0.5);
}

const getInitialTime = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 60;
    case 'medium': return 45;
    case 'hard': return 30;
    case 'veryhard': return 20;
    default: return 60;
  }
};

export default function MixedQuizGame() {
  const [lang, setLang] = useState<'en' | 'he'>('en');
  const [difficulty, setDifficulty] = useState<string>('easy');
  const [category, setCategory] = useState<string>("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selected, setSelected] = useState<number|null>(null);
  const [feedback, setFeedback] = useState<string|null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [stats, setStats] = useState<{ total: number; correct: number; mistakes: number }>({ total: 0, correct: 0, mistakes: 0 });
  const [personalBest, setPersonalBest] = useState<{score: number, accuracy: number} | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const confettiRef = useRef<HTMLDivElement>(null);
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);
  const [categoryStats, setCategoryStats] = useState<Record<string, { total: number; correct: number }>>({});
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number }[]>([]);
  const [detailedResults, setDetailedResults] = useState<any[]>([]);
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);
  const [mistakeQuestions, setMistakeQuestions] = useState<Question[]>([]);
  const [practiceMistakes, setPracticeMistakes] = useState<boolean>(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translatingId, setTranslatingId] = useState<number|null>(null);
  const [countdown, setCountdown] = useState<number>(getInitialTime(difficulty));
  const [timeUp, setTimeUp] = useState<boolean>(false);
  const [showAddQ, setShowAddQ] = useState<boolean>(false);
  const [newQ, setNewQ] = useState<{ lang: string; category: string; text: string; options: string[]; answer: number; explanation: string; link: string }>({ lang: lang, category: 'other', text: '', options: ['', '', '', ''], answer: 0, explanation: '', link: '' });
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [marathon, setMarathon] = useState<boolean>(false);
  const [goldenIdx, setGoldenIdx] = useState<number|null>(null);
  const [bonus, setBonus] = useState<any>(null);

  useEffect(() => {
    const diff = difficulties.find(d => d.key === difficulty)!;
    setQuestions(pickQuestions(QUESTIONS, lang, diff.count, category));
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setShowExplanation(false);
    setFinished(false);
    setStats({ total: 0, correct: 0, mistakes: 0 });
    setTimer(0);
    try {
      const pb = JSON.parse(localStorage.getItem('mixed-best') || 'null');
      if (pb) setPersonalBest(pb);
    } catch {}
    const stats = JSON.parse(localStorage.getItem('category-stats') || '{}');
    setCategoryStats(stats);
    const lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    setLeaderboard(lb);
    const mistakes = JSON.parse(localStorage.getItem('mistake-questions') || '[]');
    setMistakeQuestions(mistakes);
    setCountdown(getInitialTime(difficulty));
    setTimeUp(false);
    if (questions.length > 0) setGoldenIdx(Math.floor(Math.random() * questions.length));
  }, [difficulty, lang, category]);

  useEffect(() => {
    if (feedback === 'correct' && confettiRef.current) {
      confettiRef.current.classList.add('show');
      setTimeout(() => confettiRef.current?.classList.remove('show'), 1200);
    }
  }, [feedback]);

  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [finished]);

  useEffect(() => {
    if (finished || timeUp) return;
    if (countdown <= 0) {
      setTimeUp(true);
      setFinished(true);
      return;
    }
    const interval = setInterval(() => setCountdown(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [finished, timeUp, countdown]);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    setStats(s => ({ ...s, total: s.total + 1 }));
    const now = Date.now();
    setQuestionTimes(qt => [...qt, now]);
    const q = questions[current];
    setDetailedResults(dr => [...dr, { ...q, selected: idx, correct: idx === q.answer, time: now }]);
    setCategoryStats(cs => {
      const cat = q.category || 'other';
      const prev = cs[cat] || { total: 0, correct: 0 };
      const updated = { total: prev.total + 1, correct: prev.correct + (idx === q.answer ? 1 : 0) };
      const newStats = { ...cs, [cat]: updated };
      localStorage.setItem('category-stats', JSON.stringify(newStats));
      return newStats;
    });
    if (idx !== q.answer) {
      setMistakeQuestions(mq => {
        const updated = [...mq, q];
        localStorage.setItem('mistake-questions', JSON.stringify(updated));
        return updated;
      });
      if (marathon) {
        setFinished(true);
        setFeedback('wrong');
        if (failAudio.current) {
          failAudio.current.currentTime = 0;
          failAudio.current.play();
        }
        return;
      }
    }
    const isGolden = current === goldenIdx;
    if (idx === q.answer) {
      setScore(s => s + (isGolden ? 20 : 10));
      setFeedback(isGolden ? 'golden' : 'correct');
      setStats(s => ({ ...s, correct: s.correct + 1 }));
      if (successAudio.current) {
        successAudio.current.currentTime = 0;
        successAudio.current.play();
      }
      maybeBonus();
      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
        setShowExplanation(false);
        if (current === questions.length - 1) setFinished(true);
        else setCurrent(c => c + 1);
      }, 1400);
    } else {
      addMistake(q.id.toString());
      setFeedback('wrong');
      setStats(s => ({ ...s, mistakes: s.mistakes + 1 }));
      if (failAudio.current) {
        failAudio.current.currentTime = 0;
        failAudio.current.play();
      }
      setTimeout(() => setFeedback(null), 1200);
    }
  }

  function restart() {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setShowExplanation(false);
    setFinished(false);
    setStats({ total: 0, correct: 0, mistakes: 0 });
  }

  useEffect(() => {
    if (!finished) return;
    const accuracy = stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0;
    if (!personalBest || score > personalBest.score || (score === personalBest.score && accuracy > personalBest.accuracy)) {
      const pb = { score, accuracy };
      setPersonalBest(pb);
      localStorage.setItem('mixed-best', JSON.stringify(pb));
    }
    const name = prompt('הכנס שם לדירוג (או השאר ריק):') || 'שחקן';
    const entry = { name, score };
    const lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    lb.push(entry);
    lb.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(lb));
    setLeaderboard(lb);
  }, [finished]);

  const isRTL = lang === 'he';
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;

  const speak = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = lang === 'he' ? 'he-IL' : 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  async function translateQuestion(id: number, text: string, lang: string) {
    setTranslatingId(id);
    try {
      const to = lang === 'he' ? 'en' : 'he';
      const res = await fetch(`/api/translate?text=${encodeURIComponent(text)}&from=${lang}&to=${to}`);
      const data = await res.json();
      setTranslations(t => ({ ...t, [id]: data.translation }));
    } catch {
      setTranslations(t => ({ ...t, [id]: 'שגיאה בתרגום' }));
    }
    setTranslatingId(null);
  }

  function getProgressIcon(accuracy: number) {
    if (accuracy >= 90) return '🥇';
    if (accuracy >= 75) return '🥈';
    if (accuracy >= 50) return '🥉';
    return '⭐';
  }

  function shareResult(score: number, accuracy: number) {
    const text = `הגעתי ל-${score} נק׳ ו-${accuracy}% הצלחה במשחק חידון מעורב!`;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'חידון מעורב', text, url });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
    }
  }

  function addUserQuestion() {
    if (!newQ.text.trim() || newQ.options.some(o => !o.trim())) return;
    const uq = [...userQuestions, { ...newQ, id: Date.now() }];
    setUserQuestions(uq);
    localStorage.setItem('user-questions', JSON.stringify(uq));
    setShowAddQ(false);
    setNewQ({ lang: lang, category: 'other', text: '', options: ['', '', '', ''], answer: 0, explanation: '', link: '' });
  }

  function maybeBonus() {
    if (Math.random() < 0.18) { // 18% סיכוי
      const type = Math.random() < 0.5 ? 'time' : 'score';
      setBonus(type);
      if (type === 'time') setCountdown(c => c + 10);
      else setScore(s => s + 10);
      setTimeout(() => setBonus(null), 2000);
    }
  }

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-4 ${isRTL ? 'rtl' : ''} bg-gradient-to-br from-blue-900 via-blue-700 to-purple-900`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div ref={confettiRef} className="confetti" />
      <div className="max-w-2xl w-full mx-auto bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 transition-all duration-700">
        <div className="w-full h-4 bg-blue-100 rounded-full mb-6 overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-700" style={{ width: `${progress}%` }} />
          <div className="absolute inset-0 flex items-center justify-center text-blue-700 font-bold text-sm">{Math.round(progress)}%</div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 text-center drop-shadow-lg flex items-center gap-4">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-4xl shadow-lg mr-2 animate-fade-in">❓</span>
            חידון מעורב
            <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xl shadow bg-gradient-to-r from-green-400 to-green-600 text-white ml-4`}>
              <span className="text-2xl">{lang === 'he' ? '🟣' : '🔵'}</span> {difficulties.find(d=>d.key===difficulty)?.label}
            </span>
          </h1>
        </div>
        <div className="flex gap-4 mb-4 justify-center">
          <button onClick={() => setLang('en')} className={`px-6 py-2 rounded-full font-bold shadow text-lg flex items-center gap-2 transition-all duration-200 ${lang==='en'?'bg-green-600 text-white scale-105':'bg-white text-green-700 hover:bg-green-100'}`}>🇬🇧 English</button>
          <button onClick={() => setLang('he')} className={`px-6 py-2 rounded-full font-bold shadow text-lg flex items-center gap-2 transition-all duration-200 ${lang==='he'?'bg-pink-600 text-white scale-105':'bg-white text-pink-700 hover:bg-pink-100'}`}>🇮🇱 עברית</button>
        </div>
        <div className="flex gap-4 mb-4 justify-center">
          {difficulties.map(d => (
            <button key={d.key} onClick={() => setDifficulty(d.key)} className={`px-4 py-2 rounded-full font-bold shadow text-md flex items-center gap-2 ${difficulty===d.key?'bg-blue-600 text-white scale-105':'bg-white text-blue-700 hover:bg-blue-100'}`}>{d.label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-2">
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setCategory(cat.key)} className={`px-4 py-2 rounded-full font-bold shadow text-md flex items-center gap-2 ${category===cat.key?'bg-blue-600 text-white scale-105':'bg-white text-blue-700 hover:bg-blue-100'}`}>
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
          <div className={`bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold shadow flex items-center gap-2 ${countdown <= 10 ? 'text-red-600' : 'text-blue-700'}`}>
            <span className="text-pink-500 text-2xl">⏰</span> זמן לאתגר: {countdown} שניות
          </div>
        </div>
        {timeUp && (
          <div className="text-center text-2xl font-bold text-red-600 mb-4 animate-fade-in">הזמן נגמר! נסה שוב את האתגר 🚨</div>
        )}
        {!finished && questions.length > 0 && (
          <>
            <div className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl shadow p-4 mb-4 text-xl font-bold text-blue-900 text-center animate-fade-in">
              {questions[current].text}
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {questions[current].options.map((opt, idx) => (
                <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null}
                  className={`w-full px-6 py-3 rounded-2xl font-bold text-lg shadow transition-all duration-200 border-2 flex items-center gap-2
                    ${selected === idx
                      ? idx === questions[current].answer
                        ? 'bg-green-200 border-green-500 text-green-900 scale-105'
                        : 'bg-red-200 border-red-500 text-red-900 shake'
                      : 'bg-white border-blue-200 text-blue-900 hover:bg-blue-50 hover:scale-105'}`}
                >{opt}</button>
              ))}
            </div>
            {feedback === 'correct' && (
              <div className="flex flex-col items-center justify-center animate-fade-in">
                <div className="bg-white border-2 border-green-400 rounded-2xl px-8 py-6 text-2xl font-bold text-green-700 shadow-lg flex items-center gap-2 mb-2">
                  <span>🎉</span> Correct! <span>🎉</span>
                </div>
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="flex flex-col items-center justify-center animate-fade-in">
                <div className="bg-white border-2 border-red-400 rounded-2xl px-8 py-6 text-2xl font-bold text-red-700 shadow-lg flex items-center gap-2 mb-2">
                  <span>❌</span> Incorrect <span>❌</span>
                </div>
              </div>
            )}
            {showExplanation && (
              <div className="bg-green-100 border-l-4 border-green-400 rounded-xl px-6 py-3 text-md font-bold text-green-900 shadow mb-2 animate-fade-in">
                {questions[current].explanation}
              </div>
            )}
            <div className="flex justify-center mt-4">
              {selected !== null && (
                <button onClick={() => {
                  setSelected(null);
                  setShowExplanation(false);
                  setFeedback(null);
                  if (current === questions.length - 1) setFinished(true);
                  else setCurrent(c => c + 1);
                }} className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-purple-400 hover:to-blue-400 transition-all duration-200 flex items-center gap-2"><span className="text-2xl">➡️</span> {lang==='he' ? 'לשאלה הבאה' : 'Next Question'}</button>
              )}
            </div>
            <div className="flex gap-2 justify-center mb-2">
              <button onClick={() => speak(questions[current].text, lang)} className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full font-bold flex items-center gap-1"><span>🔊</span> השמע</button>
              <button onClick={() => translateQuestion(questions[current].id, questions[current].text, lang)} className="bg-green-200 text-green-900 px-3 py-1 rounded-full font-bold flex items-center gap-1" disabled={translatingId===questions[current].id}>{translatingId===questions[current].id ? 'מתרגם...' : 'תרגם'}</button>
              {translations[questions[current].id] && (
                <span className="bg-yellow-100 text-yellow-900 px-2 py-1 rounded-full font-bold">{translations[questions[current].id]}</span>
              )}
            </div>
            {questions[current].link && (
              <a href={questions[current].link} target="_blank" rel="noopener noreferrer" className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full font-bold ml-2">למידע נוסף</a>
            )}
          </>
        )}
        {finished && (
          <div className="text-center mt-6 animate-fade-in">
            <div className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center gap-2"><span className="text-green-500 text-3xl">🏆</span> כל הכבוד! סיימת את החידון 🎉</div>
            <div className="text-lg font-bold text-green-700 mb-2 flex items-center justify-center gap-2"><span className="text-blue-500 text-2xl">★</span> ניקוד סופי: {score} | {stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0}% הצלחה</div>
            <div className="text-md font-bold text-purple-700 mb-2 flex items-center justify-center gap-2">{stats.correct} תשובות נכונות, {stats.mistakes} טעויות, {stats.total} שאלות</div>
            <button onClick={restart} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4 flex items-center gap-2"><span className="text-2xl">🔄</span> שחק שוב</button>
          </div>
        )}
        {mistakeQuestions.length > 0 && !practiceMistakes && (
          <button onClick={() => setPracticeMistakes(true)} className="bg-yellow-400 text-white px-4 py-2 rounded-full font-bold shadow mb-2">תרגל טעויות</button>
        )}
        {practiceMistakes && (
          <button onClick={() => setPracticeMistakes(false)} className="bg-blue-400 text-white px-4 py-2 rounded-full font-bold shadow mb-2">חזור לחידון רגיל</button>
        )}
        <div className="bg-white bg-opacity-80 rounded-xl p-4 mb-4">
          <div className="font-bold text-blue-700 mb-2">סטטיסטיקות לפי קטגוריה:</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryStats).map(([cat, stat]) => (
              <div key={cat} className="bg-blue-50 rounded px-3 py-1 flex items-center gap-2">
                <span>{CATEGORIES.find(c=>c.key===cat)?.icon || '❓'}</span>
                <span>{CATEGORIES.find(c=>c.key===cat)?.label || cat}</span>
                <span className="text-green-700">{stat.correct}/{stat.total} ({stat.total > 0 ? Math.round((stat.correct/stat.total)*100) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white bg-opacity-80 rounded-xl p-4 mb-4">
          <div className="font-bold text-purple-700 mb-2">דירוג שחקנים (מקומי):</div>
          <ol className="list-decimal ml-6">
            {leaderboard.slice(0,5).map((entry,i) => (
              <li key={i}>{entry.name || 'שחקן'}: {entry.score} נק׳</li>
            ))}
          </ol>
        </div>
        {finished && detailedResults.length > 0 && (
          <div className="bg-white bg-opacity-90 rounded-xl p-4 mt-4">
            <div className="font-bold text-blue-700 mb-2">פירוט תשובות:</div>
            <ol className="list-decimal ml-6">
              {detailedResults.map((res,i) => (
                <li key={i} className={res.correct ? 'text-green-700' : 'text-red-700'}>
                  <span>{res.text}</span> - <span>{res.options[res.selected]}</span> {res.correct ? '✔️' : '❌'}
                  <span className="ml-2 text-gray-500">({res.time && i>0 ? ((res.time-detailedResults[i-1].time)/1000).toFixed(1)+' שניות' : ''})</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        <div className="flex gap-2 mb-2 justify-center">
          <button onClick={() => setMarathon(m => !m)} className={`px-4 py-2 rounded-full font-bold shadow text-md ${marathon?'bg-yellow-500 text-white':'bg-white text-yellow-700 hover:bg-yellow-100'}`}>{marathon ? 'מצב רגיל' : 'מצב מרתון'}</button>
          <button onClick={() => setShowAddQ(true)} className="px-4 py-2 rounded-full font-bold shadow text-md bg-green-500 text-white">➕ הוסף שאלה</button>
          <button onClick={() => shareResult(score, stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0)} className="px-4 py-2 rounded-full font-bold shadow text-md bg-blue-500 text-white">שתף תוצאה</button>
        </div>
        {showAddQ && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col gap-4">
              <h2 className="text-xl font-bold text-blue-700 mb-2">הוספת שאלה אישית</h2>
              <input value={newQ.text} onChange={e => setNewQ(q => ({...q, text: e.target.value}))} placeholder="שאלה" className="border rounded px-4 py-2" />
              {newQ.options.map((opt,i) => (
                <input key={i} value={opt} onChange={e => setNewQ(q => { const opts = [...q.options]; opts[i]=e.target.value; return {...q, options:opts}; })} placeholder={`אפשרות ${i+1}`} className="border rounded px-4 py-2" />
              ))}
              <div className="flex gap-2 items-center">
                <label>תשובה נכונה:</label>
                <select value={newQ.answer} onChange={e => setNewQ(q => ({...q, answer: +e.target.value}))} className="border rounded px-2 py-1">
                  {[0,1,2,3].map(i=>(<option key={i} value={i}>{i+1}</option>))}
                </select>
              </div>
              <input value={newQ.explanation} onChange={e => setNewQ(q => ({...q, explanation: e.target.value}))} placeholder="הסבר" className="border rounded px-4 py-2" />
              <input value={newQ.link} onChange={e => setNewQ(q => ({...q, link: e.target.value}))} placeholder="קישור למידע נוסף (לא חובה)" className="border rounded px-4 py-2" />
              <button onClick={addUserQuestion} className="bg-green-500 text-white px-4 py-2 rounded font-bold">הוסף</button>
              <button onClick={()=>setShowAddQ(false)} className="bg-gray-300 px-4 py-2 rounded font-bold">ביטול</button>
            </div>
          </div>
        )}
        <div className="flex justify-center mb-2">
          <span className="text-3xl">{getProgressIcon(stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0)}</span>
        </div>
        {current === goldenIdx && (
          <div className="flex justify-center mb-2"><span className="text-2xl text-yellow-500 font-bold">⭐ שאלת זהב! ניקוד כפול ⭐</span></div>
        )}
        {bonus && (
          <div className="flex justify-center mb-2"><span className="text-2xl text-green-600 font-bold">🎁 בונוס הפתעה! {bonus==='time'?'+10 שניות':' +10 נקודות'} 🎁</span></div>
        )}
      </div>
      {!finished && personalBest && (
        <div className="text-center text-md font-bold text-green-300 mb-2 animate-fade-in">שיא אישי: {personalBest.score} נק׳, {personalBest.accuracy}% הצלחה</div>
      )}
      <audio ref={successAudio} src="/voise/הצלחה.dat" preload="auto" />
      <audio ref={failAudio} src="/voise/כשלון.dat" preload="auto" />
      <style>{`
        @keyframes fade-in { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
        .confetti { pointer-events:none; position:fixed; inset:0; z-index:50; display:none; }
        .confetti.show { display:block; background:transparent; }
        .confetti.show:after { content:''; position:absolute; inset:0; background-image: repeating-radial-gradient(circle, #ff0 2px, transparent 4px), repeating-radial-gradient(circle, #0ff 2px, transparent 4px), repeating-radial-gradient(circle, #f0f 2px, transparent 4px), repeating-radial-gradient(circle, #0f0 2px, transparent 4px), repeating-radial-gradient(circle, #00f 2px, transparent 4px), repeating-radial-gradient(circle, #f00 2px, transparent 4px); background-size: 40px 40px; opacity:0.5; animation: confetti-fall 1.2s linear; }
        @keyframes confetti-fall { from{background-position:0 0,0 0,0 0,0 0,0 0,0 0;} to{background-position:0 400px,0 300px,0 500px,0 200px,0 600px,0 350px;} }
        .shake { animation: shake 0.4s; }
        @keyframes shake { 0%{transform:translateX(0);} 20%{transform:translateX(-8px);} 40%{transform:translateX(8px);} 60%{transform:translateX(-8px);} 80%{transform:translateX(8px);} 100%{transform:translateX(0);} }
      `}</style>
    </main>
  );
} 