'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthUser from '@/lib/useAuthUser';

interface DashboardData {
  overview: {
    totalUsers: number;
    totalGames: number;
    totalAchievements: number;
    totalBugReports: number;
    newUsersThisWeek: number;
    gamesThisWeek: number;
    openBugReports: number;
    activeUsers: number;
    completedAchievements: number;
  };
  gameStats: {
    totalGamesPlayed: number;
    totalGamesWon: number;
    totalScore: number;
    averageScore: number;
  };
  bugReports: {
    byPriority: Array<{ priority: string; _count: { priority: number } }>;
    recent: Array<{
      id: string;
      email?: string;
      description: string;
      status: string;
      priority: string;
      createdAt: string;
    }>;
  };
  users: {
    byLevel: Array<{ level: number; _count: { level: number } }>;
    topUsers: Array<{
      id: string;
      name: string;
      email: string;
      points: number;
      level: number;
      gamesPlayed: number;
      gamesWon: number;
    }>;
  };
  games: {
    popular: Array<{
      gameName: string;
      _count: { gameName: number };
      _sum: { gamesPlayed: number | null };
    }>;
  };
  dailyStats: Array<{
    date: string;
    users: number;
    games: number;
    bugReports: number;
  }>;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuthUser();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    loadDashboardData();
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/dashboard?userId=${user?.id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load dashboard data');
      }

      setData(result);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">טוען לוח בקרה...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">שגיאה בטעינת הנתונים</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-600">אין נתונים להצגה</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 לוח בקרה</h1>
          <p className="text-lg text-gray-600">נתונים אמיתיים מהמערכת</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">סה"כ משתמשים</p>
                <p className="text-3xl font-bold text-blue-600">{data.overview.totalUsers}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              +{data.overview.newUsersThisWeek} השבוע
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">משחקים שוחקו</p>
                <p className="text-3xl font-bold text-green-600">{data.overview.totalGames}</p>
              </div>
              <div className="text-4xl">🎮</div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              +{data.overview.gamesThisWeek} השבוע
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">הישגים מושלמים</p>
                <p className="text-3xl font-bold text-purple-600">{data.overview.completedAchievements}</p>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              מתוך {data.overview.totalAchievements} הישגים
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">דיווחי באגים פתוחים</p>
                <p className="text-3xl font-bold text-red-600">{data.overview.openBugReports}</p>
              </div>
              <div className="text-4xl">🐛</div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              מתוך {data.overview.totalBugReports} סה"כ
            </p>
          </div>
        </div>

        {/* Game Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📈 סטטיסטיקות משחקים</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">סה"כ משחקים שוחקו:</span>
                <span className="font-bold text-blue-600">{data.gameStats.totalGamesPlayed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">משחקים שניצחו:</span>
                <span className="font-bold text-green-600">{data.gameStats.totalGamesWon}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">אחוז ניצחונות:</span>
                <span className="font-bold text-purple-600">
                  {data.gameStats.totalGamesPlayed > 0 
                    ? Math.round((data.gameStats.totalGamesWon / data.gameStats.totalGamesPlayed) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ציון ממוצע:</span>
                <span className="font-bold text-orange-600">
                  {Math.round(data.gameStats.averageScore || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 משחקים פופולריים</h2>
            <div className="space-y-3">
              {data.games.popular.slice(0, 5).map((game, index) => (
                <div key={game.gameName} className="flex justify-between items-center">
                  <span className="text-gray-600">{game.gameName}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600">{game._count.gameName}</span>
                    <span className="text-sm text-gray-500">פעמים</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users and Bug Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">👑 משתמשים מובילים</h2>
            <div className="space-y-3">
              {data.users.topUsers.slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">רמה {user.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{user.points} נקודות</p>
                    <p className="text-sm text-gray-500">{user.gamesWon}/{user.gamesPlayed} ניצחונות</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🐛 דיווחי באגים אחרונים</h2>
            <div className="space-y-3">
              {data.bugReports.recent.map((report) => (
                <div key={report.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-gray-900">
                      {report.email || 'אנונימי'}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      report.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      report.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {report.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {report.description.length > 100 
                      ? report.description.substring(0, 100) + '...'
                      : report.description
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString('he-IL')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Stats Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 פעילות יומית (7 ימים אחרונים)</h2>
          <div className="grid grid-cols-7 gap-4">
            {data.dailyStats.map((day, index) => (
              <div key={day.date} className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  {new Date(day.date).toLocaleDateString('he-IL', { weekday: 'short' })}
                </div>
                <div className="space-y-2">
                  <div className="bg-blue-100 rounded p-2">
                    <div className="text-lg font-bold text-blue-600">{day.users}</div>
                    <div className="text-xs text-blue-600">משתמשים</div>
                  </div>
                  <div className="bg-green-100 rounded p-2">
                    <div className="text-lg font-bold text-green-600">{day.games}</div>
                    <div className="text-xs text-green-600">משחקים</div>
                  </div>
                  <div className="bg-red-100 rounded p-2">
                    <div className="text-lg font-bold text-red-600">{day.bugReports}</div>
                    <div className="text-xs text-red-600">דיווחים</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={loadDashboardData}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 רענן נתונים
          </button>
          <button
            onClick={() => router.push('/admin/bug-reports')}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            🐛 ניהול דיווחי באגים
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            👤 חזרה לפרופיל
          </button>
        </div>
      </div>
    </div>
  );
}