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
    minPoints: 100,
    color: 'from-green-400 to-green-600',
    description: 'אתה לומד מהר!'
  },
  {
    id: 'student',
    name: 'תלמיד',
    icon: '🎓',
    minPoints: 300,
    color: 'from-blue-400 to-blue-600',
    description: 'תלמיד מצטיין!'
  },
  {
    id: 'skilled',
    name: 'מיומן',
    icon: '⚡',
    minPoints: 600,
    color: 'from-yellow-400 to-yellow-600',
    description: 'כישוריך משתפרים!'
  },
  {
    id: 'expert',
    name: 'מומחה',
    icon: '🌟',
    minPoints: 1000,
    color: 'from-purple-400 to-purple-600',
    description: 'מומחה אמיתי!'
  },
  {
    id: 'master',
    name: 'אמן',
    icon: '💎',
    minPoints: 1500,
    color: 'from-cyan-400 to-cyan-600',
    description: 'אמן במלוא המובן!'
  },
  {
    id: 'grandmaster',
    name: 'אמן גדול',
    icon: '👑',
    minPoints: 2200,
    color: 'from-pink-400 to-pink-600',
    description: 'אמן גדול מרשים!'
  },
  {
    id: 'champion',
    name: 'אלוף',
    icon: '🏆',
    minPoints: 3200,
    color: 'from-orange-400 to-red-500',
    description: 'אלוף אמיתי!'
  },
  {
    id: 'legend',
    name: 'אגדה',
    icon: '⭐',
    minPoints: 4500,
    color: 'from-yellow-300 via-yellow-500 to-orange-600',
    description: 'אגדה חיה!'
  },
  {
    id: 'myth',
    name: 'מיתוס',
    icon: '🌠',
    minPoints: 6000,
    color: 'from-purple-500 via-pink-500 to-red-500',
    description: 'מיתוס בין תלמידים!'
  }
];

// פונקציה חדשה לקביעת דרגה לפי רמה - הדרגה קשורה ישירות לרמה
export function getRankByUserStats(user: {
  points: number;
  gamesPlayed: number;
  gamesWon: number;
  completedAchievementsCount?: number;
  level?: number; // רמה של המשתמש
}): RankInfo {
  // אם יש רמה, קבע דרגה לפי הרמה
  if (user.level !== undefined && user.level !== null) {
    // מיפוי רמות לדרגות:
    // רמה 1 -> מתחיל (beginner)
    // רמה 2 -> לומד (learner)
    // רמה 3 -> תלמיד (student)
    // רמה 4 -> מיומן (skilled)
    // רמה 5 -> מומחה (expert)
    // רמה 6 -> אמן (master)
    // רמה 7 -> אמן גדול (grandmaster)
    // רמה 8 -> אלוף (champion)
    // רמה 9 -> אגדה (legend)
    // רמה 10+ -> מיתוס (myth)
    
    const levelToRankIndex: { [key: number]: number } = {
      1: 0,  // מתחיל
      2: 1,  // לומד
      3: 2,  // תלמיד
      4: 3,  // מיומן
      5: 4,  // מומחה
      6: 5,  // אמן
      7: 6,  // אמן גדול
      8: 7,  // אלוף
      9: 8,  // אגדה
    };
    
    const rankIndex = levelToRankIndex[user.level];
    if (rankIndex !== undefined) {
      return RANKS[rankIndex];
    } else if (user.level >= 10) {
      // רמה 10 ומעלה -> מיתוס
      return RANKS[RANKS.length - 1]; // הדרגה האחרונה (מיתוס)
    } else {
      // רמה 0 או שלילית -> מתחיל
      return RANKS[0];
    }
  }
  
  // אם אין רמה, נשתמש בלוגיקה הישנה (לתאימות לאחור)
  const basePoints = user.points;
  const gamesBonus = user.gamesPlayed * 10;
  const winsBonus = user.gamesWon * 20;
  const achievementsBonus = (user.completedAchievementsCount || 0) * 15;
  
  const weightedScore = Math.min(
    basePoints + gamesBonus + winsBonus + achievementsBonus,
    basePoints * 1.2
  );
  
  let currentRank = RANKS[0];
  
  for (const rank of RANKS) {
    if (weightedScore >= rank.minPoints) {
      currentRank = rank;
    } else {
      break;
    }
  }
  
  return currentRank;
}

// פונקציה ישנה - נשמור אותה לתאימות לאחור, אבל נשתמש בפונקציה החדשה
export function getRankByPoints(points: number): RankInfo {
  // מחזיר את הדרגה הגבוהה ביותר שהמשתמש הגיע אליה
  // שימוש בפונקציה הישנה רק אם אין נתונים על משחקים
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

// פונקציה ישנה - נשמור אותה לתאימות לאחור
export function calculateProgress(points: number): number {
  const currentRank = getRankByPoints(points);
  const nextRank = getNextRank(currentRank.id);
  
  if (!nextRank) {
    return 100; // דרגה מקסימלית
  }
  
  const pointsInCurrentRank = points - currentRank.minPoints;
  const pointsNeededForNext = nextRank.minPoints - currentRank.minPoints;
  
  return Math.min(100, Math.floor((pointsInCurrentRank / pointsNeededForNext) * 100));
}

// פונקציה חדשה - מחשבת התקדמות לדרגה הבאה לפי רמה
export function calculateRankProgress(user: {
  points: number;
  gamesPlayed: number;
  gamesWon: number;
  completedAchievementsCount?: number;
  level?: number;
}): number {
  // אם יש רמה, חשב התקדמות לפי הרמה
  if (user.level !== undefined && user.level !== null) {
    // קבע את הדרגה הנוכחית לפי הרמה
    const currentRank = getRankByUserStats({
      points: user.points,
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      completedAchievementsCount: user.completedAchievementsCount || 0,
      level: user.level
    });
    
    const nextRank = getNextRank(currentRank.id);
    
    if (!nextRank) {
      return 100; // דרגה מקסימלית
    }
    
    // חשב את הדרישות לרמה הבאה
    const levelRequirements = calculateLevelRequirements(user.level);
    
    // חשב התקדמות לפי כל הדרישות
    const pointsProgress = levelRequirements.pointsNeeded > 0
      ? Math.min(100, (user.points / levelRequirements.pointsNeeded) * 100)
      : 100;
    
    const gamesProgress = levelRequirements.gamesNeeded > 0
      ? Math.min(100, (user.gamesPlayed / levelRequirements.gamesNeeded) * 100)
      : 100;
    
    const winsProgress = levelRequirements.winsNeeded > 0
      ? Math.min(100, (user.gamesWon / levelRequirements.winsNeeded) * 100)
      : 100;
    
    const achievementsCount = user.completedAchievementsCount || 0;
    const achievementsProgress = levelRequirements.achievementsNeeded > 0
      ? Math.min(100, (achievementsCount / levelRequirements.achievementsNeeded) * 100)
      : 100;
    
    // ההתקדמות הכללית היא המינימום של כל הדרישות (כל הדרישות צריכות להתמלא)
    const overallProgress = Math.min(
      pointsProgress,
      gamesProgress,
      winsProgress,
      achievementsProgress
    );
    
    return Math.min(100, Math.floor(overallProgress));
  }
  
  // אם אין רמה, נשתמש בלוגיקה הישנה (לתאימות לאחור)
  const currentRank = getRankByUserStats({
    points: user.points,
    gamesPlayed: user.gamesPlayed,
    gamesWon: user.gamesWon,
    completedAchievementsCount: user.completedAchievementsCount || 0
  });
  
  const nextRank = getNextRank(currentRank.id);
  
  if (!nextRank) {
    return 100; // דרגה מקסימלית
  }
  
  // חשב את הדרישות לדרגה הבאה
  const pointsNeededForNext = nextRank.minPoints - currentRank.minPoints;
  const currentPoints = user.points - currentRank.minPoints;
  
  // חשב התקדמות לפי נקודות
  const pointsProgress = pointsNeededForNext > 0
    ? Math.min(100, (currentPoints / pointsNeededForNext) * 100)
    : 100;
  
  // חשב התקדמות לפי משחקים
  const estimatedGamesNeeded = Math.max(5, Math.floor(pointsNeededForNext / 30));
  const gamesProgress = estimatedGamesNeeded > 0
    ? Math.min(100, (user.gamesPlayed / estimatedGamesNeeded) * 100)
    : 100;
  
  // חשב התקדמות לפי ניצחונות
  const estimatedWinsNeeded = Math.max(3, Math.floor(pointsNeededForNext / 60));
  const winsProgress = estimatedWinsNeeded > 0
    ? Math.min(100, (user.gamesWon / estimatedWinsNeeded) * 100)
    : 100;
  
  const achievementsCount = user.completedAchievementsCount || 0;
  const estimatedAchievementsNeeded = Math.max(2, Math.floor(pointsNeededForNext / 200));
  const achievementsProgress = estimatedAchievementsNeeded > 0
    ? Math.min(100, (achievementsCount / estimatedAchievementsNeeded) * 100)
    : 100;
  
  // ההתקדמות הכללית היא ממוצע משוקלל של כל הנתונים
  const overallProgress = (
    pointsProgress * 0.5 +
    gamesProgress * 0.2 +
    winsProgress * 0.2 +
    achievementsProgress * 0.1
  );
  
  return Math.min(100, Math.floor(overallProgress));
}

export function calculateTotalScore(user: {
  points: number;
  gamesWon: number;
  gamesPlayed: number;
  achievementsXP?: number;
}): number {
  // נוסחה מורכבת לחישוב ניקוד כולל
  const basePoints = user.points;
  const winBonus = user.gamesWon * 50; // בונוס על כל ניצחון
  const playBonus = user.gamesPlayed * 10; // בונוס על כל משחק
  const winRateBonus = user.gamesPlayed > 0 
    ? Math.floor((user.gamesWon / user.gamesPlayed) * 1000) 
    : 0;
  const achievementsBonus = user.achievementsXP || 0; // בונוס מהישגים
  
  return basePoints + winBonus + playBonus + winRateBonus + achievementsBonus;
}

// פונקציה חדשה לחישוב נקודות ניסיון מהישגים
export function calculateAchievementsXP(completedAchievements: Array<{ xpReward: number }>): number {
  return completedAchievements.reduce((total, achievement) => total + (achievement.xpReward || 0), 0);
}

// פונקציה לחישוב דרישות רמה דינמיות
export function calculateLevelRequirements(currentLevel: number): {
  pointsNeeded: number;
  gamesNeeded: number;
  winsNeeded: number;
  achievementsNeeded: number;
} {
  // ככל שהרמה גבוהה יותר, הדרישות גדלות באופן אקספוננציאלי
  // הגדלנו את הדרישות כדי שההתקדמות תהיה מאוזנת יותר
  const baseMultiplier = Math.pow(1.5, currentLevel - 1);
  
  return {
    pointsNeeded: Math.floor(200 * baseMultiplier), // הוגדל מ-100 ל-200
    gamesNeeded: Math.floor(10 * baseMultiplier), // הוגדל מ-5 ל-10
    winsNeeded: Math.floor(6 * baseMultiplier), // הוגדל מ-3 ל-6
    achievementsNeeded: Math.max(2, Math.floor(3 * baseMultiplier)) // הוגדל מ-2 ל-3, לפחות 2
  };
}

// פונקציה לבדיקה אם המשתמש יכול לעלות רמה
export function canLevelUp(user: {
  points: number;
  gamesPlayed: number;
  gamesWon: number;
  level: number;
  achievementsXP?: number;
  completedAchievementsCount?: number; // מספר הישגים שהושלמו, לא נקודות ניסיון
}): boolean {
  // חשב את הדרישות לרמה הנוכחית
  const requirements = calculateLevelRequirements(user.level);
  
  // השתמש בנקודות בסיסיות בלבד, לא כולל בונוסים
  const basePoints = user.points;
  
  // השתמש במספר הישגים שהושלמו, לא נקודות ניסיון
  const achievementsCount = user.completedAchievementsCount || 0;
  
  console.log('🔍 [canLevelUp] Checking level up for level', user.level, ':', {
    points: basePoints,
    pointsNeeded: requirements.pointsNeeded,
    gamesPlayed: user.gamesPlayed,
    gamesNeeded: requirements.gamesNeeded,
    gamesWon: user.gamesWon,
    winsNeeded: requirements.winsNeeded,
    achievementsCount,
    achievementsNeeded: requirements.achievementsNeeded
  });
  
  // בדוק אם עומד בכל הדרישות
  const canLevel = (
    basePoints >= requirements.pointsNeeded &&
    user.gamesPlayed >= requirements.gamesNeeded &&
    user.gamesWon >= requirements.winsNeeded &&
    achievementsCount >= requirements.achievementsNeeded
  );
  
  console.log('✅ [canLevelUp] Result:', canLevel);
  
  return canLevel;
}

// פונקציה לחישוב התקדמות לרמה הבאה
export function calculateLevelProgress(user: {
  points: number;
  gamesPlayed: number;
  gamesWon: number;
  level: number;
  achievementsXP?: number;
  completedAchievementsCount?: number; // מספר הישגים שהושלמו, לא נקודות ניסיון
}): {
  progress: number;
  requirements: {
    pointsNeeded: number;
    gamesNeeded: number;
    winsNeeded: number;
    achievementsNeeded: number;
  };
  current: {
    points: number;
    games: number;
    wins: number;
    achievements: number;
  };
} {
  const requirements = calculateLevelRequirements(user.level);
  // השתמש בנקודות בסיסיות בלבד, לא כולל בונוסים
  const basePoints = user.points;
  
  // השתמש במספר הישגים שהושלמו, לא נקודות ניסיון
  const achievementsCount = user.completedAchievementsCount || 0;
  
  // חשב התקדמות לכל דרישה - אם עבר את הדרישה, זה 100%
  // אבל אם לא עבר, זה האחוז האמיתי
  const pointsProgress = requirements.pointsNeeded > 0 
    ? Math.min(100, (basePoints / requirements.pointsNeeded) * 100)
    : 100;
  const gamesProgress = requirements.gamesNeeded > 0
    ? Math.min(100, (user.gamesPlayed / requirements.gamesNeeded) * 100)
    : 100;
  const winsProgress = requirements.winsNeeded > 0
    ? Math.min(100, (user.gamesWon / requirements.winsNeeded) * 100)
    : 100;
  const achievementsProgress = requirements.achievementsNeeded > 0
    ? Math.min(100, (achievementsCount / requirements.achievementsNeeded) * 100)
    : 100;
  
  // ההתקדמות הכללית היא המינימום של כל הדרישות - רק אם עומד בכל הדרישות, זה 100%
  // אם לא עומד באחת מהן, זה האחוז הנמוך ביותר
  const overallProgress = Math.min(pointsProgress, gamesProgress, winsProgress, achievementsProgress);
  
  return {
    progress: Math.floor(overallProgress),
    requirements,
    current: {
      points: basePoints,
      games: user.gamesPlayed,
      wins: user.gamesWon,
      achievements: achievementsCount
    }
  };
}

// פונקציה לבדיקה כמה רמות יש במערכת
// אין מקסימום רמה - המשתמש יכול לעלות רמה ללא הגבלה
// אבל הדרישות גדלות באופן אקספוננציאלי, כך שזה הופך קשה יותר ויותר
export function getMaxLevel(): number | null {
  // אין מקסימום רמה - המשתמש יכול לעלות ללא הגבלה
  // הדרישות גדלות באופן אקספוננציאלי, כך שזה הופך קשה יותר ויותר
  return null; // null = אין הגבלה
}

// פונקציה לחישוב כמה רמות המשתמש יכול לעלות לפי הנתונים הנוכחיים
export function calculatePossibleLevels(user: {
  points: number;
  gamesPlayed: number;
  gamesWon: number;
  completedAchievementsCount: number;
}): number {
  let level = 1;
  let canStillLevelUp = true;
  
  while (canStillLevelUp) {
    const requirements = calculateLevelRequirements(level);
    
    if (
      user.points >= requirements.pointsNeeded &&
      user.gamesPlayed >= requirements.gamesNeeded &&
      user.gamesWon >= requirements.winsNeeded &&
      user.completedAchievementsCount >= requirements.achievementsNeeded
    ) {
      level++;
    } else {
      canStillLevelUp = false;
    }
  }
  
  return level;
}










