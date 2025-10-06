"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type SpeechRecognitionEvent = {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
};

type Sentence = {
  id: number;
  lang: string;
  text: string;
  keywords: string[];
  he?: string;
};

const SENTENCES: Sentence[] = [
  // English
  { id: 1, lang: "en", text: "The cat is sleeping on the sofa.", keywords: ["cat", "sleeping", "sofa"], he: "החתול ישן על הספה." },
  { id: 2, lang: "en", text: "She goes to school every morning.", keywords: ["goes", "school", "morning"], he: "היא הולכת לבית הספר כל בוקר." },
  { id: 3, lang: "en", text: "I like to eat apples.", keywords: ["like", "eat", "apples"], he: "אני אוהב לאכול תפוחים." },
  { id: 4, lang: "en", text: "The sun is shining today.", keywords: ["sun", "shining", "today"], he: "השמש זורחת היום." },
  { id: 5, lang: "en", text: "I have a red car.", keywords: ["have", "red", "car"], he: "יש לי מכונית אדומה." },
  { id: 6, lang: "en", text: "The dog is playing in the garden.", keywords: ["dog", "playing", "garden"], he: "הכלב משחק בגן." },
  { id: 7, lang: "en", text: "My mother cooks delicious food.", keywords: ["mother", "cooks", "delicious"], he: "אמא שלי מבשלת אוכל טעים." },
  { id: 8, lang: "en", text: "The book is on the table.", keywords: ["book", "on", "table"], he: "הספר על השולחן." },
  { id: 9, lang: "en", text: "I love to read stories.", keywords: ["love", "read", "stories"], he: "אני אוהב לקרוא סיפורים." },
  { id: 10, lang: "en", text: "The flowers are beautiful.", keywords: ["flowers", "beautiful"], he: "הפרחים יפים." },
  { id: 11, lang: "en", text: "I drink water every day.", keywords: ["drink", "water", "every"], he: "אני שותה מים כל יום." },
  { id: 12, lang: "en", text: "The teacher is in the classroom.", keywords: ["teacher", "classroom"], he: "המורה בכיתה." },
  { id: 13, lang: "en", text: "I play football with my friends.", keywords: ["play", "football", "friends"], he: "אני משחק כדורגל עם החברים שלי." },
  { id: 14, lang: "en", text: "The sky is blue and clear.", keywords: ["sky", "blue", "clear"], he: "השמים כחולים ובהירים." },
  { id: 15, lang: "en", text: "I eat breakfast at home.", keywords: ["eat", "breakfast", "home"], he: "אני אוכל ארוחת בוקר בבית." },
  { id: 16, lang: "en", text: "The music is very loud.", keywords: ["music", "very", "loud"], he: "המוזיקה מאוד רועשת." },
  { id: 17, lang: "en", text: "I watch television in the evening.", keywords: ["watch", "television", "evening"], he: "אני צופה בטלוויזיה בערב." },
  { id: 18, lang: "en", text: "The children are playing happily.", keywords: ["children", "playing", "happily"], he: "הילדים משחקים בשמחה." },
  { id: 19, lang: "en", text: "I brush my teeth before bed.", keywords: ["brush", "teeth", "before"], he: "אני מצחצח שיניים לפני השינה." },
  { id: 20, lang: "en", text: "The weather is nice today.", keywords: ["weather", "nice", "today"], he: "המזג אויר נחמד היום." },
  { id: 21, lang: "en", text: "I study English every day.", keywords: ["study", "English", "every"], he: "אני לומד אנגלית כל יום." },
  { id: 22, lang: "en", text: "The bus arrives at eight o'clock.", keywords: ["bus", "arrives", "eight"], he: "האוטובוס מגיע בשמונה." },
  { id: 23, lang: "en", text: "I wear a blue shirt today.", keywords: ["wear", "blue", "shirt"], he: "אני לובש חולצה כחולה היום." },
  { id: 24, lang: "en", text: "The computer is very fast.", keywords: ["computer", "very", "fast"], he: "המחשב מאוד מהיר." },
  { id: 25, lang: "en", text: "I listen to music when I work.", keywords: ["listen", "music", "work"], he: "אני מאזין למוזיקה כשאני עובד." },
  { id: 26, lang: "en", text: "The restaurant serves good food.", keywords: ["restaurant", "serves", "good"], he: "המסעדה מגישה אוכל טוב." },
  { id: 27, lang: "en", text: "I visit my grandmother every week.", keywords: ["visit", "grandmother", "week"], he: "אני מבקר את סבתא שלי כל שבוע." },
  { id: 28, lang: "en", text: "The movie is very interesting.", keywords: ["movie", "very", "interesting"], he: "הסרט מאוד מעניין." },
  { id: 29, lang: "en", text: "I clean my room every Sunday.", keywords: ["clean", "room", "Sunday"], he: "אני מנקה את החדר שלי כל יום ראשון." },
  { id: 30, lang: "en", text: "The phone rings loudly.", keywords: ["phone", "rings", "loudly"], he: "הטלפון מצלצל בקול רם." },
  { id: 31, lang: "en", text: "I write letters to my friends.", keywords: ["write", "letters", "friends"], he: "אני כותב מכתבים לחברים שלי." },
  { id: 32, lang: "en", text: "The store closes at nine o'clock.", keywords: ["store", "closes", "nine"], he: "החנות נסגרת בתשע." },
  { id: 33, lang: "en", text: "I ride my bicycle to school.", keywords: ["ride", "bicycle", "school"], he: "אני רוכב באופניים לבית הספר." },
  { id: 34, lang: "en", text: "The library has many books.", keywords: ["library", "many", "books"], he: "הספרייה יש הרבה ספרים." },
  { id: 35, lang: "en", text: "I help my mother with cooking.", keywords: ["help", "mother", "cooking"], he: "אני עוזר לאמא שלי בבישול." },
  { id: 36, lang: "en", text: "The park is full of children.", keywords: ["park", "full", "children"], he: "הפארק מלא בילדים." },
  { id: 37, lang: "en", text: "I speak three languages.", keywords: ["speak", "three", "languages"], he: "אני מדבר שלוש שפות." },
  { id: 38, lang: "en", text: "The hospital is near my house.", keywords: ["hospital", "near", "house"], he: "הבית חולים קרוב לבית שלי." },
  { id: 39, lang: "en", text: "I buy groceries every Friday.", keywords: ["buy", "groceries", "Friday"], he: "אני קונה מצרכים כל יום שישי." },
  { id: 40, lang: "en", text: "The airplane flies high in the sky.", keywords: ["airplane", "flies", "high"], he: "המטוס טס גבוה בשמים." },
  // Hebrew
  { id: 101, lang: "he", text: "החתול ישן על הספה.", keywords: ["חתול", "ישן", "ספה"] },
  { id: 102, lang: "he", text: "היא הולכת לבית הספר כל בוקר.", keywords: ["הולכת", "בית ספר", "בוקר"] },
  { id: 103, lang: "he", text: "אני אוהב לאכול תפוחים.", keywords: ["אוהב", "לאכול", "תפוחים"] },
  { id: 104, lang: "he", text: "השמש זורחת היום.", keywords: ["שמש", "זורחת", "היום"] },
  { id: 105, lang: "he", text: "יש לי מכונית אדומה.", keywords: ["יש", "מכונית", "אדומה"] },
  { id: 106, lang: "he", text: "הכלב משחק בגן.", keywords: ["כלב", "משחק", "גן"] },
  { id: 107, lang: "he", text: "אמא שלי מבשלת אוכל טעים.", keywords: ["אמא", "מבשלת", "טעים"] },
  { id: 108, lang: "he", text: "הספר על השולחן.", keywords: ["ספר", "על", "שולחן"] },
  { id: 109, lang: "he", text: "אני אוהב לקרוא סיפורים.", keywords: ["אוהב", "לקרוא", "סיפורים"] },
  { id: 110, lang: "he", text: "הפרחים יפים.", keywords: ["פרחים", "יפים"] },
  { id: 111, lang: "he", text: "אני שותה מים כל יום.", keywords: ["שותה", "מים", "כל"] },
  { id: 112, lang: "he", text: "המורה בכיתה.", keywords: ["מורה", "כיתה"] },
  { id: 113, lang: "he", text: "אני משחק כדורגל עם החברים שלי.", keywords: ["משחק", "כדורגל", "חברים"] },
  { id: 114, lang: "he", text: "השמים כחולים ובהירים.", keywords: ["שמים", "כחולים", "בהירים"] },
  { id: 115, lang: "he", text: "אני אוכל ארוחת בוקר בבית.", keywords: ["אוכל", "ארוחת בוקר", "בית"] },
  { id: 116, lang: "he", text: "המוזיקה מאוד רועשת.", keywords: ["מוזיקה", "מאוד", "רועשת"] },
  { id: 117, lang: "he", text: "אני צופה בטלוויזיה בערב.", keywords: ["צופה", "טלוויזיה", "ערב"] },
  { id: 118, lang: "he", text: "הילדים משחקים בשמחה.", keywords: ["ילדים", "משחקים", "שמחה"] },
  { id: 119, lang: "he", text: "אני מצחצח שיניים לפני השינה.", keywords: ["מצחצח", "שיניים", "לפני"] },
  { id: 120, lang: "he", text: "המזג אויר נחמד היום.", keywords: ["מזג אויר", "נחמד", "היום"] },
  { id: 121, lang: "he", text: "אני לומד אנגלית כל יום.", keywords: ["לומד", "אנגלית", "כל"] },
  { id: 122, lang: "he", text: "האוטובוס מגיע בשמונה.", keywords: ["אוטובוס", "מגיע", "שמונה"] },
  { id: 123, lang: "he", text: "אני לובש חולצה כחולה היום.", keywords: ["לובש", "חולצה", "כחולה"] },
  { id: 124, lang: "he", text: "המחשב מאוד מהיר.", keywords: ["מחשב", "מאוד", "מהיר"] },
  { id: 125, lang: "he", text: "אני מאזין למוזיקה כשאני עובד.", keywords: ["מאזין", "מוזיקה", "עובד"] },
  { id: 126, lang: "he", text: "המסעדה מגישה אוכל טוב.", keywords: ["מסעדה", "מגישה", "טוב"] },
  { id: 127, lang: "he", text: "אני מבקר את סבתא שלי כל שבוע.", keywords: ["מבקר", "סבתא", "שבוע"] },
  { id: 128, lang: "he", text: "הסרט מאוד מעניין.", keywords: ["סרט", "מאוד", "מעניין"] },
  { id: 129, lang: "he", text: "אני מנקה את החדר שלי כל יום ראשון.", keywords: ["מנקה", "חדר", "ראשון"] },
  { id: 130, lang: "he", text: "הטלפון מצלצל בקול רם.", keywords: ["טלפון", "מצלצל", "רם"] },
  { id: 131, lang: "he", text: "אני כותב מכתבים לחברים שלי.", keywords: ["כותב", "מכתבים", "חברים"] },
  { id: 132, lang: "he", text: "החנות נסגרת בתשע.", keywords: ["חנות", "נסגרת", "תשע"] },
  { id: 133, lang: "he", text: "אני רוכב באופניים לבית הספר.", keywords: ["רוכב", "אופניים", "בית ספר"] },
  { id: 134, lang: "he", text: "הספרייה יש הרבה ספרים.", keywords: ["ספרייה", "הרבה", "ספרים"] },
  { id: 135, lang: "he", text: "אני עוזר לאמא שלי בבישול.", keywords: ["עוזר", "אמא", "בישול"] },
  { id: 136, lang: "he", text: "הפארק מלא בילדים.", keywords: ["פארק", "מלא", "ילדים"] },
  { id: 137, lang: "he", text: "אני מדבר שלוש שפות.", keywords: ["מדבר", "שלוש", "שפות"] },
  { id: 138, lang: "he", text: "הבית חולים קרוב לבית שלי.", keywords: ["בית חולים", "קרוב", "בית"] },
  { id: 139, lang: "he", text: "אני קונה מצרכים כל יום שישי.", keywords: ["קונה", "מצרכים", "שישי"] },
  { id: 140, lang: "he", text: "המטוס טס גבוה בשמים.", keywords: ["מטוס", "טס", "גבוה"] },
];

const difficulties = [
  { key: "easy", label: "קל", count: 20 },
  { key: "medium", label: "בינוני", count: 30 },
  { key: "hard", label: "קשה", count: 40 },
];

const levelMap: Record<string, string> = {
  beginner: 'easy',
  intermediate: 'medium',
  advanced: 'hard',
  extreme: 'hard',
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
};

function getMistakeStats() {
  try {
    return JSON.parse(localStorage.getItem('listen-mistakes') || '{}');
  } catch {
    return {};
  }
}
function addMistake(id: number) {
  const stats = getMistakeStats();
  stats[id] = (stats[id] || 0) + 1;
  localStorage.setItem('listen-mistakes', JSON.stringify(stats));
}
function pickSentences(all: any[], lang: string, count: number) {
  const pool = all.filter((s: Sentence) => s.lang === lang);
  const stats = getMistakeStats();
  const sorted = [...pool].sort((a: Sentence, b: Sentence) => (stats[b.id] || 0) - (stats[a.id] || 0));
  const boosted = sorted.filter((s: Sentence) => stats[s.id] > 0).slice(0, 5);
  const rest = pool.filter((s: Sentence) => !boosted.includes(s));
  const randomRest = rest.sort(() => Math.random() - 0.5).slice(0, count - boosted.length);
  return [...boosted, ...randomRest].sort(() => Math.random() - 0.5);
}

function levenshtein(a: string, b: string) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: an + 1 }, () => Array(bn + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[i][0] = i;
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[an][bn];
}

export default function ListeningWrapper() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <Listening />
    </Suspense>
  );
}

function Listening() {
  const searchParams = useSearchParams();
  const levelParam = searchParams?.get('level') || 'easy';
  
  // בדיקה אם נבחרה רמה תקינה
  if (!levelParam || !levelMap[levelParam]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-100 to-green-100 flex flex-col items-center justify-center p-4">
        <div className="text-center bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8 max-w-lg w-full">
          <h2 className="text-3xl font-extrabold text-blue-700 mb-4">בחר רמה</h2>
          <p className="text-lg text-gray-600 mb-6">אנא בחר רמת קושי כדי להתחיל את המשחק</p>
          <div className="flex flex-col gap-3">
            <a href="/games/listening?level=beginner" className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg hover:from-green-500 hover:to-blue-600 transition-transform transform hover:scale-105">
              מתחיל
            </a>
            <a href="/games/listening?level=intermediate" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-transform transform hover:scale-105">
              בינוני
            </a>
            <a href="/games/listening?level=advanced" className="bg-gradient-to-r from-red-400 to-pink-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg hover:from-red-500 hover:to-pink-600 transition-transform transform hover:scale-105">
              מתקדם
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  const [lang, setLang] = useState<'en' | 'he'>('en');
  const [difficulty, setDifficulty] = useState(levelMap[levelParam] || 'easy');
  const [sentences, setSentences] = useState<typeof SENTENCES>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [checking, setChecking] = useState(false);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [savedRecordings, setSavedRecordings] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, correct: 0, mistakes: 0 });
  const [personalBest, setPersonalBest] = useState<{score: number, accuracy: number} | null>(null);
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const mappedLevel = levelMap[levelParam] || 'easy';
    setDifficulty(mappedLevel);
  }, [levelParam]);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started]);

  useEffect(() => {
    const diff = difficulties.find((d) => d.key === difficulty)!;
    setSentences(pickSentences(SENTENCES, lang, diff.count));
    setCurrent(0);
    setScore(0);
    setTimer(0);
    setFinished(false);
    setFeedback(null);
    setStarted(false);
    setUserTranscript('');
    setRecording(false);
    setChecking(false);
    setSimilarity(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setStats({ total: 0, correct: 0, mistakes: 0 });
    try {
      const pb = JSON.parse(localStorage.getItem('listen-best') || 'null');
      if (pb) setPersonalBest(pb);
    } catch {}
  }, [difficulty, lang]);

  const speak = (text: string, lang: string) => {
    const synth = window.speechSynthesis;
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = lang === 'he' ? 'he-IL' : 'en-US';
    synth.speak(utter);
  };

  const startRecording = () => {
    setRecording(true);
    setUserTranscript('');
    setAudioBlob(null);
    setAudioUrl(null);
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFeedback('דפדפן לא תומך בזיהוי דיבור');
      setRecording(false);
      return;
    }
    let mediaRecorder: MediaRecorder;
    let chunks: Blob[] = [];
    let recognition;
    let streamRef;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      streamRef = stream;
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        try {
          const prev = JSON.parse(localStorage.getItem('listen-recordings') || '[]');
          const updated = [url, ...prev].slice(0, 3);
          setSavedRecordings(updated);
          localStorage.setItem('listen-recordings', JSON.stringify(updated));
        } catch {}
      };
      mediaRecorder.start();

      recognition = new SpeechRecognition();
      recognition.lang = lang === 'he' ? 'he-IL' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserTranscript(transcript);
        setRecording(false);
        setChecking(true);
        setTimeout(() => checkAnswer(transcript), 500);
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      };
      recognition.onerror = (event: { error?: string }) => {
        setFeedback('שגיאה בהקלטה: ' + (event.error || ''));
        setRecording(false);
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      };
      recognition.onend = () => {
        setRecording(false);
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      };
      recognition.start();
    }).catch(() => {
      setFeedback('אין הרשאת מיקרופון');
      setRecording(false);
    });
  };

  const checkAnswer = (transcript: string) => {
    setChecking(false);
    const correctKeywords = sentences[current].keywords;
    const user = transcript.trim().toLowerCase();
    let matched = 0;
    for (const kw of correctKeywords) {
      if (user.includes(kw)) matched++;
    }
    const dist = levenshtein(user, sentences[current].text.toLowerCase());
    const maxLen = Math.max(user.length, sentences[current].text.length);
    const sim = maxLen === 0 ? 1 : 1 - dist / maxLen;
    setSimilarity(sim);
    let feedbackMsg = '';
    if (matched === correctKeywords.length || sim >= 0.85) feedbackMsg = 'מעולה!';
    else if (matched > 0 || sim >= 0.6) feedbackMsg = 'כמעט! נסה שוב';
    else feedbackMsg = 'נסה שוב';
    setFeedback(feedbackMsg);
    setStats(s => ({
      total: s.total + 1,
      correct: s.correct + ((matched === correctKeywords.length || sim >= 0.85) ? 1 : 0),
      mistakes: s.mistakes + ((matched === correctKeywords.length || sim >= 0.85) ? 0 : 1)
    }));
    setShowAnswer(true);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setFeedback(null);
    setUserTranscript('');
    setSimilarity(null);
    setAudioBlob(null);
    setAudioUrl(null);
    if (current === sentences.length - 1) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const startGame = () => {
    setStarted(true);
    setTimer(0);
    setScore(0);
    setCurrent(0);
    setFinished(false);
    setFeedback(null);
    setUserTranscript('');
    setSimilarity(null);
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const restart = () => {
    setStarted(false);
    setCurrent(0);
    setScore(0);
    setTimer(0);
    setFinished(false);
    setFeedback(null);
    setUserTranscript('');
    setSimilarity(null);
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const isRTL = lang === 'he';
  const progress = sentences.length > 0 ? ((current + 1) / sentences.length) * 100 : 0;

  useEffect(() => {
    if (!finished) return;
    const accuracy = stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0;
    if (!personalBest || score > personalBest.score || (score === personalBest.score && accuracy > personalBest.accuracy)) {
      const pb = { score, accuracy };
      setPersonalBest(pb);
      localStorage.setItem('listen-best', JSON.stringify(pb));
    }
  }, [finished]);

  useEffect(() => {
    if (!showAnswer || !feedback) return;
    if (feedback === 'מעולה!') {
      if (successAudio.current) {
        successAudio.current.currentTime = 0;
        successAudio.current.play();
      }
    } else if (feedback) {
      if (failAudio.current) {
        failAudio.current.currentTime = 0;
        failAudio.current.play();
      }
    }
  }, [showAnswer, feedback]);

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  return (
    <main className={`min-h-screen bg-gradient-to-br from-yellow-200 via-blue-200 to-green-200 flex flex-col items-center justify-center p-4 ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <audio ref={successAudio} src="/voise/הצלחה.dat" preload="auto" />
      <audio ref={failAudio} src="/voise/כשלון.dat" preload="auto" />
      <div className="max-w-2xl w-full mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8">
        {started && sentences.length > 0 && (
          <div className="w-full h-3 bg-blue-100 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-pink-700 text-center drop-shadow-lg flex items-center gap-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-blue-400 text-white text-3xl shadow-lg mr-2">🎧</span>
            משחק האזנה והקלטה
            <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xl shadow bg-gradient-to-r from-green-400 to-green-600 text-white ml-4`}>
              <span className="text-2xl">{lang === 'he' ? '🟣' : '🔵'}</span> {difficulties.find(d=>d.key===difficulty)?.label}
            </span>
          </h1>
        </div>
        {!started && (
          <div className="flex flex-col gap-4 items-center mb-8">
            <div className="flex gap-4 mb-4">
              <button onClick={() => setLang('en')} className={`px-6 py-2 rounded-full font-bold shadow text-lg ${lang==='en'?'bg-green-600 text-white scale-105':'bg-white text-green-700 hover:bg-green-100'}`}>English</button>
              <button onClick={() => setLang('he')} className={`px-6 py-2 rounded-full font-bold shadow text-lg ${lang==='he'?'bg-pink-600 text-white scale-105':'bg-white text-pink-700 hover:bg-pink-100'}`}>עברית</button>
            </div>
            <button onClick={startGame} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4">התחל</button>
          </div>
        )}
        {started && !finished && sentences.length > 0 && (
          <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-pink-700 shadow flex items-center gap-2"><span className="text-green-500 text-2xl">★</span> ניקוד: {score}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-green-700 shadow flex items-center gap-2"><span className="text-blue-500 text-2xl">#️⃣</span> משפט: {current+1}/{sentences.length}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-pink-700 shadow flex items-center gap-2"><span className="text-pink-500 text-2xl">⏰</span> זמן: {timer} שניות</div>
            </div>
            <div className="mb-6 flex flex-col items-center gap-4">
              <div className="text-2xl font-bold text-center mb-4 animate-fade-in-slow flex items-center justify-center gap-2">
                <button onClick={() => speak(sentences[current].text, lang)} className="bg-gradient-to-r from-blue-400 to-green-400 text-white px-6 py-2 rounded-full font-bold shadow hover:from-green-400 hover:to-blue-400 transition-all duration-200 flex items-center gap-2 text-lg">
                  <span className="text-2xl">🔊</span> האזן למשפט
                </button>
                <span className="ml-4">{sentences[current].text}</span>
                {sentences[current].he && (
                  <span className="ml-2 text-purple-700">{sentences[current].he}</span>
                )}
                {getMistakeStats()[sentences[current].id] > 0 && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-bold align-middle animate-pulse">💡 חיזוק אישי</span>
                )}
              </div>
              <div className="flex flex-col items-center gap-4 mb-4">
                <button
                  onClick={startRecording}
                  disabled={recording || checking}
                  className={`px-10 py-4 rounded-full font-bold text-2xl shadow transition-all duration-200 flex items-center gap-2
                    ${recording ? 'bg-yellow-400 text-white animate-pulse' : 'bg-pink-100 text-pink-700 hover:bg-pink-200 hover:scale-105'}`}
                >
                  <span className="text-2xl">🎙️</span> {recording ? 'מקליט...' : 'חזור בקול' }
                </button>
                {userTranscript && (
                  <div className="text-center text-lg font-bold text-blue-700 bg-blue-50 rounded-xl px-4 py-2 shadow">
                    ההגייה שלך: {userTranscript}
                    {similarity !== null && (
                      <span className="ml-2 text-purple-700">({Math.round(similarity*100)}% התאמה)</span>
                    )}
                  </div>
                )}
                {audioUrl && (
                  <div className="flex flex-col items-center gap-2 mt-2">
                    <audio src={audioUrl} controls className="w-full max-w-xs" />
                    <div className="flex gap-2">
                      <button onClick={() => { const a = new Audio(audioUrl); a.play(); }} className="bg-gradient-to-r from-pink-400 to-blue-400 text-white px-6 py-2 rounded-full font-bold shadow hover:from-blue-400 hover:to-pink-400 transition-all duration-200 flex items-center gap-2 text-lg">
                        <span className="text-2xl">🔁</span> האזן להקלטה שלי
                      </button>
                      {audioBlob && (
                        <button onClick={() => downloadBlob(audioBlob, 'listening.webm')} className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-4 py-2 rounded-full font-bold shadow flex items-center gap-2 text-md">
                          <span className="text-2xl">⬇️</span> הורד הקלטה
                        </button>
                      )}
                      {audioUrl && navigator.share && (
                        <button onClick={() => navigator.share({ title: 'הקלטת חזרה', url: audioUrl })} className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-4 py-2 rounded-full font-bold shadow flex items-center gap-2 text-md">
                          <span className="text-2xl">🔗</span> שתף הקלטה
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {savedRecordings.length > 0 && (
                  <div className="mt-4">
                    <div className="font-bold text-blue-700 mb-2">הקלטות אחרונות:</div>
                    <div className="flex flex-wrap gap-2">
                      {savedRecordings.map((url, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <audio src={url} controls className="w-32" />
                          <div className="flex gap-1">
                            <button onClick={() => { const a = document.createElement('a'); a.href = url; a.download = `listening${i+1}.webm`; a.click(); }} className="bg-green-400 text-white px-2 py-1 rounded text-xs font-bold">⬇️ הורד</button>
                            {navigator.share && (
                              <button onClick={() => navigator.share({ title: 'הקלטת חזרה', url })} className="bg-yellow-400 text-white px-2 py-1 rounded text-xs font-bold">🔗 שתף</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {showAnswer && (
                <div className="flex flex-col items-center gap-4 mb-4 animate-fade-in">
                  {feedback && (
                    <div className={`text-center text-2xl font-bold ${feedback==='מעולה!'?'text-green-600':'text-red-500'}`}>{feedback}</div>
                  )}
                  <div className="text-center text-lg font-bold text-blue-700">{sentences[current].text}</div>
                  {sentences[current].he && (
                    <div className="text-center text-md font-bold text-purple-700">{sentences[current].he}</div>
                  )}
                  <button onClick={handleNext} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200">המשך</button>
                </div>
              )}
              {!showAnswer && (
                <div className="flex flex-col items-center gap-4 mb-4">
                  <button
                    onClick={() => {
                      setShowAnswer(true);
                    }}
                    className="bg-gradient-to-r from-pink-400 to-blue-400 text-white px-8 py-3 rounded-full font-bold shadow hover:from-blue-400 hover:to-pink-400 transition-all duration-200"
                  >
                    <span className="text-2xl">🔄</span> הצג תשובה
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {finished && (
          <div className="text-center mt-6 animate-fade-in">
            <div className="text-2xl font-bold text-pink-700 mb-4 flex items-center justify-center gap-2"><span className="text-green-500 text-3xl">🏆</span> כל הכבוד! סיימת את כל המשפטים 🎉</div>
            <div className="text-lg font-bold text-green-700 mb-2 flex items-center justify-center gap-2"><span className="text-blue-500 text-2xl">★</span> ניקוד סופי: {score} | <span className="text-pink-500 text-2xl">⏰</span> זמן: {timer} שניות</div>
            <div className="text-md font-bold text-purple-700 mb-2 flex items-center justify-center gap-2">הישגים: {stats.correct} הצלחות, {stats.mistakes} טעויות, {stats.total} ניסיונות, {stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0}% הצלחה</div>
            <div className="text-md font-bold text-yellow-700 mb-2 flex items-center justify-center gap-2">משפטים מחוזקים: {sentences.filter(s => getMistakeStats()[s.id] > 0).length}</div>
            
            
            <button onClick={restart} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4 flex items-center gap-2"><span className="text-2xl">🔄</span> שחק שוב</button>
          </div>
        )}
      </div>
      {!started && personalBest && (
        <div className="text-center text-md font-bold text-green-700 mb-2">שיא אישי: {personalBest.score} נק׳, {personalBest.accuracy}% הצלחה</div>
      )}
      <style>{`
        @keyframes fade-in { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fade-in-slow { from{opacity:0;} to{opacity:1;} }
        .animate-fade-in-slow { animation: fade-in-slow 1.5s; }
      `}</style>
    </main>
  );
} 