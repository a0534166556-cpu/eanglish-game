'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SystemOverview {
  uptime: string;
  status: 'healthy' | 'warning' | 'critical';
  users: {
    total: number;
    active: number;
    newToday: number;
  };
  games: {
    total: number;
    totalPlays: number;
    averageScore: number;
  };
  payments: {
    totalRevenue: number;
    totalTransactions: number;
    conversionRate: number;
  };
  performance: {
    pageLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
  };
  alerts: {
    total: number;
    critical: number;
    warning: number;
    info: number;
  };
}

export default function AdminPage() {
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      // סימולציה של נתוני מערכת
      const mockOverview: SystemOverview = {
        uptime: '5 ימים 12 שעות',
        status: 'healthy',
        users: {
          total: 1250,
          active: 89,
          newToday: 12
        },
        games: {
          total: 5,
          totalPlays: 5730,
          averageScore: 420
        },
        payments: {
          totalRevenue: 12500,
          totalTransactions: 156,
          conversionRate: 87
        },
        performance: {
          pageLoadTime: 1200,
          apiResponseTime: 350,
          errorRate: 1.2
        },
        alerts: {
          total: 8,
          critical: 0,
          warning: 3,
          info: 5
        }
      };

      setOverview(mockOverview);

    } catch (error) {
      console.error('Error loading overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'תקין';
      case 'warning': return 'תשומת לב נדרשת';
      case 'critical': return 'בעיה קריטית';
      default: return 'לא ידוע';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתוני מערכת...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎛️ לוח בקרה ראשי</h1>
          <p className="text-gray-600 mt-2">ניהול וניטור המערכת הכולל</p>
        </div>

        {/* System Status */}
        {overview && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">סטטוס מערכת</h2>
                  <p className="text-gray-600 mt-1">זמן פעילות: {overview.uptime}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(overview.status)}`}>
                    {getStatusIcon(overview.status)} {getStatusText(overview.status)}
                  </span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    🔄 רענן
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">משתמשים</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.users.total.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{overview.users.newToday} היום</p>
                </div>
              </div>
            </div>

            {/* Games */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">🎮</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">משחקים</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.games.total}</p>
                  <p className="text-sm text-blue-600">{overview.games.totalPlays.toLocaleString()} משחקים</p>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">הכנסות</p>
                  <p className="text-2xl font-bold text-gray-900">₪{overview.payments.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600">{overview.payments.conversionRate}% הצלחה</p>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ביצועים</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.performance.pageLoadTime}ms</p>
                  <p className="text-sm text-green-600">{overview.performance.errorRate}% שגיאות</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {overview && overview.alerts.total > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🚨 התראות</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🚨</span>
                    <div>
                      <p className="font-medium text-red-900">קריטי</p>
                      <p className="text-2xl font-bold text-red-600">{overview.alerts.critical}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                      <p className="font-medium text-yellow-900">אזהרה</p>
                      <p className="text-2xl font-bold text-yellow-600">{overview.alerts.warning}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">ℹ️</span>
                    <div>
                      <p className="font-medium text-blue-900">מידע</p>
                      <p className="text-2xl font-bold text-blue-600">{overview.alerts.info}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Analytics */}
          <Link href="/admin/analytics" className="group">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mr-4">אנליטיק</h3>
              </div>
              <p className="text-gray-600 mb-4">ניטור ביצועי המערכת בזמן אמת</p>
              <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                <span className="text-sm font-medium">צפה באנליטיק</span>
                <span className="mr-2">→</span>
              </div>
            </div>
          </Link>

          {/* System Test */}
          <Link href="/admin/system-test" className="group">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mr-4">בדיקות מערכת</h3>
              </div>
              <p className="text-gray-600 mb-4">בדיקה מקיפה של כל רכיבי המערכת</p>
              <div className="flex items-center text-green-600 group-hover:text-green-700">
                <span className="text-sm font-medium">הרץ בדיקות</span>
                <span className="mr-2">→</span>
              </div>
            </div>
          </Link>

          {/* Users Management */}
          <Link href="/admin/users" className="group">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mr-4">ניהול משתמשים</h3>
              </div>
              <p className="text-gray-600 mb-4">ניהול וניטור משתמשי המערכת</p>
              <div className="flex items-center text-purple-600 group-hover:text-purple-700">
                <span className="text-sm font-medium">נהל משתמשים</span>
                <span className="mr-2">→</span>
              </div>
            </div>
          </Link>

          {/* Games Management */}
          <Link href="/admin/games" className="group">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <span className="text-2xl">🎮</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mr-4">ניהול משחקים</h3>
              </div>
              <p className="text-gray-600 mb-4">ניהול וניטור משחקי המערכת</p>
              <div className="flex items-center text-orange-600 group-hover:text-orange-700">
                <span className="text-sm font-medium">נהל משחקים</span>
                <span className="mr-2">→</span>
              </div>
            </div>
          </Link>

          {/* Payments Management */}
          <Link href="/admin/payments" className="group">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mr-4">ניהול תשלומים</h3>
              </div>
              <p className="text-gray-600 mb-4">ניהול וניטור תשלומי המערכת</p>
              <div className="flex items-center text-yellow-600 group-hover:text-yellow-700">
                <span className="text-sm font-medium">נהל תשלומים</span>
                <span className="mr-2">→</span>
              </div>
            </div>
          </Link>

          {/* Email Test */}
          <Link href="/admin/email-test" className="group">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mr-4">בדיקת מייל</h3>
              </div>
              <p className="text-gray-600 mb-4">בדיקה ושליחת מיילים</p>
              <div className="flex items-center text-indigo-600 group-hover:text-indigo-700">
                <span className="text-sm font-medium">בדוק מייל</span>
                <span className="mr-2">→</span>
              </div>
            </div>
          </Link>

          {/* My Ads */}
          <Link href="/admin/my-ads" className="group">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                  <span className="text-2xl">📢</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mr-4">הפרסומות שלי</h3>
              </div>
              <p className="text-gray-600 mb-4">ניהול פרסומות מותאמות אישית</p>
              <div className="flex items-center text-yellow-600 group-hover:text-yellow-700">
                <span className="text-sm font-medium">נהל פרסומות</span>
                <span className="mr-2">→</span>
              </div>
            </div>
          </Link>

        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ פעולות מהירות</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="text-2xl mb-2">🔄</div>
              <p className="font-medium text-blue-900">רענן נתונים</p>
            </button>
            <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-green-900">דוח מפורט</p>
            </button>
            <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <div className="text-2xl mb-2">🔧</div>
              <p className="font-medium text-yellow-900">הגדרות מערכת</p>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="text-2xl mb-2">📈</div>
              <p className="font-medium text-purple-900">אנליטיק מתקדם</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


