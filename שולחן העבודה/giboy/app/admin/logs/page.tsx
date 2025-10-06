'use client';

import { useState, useEffect } from 'react';

interface LogEntry {
  id: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  timestamp: Date;
  source: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  details?: any;
  stackTrace?: string;
  tags?: string[];
}

interface LogFilter {
  level: 'all' | 'error' | 'warning' | 'info' | 'debug';
  source: 'all' | string;
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  search: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<LogFilter>({
    level: 'all',
    source: 'all',
    timeRange: '24h',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [sources, setSources] = useState<string[]>([]);

  useEffect(() => {
    loadLogs();
    
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 5000); // כל 5 שניות
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const loadLogs = async () => {
    try {
      // סימולציה של נתוני לוגים
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          level: 'error',
          message: 'Failed to connect to database',
          timestamp: new Date(),
          source: 'Database',
          userId: 'user123',
          sessionId: 'sess_abc123',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: { error: 'Connection timeout', retries: 3, host: 'localhost:5432' },
          stackTrace: 'Error: Connection timeout\n    at Database.connect (/app/db.js:45:12)\n    at async main (/app/index.js:23:5)',
          tags: ['database', 'connection', 'timeout']
        },
        {
          id: '2',
          level: 'warning',
          message: 'High memory usage detected',
          timestamp: new Date(Date.now() - 60000),
          source: 'System',
          details: { usage: '85%', threshold: '80%', process: 'node' },
          tags: ['memory', 'performance']
        },
        {
          id: '3',
          level: 'info',
          message: 'User login successful',
          timestamp: new Date(Date.now() - 120000),
          source: 'Auth',
          userId: 'user456',
          sessionId: 'sess_def456',
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          details: { method: 'password', provider: 'local' },
          tags: ['auth', 'login', 'success']
        },
        {
          id: '4',
          level: 'debug',
          message: 'Cache hit for key: user:123',
          timestamp: new Date(Date.now() - 180000),
          source: 'Cache',
          details: { key: 'user:123', hit: true, ttl: 3600 },
          tags: ['cache', 'hit']
        },
        {
          id: '5',
          level: 'error',
          message: 'Payment processing failed',
          timestamp: new Date(Date.now() - 240000),
          source: 'Payment',
          userId: 'user789',
          sessionId: 'sess_ghi789',
          ip: '192.168.1.102',
          details: { amount: 19.90, currency: 'ILS', provider: 'stripe', error: 'Card declined' },
          tags: ['payment', 'stripe', 'failed']
        },
        {
          id: '6',
          level: 'info',
          message: 'Game completed successfully',
          timestamp: new Date(Date.now() - 300000),
          source: 'Game',
          userId: 'user123',
          sessionId: 'sess_abc123',
          details: { gameType: 'word-clash', score: 450, duration: 180 },
          tags: ['game', 'completion', 'score']
        },
        {
          id: '7',
          level: 'warning',
          message: 'Slow query detected',
          timestamp: new Date(Date.now() - 360000),
          source: 'Database',
          details: { query: 'SELECT * FROM users WHERE...', duration: 2500, threshold: 1000 },
          tags: ['database', 'query', 'performance']
        },
        {
          id: '8',
          level: 'debug',
          message: 'Email sent successfully',
          timestamp: new Date(Date.now() - 420000),
          source: 'Email',
          userId: 'user456',
          details: { to: 'user@example.com', subject: 'Welcome to Word Clash', template: 'welcome' },
          tags: ['email', 'sent', 'welcome']
        }
      ];

      setLogs(mockLogs);
      
      // חילוץ מקורות ייחודיים
      const uniqueSources = [...new Set(mockLogs.map(log => log.source))];
      setSources(uniqueSources);

    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // סינון לפי רמה
    if (filters.level !== 'all') {
      filtered = filtered.filter(log => log.level === filters.level);
    }

    // סינון לפי מקור
    if (filters.source !== 'all') {
      filtered = filtered.filter(log => log.source === filters.source);
    }

    // סינון לפי טווח זמן
    const now = new Date();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const timeRange = timeRanges[filters.timeRange];
    if (timeRange) {
      filtered = filtered.filter(log => now.getTime() - log.timestamp.getTime() <= timeRange);
    }

    // סינון לפי חיפוש
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm) ||
        log.source.toLowerCase().includes(searchTerm) ||
        (log.userId && log.userId.toLowerCase().includes(searchTerm)) ||
        (log.tags && log.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    setFilteredLogs(filtered);
  };

  const clearLogs = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל הלוגים?')) {
      setLogs([]);
      setFilteredLogs([]);
    }
  };

  const exportLogs = () => {
    const csvContent = [
      'Timestamp,Level,Source,Message,User ID,IP,Details',
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.level,
        log.source,
        `"${log.message.replace(/"/g, '""')}"`,
        log.userId || '',
        log.ip || '',
        `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'debug': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'debug': return '🐛';
      default: return '📝';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('he-IL');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען לוגים...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">📝 לוגים מערכת</h1>
              <p className="text-gray-600 mt-2">ניהול וניטור לוגי המערכת</p>
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
                onClick={exportLogs}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📤 ייצא CSV
              </button>
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🗑️ נקה לוגים
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🔍 סינון לוגים</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">רמה</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value as any }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">כל הרמות</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מקור</label>
              <select
                value={filters.source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">כל המקורות</option>
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">טווח זמן</label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value as any }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1h">שעה אחרונה</option>
                <option value="6h">6 שעות אחרונות</option>
                <option value="24h">24 שעות אחרונות</option>
                <option value="7d">7 ימים אחרונים</option>
                <option value="30d">30 ימים אחרונים</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">חיפוש</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="חיפוש בהודעות..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              לוגים ({filteredLogs.length})
            </h3>
            <div className="text-sm text-gray-500">
              {logs.length} סה"כ לוגים
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    זמן
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    רמה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מקור
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    הודעה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    משתמש
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)} {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.source}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.userId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        צפה
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Log Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">פרטי לוג</h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">זמן</label>
                      <p className="text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">רמה</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(selectedLog.level)}`}>
                        {getLevelIcon(selectedLog.level)} {selectedLog.level.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">מקור</label>
                      <p className="text-sm text-gray-900">{selectedLog.source}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">משתמש</label>
                      <p className="text-sm text-gray-900">{selectedLog.userId || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IP</label>
                      <p className="text-sm text-gray-900">{selectedLog.ip || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">סשן</label>
                      <p className="text-sm text-gray-900">{selectedLog.sessionId || '-'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">הודעה</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedLog.message}</p>
                  </div>
                  
                  {selectedLog.details && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">פרטים</label>
                      <pre className="text-sm text-gray-900 bg-gray-50 p-3 rounded overflow-x-auto">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {selectedLog.stackTrace && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stack Trace</label>
                      <pre className="text-sm text-gray-900 bg-gray-50 p-3 rounded overflow-x-auto">
                        {selectedLog.stackTrace}
                      </pre>
                    </div>
                  )}
                  
                  {selectedLog.tags && selectedLog.tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">תגיות</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedLog.tags.map((tag, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


