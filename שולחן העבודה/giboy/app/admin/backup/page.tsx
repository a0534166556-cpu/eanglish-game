'use client';

import { useState, useEffect } from 'react';

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  size: number;
  createdAt: Date;
  completedAt?: Date;
  duration?: number;
  location: string;
  description: string;
}

interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  backupLocation: string;
  maxBackups: number;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupJob[]>([]);
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

  useEffect(() => {
    loadBackupData();
  }, []);

  const loadBackupData = async () => {
    try {
      // סימולציה של נתוני גיבוי
      const mockBackups: BackupJob[] = [
        {
          id: '1',
          name: 'Full Backup - 2024-09-28',
          type: 'full',
          status: 'completed',
          size: 2048576000, // 2GB
          createdAt: new Date('2024-09-28T02:00:00'),
          completedAt: new Date('2024-09-28T02:15:00'),
          duration: 15,
          location: '/backups/full_2024-09-28.tar.gz',
          description: 'גיבוי מלא של כל המערכת'
        },
        {
          id: '2',
          name: 'Incremental Backup - 2024-09-28',
          type: 'incremental',
          status: 'completed',
          size: 512000000, // 500MB
          createdAt: new Date('2024-09-28T14:00:00'),
          completedAt: new Date('2024-09-28T14:05:00'),
          duration: 5,
          location: '/backups/inc_2024-09-28.tar.gz',
          description: 'גיבוי מצטבר של שינויים'
        },
        {
          id: '3',
          name: 'Database Backup - 2024-09-28',
          type: 'full',
          status: 'running',
          size: 0,
          createdAt: new Date(),
          location: '/backups/db_2024-09-28.sql',
          description: 'גיבוי בסיס נתונים'
        },
        {
          id: '4',
          name: 'Full Backup - 2024-09-27',
          type: 'full',
          status: 'completed',
          size: 1950000000, // 1.95GB
          createdAt: new Date('2024-09-27T02:00:00'),
          completedAt: new Date('2024-09-27T02:18:00'),
          duration: 18,
          location: '/backups/full_2024-09-27.tar.gz',
          description: 'גיבוי מלא של כל המערכת'
        },
        {
          id: '5',
          name: 'Incremental Backup - 2024-09-27',
          type: 'incremental',
          status: 'failed',
          size: 0,
          createdAt: new Date('2024-09-27T14:00:00'),
          location: '/backups/inc_2024-09-27.tar.gz',
          description: 'גיבוי מצטבר של שינויים'
        }
      ];

      const mockSettings: BackupSettings = {
        autoBackup: true,
        backupFrequency: 'daily',
        retentionDays: 30,
        compressionEnabled: true,
        encryptionEnabled: true,
        backupLocation: '/backups',
        maxBackups: 10
      };

      setBackups(mockBackups);
      setSettings(mockSettings);

    } catch (error) {
      console.error('Error loading backup data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async (type: 'full' | 'incremental' | 'differential') => {
    try {
      setIsCreatingBackup(true);
      
      // סימולציה של יצירת גיבוי
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBackup: BackupJob = {
        id: Date.now().toString(),
        name: `${type === 'full' ? 'Full' : type === 'incremental' ? 'Incremental' : 'Differential'} Backup - ${new Date().toISOString().split('T')[0]}`,
        type,
        status: 'running',
        size: 0,
        createdAt: new Date(),
        location: `/backups/${type}_${new Date().toISOString().split('T')[0]}.tar.gz`,
        description: `גיבוי ${type === 'full' ? 'מלא' : type === 'incremental' ? 'מצטבר' : 'דיפרנציאלי'} של המערכת`
      };

      setBackups(prev => [newBackup, ...prev]);
      
      // סימולציה של השלמת הגיבוי
      setTimeout(() => {
        setBackups(prev => prev.map(backup => 
          backup.id === newBackup.id 
            ? { 
                ...backup, 
                status: 'completed', 
                completedAt: new Date(),
                duration: Math.floor(Math.random() * 20) + 5,
                size: Math.floor(Math.random() * 2000000000) + 500000000
              }
            : backup
        ));
      }, 5000);

    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    try {
      const backup = backups.find(b => b.id === backupId);
      if (!backup) return;

      if (confirm(`האם אתה בטוח שברצונך לשחזר את הגיבוי "${backup.name}"?`)) {
        // סימולציה של שחזור
        alert('שחזור הגיבוי החל...');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
    }
  };

  const deleteBackup = async (backupId: string) => {
    try {
      const backup = backups.find(b => b.id === backupId);
      if (!backup) return;

      if (confirm(`האם אתה בטוח שברצונך למחוק את הגיבוי "${backup.name}"?`)) {
        setBackups(prev => prev.filter(b => b.id !== backupId));
        alert('הגיבוי נמחק בהצלחה');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} דקות`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} שעות ${remainingMinutes} דקות`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'scheduled': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'הושלם';
      case 'running': return 'רץ';
      case 'failed': return 'נכשל';
      case 'scheduled': return 'מתוכנן';
      default: return 'לא ידוע';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'full': return 'מלא';
      case 'incremental': return 'מצטבר';
      case 'differential': return 'דיפרנציאלי';
      default: return 'לא ידוע';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full': return 'text-blue-600 bg-blue-100';
      case 'incremental': return 'text-green-600 bg-green-100';
      case 'differential': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתוני גיבוי...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">💾 ניהול גיבויים</h1>
              <p className="text-gray-600 mt-2">ניהול ושחזור גיבויי המערכת</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => createBackup('full')}
                disabled={isCreatingBackup}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isCreatingBackup
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCreatingBackup ? '🔄 יוצר...' : '💾 צור גיבוי מלא'}
              </button>
              <button
                onClick={() => createBackup('incremental')}
                disabled={isCreatingBackup}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isCreatingBackup
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isCreatingBackup ? '🔄 יוצר...' : '📈 צור גיבוי מצטבר'}
              </button>
            </div>
          </div>
        </div>

        {/* Backup Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">💾</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">סה"כ גיבויים</p>
                <p className="text-2xl font-bold text-gray-900">{backups.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">הושלמו</p>
                <p className="text-2xl font-bold text-gray-900">
                  {backups.filter(b => b.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">נכשלו</p>
                <p className="text-2xl font-bold text-gray-900">
                  {backups.filter(b => b.status === 'failed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">סה"כ גודל</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(backups.reduce((sum, b) => sum + b.size, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Backup List */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">רשימת גיבויים</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    שם
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סוג
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סטטוס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    גודל
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    נוצר
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    משך
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                        <div className="text-sm text-gray-500">{backup.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(backup.type)}`}>
                        {getTypeText(backup.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(backup.status)}`}>
                        {getStatusText(backup.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {backup.size > 0 ? formatFileSize(backup.size) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.createdAt.toLocaleString('he-IL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.duration ? formatDuration(backup.duration) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {backup.status === 'completed' && (
                          <button
                            onClick={() => restoreBackup(backup.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            שחזר
                          </button>
                        )}
                        <button
                          onClick={() => deleteBackup(backup.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          מחק
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Backup Settings */}
        {settings && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">⚙️ הגדרות גיבוי</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">גיבוי אוטומטי</label>
                    <p className="text-sm text-gray-500">הפעל גיבוי אוטומטי</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => prev ? {...prev, autoBackup: !prev.autoBackup} : null)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoBackup ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תדירות גיבוי
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings(prev => prev ? {...prev, backupFrequency: e.target.value as any} : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="hourly">שעתי</option>
                    <option value="daily">יומי</option>
                    <option value="weekly">שבועי</option>
                    <option value="monthly">חודשי</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ימי שמירה
                  </label>
                  <input
                    type="number"
                    value={settings.retentionDays}
                    onChange={(e) => setSettings(prev => prev ? {...prev, retentionDays: parseInt(e.target.value)} : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">דחיסה</label>
                    <p className="text-sm text-gray-500">דחיסת קבצי גיבוי</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => prev ? {...prev, compressionEnabled: !prev.compressionEnabled} : null)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.compressionEnabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.compressionEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">הצפנה</label>
                    <p className="text-sm text-gray-500">הצפנת קבצי גיבוי</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => prev ? {...prev, encryptionEnabled: !prev.encryptionEnabled} : null)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.encryptionEnabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.encryptionEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מיקום גיבוי
                  </label>
                  <input
                    type="text"
                    value={settings.backupLocation}
                    onChange={(e) => setSettings(prev => prev ? {...prev, backupLocation: e.target.value} : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


