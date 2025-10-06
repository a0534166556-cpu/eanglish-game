// מערכת דרגות מתקדמת

export interface RankInfo {
  id: string;
  name: string;
  icon: string;
  minPoints: number;
  color: string;
  description: string;
}

export const RANKS: RankInfo[] = [
  {
    id: 'beginner',
    name: 'מתחיל',
    icon: '🌱',
    minPoints: 0,
    color: 'from-gray-400 to-gray-600',
    description: 'רק התחלת את המסע שלך!'
  },
  {
    id: 'learner',
    name: 'לומד',
    icon: '📚',
    minPoints: 500,
    color: 'from-green-400 to-green-600',
    description: 'אתה לומד מהר!'
  },
  {
    id: 'student',
    name: 'תלמיד',
    icon: '🎓',
    minPoints: 1500,
    color: 'from-blue-400 to-blue-600',
    description: 'תלמיד מצטיין!'
  },
  {
    id: 'skilled',
    name: 'מיומן',
    icon: '⚡',
    minPoints: 3500,
    color: 'from-yellow-400 to-yellow-600',
    description: 'כישוריך משתפרים!'
  },
  {
    id: 'expert',
    name: 'מומחה',
    icon: '🌟',
    minPoints: 7000,
    color: 'from-purple-400 to-purple-600',
    description: 'מומחה אמיתי!'
  },
  {
    id: 'master',
    name: 'אמן',
    icon: '💎',
    minPoints: 12000,
    color: 'from-cyan-400 to-cyan-600',
    description: 'אמן במלוא המובן!'
  },
  {
    id: 'grandmaster',
    name: 'אמן גדול',
    icon: '👑',
    minPoints: 20000,
    color: 'from-pink-400 to-pink-600',
    description: 'אמן גדול מרשים!'
  },
  {
    id: 'champion',
    name: 'אלוף',
    icon: '🏆',
    minPoints: 35000,
    color: 'from-orange-400 to-red-500',
    description: 'אלוף אמיתי!'
  },
  {
    id: 'legend',
    name: 'אגדה',
    icon: '⭐',
    minPoints: 60000,
    color: 'from-yellow-300 via-yellow-500 to-orange-600',
    description: 'אגדה חיה!'
  },
  {
    id: 'myth',
    name: 'מיתוס',
    icon: '🌠',
    minPoints: 100000,
    color: 'from-purple-500 via-pink-500 to-red-500',
    description: 'מיתוס בין תלמידים!'
  }
];

export function getRankByPoints(points: number): RankInfo {
  // מחזיר את הדרגה הגבוהה ביותר שהמשתמש הגיע אליה
  let currentRank = RANKS[0];
  
  for (const rank of RANKS) {
    if (points >= rank.minPoints) {
      currentRank = rank;
    } else {
      break;
    }
  }
  
  return currentRank;
}

export function getNextRank(currentRankId: string): RankInfo | null {
  const currentIndex = RANKS.findIndex(r => r.id === currentRankId);
  if (currentIndex === -1 || currentIndex === RANKS.length - 1) {
    return null;
  }
  return RANKS[currentIndex + 1];
}

export function calculateProgress(points: number): number {
  const currentRank = getRankByPoints(points);
  const nextRank = getNextRank(currentRank.id);
  
  if (!nextRank) {
    return 100; // רמה מקסימלית
  }
  
  const pointsInCurrentRank = points - currentRank.minPoints;
  const pointsNeededForNext = nextRank.minPoints - currentRank.minPoints;
  
  return Math.min(100, Math.floor((pointsInCurrentRank / pointsNeededForNext) * 100));
}

export function calculateTotalScore(user: {
  points: number;
  gamesWon: number;
  gamesPlayed: number;
}): number {
  // נוסחה מורכבת לחישוב ניקוד כולל
  const basePoints = user.points;
  const winBonus = user.gamesWon * 50; // בונוס על כל ניצחון
  const playBonus = user.gamesPlayed * 10; // בונוס על כל משחק
  const winRateBonus = user.gamesPlayed > 0 
    ? Math.floor((user.gamesWon / user.gamesPlayed) * 1000) 
    : 0;
  
  return basePoints + winBonus + playBonus + winRateBonus;
}



