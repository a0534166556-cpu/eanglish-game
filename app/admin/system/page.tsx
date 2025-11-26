'use client';

import { useState, useEffect } from 'react';

interface SystemInfo {
  name: string;
  version: string;
  uptime: string;
  status: 'online' | 'offline' | 'maintenance';
  lastUpdate: Date;
  nextUpdate?: Date;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    name: string;
    status: 'healthy' | 'warning' | 'critical';
    lastCheck: Date;
    details?: string;
  }[];
}

interface SystemResource {
  name: string;
  current: number;
  max: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

export default function SystemPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [resources, setResources] = useState<SystemResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSystemData();
    
    if (autoRefresh) {
      const interval = setInterval(loadSystemData, 10000); // כל 10 שניות
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadSystemData = async () => {
    try {
      // סימולציה של נתוני מערכת
      const mockSystemInfo: SystemInfo = {
        name: 'Word Clash System',
        version: '1.2.3',
        uptime: '15 ימים 8 שעות 32 דקות',
        status: 'online',
        lastUpdate: new Date('2024-09-20'),
        nextUpdate: new Date('2024-10-20')
      };

      const mockSystemHealth: SystemHealth = {
        overall: 'healthy',
        components: [
          {
            name: 'Web Server',
            status: 'healthy',
            lastCheck: new Date(),
            details: 'Running on port 3000'
          },
          {
            name: 'Database',
            status: 'healthy',
            lastCheck: new Date(),
            details: 'PostgreSQL 14.5'
          },
          {
            name: 'Cache',
            status: 'warning',
            lastCheck: new Date(),
            details: 'Memory usage high'
          },
          {
            name: 'Email Service',
            status: 'healthy',
            lastCheck: new Date(),
            details: 'SMTP configured'
          },
          {
            name: 'Payment Gateway',
            status: 'healthy',
            lastCheck: new Date(),
            details: 'Stripe & Payoneer active'
          }
        ]
      };

      const mockResources: SystemResource[] = [
        {
          name: 'CPU',
          current: Math.floor(Math.random() * 40) + 20,
          max: 100,
          unit: '%',
          status: Math.random() > 0.7 ? 'warning' : 'good'
        },
        {
          name: 'Memory',
          current: Math.floor(Math.random() * 30) + 40,
          max: 100,
          unit: '%',
          status: Math.random() > 0.8 ? 'warning' : 'good'
        },
        {
          name: 'Disk Space',
          current: Math.floor(Math.random() * 20) + 30,
          max: 100,
          unit: '%',
          status: 'good'
        },
        {
          name: 'Network I/O',
          current: Math.floor(Math.random() * 50) + 10,
          max: 100,
          unit: '%',
          status: Math.random() > 0.6 ? 'warning' : 'good'
        },
        {
          name: 'Database Connections',
          current: Math.floor(Math.random() * 20) + 10,
          max: 50,
          unit: 'connections',
          status: Math.random() > 0.8 ? 'warning' : 'good'
        }
      ];

      setSystemInfo(mockSystemInfo);
      setSystemHealth(mockSystemHealth);
      setResources(mockResources);

    } catch (error) {
      console.error('Error loading system data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
      case 'online': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'offline': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good': return 'תקין';
      case 'warning': return 'אזהרה';
      case 'critical': return 'קריטי';
      case 'online': return 'מחובר';
      case 'offline': return 'מנותק';
      case 'maintenance': return 'תחזוקה';
      default: return 'לא ידוע';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
      case 'online': return '✅';
      case 'warning': return '⚠️';
      case 'critical':
      case 'offline': return '❌';
      case 'maintenance': return '🔧';
      default: return '❓';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('he-IL');
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
              <h1 className="text-3xl font-bold text-gray-900">🖥️ מידע מערכת</h1>
              <p className="text-gray-600 mt-2">מידע מפורט על מצב המערכת</p>
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
                onClick={loadSystemData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 רענן עכשיו
              </button>
            </div>
          </div>
        </div>

        {/* System Info */}
        {systemInfo && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">מידע כללי</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600">שם המערכת</h3>
                <p className="text-lg font-semibold text-gray-900">{systemInfo.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">גרסה</h3>
                <p className="text-lg font-semibold text-gray-900">{systemInfo.version}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">זמן פעילות</h3>
                <p className="text-lg font-semibold text-gray-900">{systemInfo.uptime}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">סטטוס</h3>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(systemInfo.status)}`}>
                  {getStatusIcon(systemInfo.status)} {getStatusText(systemInfo.status)}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">עדכון אחרון</h3>
                <p className="text-lg font-semibold text-gray-900">{formatDate(systemInfo.lastUpdate)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">עדכון הבא</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {systemInfo.nextUpdate ? formatDate(systemInfo.nextUpdate) : 'לא מתוכנן'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System Health */}
        {systemHealth && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">בריאות המערכת</h2>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(systemHealth.overall)}`}>
                {getStatusIcon(systemHealth.overall)} {getStatusText(systemHealth.overall)}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemHealth.components.map((component, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{component.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(component.status)}`}>
                      {getStatusIcon(component.status)} {getStatusText(component.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{component.details}</p>
                  <p className="text-xs text-gray-500">
                    אחרון: {formatDate(component.lastCheck)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">משאבי מערכת</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{resource.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resource.status)}`}>
                    {getStatusIcon(resource.status)} {getStatusText(resource.status)}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{resource.current}{resource.unit}</span>
                    <span>{resource.max}{resource.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        resource.status === 'good' ? 'bg-green-500' :
                        resource.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(resource.current / resource.max) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {Math.round((resource.current / resource.max) * 100)}% שימוש
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ פעולות מהירות</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="text-2xl mb-2">🔄</div>
              <p className="font-medium text-blue-900">רענן מערכת</p>
            </button>
            <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-green-900">דוח מפורט</p>
            </button>
            <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <div className="text-2xl mb-2">🔧</div>
              <p className="font-medium text-yellow-900">תחזוקה</p>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="text-2xl mb-2">📈</div>
              <p className="font-medium text-purple-900">ביצועים</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


