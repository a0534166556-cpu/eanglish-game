'use client';

import { useState, useEffect } from 'react';

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface SystemStats {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    load: number;
  };
  users: {
    active: number;
    total: number;
    newToday: number;
  };
  games: {
    totalPlays: number;
    averageScore: number;
    topGame: string;
  };
  performance: {
    pageLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadData();
    
    if (autoRefresh) {
      const interval = setInterval(loadData, 10000); // כל 10 שניות
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadData = async () => {
    try {
      // טעינת נתוני מערכת
      const response = await fetch('/api/admin/metrics');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }

      // יצירת התראות
      generateAlerts(data.data);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAlerts = (data: any) => {
    const newAlerts: SystemAlert[] = [];
    
    // בדיקת זיכרון
    if (data.memory.percentage > 80) {
      newAlerts.push({
        id: 'memory-high',
        type: 'warning',
        title: 'זיכרון גבוה',
        message: `שימוש בזיכרון: ${data.memory.percentage}%`,
        timestamp: new Date(),
        resolved: false,
        priority: 'high'
      });
    }
    
    // בדיקת CPU
    if (data.cpu.usage > 70) {
      newAlerts.push({
        id: 'cpu-high',
        type: 'warning',
        title: 'CPU גבוה',
        message: `שימוש ב-CPU: ${data.cpu.usage}%`,
        timestamp: new Date(),
        resolved: false,
        priority: 'high'
      });
    }
    
    // בדיקת זמן תגובה
    if (data.performance.pageLoadTime > 2000) {
      newAlerts.push({
        id: 'slow-response',
        type: 'warning',
        title: 'זמן תגובה איטי',
        message: `זמן טעינה: ${data.performance.pageLoadTime}ms`,
        timestamp: new Date(),
        resolved: false,
        priority: 'medium'
      });
    }
    
    // בדיקת שגיאות
    if (data.performance.errorRate > 3) {
      newAlerts.push({
        id: 'high-errors',
        type: 'error',
        title: 'שיעור שגיאות גבוה',
        message: `שיעור שגיאות: ${data.performance.errorRate.toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false,
        priority: 'high'
      });
    }
    
    // בדיקת משתמשים
    if (data.users.active > 100) {
      newAlerts.push({
        id: 'high-users',
        type: 'info',
        title: 'עומס משתמשים גבוה',
        message: `${data.users.active} משתמשים פעילים`,
        timestamp: new Date(),
        resolved: false,
        priority: 'medium'
      });
    }
    
    setAlerts(prev => [...newAlerts, ...prev].slice(0, 20));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} שעות ${minutes} דקות`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900"> לוח בקרה</h1>
              <p className="text-gray-600 mt-2">ניהול וניטור המערכת בזמן אמת</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  autoRefresh 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {autoRefresh ? '🔄 רענון אוטומטי' : '⏸️ רענון ידני'}
              </button>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                🔄 רענן עכשיו
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Uptime */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">זמן פעילות</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? formatUptime(stats.uptime) : '0 שעות 0 דקות'}
                </p>
              </div>
            </div>
          </div>

          {/* Memory */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">💾</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">זיכרון</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? `${stats.memory.used}GB / ${stats.memory.total}GB` : '0GB / 0GB'}
                </p>
                <p className={`text-sm font-medium ${
                  stats && stats.memory.percentage > 80 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats ? `${stats.memory.percentage}%` : '0%'}
                </p>
              </div>
            </div>
          </div>

          {/* CPU */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CPU</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? `${stats.cpu.usage}%` : '0%'}
                </p>
                <p className="text-sm text-gray-500">
                  Load: {stats ? stats.cpu.load.toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">משתמשים פעילים</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? stats.users.active : '0'}
                </p>
                <p className="text-sm text-gray-500">
                  סה"כ: {stats ? stats.users.total : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🚨 התראות</h2>
            <div className="grid gap-4">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.resolved ? 'opacity-50' : ''
                  } ${getPriorityColor(alert.priority)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getAlertIcon(alert.type)}</span>
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {alert.timestamp.toLocaleTimeString('he-IL')}
                      </span>
                      {!alert.resolved && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          פתור
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 ביצועים</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">זמן טעינת דף</span>
                <span className={`font-medium ${
                  stats && stats.performance.pageLoadTime > 2000 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats ? `${stats.performance.pageLoadTime}ms` : '0ms'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">זמן תגובת API</span>
                <span className={`font-medium ${
                  stats && stats.performance.apiResponseTime > 1000 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats ? `${stats.performance.apiResponseTime}ms` : '0ms'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">שיעור שגיאות</span>
                <span className={`font-medium ${
                  stats && stats.performance.errorRate > 3 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats ? `${stats.performance.errorRate.toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Games */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎮 משחקים</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">סה"כ משחקים</span>
                <span className="font-medium text-blue-600">
                  {stats ? stats.games.totalPlays : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ציון ממוצע</span>
                <span className="font-medium text-green-600">
                  {stats ? stats.games.averageScore : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">משחק פופולרי</span>
                <span className="font-medium text-purple-600">
                  {stats ? stats.games.topGame : 'אין נתונים'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ פעולות מהירות</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}


