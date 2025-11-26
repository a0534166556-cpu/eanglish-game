'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthUser from '@/lib/useAuthUser';
import { getTranslationOrDefault } from '@/lib/translations';

// פונקציה לקבלת תרגום נכון למילה
const getCorrectTranslation = (word: string, currentTranslation: string): string => {
  const wordLower = word.toLowerCase().trim();
  
  // תמיד נסה לקבל תרגום מהמילון המרכזי קודם
  const dictionaryTranslation = getTranslationOrDefault(wordLower, '');
  // אם מצאנו תרגום במילון (ולא מחרוזת ריקה ולא "לא ידוע"), החזר אותו
  if (dictionaryTranslation && 
      dictionaryTranslation.trim() !== '' && 
      dictionaryTranslation !== 'לא ידוע') {
    return dictionaryTranslation;
  }
  
  // בדוק אם התרגום הנוכחי הוא באנגלית (רק אותיות אנגליות)
  const isEnglish = (text: string): boolean => {
    if (!text) return false;
    // בדוק אם הטקסט מכיל רק אותיות אנגליות, רווחים, ומקפים
    const englishPattern = /^[a-zA-Z\s\-]+$/;
    return englishPattern.test(text) && text.trim().length > 0;
  };
  
  // אם התרגום הנוכחי הוא באנגלית, החזר "לא ידוע" (כי כבר בדקנו במילון)
  if (currentTranslation && isEnglish(currentTranslation)) {
    return 'לא ידוע';
  }
  
  // אם התרגום הנוכחי הוא משפט ארוך או לא נכון, החזר "לא ידוע"
  if (currentTranslation && currentTranslation.length > 20) {
    return 'לא ידוע';
  }
  
  // אם התרגום הנוכחי הוא "לא ידוע", אבל לא מצאנו במילון, החזר "לא ידוע"
  if (currentTranslation === 'לא ידוע') {
    return 'לא ידוע';
  }
  
  // אחרת, החזר את התרגום הנוכחי (אם הוא בעברית)
  return currentTranslation || 'לא ידוע';
};

interface LearnedWord {
  word: string;
  translation: string;
  game: string;
  difficulty: string;
  learnedAt: string;
  timesSeen: number;
  timesCorrect: number;
  accuracy: number;
}

interface GameStats {
  gameName: string;
  totalWords: number;
  correctWords: number;
  accuracy: number;
}

export default function LearnedWords() {
  const { user, loading: authLoading } = useAuthUser();
  const router = useRouter();
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  useEffect(() => {
    // המתן עד שהאימות יסתיים
    if (authLoading) {
      console.log('LearnedWords - Still loading auth...');
      return;
    }
    
    console.log('LearnedWords - Auth loaded, user:', user);
    
    if (!user) {
      console.log('LearnedWords - No user, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('LearnedWords - User found, loading words...');
    loadLearnedWords();
  }, [user, authLoading, router]);

  const loadLearnedWords = async () => {
    try {
      setLoading(true);
      console.log('LearnedWords - Loading words from API...');
      console.log('LearnedWords - User ID:', user?.id);
      
      // טען נתונים מה-API החדש
      const response = await fetch(`/api/learned-words?userId=${user?.id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('LearnedWords - API error:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to load learned words');
      }
      
      const data = await response.json();
      console.log('LearnedWords - API data loaded:', data);
      console.log('LearnedWords - Number of words:', data.learnedWords?.length || 0);
      console.log('LearnedWords - Words:', data.learnedWords);

      setLearnedWords(data.learnedWords || []);
      setGameStats(data.gameStats || []);
    } catch (error) {
      console.error('Error loading learned words:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGameDisplayName = (gameKey: string): string => {
    const gameNames: { [key: string]: string } = {
      fillBlanks: 'השלמת מילים',
      wordClash: 'קרב זוגי - מילים',
      multipleChoice: 'בחירה מרובה',
      trueFalse: 'נכון/לא נכון',
      pictureDescription: 'תיאור תמונה',
      sentenceBuilder: 'בניית משפטים',
      matchingPairs: 'זוגות תואמים',
      listening: 'האזנה',
      pronunciation: 'הגייה',
      mixedQuiz: 'חידון מעורב'
    };
    return gameNames[gameKey] || gameKey;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'קל';
      case 'medium': return 'בינוני';
      case 'hard': return 'קשה';
      case 'extreme': return 'אקסטרים';
      default: return difficulty;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredWords = learnedWords.filter(word => {
    const gameMatch = selectedGame === 'all' || word.game === selectedGame;
    const difficultyMatch = selectedDifficulty === 'all' || word.difficulty === selectedDifficulty;
    return gameMatch && difficultyMatch;
  });

  const sortedWords = [...filteredWords].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.learnedAt).getTime() - new Date(a.learnedAt).getTime();
      case 'accuracy':
        return b.accuracy - a.accuracy;
      case 'timesSeen':
        return b.timesSeen - a.timesSeen;
      case 'word':
        return a.word.localeCompare(b.word);
      default:
        return 0;
    }
  });

  const uniqueGames = [...new Set(learnedWords.map(word => word.game))];
  const uniqueDifficulties = [...new Set(learnedWords.map(word => word.difficulty))];

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            {authLoading ? 'בודק התחברות...' : 'טוען מילים נלמדות...'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 המילים שלמדתי
          </h1>
          <p className="text-lg text-gray-600">
            כל המילים והביטויים שלמדת מכל המשחקים
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">סה"כ מילים</p>
                <p className="text-2xl font-bold text-gray-900">{learnedWords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">דיוק ממוצע</p>
                <p className="text-2xl font-bold text-gray-900">
                  {learnedWords.length > 0 
                    ? Math.round(learnedWords.reduce((sum, word) => sum + word.accuracy, 0) / learnedWords.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🎮</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">משחקים שיחקת</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueGames.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">מילים מושלמות</p>
                <p className="text-2xl font-bold text-gray-900">
                  {learnedWords.filter(word => word.accuracy >= 80).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סינון לפי משחק
              </label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">כל המשחקים</option>
                {uniqueGames.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סינון לפי רמה
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">כל הרמות</option>
                {uniqueDifficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {getDifficultyLabel(difficulty)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מיון לפי
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">הכי חדש</option>
                <option value="accuracy">דיוק גבוה</option>
                <option value="timesSeen">נצפה הכי הרבה</option>
                <option value="word">אלפביתי</option>
              </select>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        {gameStats.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">סטטיסטיקות לפי משחק</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameStats.map((stat, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{stat.gameName}</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      מילים נלמדות: <span className="font-semibold">{stat.totalWords}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      נכונות: <span className="font-semibold">{stat.correctWords}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      דיוק: <span className={`font-semibold ${getAccuracyColor(stat.accuracy)}`}>
                        {stat.accuracy}%
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Words List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              המילים שלמדת ({sortedWords.length})
            </h2>
          </div>
          
          {sortedWords.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                עדיין לא למדת מילים
              </h3>
              <p className="text-gray-600 mb-4">
                התחל לשחק במשחקים השונים כדי לראות כאן את המילים שלמדת!
              </p>
              <button
                onClick={() => router.push('/games')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                לך למשחקים
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedWords.map((word, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{word.word}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(word.difficulty)}`}>
                          {getDifficultyLabel(word.difficulty)}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {word.game}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{getCorrectTranslation(word.word, word.translation)}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>נצפה: {word.timesSeen} פעמים</span>
                        <span>נכון: {word.timesCorrect} פעמים</span>
                        <span className={`font-semibold ${getAccuracyColor(word.accuracy)}`}>
                          דיוק: {Math.round(word.accuracy)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(word.learnedAt).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/profile')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← חזור לפרופיל
          </button>
        </div>
      </div>
    </main>
  );
}
