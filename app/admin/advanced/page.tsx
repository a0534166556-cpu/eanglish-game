'use client';

import { useState, useEffect } from 'react';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: {
    warning: number;
    critical: number;
  };
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface SystemLog {
  id: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  timestamp: Date;
  source: string;
  details?: any;
}

export default function AdvancedAdminPage() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'metrics' | 'alerts' | 'logs' | 'settings'>('metrics');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadData();
    
    if (autoRefresh) {
      const interval = setInterval(loadData, 5000); // כל 5 שניות
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadData = async () => {
    try {
      // סימולציה של נתוני מערכת מתקדמים
      const mockMetrics: SystemMetric[] = [
        {
          name: 'CPU Usage',
          value: Math.floor(Math.random() * 40) + 20,
          unit: '%',
          status: Math.random() > 0.7 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 70, critical: 90 }
        },
        {
          name: 'Memory Usage',
          value: Math.floor(Math.random() * 30) + 40,
          unit: '%',
          status: Math.random() > 0.8 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 80, critical: 95 }
        },
        {
          name: 'Disk Usage',
          value: Math.floor(Math.random() * 20) + 30,
          unit: '%',
          status: 'good',
          trend: 'up',
          threshold: { warning: 85, critical: 95 }
        },
        {
          name: 'Network Latency',
          value: Math.floor(Math.random() * 100) + 50,
          unit: 'ms',
          status: Math.random() > 0.6 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 200, critical: 500 }
        },
        {
          name: 'Database Connections',
          value: Math.floor(Math.random() * 20) + 10,
          unit: 'connections',
          status: Math.random() > 0.8 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 50, critical: 80 }
        },
        {
          name: 'Error Rate',
          value: Math.random() * 5,
          unit: '%',
          status: Math.random() > 0.7 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 3, critical: 10 }
        }
      ];

      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'זיכרון גבוה',
          message: 'שימוש בזיכרון עבר את 80%',
          timestamp: new Date(),
          resolved: false,
          priority: 'high',
          category: 'Performance'
        },
        {
          id: '2',
          type: 'error',
          title: 'שגיאת בסיס נתונים',
          message: 'חיבור לבסיס נתונים נכשל',
          timestamp: new Date(Date.now() - 300000),
          resolved: false,
          priority: 'high',
          category: 'Database'
        },
        {
          id: '3',
          type: 'info',
          title: 'עדכון זמין',
          message: 'עדכון מערכת זמין',
          timestamp: new Date(Date.now() - 600000),
          resolved: false,
          priority: 'low',
          category: 'System'
        }
      ];

      const mockLogs: SystemLog[] = [
        {
          id: '1',
          level: 'error',
          message: 'Failed to connect to database',
          timestamp: new Date(),
          source: 'Database',
          details: { error: 'Connection timeout', retries: 3 }
        },
        {
          id: '2',
          level: 'warning',
          message: 'High memory usage detected',
          timestamp: new Date(Date.now() - 60000),
          source: 'System',
          details: { usage: '85%', threshold: '80%' }
        },
        {
          id: '3',
          level: 'info',
          message: 'User login successful',
          timestamp: new Date(Date.now() - 120000),
          source: 'Auth',
          details: { userId: '123', ip: '192.168.1.1' }
        },
        {
          id: '4',
          level: 'debug',
          message: 'Cache hit for key: user:123',
          timestamp: new Date(Date.now() - 180000),
          source: 'Cache',
          details: { key: 'user:123', hit: true }
        }
      ];

      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
      setLogs(mockLogs);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'debug': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const clearLogs = () => {
    setLogs([]);
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">⚙️ ניהול מתקדם</h1>
              <p className="text-gray-600 mt-2">ניהול וניטור מתקדם של המערכת</p>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 רענן עכשיו
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'metrics', name: 'מדדים', icon: '📊' },
                { id: 'alerts', name: 'התראות', icon: '🚨' },
                { id: 'logs', name: 'לוגים', icon: '📝' },
                { id: 'settings', name: 'הגדרות', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Metrics Tab */}
        {selectedTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{metric.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(metric.status)}`}>
                      {metric.status === 'good' ? 'טוב' : metric.status === 'warning' ? 'אזהרה' : 'קריטי'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-gray-900">
                      {metric.value}{metric.unit}
                    </div>
                    <div className="text-2xl">
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>אזהרה: {metric.threshold.warning}{metric.unit}</span>
                      <span>קריטי: {metric.threshold.critical}{metric.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          metric.status === 'good' ? 'bg-green-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((metric.value / metric.threshold.critical) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {selectedTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">התראות מערכת</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-6 ${alert.resolved ? 'opacity-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-4">{getAlertIcon(alert.type)}</span>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{alert.title}</h4>
                          <p className="text-gray-600">{alert.message}</p>
                          <div className="mt-2 flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              {alert.timestamp.toLocaleString('he-IL')}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              alert.priority === 'high' ? 'text-red-600 bg-red-100' :
                              alert.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                              'text-blue-600 bg-blue-100'
                            }`}>
                              {alert.priority === 'high' ? 'גבוה' : alert.priority === 'medium' ? 'בינוני' : 'נמוך'}
                            </span>
                            <span className="text-xs text-gray-500">{alert.category}</span>
                          </div>
                        </div>
                      </div>
                      {!alert.resolved && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          פתור
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {selectedTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">לוגים מערכת</h3>
                <button
                  onClick={clearLogs}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  נקה לוגים
                </button>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="p-4">
                    <div className="flex items-start">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-3 ${getLogLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{log.message}</span>
                          <span className="text-xs text-gray-500">
                            {log.timestamp.toLocaleString('he-IL')}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-4">
                          <span className="text-xs text-gray-500">מקור: {log.source}</span>
                          {log.details && (
                            <span className="text-xs text-blue-600 cursor-pointer hover:underline">
                              פרטים
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {selectedTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">הגדרות מערכת</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">רענון אוטומטי</label>
                    <p className="text-sm text-gray-500">רענון נתונים כל 5 שניות</p>
                  </div>
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoRefresh ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">התראות מייל</label>
                    <p className="text-sm text-gray-500">שליחת התראות במייל</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">לוגים מפורטים</label>
                    <p className="text-sm text-gray-500">שמירת לוגים מפורטים</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


