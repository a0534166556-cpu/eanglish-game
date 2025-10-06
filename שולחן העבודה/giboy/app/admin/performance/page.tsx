'use client';

import { useState, useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: {
    warning: number;
    critical: number;
  };
  history: {
    timestamp: Date;
    value: number;
  }[];
}

interface PerformanceAlert {
  id: string;
  type: 'slow_response' | 'high_memory' | 'high_cpu' | 'database_slow' | 'network_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  details?: any;
}

interface PerformanceSettings {
  enableCaching: boolean;
  cacheTimeout: number;
  enableCompression: boolean;
  enableCDN: boolean;
  maxFileSize: number;
  enableMinification: boolean;
  enableImageOptimization: boolean;
  enableLazyLoading: boolean;
  enablePrefetching: boolean;
  enableServiceWorker: boolean;
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [settings, setSettings] = useState<PerformanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    loadPerformanceData();
    
    if (autoRefresh) {
      const interval = setInterval(loadPerformanceData, 5000); // כל 5 שניות
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedTimeRange]);

  const loadPerformanceData = async () => {
    try {
      // סימולציה של נתוני ביצועים
      const mockMetrics: PerformanceMetric[] = [
        {
          name: 'Page Load Time',
          value: Math.floor(Math.random() * 2000) + 500,
          unit: 'ms',
          status: Math.random() > 0.7 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 2000, critical: 5000 },
          history: generateHistoryData()
        },
        {
          name: 'API Response Time',
          value: Math.floor(Math.random() * 1000) + 200,
          unit: 'ms',
          status: Math.random() > 0.6 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 1000, critical: 3000 },
          history: generateHistoryData()
        },
        {
          name: 'Memory Usage',
          value: Math.floor(Math.random() * 30) + 40,
          unit: '%',
          status: Math.random() > 0.8 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 80, critical: 95 },
          history: generateHistoryData()
        },
        {
          name: 'CPU Usage',
          value: Math.floor(Math.random() * 40) + 20,
          unit: '%',
          status: Math.random() > 0.7 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 70, critical: 90 },
          history: generateHistoryData()
        },
        {
          name: 'Database Query Time',
          value: Math.floor(Math.random() * 500) + 100,
          unit: 'ms',
          status: Math.random() > 0.6 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 1000, critical: 3000 },
          history: generateHistoryData()
        },
        {
          name: 'Network Latency',
          value: Math.floor(Math.random() * 100) + 50,
          unit: 'ms',
          status: Math.random() > 0.6 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 200, critical: 500 },
          history: generateHistoryData()
        }
      ];

      const mockAlerts: PerformanceAlert[] = [
        {
          id: '1',
          type: 'slow_response',
          severity: 'high',
          message: 'זמן תגובה איטי - 3.2 שניות',
          timestamp: new Date(),
          resolved: false,
          details: { endpoint: '/api/games', responseTime: 3200, threshold: 2000 }
        },
        {
          id: '2',
          type: 'high_memory',
          severity: 'medium',
          message: 'שימוש גבוה בזיכרון - 85%',
          timestamp: new Date(Date.now() - 300000),
          resolved: false,
          details: { usage: 85, threshold: 80, process: 'node' }
        },
        {
          id: '3',
          type: 'database_slow',
          severity: 'high',
          message: 'שאילתת בסיס נתונים איטית - 2.5 שניות',
          timestamp: new Date(Date.now() - 600000),
          resolved: false,
          details: { query: 'SELECT * FROM users', duration: 2500, threshold: 1000 }
        }
      ];

      const mockSettings: PerformanceSettings = {
        enableCaching: true,
        cacheTimeout: 3600,
        enableCompression: true,
        enableCDN: false,
        maxFileSize: 10,
        enableMinification: true,
        enableImageOptimization: true,
        enableLazyLoading: true,
        enablePrefetching: false,
        enableServiceWorker: false
      };

      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
      setSettings(mockSettings);

    } catch (error) {
      // console.error('Error loading performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateHistoryData = () => {
    const data = [];
    const now = new Date();
    const interval = selectedTimeRange === '1h' ? 5 * 60 * 1000 : // 5 minutes
                    selectedTimeRange === '6h' ? 30 * 60 * 1000 : // 30 minutes
                    selectedTimeRange === '24h' ? 2 * 60 * 60 * 1000 : // 2 hours
                    selectedTimeRange === '7d' ? 12 * 60 * 60 * 1000 : // 12 hours
                    24 * 60 * 60 * 1000; // 24 hours

    const points = selectedTimeRange === '1h' ? 12 :
                   selectedTimeRange === '6h' ? 12 :
                   selectedTimeRange === '24h' ? 12 :
                   selectedTimeRange === '7d' ? 14 : 30;

    for (let i = points; i >= 0; i--) {
      data.push({
        timestamp: new Date(now.getTime() - (i * interval)),
        value: Math.floor(Math.random() * 1000) + 500
      });
    }

    return data;
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
      case 'slow_response': return '🐌';
      case 'high_memory': return '💾';
      case 'high_cpu': return '⚡';
      case 'database_slow': return '🗄️';
      case 'network_issue': return '🌐';
      default: return '⚠️';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'low': return 'נמוך';
      case 'medium': return 'בינוני';
      case 'high': return 'גבוה';
      case 'critical': return 'קריטי';
      default: return 'לא ידוע';
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getTimeRangeText = (range: string) => {
    switch (range) {
      case '1h': return 'שעה אחרונה';
      case '6h': return '6 שעות אחרונות';
      case '24h': return '24 שעות אחרונות';
      case '7d': return '7 ימים אחרונים';
      case '30d': return '30 ימים אחרונים';
      default: return 'לא ידוע';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתוני ביצועים...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">⚡ ביצועי מערכת</h1>
              <p className="text-gray-600 mt-2">ניטור וניתוח ביצועי המערכת</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1h">שעה אחרונה</option>
                <option value="6h">6 שעות אחרונות</option>
                <option value="24h">24 שעות אחרונות</option>
                <option value="7d">7 ימים אחרונים</option>
                <option value="30d">30 ימים אחרונים</option>
              </select>
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
                onClick={loadPerformanceData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 רענן עכשיו
              </button>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedMetric === metric.name ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedMetric(selectedMetric === metric.name ? null : metric.name)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{metric.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(metric.status)}`}>
                  {metric.status === 'good' ? 'טוב' : metric.status === 'warning' ? 'אזהרה' : 'קריטי'}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {metric.value}{metric.unit}
                </div>
                <div className="text-2xl">
                  {getTrendIcon(metric.trend)}
                </div>
              </div>
              <div className="mb-4">
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
              {selectedMetric === metric.name && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">היסטוריה - {getTimeRangeText(selectedTimeRange)}</h4>
                  <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📈</div>
                      <p className="text-sm text-gray-600">גרף היסטוריה</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Performance Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🚨 התראות ביצועים</h3>
            <div className="space-y-4">
              {alerts.filter(alert => !alert.resolved).map((alert) => (
                <div key={alert.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getAlertIcon(alert.type)}</span>
                      <div>
                        <h4 className="font-medium text-red-900">{alert.message}</h4>
                        <p className="text-sm text-red-700">
                          {alert.timestamp.toLocaleString('he-IL')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                        {getSeverityText(alert.severity)}
                      </span>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        פתור
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Settings */}
        {settings && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">⚙️ הגדרות ביצועים</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">הפעל Cache</label>
                    <p className="text-sm text-gray-500">שיפור ביצועים באמצעות Cache</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => prev ? {...prev, enableCaching: !prev.enableCaching} : null)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableCaching ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enableCaching ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">הפעל דחיסה</label>
                    <p className="text-sm text-gray-500">דחיסת קבצים לשיפור מהירות</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => prev ? {...prev, enableCompression: !prev.enableCompression} : null)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableCompression ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enableCompression ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">הפעל CDN</label>
                    <p className="text-sm text-gray-500">שיפור מהירות באמצעות CDN</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => prev ? {...prev, enableCDN: !prev.enableCDN} : null)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableCDN ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enableCDN ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    זמן Cache (שניות)
                  </label>
                  <input
                    type="number"
                    value={settings.cacheTimeout}
                    onChange={(e) => setSettings(prev => prev ? {...prev, cacheTimeout: parseInt(e.target.value)} : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    גודל קובץ מקסימלי (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings(prev => prev ? {...prev, maxFileSize: parseInt(e.target.value)} : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">אופטימיזציה של תמונות</label>
                    <p className="text-sm text-gray-500">שיפור ביצועי תמונות</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => prev ? {...prev, enableImageOptimization: !prev.enableImageOptimization} : null)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableImageOptimization ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enableImageOptimization ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Recommendations */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 המלצות ביצועים</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🚀 אופטימיזציה</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• הפעל דחיסה (Gzip)</li>
                <li>• השתמש ב-CDN</li>
                <li>• אופטמז תמונות</li>
                <li>• הפעל Lazy Loading</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">📊 ניטור</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• הגדר התראות ביצועים</li>
                <li>• ניטור זמן תגובה</li>
                <li>• בדיקת זיכרון ו-CPU</li>
                <li>• ניתוח ביצועי בסיס נתונים</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


