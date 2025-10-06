'use client';

import { useState, useEffect } from 'react';

interface MonitoringMetric {
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

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
  source: string;
}

interface SystemLog {
  id: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  timestamp: Date;
  source: string;
  details?: any;
  stackTrace?: string;
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<MonitoringMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    loadMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 5000); // כל 5 שניות
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedTimeRange]);

  const loadMonitoringData = async () => {
    try {
      // סימולציה של נתוני ניטור
      const mockMetrics: MonitoringMetric[] = [
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
          name: 'Memory Usage',
          value: Math.floor(Math.random() * 30) + 40,
          unit: '%',
          status: Math.random() > 0.8 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 80, critical: 95 },
          history: generateHistoryData()
        },
        {
          name: 'Disk Usage',
          value: Math.floor(Math.random() * 20) + 30,
          unit: '%',
          status: 'good',
          trend: 'up',
          threshold: { warning: 85, critical: 95 },
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
        },
        {
          name: 'Database Connections',
          value: Math.floor(Math.random() * 20) + 10,
          unit: 'connections',
          status: Math.random() > 0.8 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 50, critical: 80 },
          history: generateHistoryData()
        },
        {
          name: 'Error Rate',
          value: Math.random() * 5,
          unit: '%',
          status: Math.random() > 0.7 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 3, critical: 10 },
          history: generateHistoryData()
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
          category: 'Performance',
          source: 'System Monitor'
        },
        {
          id: '2',
          type: 'error',
          title: 'שגיאת בסיס נתונים',
          message: 'חיבור לבסיס נתונים נכשל',
          timestamp: new Date(Date.now() - 300000),
          resolved: false,
          priority: 'high',
          category: 'Database',
          source: 'Database Monitor'
        },
        {
          id: '3',
          type: 'info',
          title: 'עדכון זמין',
          message: 'עדכון מערכת זמין',
          timestamp: new Date(Date.now() - 600000),
          resolved: false,
          priority: 'low',
          category: 'System',
          source: 'Update Manager'
        }
      ];

      const mockLogs: SystemLog[] = [
        {
          id: '1',
          level: 'error',
          message: 'Failed to connect to database',
          timestamp: new Date(),
          source: 'Database',
          details: { error: 'Connection timeout', retries: 3 },
          stackTrace: 'Error: Connection timeout\n    at Database.connect (/app/db.js:45:12)\n    at async main (/app/index.js:23:5)'
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
      console.error('Error loading monitoring data:', error);
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
        value: Math.floor(Math.random() * 100)
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
          <p className="text-gray-600">טוען נתוני ניטור...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">📊 ניטור מערכת</h1>
              <p className="text-gray-600 mt-2">ניטור מתקדם של ביצועי המערכת</p>
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
                onClick={loadMonitoringData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 רענן עכשיו
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
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

        {/* Alerts and Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">התראות מערכת</h3>
              <span className="text-sm text-gray-500">{alerts.filter(a => !a.resolved).length} פעילות</span>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 ${alert.resolved ? 'opacity-50' : ''}`}>
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{getAlertIcon(alert.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.priority === 'high' ? 'text-red-600 bg-red-100' :
                          alert.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                          'text-blue-600 bg-blue-100'
                        }`}>
                          {alert.priority === 'high' ? 'גבוה' : alert.priority === 'medium' ? 'בינוני' : 'נמוך'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleString('he-IL')}
                          </span>
                          <span className="text-xs text-gray-500">{alert.category}</span>
                          <span className="text-xs text-gray-500">{alert.source}</span>
                        </div>
                        {!alert.resolved && (
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            פתור
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">לוגים מערכת</h3>
              <button
                onClick={clearLogs}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                נקה
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
                        {log.stackTrace && (
                          <span className="text-xs text-red-600 cursor-pointer hover:underline">
                            Stack Trace
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

        {/* System Health Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🏥 סיכום בריאות המערכת</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {metrics.filter(m => m.status === 'good').length}
              </div>
              <p className="text-gray-600">מדדים תקינים</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {metrics.filter(m => m.status === 'warning').length}
              </div>
              <p className="text-gray-600">אזהרות</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {metrics.filter(m => m.status === 'critical').length}
              </div>
              <p className="text-gray-600">בעיות קריטיות</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


