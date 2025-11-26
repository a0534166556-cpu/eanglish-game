'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  pageViews: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  users: {
    total: number;
    active: number;
    newToday: number;
    returning: number;
  };
  games: {
    totalPlays: number;
    averageScore: number;
    popularGames: Array<{
      name: string;
      plays: number;
      averageScore: number;
    }>;
  };
  revenue: {
    total: number;
    thisMonth: number;
    subscriptions: number;
    conversions: number;
  };
  performance: {
    pageLoadTime: number;
    bounceRate: number;
    sessionDuration: number;
    errorRate: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'games' | 'revenue' | 'performance'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        console.error('Failed to load analytics:', data.error);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">טוען נתוני אנליטיקס...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 אנליטיקס מתקדם</h1>
          <p className="text-gray-600">ניתוח ביצועי המערכת והמשתמשים</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">טווח זמן</h2>
              <div className="flex space-x-2">
                {[
                  { value: '7d', label: '7 ימים' },
                  { value: '30d', label: '30 ימים' },
                  { value: '90d', label: '90 ימים' },
                  { value: '1y', label: 'שנה' }
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      timeRange === range.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'סקירה כללית', icon: '📈' },
                { id: 'users', label: 'משתמשים', icon: '👥' },
                { id: 'games', label: 'משחקים', icon: '🎮' },
                { id: 'revenue', label: 'הכנסות', icon: '💰' },
                { id: 'performance', label: 'ביצועים', icon: '⚡' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && analytics && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">סקירה כללית</h2>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <span className="text-2xl">👁️</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">צפיות דף</p>
                        <p className="text-2xl font-bold text-blue-900">{analytics.pageViews.total.toLocaleString()}</p>
                        <p className="text-sm text-blue-700">+{analytics.pageViews.today} היום</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <span className="text-2xl">👥</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">משתמשים</p>
                        <p className="text-2xl font-bold text-green-900">{analytics.users.total.toLocaleString()}</p>
                        <p className="text-sm text-green-700">{analytics.users.active} פעילים</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <span className="text-2xl">🎮</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">משחקים</p>
                        <p className="text-2xl font-bold text-purple-900">{analytics.games.totalPlays.toLocaleString()}</p>
                        <p className="text-sm text-purple-700">ציון ממוצע: {analytics.games.averageScore}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <span className="text-2xl">💰</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-600">הכנסות</p>
                        <p className="text-2xl font-bold text-yellow-900">₪{analytics.revenue.total.toLocaleString()}</p>
                        <p className="text-sm text-yellow-700">₪{analytics.revenue.thisMonth} החודש</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">צפיות דף - 30 ימים אחרונים</h3>
                    <div className="h-64 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">📊</span>
                        <p className="text-gray-500">גרף צפיות</p>
                        <p className="text-sm text-gray-400">(יוצג כאן גרף אמיתי)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">משתמשים חדשים</h3>
                    <div className="h-64 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">👥</span>
                        <p className="text-gray-500">גרף משתמשים</p>
                        <p className="text-sm text-gray-400">(יוצג כאן גרף אמיתי)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && analytics && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">ניתוח משתמשים</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{analytics.users.total.toLocaleString()}</p>
                      <p className="text-gray-600">סה"כ משתמשים</p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{analytics.users.active}</p>
                      <p className="text-gray-600">משתמשים פעילים</p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">{analytics.users.newToday}</p>
                      <p className="text-gray-600">חדשים היום</p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">{analytics.users.returning}</p>
                      <p className="text-gray-600">חוזרים</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">התפלגות משתמשים</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">📊</span>
                      <p className="text-gray-500">גרף התפלגות משתמשים</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && analytics && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">ניתוח משחקים</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{analytics.games.totalPlays.toLocaleString()}</p>
                      <p className="text-gray-600">סה"כ משחקים</p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{analytics.games.averageScore}</p>
                      <p className="text-gray-600">ציון ממוצע</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">משחקים פופולריים</h3>
                  <div className="space-y-4">
                    {analytics.games.popularGames.map((game, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{game.name}</p>
                            <p className="text-sm text-gray-600">ציון ממוצע: {game.averageScore}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{game.plays.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">משחקים</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && analytics && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">ניתוח הכנסות</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">₪{analytics.revenue.total.toLocaleString()}</p>
                      <p className="text-gray-600">סה"כ הכנסות</p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">₪{analytics.revenue.thisMonth.toLocaleString()}</p>
                      <p className="text-gray-600">החודש</p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">{analytics.revenue.subscriptions}</p>
                      <p className="text-gray-600">מנויים</p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">{analytics.revenue.conversions}%</p>
                      <p className="text-gray-600">שיעור המרה</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">הכנסות חודשיות</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">💰</span>
                      <p className="text-gray-500">גרף הכנסות</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && analytics && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">ניתוח ביצועים</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{analytics.performance.pageLoadTime}ms</p>
                      <p className="text-gray-600">זמן טעינה</p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{analytics.performance.bounceRate}%</p>
                      <p className="text-gray-600">שיעור נטישה</p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">{analytics.performance.sessionDuration}דק'</p>
                      <p className="text-gray-600">משך ממוצע</p>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">{analytics.performance.errorRate}%</p>
                      <p className="text-gray-600">שיעור שגיאות</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ביצועי דפים</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">⚡</span>
                        <p className="text-gray-500">גרף ביצועים</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">שגיאות מערכת</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">🚨</span>
                        <p className="text-gray-500">גרף שגיאות</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
