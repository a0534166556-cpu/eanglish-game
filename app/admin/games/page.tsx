'use client';

import { useState, useEffect } from 'react';

interface GameStats {
  name: string;
  totalPlays: number;
  averageScore: number;
  averageTime: number;
  completionRate: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  isActive: boolean;
  lastPlayed: Date;
  topPlayer: string;
  revenue: number;
}

interface GameAnalytics {
  totalGames: number;
  totalPlays: number;
  averageScore: number;
  mostPopular: string;
  leastPopular: string;
  totalRevenue: number;
  dailyPlays: number;
  weeklyPlays: number;
  monthlyPlays: number;
}

export default function GamesManagementPage() {
  const [games, setGames] = useState<GameStats[]>([]);
  const [analytics, setAnalytics] = useState<GameAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      // סימולציה של נתוני משחקים
      const mockGames: GameStats[] = [
        {
          name: 'Word Clash',
          totalPlays: 1250,
          averageScore: 450,
          averageTime: 180,
          completionRate: 85,
          difficulty: 'medium',
          category: 'מילים',
          isActive: true,
          lastPlayed: new Date('2024-09-28'),
          topPlayer: 'יוסי כהן',
          revenue: 2500
        },
        {
          name: 'Matching Pairs',
          totalPlays: 980,
          averageScore: 380,
          averageTime: 120,
          completionRate: 92,
          difficulty: 'easy',
          category: 'זיכרון',
          isActive: true,
          lastPlayed: new Date('2024-09-27'),
          topPlayer: 'שרה לוי',
          revenue: 1800
        },
        {
          name: 'Mixed Quiz',
          totalPlays: 2100,
          averageScore: 520,
          averageTime: 300,
          completionRate: 78,
          difficulty: 'hard',
          category: 'ידע כללי',
          isActive: true,
          lastPlayed: new Date('2024-09-28'),
          topPlayer: 'מיכל רוזן',
          revenue: 4200
        },
        {
          name: 'Picture Description Duel',
          totalPlays: 750,
          averageScore: 420,
          averageTime: 240,
          completionRate: 88,
          difficulty: 'medium',
          category: 'תיאור',
          isActive: true,
          lastPlayed: new Date('2024-09-26'),
          topPlayer: 'דוד ישראלי',
          revenue: 1500
        },
        {
          name: 'Sentence Builder',
          totalPlays: 650,
          averageScore: 350,
          averageTime: 200,
          completionRate: 80,
          difficulty: 'medium',
          category: 'דקדוק',
          isActive: false,
          lastPlayed: new Date('2024-09-20'),
          topPlayer: 'אבי גולד',
          revenue: 800
        }
      ];

      setGames(mockGames);

      // חישוב אנליטיק
      const gameAnalytics: GameAnalytics = {
        totalGames: mockGames.length,
        totalPlays: mockGames.reduce((sum, game) => sum + game.totalPlays, 0),
        averageScore: Math.round(
          mockGames.reduce((sum, game) => sum + game.averageScore, 0) / mockGames.length
        ),
        mostPopular: mockGames.sort((a, b) => b.totalPlays - a.totalPlays)[0].name,
        leastPopular: mockGames.sort((a, b) => a.totalPlays - b.totalPlays)[0].name,
        totalRevenue: mockGames.reduce((sum, game) => sum + game.revenue, 0),
        dailyPlays: Math.floor(mockGames.reduce((sum, game) => sum + game.totalPlays, 0) / 30),
        weeklyPlays: Math.floor(mockGames.reduce((sum, game) => sum + game.totalPlays, 0) / 4),
        monthlyPlays: mockGames.reduce((sum, game) => sum + game.totalPlays, 0)
      };

      setAnalytics(gameAnalytics);

    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'קל';
      case 'medium': return 'בינוני';
      case 'hard': return 'קשה';
      default: return 'לא ידוע';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('he-IL');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתוני משחקים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎮 ניהול משחקים</h1>
          <p className="text-gray-600 mt-2">ניהול וניטור משחקי המערכת</p>
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">🎮</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">סה"כ משחקים</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalGames}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">סה"כ משחקים</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalPlays.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ציון ממוצע</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.averageScore}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">סה"כ הכנסות</p>
                  <p className="text-2xl font-bold text-gray-900">₪{analytics.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">📊 אנליטיק לפי תקופה</h3>
            <div className="flex space-x-2">
              {['day', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {range === 'day' ? 'יום' : 
                   range === 'week' ? 'שבוע' : 
                   range === 'month' ? 'חודש' : 'שנה'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {games.map((game, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedGame === game.name ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedGame(selectedGame === game.name ? null : game.name)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{game.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(game.difficulty)}`}>
                    {getDifficultyText(game.difficulty)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    game.isActive ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                  }`}>
                    {game.isActive ? 'פעיל' : 'לא פעיל'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">סה"כ משחקים:</span>
                  <span className="font-medium">{game.totalPlays.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ציון ממוצע:</span>
                  <span className="font-medium">{game.averageScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">זמן ממוצע:</span>
                  <span className="font-medium">{formatTime(game.averageTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">אחוז השלמה:</span>
                  <span className="font-medium">{game.completionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">הכנסות:</span>
                  <span className="font-medium text-green-600">₪{game.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">שחקן מוביל:</span>
                  <span className="font-medium text-blue-600">{game.topPlayer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">משחק אחרון:</span>
                  <span className="font-medium">{formatDate(game.lastPlayed)}</span>
                </div>
              </div>

              {selectedGame === game.name && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      ערוך
                    </button>
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                      הפעל/כבה
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                      מחק
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Game Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📈 ביצועי משחקים</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">המשחקים הפופולריים</h4>
              <div className="space-y-2">
                {games
                  .sort((a, b) => b.totalPlays - a.totalPlays)
                  .slice(0, 5)
                  .map((game, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{game.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(game.totalPlays / games[0].totalPlays) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{game.totalPlays}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">המשחקים הרווחיים</h4>
              <div className="space-y-2">
                {games
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 5)
                  .map((game, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{game.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(game.revenue / games.sort((a, b) => b.revenue - a.revenue)[0].revenue) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">₪{game.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ פעולות מהירות</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="text-2xl mb-2">➕</div>
              <p className="font-medium text-blue-900">הוסף משחק חדש</p>
            </button>
            <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-green-900">דוח מפורט</p>
            </button>
            <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <div className="text-2xl mb-2">🔧</div>
              <p className="font-medium text-yellow-900">הגדרות משחקים</p>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="text-2xl mb-2">🎯</div>
              <p className="font-medium text-purple-900">אופטימיזציה</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


