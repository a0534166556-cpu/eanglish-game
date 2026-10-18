"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import useAuthUser from "@/lib/useAuthUser";
import AdManager from "@/app/components/ads/AdManager";
import { getTranslationWithFallback } from "@/lib/translations";
import { MULTIPLE_CHOICE_BY_DIFFICULTY } from "@/lib/englishLearningBank";

interface MultipleChoiceQuestion {
  id: number;
  lang: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  explanationHe?: string;
}

// שאלות לימודיות: דקדוק, ביטויים שימושיים והסברים בעברית
const QUESTIONS_BY_DIFFICULTY = MULTIPLE_CHOICE_BY_DIFFICULTY as {
  beginner: MultipleChoiceQuestion[];
  intermediate: MultipleChoiceQuestion[];
  advanced: MultipleChoiceQuestion[];
  extreme: MultipleChoiceQuestion[];
};

// Hebrew backup questions (unused in EN mode)
const HEBREW_QUESTIONS: MultipleChoiceQuestion[] = [];

// Select questions by difficulty
const getQuestionsByDifficulty = (difficulty: string): MultipleChoiceQuestion[] => {
  switch (difficulty) {
    case 'beginner':
      return QUESTIONS_BY_DIFFICULTY.beginner;
    case 'intermediate':
      return QUESTIONS_BY_DIFFICULTY.intermediate;
    case 'advanced':
      return QUESTIONS_BY_DIFFICULTY.advanced;
    case 'extreme':
      return QUESTIONS_BY_DIFFICULTY.extreme;
    default:
      return QUESTIONS_BY_DIFFICULTY.beginner;
  }
};

const levelMap: Record<string, string> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
  extreme: 'extreme',
  easy: 'beginner',
  medium: 'intermediate',
  hard: 'advanced',
};

function getMistakeStats() {
  try {
    return JSON.parse(localStorage.getItem('mc-mistakes') || '{}');
  } catch {
    return {};
  }
}

function addMistake(id: number) {
  const stats = getMistakeStats();
  stats[id] = (stats[id] || 0) + 1;
  localStorage.setItem('mc-mistakes', JSON.stringify(stats));
}

export default function MultipleChoiceGameWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl">׳˜׳•׳¢׳...</div>
    </div>}>
      <MultipleChoiceGame />
    </Suspense>
  );
}

function MultipleChoiceGame() {
  const searchParams = useSearchParams();
  const level = searchParams?.get('level') || 'beginner';
  const { user, loading, updateUser } = useAuthUser();
  
  // ׳‘׳—׳¨ ׳©׳׳׳•׳× ׳׳₪׳™ ׳¨׳׳× ׳§׳•׳©׳™
  const selectedQuestions = getQuestionsByDifficulty(levelMap[level] || 'beginner');
  
  const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [time, setTime] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [learnedWordsList, setLearnedWordsList] = useState<Array<{word: string, translation: string}>>([]);
  const [newlyCompletedAchievements, setNewlyCompletedAchievements] = useState<Array<{id: string, name: string, icon: string, reward: number, xpReward: number}>>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [useLearnedWords, setUseLearnedWords] = useState(false);
  const [learnedWordsData, setLearnedWordsData] = useState<Array<{word: string, translation: string}>>([]);
  const [loadingLearnedWords, setLoadingLearnedWords] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedWordsCount, setSelectedWordsCount] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<Array<{word: string, translation: string}>>([]);
  const [showWordSelector, setShowWordSelector] = useState(false);
  
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);

  // ׳˜׳¢׳ ׳׳™׳׳™׳ ׳©׳ ׳׳׳“׳• ׳׳”-API
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
    } catch (error) {
      console.error('Error loading learned words:', error);
      setLearnedWordsData([]);
    } finally {
      setLoadingLearnedWords(false);
    }
  };

  // ׳”׳׳¨ ׳׳™׳׳™׳ ׳©׳ ׳׳׳“׳• ׳׳©׳׳׳•׳×
  const createQuestionsFromLearnedWords = (words: Array<{word: string, translation: string}>, count: number): MultipleChoiceQuestion[] => {
    const questions: MultipleChoiceQuestion[] = [];
    const usedWords = new Set<string>();
    
    words.forEach((wordData, index) => {
      if (questions.length >= count) return;
      if (usedWords.has(wordData.word.toLowerCase())) return;
      
      const word = wordData.word;
      const translation = wordData.translation || word;
      
      // ׳ ׳¡׳” ׳׳׳¦׳•׳ ׳©׳׳׳” ׳§׳™׳™׳׳× ׳©׳”׳׳™׳׳” ׳”׳™׳ ׳”׳×׳©׳•׳‘׳” ׳”׳ ׳›׳•׳ ׳” ׳©׳׳”
      const existingQuestion = Object.values(QUESTIONS_BY_DIFFICULTY).flat().find(q => 
        q.answer.toLowerCase() === word.toLowerCase()
      );
      
      if (existingQuestion) {
        questions.push(existingQuestion);
        usedWords.add(word.toLowerCase());
      } else {
        // ׳¦׳•׳¨ ׳©׳׳׳” ׳—׳“׳©׳” ׳׳”׳׳™׳׳”
        const similarWords = Object.values(QUESTIONS_BY_DIFFICULTY)
          .flat()
          .map(q => q.answer)
          .filter(opt => opt.toLowerCase() !== word.toLowerCase())
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        const options = [word, ...similarWords].sort(() => Math.random() - 0.5);
        
        // ׳ ׳¡׳” ׳׳׳¦׳•׳ ׳×׳¨׳’׳•׳ ׳˜׳•׳‘ ׳™׳•׳×׳¨ ׳׳ ׳”׳×׳¨׳’׳•׳ ׳–׳”׳” ׳׳׳™׳׳”
        let finalTranslation = translation;
        if (translation === word || !translation || translation.trim() === '') {
          // ׳ ׳¡׳” ׳׳׳¦׳•׳ ׳×׳¨׳’׳•׳ ׳׳”׳©׳׳׳•׳× ׳”׳§׳™׳™׳׳•׳×
          const existingQuestion = Object.values(QUESTIONS_BY_DIFFICULTY).flat().find(q => 
            q.answer.toLowerCase() === word.toLowerCase()
          );
          if (existingQuestion?.explanationHe) {
            finalTranslation = existingQuestion.explanationHe.split('-')[0]?.trim() || word;
          } else {
            finalTranslation = word; // ׳׳ ׳׳™׳ ׳×׳¨׳’׳•׳, ׳ ׳©׳×׳׳© ׳‘׳׳™׳׳” ׳¢׳¦׳׳”
          }
        }
        
        // ׳¦׳•׳¨ ׳”׳¡׳‘׳¨ ׳׳©׳׳¢׳•׳×׳™
        const explanationHe = finalTranslation !== word
          ? `׳”׳׳™׳׳” "${word}" ׳₪׳™׳¨׳•׳©׳” "${finalTranslation}"`
          : `׳”׳׳™׳׳” "${word}" ׳”׳™׳ ׳׳™׳׳” ׳‘׳׳ ׳’׳׳™׳×`;
        
        questions.push({
          id: 10000 + index,
          lang: 'en',
          question: finalTranslation !== word 
            ? `What is the English word for "${finalTranslation}"?`
            : `What is the English word "${word}"?`,
          options: options,
          answer: word,
          explanation: `The English word "${word}"${finalTranslation !== word ? ` means "${finalTranslation}"` : ''}.`,
          explanationHe: explanationHe
        });
        usedWords.add(word.toLowerCase());
      }
    });
    
    return questions.slice(0, count);
  };

  useEffect(() => {
    if (gameStarted) {
      if (useLearnedWords && learnedWordsData.length > 0) {
        // ׳”׳©׳×׳׳© ׳‘׳׳™׳׳™׳ ׳©׳ ׳׳׳“׳• - ׳§׳•׳“׳ ׳›׳ ׳‘׳“׳•׳§ ׳׳ ׳™׳© ׳׳™׳׳™׳ ׳©׳ ׳‘׳—׳¨׳• ׳¡׳₪׳¦׳™׳₪׳™׳×
        let wordsToUse: Array<{word: string, translation: string}>;
        if (selectedWords.length > 0) {
          // ׳׳ ׳™׳© ׳׳™׳׳™׳ ׳©׳ ׳‘׳—׳¨׳• ׳¡׳₪׳¦׳™׳₪׳™׳×, ׳”׳©׳×׳׳© ׳‘׳”׳
          wordsToUse = selectedWords;
        } else if (selectedWordsCount !== null) {
          // ׳׳ ׳™׳© ׳›׳׳•׳× ׳ ׳‘׳—׳¨׳×, ׳‘׳—׳¨ ׳׳§׳¨׳׳™׳× ׳׳”׳׳™׳׳™׳
          wordsToUse = [...learnedWordsData].sort(() => Math.random() - 0.5).slice(0, selectedWordsCount);
        } else {
          // ׳׳—׳¨׳×, ׳”׳©׳×׳׳© ׳‘׳›׳ ׳”׳׳™׳׳™׳
          wordsToUse = learnedWordsData;
        }
        
        const learnedQuestions = createQuestionsFromLearnedWords(wordsToUse, 10);
        if (learnedQuestions.length > 0) {
          const shuffled = [...learnedQuestions].sort(() => Math.random() - 0.5);
          setQuestions(shuffled);
        } else {
          // ׳׳ ׳׳™׳ ׳׳¡׳₪׳™׳§ ׳©׳׳׳•׳×, ׳”׳©׳×׳׳© ׳‘׳©׳׳׳•׳× ׳¨׳’׳™׳׳•׳×
          const shuffled = [...selectedQuestions].sort(() => Math.random() - 0.5);
          setQuestions(shuffled.slice(0, 10));
        }
      } else {
    // ׳‘׳—׳¨ ׳©׳׳׳•׳× ׳׳§׳¨׳׳™׳•׳×
    const shuffled = [...selectedQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 10));
      }
      setCurrent(0);
      setScore(0);
      setTime(0);
      setFinished(false);
      setSelected(null);
      setFeedback(null);
      setShowHint(false);
    }
  }, [gameStarted, useLearnedWords, learnedWordsData, selectedWordsCount, selectedWords]);

  // ׳˜׳¢׳ ׳׳™׳׳™׳ ׳©׳ ׳׳׳“׳• ׳›׳©׳”׳׳©׳×׳׳© ׳‘׳•׳—׳¨ ׳‘׳׳¦׳‘ learned words
  useEffect(() => {
    if (useLearnedWords && user && learnedWordsData.length === 0 && !loadingLearnedWords) {
      loadLearnedWords();
    }
  }, [useLearnedWords, user]);

  useEffect(() => {
    if (!finished) {
      const timer = setInterval(() => setTime(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [finished]);
  
  // ׳₪׳•׳ ׳§׳¦׳™׳” ׳׳—׳™׳׳•׳¥ ׳׳™׳׳™׳ ׳׳ ׳’׳׳™׳•׳× ׳׳˜׳§׳¡׳˜
  const extractEnglishWords = (text: string): string[] => {
    if (!text) return [];
    const englishWords = text.match(/[A-Za-z]+/g) || [];
    return englishWords
      .map(word => word.toLowerCase())
      .filter(word => 
        word.length > 2 && 
        !['the', 'and', 'is', 'are', 'was', 'were', 'has', 'have', 'had', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'what', 'which', 'do', 'you', 'use', 'can', 'does'].includes(word)
      );
  };

  // ׳׳¡׳•׳£ ׳׳× ׳›׳ ׳”׳׳™׳׳™׳ ׳׳›׳ ׳”׳©׳׳׳•׳× ׳‘׳׳©׳—׳§
  // ׳׳™׳׳•׳ ׳×׳¨׳’׳•׳׳™׳ ׳׳§׳•׳׳™ - ׳׳ ׳׳™׳׳” ׳׳ ׳ ׳׳¦׳׳× ׳›׳׳, ׳™׳—׳₪׳© ׳‘׳׳™׳׳•׳ ׳”׳׳¨׳›׳–׳™
  const getTranslationForWord = (word: string): string | null => {
    const wordLower = word.toLowerCase();
    
    // ׳׳™׳׳•׳ ׳×׳¨׳’׳•׳׳™׳ ׳׳§׳•׳׳™ (׳ ׳©׳׳¨ ׳›׳׳• ׳©׳”׳™׳”)
    const localTranslations: Record<string, string> = {
      // ׳‘׳¢׳׳™ ׳—׳™׳™׳
      'dog': '׳›׳׳‘', 'cat': '׳—׳×׳•׳', 'bird': '׳¦׳™׳₪׳•׳¨', 'fish': '׳“׳’', 'frog': '׳¦׳₪׳¨׳“׳¢',
      'bear': '׳“׳•׳‘', 'lion': '׳׳¨׳™׳”', 'whale': '׳׳•׳•׳™׳™׳×׳', 'monkey': '׳§׳•׳£', 'deer': '׳¦׳‘׳™',
      'owl': '׳™׳ ׳©׳•׳£', 'rabbit': '׳׳¨׳ ׳‘', 'duck': '׳‘׳¨׳•׳•׳–', 'eagle': '׳ ׳©׳¨', 'snake': '׳ ׳—׳©',
      'cow': '׳₪׳¨׳”', 'elephant': '׳₪׳™׳', 'mouse': '׳¢׳›׳‘׳¨', 'zebra': '׳–׳‘׳¨׳”',
      // ׳׳•׳›׳
      'apple': '׳×׳₪׳•׳—', 'banana': '׳‘׳ ׳ ׳”', 'water': '׳׳™׳', 'milk': '׳—׳׳‘', 'tea': '׳×׳”',
      'bread': '׳׳—׳', 'rice': '׳׳•׳¨׳–', 'cake': '׳¢׳•׳’׳”', 'soup': '׳׳¨׳§', 'egg': '׳‘׳™׳¦׳”',
      'pasta': '׳₪׳¡׳˜׳”', 'curry': '׳§׳׳¨׳™', 'lemonade': '׳׳™׳׳•׳ ׳“׳”', 'honey': '׳“׳‘׳©',
      'toast': '׳˜׳•׳¡׳˜', 'ice cream': '׳’׳׳™׳“׳”', 'sushi': '׳¡׳•׳©׳™', 'pizza': '׳₪׳™׳¦׳”',
      'juice': '׳׳™׳¥', 'sugar': '׳¡׳•׳›׳¨', 'salt': '׳׳׳—', 'lemon': '׳׳™׳׳•׳', 'carrot': '׳’׳–׳¨',
      'tomato': '׳¢׳’׳‘׳ ׳™׳”',
      // ׳—׳₪׳¦׳™׳
      'book': '׳¡׳₪׳¨', 'pen': '׳¢׳˜', 'cup': '׳›׳•׳¡', 'ball': '׳›׳“׳•׳¨', 'hat': '׳›׳•׳‘׳¢',
      'shoes': '׳ ׳¢׳׳™׳™׳', 'shoe': '׳ ׳¢׳', 'chair': '׳›׳™׳¡׳', 'bed': '׳׳™׳˜׳”', 'bike': '׳׳•׳₪׳ ׳™׳™׳',
      'camera': '׳׳¦׳׳׳”', 'television': '׳˜׳׳•׳•׳™׳–׳™׳”', 'headphones': '׳׳•׳–׳ ׳™׳•׳×',
      'clock': '׳©׳¢׳•׳', 'key': '׳׳₪׳×׳—', 'telescope': '׳˜׳׳¡׳§׳•׳₪', 'blanket': '׳©׳׳™׳›׳”',
      'toothbrush': '׳׳‘׳¨׳©׳× ׳©׳™׳ ׳™׳™׳', 'phone': '׳˜׳׳₪׳•׳', 'pillow': '׳›׳¨׳™׳×',
      'socks': '׳’׳¨׳‘׳™׳™׳', 'gloves': '׳›׳₪׳₪׳•׳×', 'shirt': '׳—׳•׳׳¦׳”', 'spoon': '׳›׳₪׳™׳×',
      'scissors': '׳׳¡׳₪׳¨׳™׳™׳', 'fork': '׳׳–׳׳’', 'knife': '׳¡׳›׳™׳', 'broom': '׳׳˜׳׳˜׳',
      'watch': '׳©׳¢׳•׳', 'bag': '׳×׳™׳§', 'hammer': '׳₪׳˜׳™׳©', 'lock': '׳׳ ׳¢׳•׳',
      'towel': '׳׳’׳‘׳×', 'stove': '׳›׳™׳¨׳™׳™׳', 'ruler': '׳¡׳¨׳’׳',
      // ׳˜׳‘׳¢
      'sun': '׳©׳׳©', 'moon': '׳™׳¨׳—', 'sky': '׳©׳׳™׳™׳', 'tree': '׳¢׳¥', 'flower': '׳₪׳¨׳—',
      'grass': '׳“׳©׳', 'cloud': '׳¢׳ ׳', 'snow': '׳©׳׳’', 'rain': '׳’׳©׳', 'sea': '׳™׳',
      'hill': '׳’׳‘׳¢׳”', 'mountain': '׳”׳¨', 'ocean': '׳׳•׳§׳™׳™׳ ׳•׳¡', 'forest': '׳™׳¢׳¨',
      'volcano': '׳”׳¨ ׳’׳¢׳©', 'river': '׳ ׳”׳¨', 'rainbow': '׳§׳©׳×', 'cave': '׳׳¢׳¨׳”',
      'fire': '׳׳©', 'ice': '׳§׳¨׳—', 'thunder': '׳¨׳¢׳',
      // ׳׳ ׳©׳™׳
      'mom': '׳׳׳', 'dad': '׳׳‘׳', 'sister': '׳׳—׳•׳×', 'brother': '׳׳—', 'family': '׳׳©׳₪׳—׳”',
      'daughter': '׳‘׳×', 'son': '׳‘׳', 'father': '׳׳‘׳', 'mother': '׳׳׳',
      'grandmother': '׳¡׳‘׳×׳', 'teenager': '׳ ׳¢׳¨', 'friend': '׳—׳‘׳¨', 'teacher': '׳׳•׳¨׳”',
      'baby': '׳×׳™׳ ׳•׳§', 'child': '׳™׳׳“',
      // ׳׳§׳•׳׳•׳×
      'home': '׳‘׳™׳×', 'school': '׳‘׳™׳× ׳¡׳₪׳¨', 'house': '׳‘׳™׳×', 'bedroom': '׳—׳“׳¨ ׳©׳™׳ ׳”',
      'kitchen': '׳׳˜׳‘׳—', 'living room': '׳¡׳׳•׳', 'bathroom': '׳—׳“׳¨ ׳׳׳‘׳˜׳™׳”',
      'garage': '׳׳•׳¡׳', 'garden': '׳’׳™׳ ׳”', 'basement': '׳׳¨׳×׳£', 'library': '׳¡׳₪׳¨׳™׳™׳”',
      'office': '׳׳©׳¨׳“',
      // ׳×׳—׳‘׳•׳¨׳”
      'car': '׳׳›׳•׳ ׳™׳×', 'bus': '׳׳•׳˜׳•׳‘׳•׳¡', 'airplane': '׳׳˜׳•׳¡', 'train': '׳¨׳›׳‘׳×',
      'boat': '׳¡׳™׳¨׳”', 'motorcycle': '׳׳•׳₪׳ ׳•׳¢', 'taxi': '׳׳•׳ ׳™׳×', 'bicycle': '׳׳•׳₪׳ ׳™׳™׳',
      'ship': '׳׳•׳ ׳™׳™׳”', 'subway': '׳¨׳›׳‘׳× ׳×׳—׳×׳™׳×', 'truck': '׳׳©׳׳™׳×', 'scooter': '׳§׳•׳¨׳§׳™׳ ׳˜',
      // ׳×׳›׳•׳ ׳•׳×
      'soft': '׳¨׳', 'hard': '׳§׳©׳”', 'big': '׳’׳“׳•׳', 'small': '׳§׳˜׳', 'hot': '׳—׳',
      'cold': '׳§׳¨', 'sweet': '׳׳×׳•׳§', 'sour': '׳—׳׳•׳¥', 'round': '׳¢׳’׳•׳', 'loud': '׳¨׳•׳¢׳©',
      'tall': '׳’׳‘׳•׳”', 'fast': '׳׳”׳™׳¨', 'green': '׳™׳¨׳•׳§', 'yellow': '׳¦׳”׳•׳‘', 'white': '׳׳‘׳',
      'red': '׳׳“׳•׳', 'blue': '׳›׳—׳•׳',
      // ׳—׳•׳׳¨׳™׳
      'metal': '׳׳×׳›׳×', 'rock': '׳¡׳׳¢', 'stone': '׳׳‘׳', 'wood': '׳¢׳¥', 'glass': '׳–׳›׳•׳›׳™׳×',
      'plastic': '׳₪׳׳¡׳˜׳™׳§', 'gold': '׳–׳”׳‘', 'diamond': '׳™׳”׳׳•׳', 'sand': '׳—׳•׳',
      // ׳—׳׳§׳™ ׳’׳•׳£
      'hand': '׳™׳“', 'eye': '׳¢׳™׳', 'ear': '׳׳•׳–׳', 'nose': '׳׳£', 'mouth': '׳₪׳”',
      'eyes': '׳¢׳™׳ ׳™׳™׳', 'ears': '׳׳•׳–׳ ׳™׳™׳',
      // ׳™׳׳™׳ ׳•׳—׳•׳“׳©׳™׳
      'monday': '׳™׳•׳ ׳©׳ ׳™', 'friday': '׳™׳•׳ ׳©׳™׳©׳™', 'winter': '׳—׳•׳¨׳£',
      'january': '׳™׳ ׳•׳׳¨', 'summer': '׳§׳™׳¥',
      // ׳׳¡׳₪׳¨׳™׳
      'five': '׳—׳׳©',
      // ׳¦׳•׳¨׳•׳×
      'circle': '׳¢׳™׳’׳•׳',
      // ׳‘׳’׳“׳™׳
      'clothes': '׳‘׳’׳“׳™׳',
      // ׳׳§׳¦׳•׳¢׳•׳×
      'programmer': '׳׳×׳›׳ ׳×', 'mechanic': '׳׳›׳•׳ ׳׳™', 'electrician': '׳—׳©׳׳׳׳™', 'plumber': '׳©׳¨׳‘׳¨׳‘',
      'manager': '׳׳ ׳”׳',
      // ׳׳§׳•׳׳•׳× ׳•׳×׳—׳‘׳•׳¨׳”
      'road': '׳›׳‘׳™׳©', 'street': '׳¨׳—׳•׳‘',
      // ׳˜׳›׳ ׳•׳׳•׳’׳™׳”
      'monitor': '׳׳¡׳', 'keyboard': '׳׳§׳׳“׳×', 'computer': '׳׳—׳©׳‘',
      // ׳׳©׳§׳׳•׳×
      'wine': '׳™׳™׳', 'soda': '׳¡׳•׳“׳”',
      // ׳₪׳¢׳•׳׳•׳×
      'gives': '׳ ׳•׳×׳', 'give': '׳ ׳•׳×׳', 'star': '׳›׳•׳›׳‘',
      // ׳§׳˜׳’׳•׳¨׳™׳•׳×
      'vegetable': '׳™׳¨׳§', 'vegetables': '׳™׳¨׳§׳•׳×', 'fruit': '׳₪׳¨׳™', 'fruits': '׳₪׳™׳¨׳•׳×',
      'season': '׳¢׳•׳ ׳”', 'seasons': '׳¢׳•׳ ׳•׳×', 'drink': '׳׳©׳§׳”', 'drinks': '׳׳©׳§׳׳•׳×',
      'vehicle': '׳›׳׳™ ׳¨׳›׳‘', 'vehicles': '׳›׳׳™ ׳¨׳›׳‘', 'tool': '׳›׳׳™', 'tools': '׳›׳׳™׳',
      'planet': '׳›׳•׳›׳‘ ׳׳›׳×', 'planets': '׳›׳•׳›׳‘׳™ ׳׳›׳×',
    };
    
    // ׳—׳₪׳© ׳§׳•׳“׳ ׳‘׳׳™׳׳•׳ ׳”׳׳§׳•׳׳™, ׳•׳׳ ׳׳ ׳ ׳׳¦׳ - ׳‘׳׳™׳׳•׳ ׳”׳׳¨׳›׳–׳™
    const translation = getTranslationWithFallback(wordLower, localTranslations, '');
    return translation || null;
  };

  // ׳׳¦׳ ׳×׳¨׳’׳•׳ ׳׳”׳©׳׳׳•׳× ׳”׳§׳™׳™׳׳•׳×
  const findTranslationFromQuestions = (word: string): string | null => {
    const wordLower = word.toLowerCase();
    
    // ׳—׳₪׳© ׳‘׳©׳׳׳•׳× ׳”׳§׳™׳™׳׳•׳×
    for (const difficulty in QUESTIONS_BY_DIFFICULTY) {
      const questions = QUESTIONS_BY_DIFFICULTY[difficulty as keyof typeof QUESTIONS_BY_DIFFICULTY];
      for (const q of questions) {
        // ׳׳ ׳”׳׳™׳׳” ׳”׳™׳ ׳”׳×׳©׳•׳‘׳” ׳”׳ ׳›׳•׳ ׳”, ׳§׳— ׳׳× ׳”׳×׳¨׳’׳•׳ ׳׳”׳”׳¡׳‘׳¨
        if (q.answer.toLowerCase() === wordLower && q.explanationHe) {
          // ׳ ׳¡׳” ׳׳—׳׳¥ ׳׳× ׳”׳×׳¨׳’׳•׳ ׳׳”׳”׳¡׳‘׳¨
          // ׳”׳”׳¡׳‘׳¨ ׳™׳›׳•׳ ׳׳”׳™׳•׳× "׳›׳¨׳™׳× ׳¨׳›׳”" ׳׳• "׳›׳¨׳™׳× ׳¨׳›׳” - Pillow is soft"
          const parts = q.explanationHe.split('-');
          if (parts.length > 0) {
            const translation = parts[0].trim();
            // ׳׳ ׳”׳×׳¨׳’׳•׳ ׳”׳•׳ ׳׳™׳׳” ׳׳—׳× ׳׳• ׳©׳×׳™׳™׳, ׳§׳— ׳׳•׳×׳•
            if (translation.split(/\s+/).length <= 2) {
              return translation;
            }
          }
        }
      }
    }
    
    return null;
  };

  const collectAllWordsFromGame = () => {
    const wordsMap = new Map<string, string>();
    
    if (!questions || questions.length === 0) {
      return [];
    }
    
    questions.forEach((question) => {
      // ׳”׳•׳¡׳£ ׳׳× ׳”׳×׳©׳•׳‘׳” ׳”׳ ׳›׳•׳ ׳” - ׳¨׳§ ׳׳”׳׳™׳׳•׳ ׳”׳‘׳¡׳™׳¡׳™!
      if (question.answer) {
        const answerWord = question.answer.toLowerCase();
        if (!wordsMap.has(answerWord)) {
          // ׳”׳©׳×׳׳© ׳¨׳§ ׳‘׳׳™׳׳•׳ ׳”׳‘׳¡׳™׳¡׳™ - ׳׳ ׳×׳ ׳¡׳” ׳׳—׳׳¥ ׳׳”׳”׳¡׳‘׳¨!
          const translation = getTranslationForWord(answerWord);
          
          // ׳׳ ׳™׳© ׳×׳¨׳’׳•׳ ׳˜׳•׳‘ ׳׳”׳׳™׳׳•׳, ׳©׳׳•׳¨ ׳׳•׳×׳•
          if (translation && translation !== answerWord) {
          wordsMap.set(answerWord, translation);
          }
        }
      }
      
      // ׳”׳•׳¡׳£ ׳׳™׳׳™׳ ׳׳”׳׳₪׳©׳¨׳•׳™׳•׳× - ׳¨׳§ ׳׳”׳׳™׳׳•׳ ׳”׳‘׳¡׳™׳¡׳™!
      if (question.options) {
        question.options.forEach(option => {
          const optionWords = extractEnglishWords(option);
          optionWords.forEach(word => {
            if (!wordsMap.has(word.toLowerCase())) {
              // ׳”׳©׳×׳׳© ׳¨׳§ ׳‘׳׳™׳׳•׳ ׳”׳‘׳¡׳™׳¡׳™ - ׳׳ ׳×׳ ׳¡׳” ׳׳—׳׳¥ ׳׳”׳”׳¡׳‘׳¨!
              const translation = getTranslationForWord(word);
              
              // ׳׳ ׳™׳© ׳×׳¨׳’׳•׳ ׳˜׳•׳‘ ׳׳”׳׳™׳׳•׳, ׳©׳׳•׳¨ ׳׳•׳×׳•
              if (translation && translation !== word) {
                wordsMap.set(word.toLowerCase(), translation);
              }
            }
          });
        });
      }
    });
    
    // ׳”׳—׳–׳¨ ׳¨׳§ ׳׳™׳׳™׳ ׳¢׳ ׳×׳¨׳’׳•׳ ׳×׳§׳£
    return Array.from(wordsMap.entries())
      .filter(([word, translation]) => translation && translation !== word)
      .map(([word, translation]) => ({
      word,
        translation: translation
    }));
  };

  const saveLearnedWord = async (word: string, translation: string, isCorrect: boolean) => {
    if (!user) {
      console.log('Cannot save word - no user logged in');
      return;
    }
    
    try {
      // ׳•׳“׳ ׳©׳”׳×׳¨׳’׳•׳ ׳”׳•׳ ׳”׳ ׳›׳•׳ - ׳§׳•׳“׳ ׳›׳ ׳׳”׳׳™׳׳•׳ ׳”׳‘׳¡׳™׳¡׳™
      let finalTranslation = getTranslationForWord(word);
      
      // ׳׳ ׳׳™׳ ׳‘׳׳™׳׳•׳, ׳ ׳¡׳” ׳׳׳¦׳•׳ ׳׳”׳©׳׳׳•׳× ׳”׳§׳™׳™׳׳•׳×
      if (!finalTranslation) {
        finalTranslation = findTranslationFromQuestions(word);
      }
      
      // ׳׳ ׳¢׳“׳™׳™׳ ׳׳™׳, ׳ ׳¡׳” ׳׳”׳©׳×׳׳© ׳‘׳×׳¨׳’׳•׳ ׳©׳§׳™׳‘׳׳ ׳• (׳׳‘׳ ׳¨׳§ ׳׳ ׳”׳•׳ ׳˜׳•׳‘)
      if (!finalTranslation && translation && translation !== word && !translation.includes('׳”׳׳™׳׳”') && !translation.includes('׳‘׳׳ ׳’׳׳™׳×')) {
        // ׳‘׳“׳•׳§ ׳׳ ׳”׳×׳¨׳’׳•׳ ׳”׳•׳ ׳׳™׳׳” ׳׳—׳× ׳׳• ׳©׳×׳™׳™׳ (׳׳ ׳׳©׳₪׳˜ ׳׳¨׳•׳)
        if (translation.split(/\s+/).length <= 2) {
          finalTranslation = translation;
        }
      }
      
      // ׳׳ ׳׳™׳ ׳×׳¨׳’׳•׳ ׳˜׳•׳‘, ׳©׳׳•׳¨ ׳׳× ׳”׳׳™׳׳” ׳¢׳ ׳”׳×׳¨׳’׳•׳ "׳׳ ׳™׳“׳•׳¢" (׳ ׳¦׳˜׳¨׳ ׳׳”׳•׳¡׳™׳£ ׳׳׳™׳׳•׳ ׳׳׳•׳—׳¨ ׳™׳•׳×׳¨)
      if (!finalTranslation || finalTranslation === word || finalTranslation.includes('׳”׳׳™׳׳”') || finalTranslation.includes('׳‘׳׳ ׳’׳׳™׳×')) {
        // ׳©׳׳•׳¨ ׳׳× ׳”׳׳™׳׳” ׳¢׳ ׳¡׳™׳׳ ׳©׳׳׳” - ׳ ׳¦׳˜׳¨׳ ׳׳”׳•׳¡׳™׳£ ׳׳׳™׳׳•׳ ׳׳׳•׳—׳¨ ׳™׳•׳×׳¨
        finalTranslation = '׳׳ ׳™׳“׳•׳¢';
      }
      
      console.log(`Saving word: ${word} (${finalTranslation})`);
      const response = await fetch('/api/learned-words/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          word: word,
          translation: finalTranslation,
          gameName: 'MultipleChoice',
          difficulty: levelMap[level] || 'beginner',
          isCorrect: isCorrect
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Failed to save word "${word}":`, response.status, errorData);
        throw new Error(`Failed to save word: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Word "${word}" saved successfully:`, result);
      return result;
    } catch (error) {
      console.error(`Failed to save learned word "${word}":`, error);
      throw error;
    }
  };

  const handleSelect = async (option: string) => {
    if (feedback) return;
    
    const question = questions[current];
    const isCorrect = option === question.answer;
    
    setSelected(option);

    if (isCorrect) {
      const explanation = question.explanationHe || question.explanation || `׳”׳×׳©׳•׳‘׳” ׳”׳ ׳›׳•׳ ׳” ׳”׳™׳ "${question.answer}".`;
      setFeedback(`׳ ׳›׳•׳! נ‰\n\n׳”׳¡׳‘׳¨: ${explanation}`);
      setScore(prev => prev + 10);
      if (successAudio.current) {
        successAudio.current.currentTime = 0;
        successAudio.current.play().catch(err => console.error('Error playing success audio:', err));
      }
    } else {
      const explanation = question.explanationHe || question.explanation || `׳”׳×׳©׳•׳‘׳” ׳”׳ ׳›׳•׳ ׳” ׳”׳™׳ "${question.answer}".`;
      setFeedback(`׳׳ ׳ ׳›׳•׳! ג\n\n׳”׳¡׳‘׳¨: ${explanation}`);
      addMistake(question.id);
      if (failAudio.current) {
        failAudio.current.currentTime = 0;
        failAudio.current.play().catch(err => console.error('Error playing fail audio:', err));
      }
    }
  };
  
  const handleNext = async () => {
    setFeedback(null);
    setSelected(null);
    setShowHint(false);
    
    if (current < questions.length - 1) {
      setCurrent(prev => prev + 1);
    } else {
      // ׳–׳” ׳”׳©׳׳׳” ׳”׳׳—׳¨׳•׳ ׳” - ׳׳¡׳•׳£ ׳׳× ׳›׳ ׳”׳׳™׳׳™׳ ׳׳₪׳ ׳™ ׳¡׳™׳•׳ ׳”׳׳©׳—׳§
      console.log('Game finished! Collecting words...');
      const allWords = collectAllWordsFromGame();
      console.log('All collected words:', allWords);
      
      // ׳¢׳“׳›׳ ׳׳× ׳”-state ׳¢׳ ׳”׳׳™׳׳™׳
      setLearnedWordsList(allWords);
      
      // ׳©׳׳•׳¨ ׳׳× ׳›׳ ׳”׳׳™׳׳™׳ (׳¨׳§ ׳׳ ׳”׳׳©׳×׳׳© ׳׳—׳•׳‘׳¨ ׳•׳׳ ׳׳©׳—׳§ ׳¢׳ ׳׳™׳׳™׳ ׳©׳ ׳׳׳“׳•)
      // ׳‘׳“׳•׳§ ׳׳™׳׳• ׳׳™׳׳™׳ ׳›׳‘׳¨ ׳§׳™׳™׳׳•׳× ׳‘׳׳¡׳“ ׳”׳ ׳×׳•׳ ׳™׳ ׳׳₪׳ ׳™ ׳”׳©׳׳™׳¨׳”
      if (user && allWords.length > 0 && !useLearnedWords) {
        console.log('User is logged in, checking existing words before saving...');
        try {
          // ׳˜׳¢׳ ׳׳× ׳›׳ ׳”׳׳™׳׳™׳ ׳”׳§׳™׳™׳׳•׳× ׳©׳ ׳”׳׳©׳×׳׳©
          const existingWordsResponse = await fetch(`/api/learned-words?userId=${user.id}`);
          if (!existingWordsResponse.ok) {
            throw new Error('Failed to fetch existing words');
          }
          const existingWordsData = await existingWordsResponse.json();
          const existingWords = existingWordsData.learnedWords || [];
          
          // ׳¦׳•׳¨ Set ׳©׳ ׳׳™׳׳™׳ ׳§׳™׳™׳׳•׳× (׳‘׳›׳ ׳”׳׳©׳—׳§׳™׳) ׳׳‘׳“׳™׳§׳” ׳׳”׳™׳¨׳”
          const existingWordsSet = new Set(
            existingWords.map((w: any) => w.word.toLowerCase())
          );
          
          // ׳¡׳ ׳ ׳¨׳§ ׳׳× ׳”׳׳™׳׳™׳ ׳”׳—׳“׳©׳•׳× (׳©׳׳™׳ ׳ ׳§׳™׳™׳׳•׳× ׳‘׳›׳ ׳”׳׳©׳—׳§׳™׳)
          const newWords = allWords.filter(wordData => {
            return !existingWordsSet.has(wordData.word.toLowerCase());
          });
          
          console.log(`Found ${existingWords.length} existing words, ${newWords.length} new words to save`);
          
          // ׳”׳¦׳’ ׳׳× ׳›׳ ׳”׳׳™׳׳™׳ ׳©׳׳׳“ ׳‘׳׳©׳—׳§ (׳׳ ׳¨׳§ ׳”׳—׳“׳©׳•׳×)
          // ׳׳‘׳ ׳©׳׳•׳¨ ׳¨׳§ ׳׳× ׳”׳׳™׳׳™׳ ׳”׳—׳“׳©׳•׳×
          setLearnedWordsList(allWords);
          
          // ׳©׳׳•׳¨ ׳¨׳§ ׳׳× ׳”׳׳™׳׳™׳ ׳”׳—׳“׳©׳•׳×
          if (newWords.length > 0) {
            console.log('Saving', newWords.length, 'new words to database...');
            const savePromises = newWords.map(wordData => 
          saveLearnedWord(wordData.word, wordData.translation, true)
        );
          const results = await Promise.allSettled(savePromises);
          const successful = results.filter(r => r.status === 'fulfilled').length;
          const failed = results.filter(r => r.status === 'rejected').length;
          console.log(`Words save completed: ${successful} successful, ${failed} failed`);
          } else {
            console.log('No new words to save - all words already exist');
          }
        } catch (error) {
          console.error('Error checking/saving words:', error);
          // ׳‘׳׳§׳¨׳” ׳©׳ ׳©׳’׳™׳׳”, ׳ ׳¡׳” ׳׳©׳׳•׳¨ ׳׳× ׳›׳ ׳”׳׳™׳׳™׳ (fallback)
          const savePromises = allWords.map(wordData => 
            saveLearnedWord(wordData.word, wordData.translation, true)
          );
          Promise.allSettled(savePromises).catch(err => 
            console.error('Error in fallback save:', err)
          );
        }
      }
      
      setFinished(true);
      
      if (user) {
        try {
          const response = await fetch('/api/games/update-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              gameName: 'MultipleChoice',
              score,
              won: score > 0,
              time,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.newlyCompletedAchievements && data.newlyCompletedAchievements.length > 0) {
              setNewlyCompletedAchievements(data.newlyCompletedAchievements);
              setShowAchievementModal(true);
              
              // ׳¢׳“׳›׳ ׳׳× ׳”׳׳©׳×׳׳© ׳¢׳ ׳”׳׳×׳ ׳•׳× ׳”׳—׳“׳©׳•׳×
              if (updateUser && user) {
                updateUser(user);
              }
            }
          }
        } catch (error) {
          console.error('Failed to update game stats:', error);
        }
      }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">׳˜׳•׳¢׳...</div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-purple-500 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-8 text-center border-4 border-blue-200">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">׳‘׳—׳™׳¨׳” ׳׳¨׳•׳‘׳”</h1>
          <p className="text-xl text-gray-600 mb-8">׳‘׳—׳¨ ׳׳× ׳”׳×׳©׳•׳‘׳” ׳”׳ ׳›׳•׳ ׳”</p>
          
          {/* ׳‘׳—׳™׳¨׳× ׳׳¦׳‘ ׳׳©׳—׳§ - ׳¨׳’׳™׳ ׳׳• ׳׳™׳׳™׳ ׳©׳ ׳׳׳“׳• */}
          <div className="mb-6 bg-white bg-opacity-90 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">׳‘׳—׳¨ ׳׳¦׳‘ ׳׳©׳—׳§:</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setUseLearnedWords(false);
                }}
                className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  !useLearnedWords
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                נ® ׳׳©׳—׳§ ׳¨׳’׳™׳
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    alert('׳׳ ׳ ׳”׳×׳—׳‘׳¨ ׳›׳“׳™ ׳׳©׳—׳§ ׳¢׳ ׳”׳׳™׳׳™׳ ׳©׳׳׳“׳×');
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
                  'ג³ ׳˜׳•׳¢׳ ׳׳™׳׳™׳...'
                ) : (
                  <>
                    נ“ ׳׳©׳—׳§ ׳¢׳ ׳׳™׳׳™׳ ׳©׳ ׳׳׳“׳•
                    {learnedWordsData.length > 0 && (
                      <span className="block text-sm mt-1">({learnedWordsData.length} ׳׳™׳׳™׳ ׳–׳׳™׳ ׳•׳×)</span>
                    )}
                  </>
                )}
              </button>
              {!user && (
                <p className="text-sm text-gray-600 text-center mt-2">
                  נ’¡ ׳”׳×׳—׳‘׳¨ ׳›׳“׳™ ׳׳©׳—׳§ ׳¢׳ ׳”׳׳™׳׳™׳ ׳©׳׳׳“׳×
                </p>
              )}
            </div>
            {useLearnedWords && learnedWordsData.length === 0 && !loadingLearnedWords && user && (
              <p className="text-red-500 text-center mt-4 font-bold">
                ׳׳™׳ ׳׳¡׳₪׳™׳§ ׳׳™׳׳™׳ ׳©׳ ׳׳׳“׳• ׳›׳“׳™ ׳׳©׳—׳§. ׳׳ ׳ ׳©׳—׳§ ׳‘׳׳©׳—׳§׳™׳ ׳׳—׳¨׳™׳ ׳›׳“׳™ ׳׳׳׳•׳“ ׳׳™׳׳™׳.
              </p>
            )}
            
            {/* ׳‘׳—׳™׳¨׳× ׳›׳׳•׳× ׳׳™׳׳™׳ (׳¨׳§ ׳׳ ׳™׳© ׳׳™׳׳™׳ ׳©׳ ׳׳׳“׳•) */}
            {useLearnedWords && learnedWordsData.length > 0 && !loadingLearnedWords && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <label className="block text-sm font-bold text-blue-800 mb-2 text-center">
                  ׳‘׳—׳¨ ׳׳™׳׳™׳ ׳׳׳©׳—׳§:
                </label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 justify-center">
                    <input
                      type="radio"
                      id="all-words-mc"
                      name="word-selection-mc"
                      checked={selectedWordsCount === null && selectedWords.length === 0 && !showWordSelector}
                      onChange={() => {
                        setSelectedWordsCount(null);
                        setSelectedWords([]);
                        setShowWordSelector(false);
                      }}
                      className="w-5 h-5"
                    />
                    <label htmlFor="all-words-mc" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      ׳›׳ ׳”׳׳™׳׳™׳ ({learnedWordsData.length})
                    </label>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <input
                      type="radio"
                      id="custom-count-mc"
                      name="word-selection-mc"
                      checked={selectedWordsCount !== null && selectedWords.length === 0 && !showWordSelector}
                      onChange={() => {
                        setSelectedWordsCount(Math.min(40, learnedWordsData.length));
                        setSelectedWords([]);
                        setShowWordSelector(false);
                      }}
                      className="w-5 h-5"
                    />
                    <label htmlFor="custom-count-mc" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      ׳›׳׳•׳× ׳׳§׳¨׳׳™׳×:
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
                      id="select-words-mc"
                      name="word-selection-mc"
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
                    <label htmlFor="select-words-mc" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      ׳‘׳—׳¨ ׳׳™׳׳™׳ ׳¡׳₪׳¦׳™׳₪׳™׳•׳×
                    </label>
                  </div>
                  {selectedWordsCount !== null && selectedWords.length === 0 && !showWordSelector && (
                    <p className="text-xs text-gray-600 text-center mt-2">
                      ׳”׳׳™׳׳™׳ ׳ ׳‘׳—׳¨׳•׳× ׳׳§׳¨׳׳™׳× ׳׳×׳•׳ {learnedWordsData.length} ׳׳™׳׳™׳ ׳–׳׳™׳ ׳•׳×
                    </p>
                  )}
                  {selectedWords.length > 0 && (
                    <p className="text-xs text-green-600 text-center mt-2 font-bold">
                      ׳ ׳‘׳—׳¨׳• {selectedWords.length} ׳׳™׳׳™׳
                    </p>
                  )}
                </div>
                
                {/* ׳¨׳©׳™׳׳× ׳‘׳—׳™׳¨׳× ׳׳™׳׳™׳ */}
                {(showWordSelector || selectedWords.length > 0) && (
                  <div className="mt-4 max-h-60 overflow-y-auto border-2 border-blue-300 rounded-lg p-3 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {learnedWordsData.map((wordData, index) => {
                        const isSelected = selectedWords.some(w => w.word.toLowerCase() === wordData.word.toLowerCase());
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
                                  setSelectedWords([...selectedWords, wordData]);
                                  setSelectedWordsCount(null);
                                  setShowWordSelector(true);
                                } else {
                                  setSelectedWords(selectedWords.filter(w => w.word.toLowerCase() !== wordData.word.toLowerCase()));
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
                          ׳ ׳§׳” ׳‘׳—׳™׳¨׳”
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWords([...learnedWordsData]);
                            setShowWordSelector(true);
                          }}
                          className="px-4 py-1 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600"
                        >
                          ׳‘׳—׳¨ ׳”׳›׳
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
            <button
              onClick={() => {
                if (useLearnedWords && learnedWordsData.length === 0) {
                  alert('׳׳™׳ ׳׳¡׳₪׳™׳§ ׳׳™׳׳™׳ ׳©׳ ׳׳׳“׳• ׳›׳“׳™ ׳׳©׳—׳§. ׳׳ ׳ ׳©׳—׳§ ׳‘׳׳©׳—׳§׳™׳ ׳׳—׳¨׳™׳ ׳›׳“׳™ ׳׳׳׳•׳“ ׳׳™׳׳™׳.');
                  return;
                }
                if (useLearnedWords && showWordSelector && selectedWords.length === 0) {
                  alert('׳׳ ׳ ׳‘׳—׳¨ ׳׳₪׳—׳•׳× ׳׳™׳׳” ׳׳—׳× ׳׳׳©׳—׳§.');
                  return;
                }
                setGameStarted(true);
              }}
              disabled={useLearnedWords && (learnedWordsData.length === 0 || (showWordSelector && selectedWords.length === 0))}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:from-green-500 hover:to-blue-600 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ׳”׳×׳—׳ ׳׳©׳—׳§
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">׳˜׳•׳¢׳ ׳©׳׳׳•׳×...</div>
      </div>
    );
  }
  
  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-purple-500 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-8 text-center border-4 border-blue-200">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">נ‰ ׳›׳ ׳”׳›׳‘׳•׳“!</h1>
          <p className="text-2xl text-blue-600 mb-4 font-bold">׳”׳¦׳™׳•׳ ׳©׳׳: {score} ׳ ׳§׳•׳“׳•׳×</p>
          <p className="text-xl text-purple-600 mb-8 font-semibold">׳–׳׳: {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</p>
          
          {/* ׳¨׳©׳™׳׳× ׳”׳׳™׳׳™׳ ׳©׳ ׳׳׳“׳• */}
          {learnedWordsList && learnedWordsList.length > 0 && (
            <div className="mb-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">נ“ ׳”׳׳™׳׳™׳ ׳©׳׳׳“׳× ׳‘׳׳©׳—׳§ ׳”׳–׳”:</h2>
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
                  ג… ׳”׳׳™׳׳™׳ ׳ ׳©׳׳¨׳• ׳‘׳“׳£ ׳”׳׳™׳׳™׳ ׳©׳ ׳׳׳“׳•
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xl font-bold shadow-lg hover:from-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105"
            >
              ׳©׳—׳§ ׳©׳•׳‘ נ”„
            </button>
            {user && learnedWordsList && learnedWordsList.length > 0 && (
              <a
                href="/learned-words"
                className="px-8 py-3 bg-gradient-to-r from-indigo-400 to-purple-500 text-white rounded-full text-xl font-bold shadow-lg hover:from-indigo-500 hover:to-purple-600 transition-transform transform hover:scale-105"
              >
                נ“ ׳¦׳₪׳” ׳‘׳›׳ ׳”׳׳™׳׳™׳
              </a>
            )}
            <button
              onClick={() => window.location.href = '/games'}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full text-xl font-bold shadow-lg hover:from-green-600 hover:to-teal-700 transition-transform transform hover:scale-105"
            >
              ׳׳©׳—׳§׳™׳ ׳ ׳•׳¡׳₪׳™׳ נ®
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const question = questions[current];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-purple-500 p-4">
      {/* ׳ ׳’׳ ׳¦׳׳™׳׳™׳ */}
      <audio ref={successAudio} src="/voise/׳”׳¦׳׳—׳”.dat" preload="auto" />
      <audio ref={failAudio} src="/voise/׳›׳©׳׳•׳.dat" preload="auto" />
      
      <AdManager showBanner={true} bannerPosition="top" testMode={false} />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold text-white">
              ׳©׳׳׳” {current + 1}/{questions.length}
          </div>
            <div className="text-xl text-blue-100">
              ג±ן¸ {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xl font-bold text-yellow-200">
              נ† {score}
            </div>
              </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
                </div>
              </div>
        
        {/* Question */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 mb-6 border-2 border-blue-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {question.question}
          </h2>
          
          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {question.options.map((option, index) => (
                  <button
                key={index}
                    onClick={() => handleSelect(option)}
                disabled={!!feedback}
                className={`p-6 rounded-xl text-xl font-bold transition-all duration-300 transform ${
                  selected === option
                    ? feedback === '׳ ׳›׳•׳! נ‰'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105'
                    : feedback && option === question.answer
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                    : `bg-gradient-to-r ${index === 0 ? 'from-blue-400 to-blue-500' : index === 1 ? 'from-purple-400 to-purple-500' : index === 2 ? 'from-pink-400 to-pink-500' : 'from-orange-400 to-orange-500'} text-white hover:scale-105 hover:shadow-lg`
                } ${feedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
          
          {/* Feedback */}
              {feedback && (
            <div className={`text-center mb-6 p-6 rounded-2xl shadow-lg ${
              feedback.includes('׳ ׳›׳•׳! נ‰') ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
            }`}>
              <div className="text-2xl font-bold animate-bounce whitespace-pre-line">{feedback}</div>
                    </div>
                  )}
          
          {/* Next Button */}
          {feedback && (
            <div className="text-center">
                  <button
                    onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xl font-bold shadow-lg hover:from-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105"
                  >
                {current < questions.length - 1 ? '׳©׳׳׳” ׳”׳‘׳׳” ג¡ן¸' : '׳¡׳™׳™׳ ׳׳©׳—׳§ נ'}
                  </button>
                </div>
              )}
            </div>
      </div>
      
      <AdManager showBanner={true} bannerPosition="bottom" testMode={false} />
      
      {/* Achievement Modal */}
      {showAchievementModal && newlyCompletedAchievements.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAchievementModal(false)}>
          <div className="bg-gradient-to-br from-yellow-100 via-orange-50 to-yellow-100 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-yellow-400 animate-bounce" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">נ†</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">׳›׳ ׳”׳›׳‘׳•׳“! ׳”׳™׳©׳’ ׳—׳“׳©!</h2>
              
              {newlyCompletedAchievements.map((achievement, index) => (
                <div key={achievement.id} className="mb-4 p-4 bg-white rounded-xl shadow-lg border-2 border-yellow-300">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <div className="text-xl font-bold text-gray-800 mb-2">{achievement.name}</div>
                  <div className="flex justify-center gap-4 text-lg">
                    <div className="flex items-center text-yellow-600">
                      <span className="mr-1">נ’</span>
                      <span className="font-bold">+{achievement.reward}</span>
                    </div>
                    {achievement.xpReward > 0 && (
                      <div className="flex items-center text-blue-600">
                        <span className="mr-1">ג­</span>
                        <span className="font-bold">+{achievement.xpReward} XP</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => {
                  setShowAchievementModal(false);
                  setNewlyCompletedAchievements([]);
                }}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xl font-bold shadow-lg hover:from-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105"
              >
                ׳׳¢׳•׳׳”! נ‰
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


