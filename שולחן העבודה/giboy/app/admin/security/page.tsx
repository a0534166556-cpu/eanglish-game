'use client';

import { useState, useEffect } from 'react';

interface SecurityThreat {
  id: string;
  type: 'brute_force' | 'sql_injection' | 'xss' | 'csrf' | 'ddos' | 'malware' | 'phishing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'blocked' | 'investigating' | 'resolved';
  source: string;
  target: string;
  timestamp: Date;
  description: string;
  details?: any;
  actions: string[];
}

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'data_access' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  source: string;
  user?: string;
  ip: string;
  description: string;
  details?: any;
}

interface SecuritySettings {
  enableFirewall: boolean;
  enableIntrusionDetection: boolean;
  enableRateLimiting: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number;
  enable2FA: boolean;
  enableEncryption: boolean;
  enableAuditLogging: boolean;
  enableRealTimeMonitoring: boolean;
  blockSuspiciousIPs: boolean;
  enableEmailAlerts: boolean;
  enableSMSAlerts: boolean;
}

export default function SecurityPage() {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'threats' | 'events' | 'settings' | 'monitoring'>('threats');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSecurityData();
    
    if (autoRefresh) {
      const interval = setInterval(loadSecurityData, 10000); // כל 10 שניות
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadSecurityData = async () => {
    try {
      // סימולציה של נתוני אבטחה
      const mockThreats: SecurityThreat[] = [
        {
          id: '1',
          type: 'brute_force',
          severity: 'high',
          status: 'active',
          source: '192.168.1.100',
          target: 'admin@wordclash.com',
          timestamp: new Date(),
          description: 'ניסיון התחברות מרובה עם סיסמאות שגויות',
          details: { attempts: 15, timeWindow: '5 minutes', blocked: false },
          actions: ['Block IP', 'Send Alert', 'Investigate']
        },
        {
          id: '2',
          type: 'sql_injection',
          severity: 'critical',
          status: 'blocked',
          source: '192.168.1.101',
          target: '/api/users',
          timestamp: new Date(Date.now() - 300000),
          description: 'ניסיון SQL injection בפרמטר userId',
          details: { query: "SELECT * FROM users WHERE id = '1' OR '1'='1'", blocked: true },
          actions: ['Block IP', 'Log Event', 'Notify Admin']
        },
        {
          id: '3',
          type: 'xss',
          severity: 'medium',
          status: 'investigating',
          source: '192.168.1.102',
          target: '/games/word-clash',
          timestamp: new Date(Date.now() - 600000),
          description: 'ניסיון XSS בפרמטר gameName',
          details: { payload: '<script>alert("XSS")</script>', sanitized: true },
          actions: ['Sanitize Input', 'Log Event', 'Monitor']
        },
        {
          id: '4',
          type: 'ddos',
          severity: 'high',
          status: 'active',
          source: '192.168.1.103',
          target: 'API endpoints',
          timestamp: new Date(Date.now() - 900000),
          description: 'ניסיון DDoS על API endpoints',
          details: { requests: 1000, timeWindow: '1 minute', rate: '16.7 req/sec' },
          actions: ['Rate Limit', 'Block IP', 'Scale Resources']
        }
      ];

      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'failed_login',
          severity: 'medium',
          timestamp: new Date(),
          source: '192.168.1.100',
          user: 'admin@wordclash.com',
          ip: '192.168.1.100',
          description: 'התחברות נכשלת - סיסמה שגויה',
          details: { attempts: 3, lastAttempt: new Date() }
        },
        {
          id: '2',
          type: 'suspicious_activity',
          severity: 'high',
          timestamp: new Date(Date.now() - 300000),
          source: '192.168.1.101',
          user: 'user@example.com',
          ip: '192.168.1.101',
          description: 'פעילות חשודה - גישה לנתונים רגישים',
          details: { dataType: 'user_profiles', accessCount: 50, timeWindow: '10 minutes' }
        },
        {
          id: '3',
          type: 'data_access',
          severity: 'low',
          timestamp: new Date(Date.now() - 600000),
          source: '192.168.1.102',
          user: 'user@example.com',
          ip: '192.168.1.102',
          description: 'גישה לנתוני משתמש',
          details: { dataType: 'game_scores', userId: 'user123' }
        },
        {
          id: '4',
          type: 'system_change',
          severity: 'medium',
          timestamp: new Date(Date.now() - 900000),
          source: '192.168.1.103',
          user: 'admin@wordclash.com',
          ip: '192.168.1.103',
          description: 'שינוי בהגדרות מערכת',
          details: { setting: 'max_login_attempts', oldValue: 5, newValue: 3 }
        }
      ];

      const mockSettings: SecuritySettings = {
        enableFirewall: true,
        enableIntrusionDetection: true,
        enableRateLimiting: true,
        maxLoginAttempts: 5,
        sessionTimeout: 24,
        enable2FA: false,
        enableEncryption: true,
        enableAuditLogging: true,
        enableRealTimeMonitoring: true,
        blockSuspiciousIPs: true,
        enableEmailAlerts: true,
        enableSMSAlerts: false
      };

      setThreats(mockThreats);
      setEvents(mockEvents);
      setSettings(mockSettings);

    } catch (error) {
      // console.error('Error loading security data:', error);
    } finally {
      setIsLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'blocked': return 'text-green-600 bg-green-100';
      case 'investigating': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'פעיל';
      case 'blocked': return 'חסום';
      case 'investigating': return 'בבדיקה';
      case 'resolved': return 'נפתר';
      default: return 'לא ידוע';
    }
  };

  const getThreatTypeText = (type: string) => {
    switch (type) {
      case 'brute_force': return 'Brute Force';
      case 'sql_injection': return 'SQL Injection';
      case 'xss': return 'XSS';
      case 'csrf': return 'CSRF';
      case 'ddos': return 'DDoS';
      case 'malware': return 'Malware';
      case 'phishing': return 'Phishing';
      default: return 'לא ידוע';
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'login_attempt': return 'ניסיון התחברות';
      case 'failed_login': return 'התחברות נכשלת';
      case 'suspicious_activity': return 'פעילות חשודה';
      case 'data_access': return 'גישה לנתונים';
      case 'system_change': return 'שינוי מערכת';
      default: return 'לא ידוע';
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'brute_force': return '🔨';
      case 'sql_injection': return '💉';
      case 'xss': return '🌐';
      case 'csrf': return '🔄';
      case 'ddos': return '⚡';
      case 'malware': return '🦠';
      case 'phishing': return '🎣';
      default: return '⚠️';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_attempt': return '🔑';
      case 'failed_login': return '❌';
      case 'suspicious_activity': return '👁️';
      case 'data_access': return '📊';
      case 'system_change': return '⚙️';
      default: return '📝';
    }
  };

  const blockThreat = (threatId: string) => {
    setThreats(prev => prev.map(threat => 
      threat.id === threatId ? { ...threat, status: 'blocked' } : threat
    ));
  };

  const resolveThreat = (threatId: string) => {
    setThreats(prev => prev.map(threat => 
      threat.id === threatId ? { ...threat, status: 'resolved' } : threat
    ));
  };

  const updateSetting = (key: keyof SecuritySettings, value: any) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתוני אבטחה...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">🔒 אבטחת מערכת</h1>
              <p className="text-gray-600 mt-2">ניהול וניטור אבטחת המערכת</p>
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
                onClick={loadSecurityData}
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
                { id: 'threats', name: 'איומים', icon: '🚨' },
                { id: 'events', name: 'אירועים', icon: '📝' },
                { id: 'settings', name: 'הגדרות', icon: '⚙️' },
                { id: 'monitoring', name: 'ניטור', icon: '📊' }
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

        {/* Threats Tab */}
        {selectedTab === 'threats' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">איומי אבטחה</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {threats.map((threat) => (
                  <div key={threat.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <span className="text-2xl mr-4">{getThreatIcon(threat.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {getThreatTypeText(threat.type)}
                            </h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(threat.severity)}`}>
                              {getSeverityText(threat.severity)}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(threat.status)}`}>
                              {getStatusText(threat.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{threat.description}</p>
                          <div className="text-sm text-gray-500 mb-2">
                            <span className="mr-4">מקור: {threat.source}</span>
                            <span className="mr-4">יעד: {threat.target}</span>
                            <span>זמן: {threat.timestamp.toLocaleString('he-IL')}</span>
                          </div>
                          {threat.details && (
                            <div className="bg-gray-50 p-3 rounded mb-2">
                              <pre className="text-sm text-gray-700">
                                {JSON.stringify(threat.details, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {threat.actions.map((action, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {threat.status === 'active' && (
                          <button
                            onClick={() => blockThreat(threat.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            חסום
                          </button>
                        )}
                        {threat.status === 'blocked' && (
                          <button
                            onClick={() => resolveThreat(threat.id)}
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
          </div>
        )}

        {/* Events Tab */}
        {selectedTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">אירועי אבטחה</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {events.map((event) => (
                  <div key={event.id} className="p-6">
                    <div className="flex items-start">
                      <span className="text-2xl mr-4">{getEventIcon(event.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {getEventTypeText(event.type)}
                          </h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}>
                            {getSeverityText(event.severity)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{event.description}</p>
                        <div className="text-sm text-gray-500 mb-2">
                          <span className="mr-4">מקור: {event.source}</span>
                          <span className="mr-4">IP: {event.ip}</span>
                          {event.user && <span className="mr-4">משתמש: {event.user}</span>}
                          <span>זמן: {event.timestamp.toLocaleString('he-IL')}</span>
                        </div>
                        {event.details && (
                          <div className="bg-gray-50 p-3 rounded">
                            <pre className="text-sm text-gray-700">
                              {JSON.stringify(event.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {selectedTab === 'settings' && settings && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">הגדרות אבטחה</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">הפעל Firewall</label>
                      <p className="text-sm text-gray-500">הגנה מפני איומים חיצוניים</p>
                    </div>
                    <button
                      onClick={() => updateSetting('enableFirewall', !settings.enableFirewall)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.enableFirewall ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.enableFirewall ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">זיהוי חדירות</label>
                      <p className="text-sm text-gray-500">זיהוי אוטומטי של איומים</p>
                    </div>
                    <button
                      onClick={() => updateSetting('enableIntrusionDetection', !settings.enableIntrusionDetection)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.enableIntrusionDetection ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.enableIntrusionDetection ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">הגבלת קצב</label>
                      <p className="text-sm text-gray-500">הגבלת מספר בקשות</p>
                    </div>
                    <button
                      onClick={() => updateSetting('enableRateLimiting', !settings.enableRateLimiting)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.enableRateLimiting ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.enableRateLimiting ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מקסימום ניסיונות התחברות
                    </label>
                    <input
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      זמן פג תוקף סשן (שעות)
                    </label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">אימות דו-שלבי</label>
                      <p className="text-sm text-gray-500">הגנה נוספת על חשבונות</p>
                    </div>
                    <button
                      onClick={() => updateSetting('enable2FA', !settings.enable2FA)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.enable2FA ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.enable2FA ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {selectedTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {threats.filter(t => t.status === 'active').length}
                  </div>
                  <p className="text-gray-600">איומים פעילים</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {threats.filter(t => t.status === 'blocked').length}
                  </div>
                  <p className="text-gray-600">איומים חסומים</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {events.length}
                  </div>
                  <p className="text-gray-600">אירועים היום</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


