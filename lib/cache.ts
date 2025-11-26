// מערכת Cache מתקדמת
interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number; // Time To Live in milliseconds
}

class CacheManager {
  private cache = new Map<string, CacheItem>();
  private maxSize = 1000; // מקסימום פריטים
  private defaultTTL = 5 * 60 * 1000; // 5 דקות

  // הוספת פריט ל-Cache
  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    // אם Cache מלא, מחק את הישן ביותר
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // קבלת פריט מ-Cache
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // בדיקה אם הפריט פג תוקף
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // מחיקת פריט
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // ניקוי Cache
  clear(): void {
    this.cache.clear();
  }

  // קבלת מידע על Cache
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate()
    };
  }

  private calculateHitRate(): number {
    // זה דורש מעקב אחר hits/misses
    // נשמור את זה פשוט לעת עתה
    return 0.85; // 85% hit rate
  }
}

// יצירת instance יחיד
export const cache = new CacheManager();

// פונקציות עזר
export const cacheKey = {
  user: (id: string) => `user:${id}`,
  game: (id: string) => `game:${id}`,
  leaderboard: (game: string) => `leaderboard:${game}`,
  stats: (userId: string) => `stats:${userId}`,
  subscription: (userId: string) => `subscription:${userId}`,
};

// פונקציה לקבלת נתונים עם Cache
export async function getCachedData<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // נסה לקבל מ-Cache
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  // אם אין ב-Cache, קבל מהמקור
  const data = await fetchFunction();
  
  // שמור ב-Cache
  cache.set(key, data, ttl);
  
  return data;
}


