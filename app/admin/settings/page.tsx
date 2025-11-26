'use client';

import { useState, useEffect } from 'react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
  };
  performance: {
    enableCaching: boolean;
    cacheTimeout: number;
    enableCompression: boolean;
    enableCDN: boolean;
    maxFileSize: number;
  };
  security: {
    enableHTTPS: boolean;
    enableRateLimiting: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
    enable2FA: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    enableEmailNotifications: boolean;
    emailFrom: string;
  };
  payments: {
    enableStripe: boolean;
    enablePayoneer: boolean;
    enableBankTransfer: boolean;
    currency: string;
    taxRate: number;
  };
  games: {
    enableLeaderboards: boolean;
    enableAchievements: boolean;
    enableDailyChallenges: boolean;
    maxGamesPerDay: number;
    enableMultiplayer: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'performance' | 'security' | 'email' | 'payments' | 'games'>('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // סימולציה של הגדרות מערכת
      const mockSettings: SystemSettings = {
        general: {
          siteName: 'Word Clash',
          siteDescription: 'משחק מילים אינטראקטיבי',
          maintenanceMode: false,
          allowRegistration: true,
          requireEmailVerification: true
        },
        performance: {
          enableCaching: true,
          cacheTimeout: 3600,
          enableCompression: true,
          enableCDN: false,
          maxFileSize: 10
        },
        security: {
          enableHTTPS: true,
          enableRateLimiting: true,
          maxLoginAttempts: 5,
          sessionTimeout: 24,
          enable2FA: false
        },
        email: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: 'noreply@wordclash.com',
          enableEmailNotifications: true,
          emailFrom: 'Word Clash <noreply@wordclash.com>'
        },
        payments: {
          enableStripe: true,
          enablePayoneer: true,
          enableBankTransfer: true,
          currency: 'ILS',
          taxRate: 17
        },
        games: {
          enableLeaderboards: true,
          enableAchievements: true,
          enableDailyChallenges: true,
          maxGamesPerDay: 50,
          enableMultiplayer: true
        }
      };

      setSettings(mockSettings);

    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      // סימולציה של שמירת הגדרות
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('הגדרות נשמרו בהצלחה!');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('שגיאה בשמירת ההגדרות');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [key]: value
      }
    }));
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'general': return '⚙️';
      case 'performance': return '🚀';
      case 'security': return '🔒';
      case 'email': return '📧';
      case 'payments': return '💰';
      case 'games': return '🎮';
      default: return '❓';
    }
  };

  const getTabName = (tab: string) => {
    switch (tab) {
      case 'general': return 'כללי';
      case 'performance': return 'ביצועים';
      case 'security': return 'אבטחה';
      case 'email': return 'מייל';
      case 'payments': return 'תשלומים';
      case 'games': return 'משחקים';
      default: return 'לא ידוע';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען הגדרות...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">⚙️ הגדרות מערכת</h1>
              <p className="text-gray-600 mt-2">ניהול הגדרות המערכת</p>
            </div>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className={`px-6 py-3 rounded-lg font-medium ${
                isSaving
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSaving ? '🔄 שומר...' : '💾 שמור הגדרות'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">קטגוריות</h3>
              <nav className="space-y-2">
                {['general', 'performance', 'security', 'email', 'payments', 'games'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`w-full text-right px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{getTabIcon(tab)}</span>
                    {getTabName(tab)}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {settings && (
                <>
                  {/* General Settings */}
                  {activeTab === 'general' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">הגדרות כלליות</h2>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            שם האתר
                          </label>
                          <input
                            type="text"
                            value={settings.general.siteName}
                            onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            תיאור האתר
                          </label>
                          <textarea
                            value={settings.general.siteDescription}
                            onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">מצב תחזוקה</label>
                              <p className="text-sm text-gray-500">השבתת האתר לצורך תחזוקה</p>
                            </div>
                            <button
                              onClick={() => updateSetting('general', 'maintenanceMode', !settings.general.maintenanceMode)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.general.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">אפשר הרשמה</label>
                              <p className="text-sm text-gray-500">אפשר למשתמשים חדשים להירשם</p>
                            </div>
                            <button
                              onClick={() => updateSetting('general', 'allowRegistration', !settings.general.allowRegistration)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.general.allowRegistration ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.general.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">דורש אימות מייל</label>
                              <p className="text-sm text-gray-500">דורש אימות מייל להרשמה</p>
                            </div>
                            <button
                              onClick={() => updateSetting('general', 'requireEmailVerification', !settings.general.requireEmailVerification)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.general.requireEmailVerification ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.general.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Performance Settings */}
                  {activeTab === 'performance' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">הגדרות ביצועים</h2>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">הפעל Cache</label>
                              <p className="text-sm text-gray-500">שיפור ביצועים באמצעות Cache</p>
                            </div>
                            <button
                              onClick={() => updateSetting('performance', 'enableCaching', !settings.performance.enableCaching)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.performance.enableCaching ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.performance.enableCaching ? 'translate-x-6' : 'translate-x-1'
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
                              onClick={() => updateSetting('performance', 'enableCompression', !settings.performance.enableCompression)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.performance.enableCompression ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.performance.enableCompression ? 'translate-x-6' : 'translate-x-1'
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
                              onClick={() => updateSetting('performance', 'enableCDN', !settings.performance.enableCDN)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.performance.enableCDN ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.performance.enableCDN ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            זמן Cache (שניות)
                          </label>
                          <input
                            type="number"
                            value={settings.performance.cacheTimeout}
                            onChange={(e) => updateSetting('performance', 'cacheTimeout', parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            גודל קובץ מקסימלי (MB)
                          </label>
                          <input
                            type="number"
                            value={settings.performance.maxFileSize}
                            onChange={(e) => updateSetting('performance', 'maxFileSize', parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">הגדרות אבטחה</h2>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">הפעל HTTPS</label>
                              <p className="text-sm text-gray-500">הצפנת תקשורת</p>
                            </div>
                            <button
                              onClick={() => updateSetting('security', 'enableHTTPS', !settings.security.enableHTTPS)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.security.enableHTTPS ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.security.enableHTTPS ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">הפעל Rate Limiting</label>
                              <p className="text-sm text-gray-500">הגבלת בקשות</p>
                            </div>
                            <button
                              onClick={() => updateSetting('security', 'enableRateLimiting', !settings.security.enableRateLimiting)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.security.enableRateLimiting ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.security.enableRateLimiting ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">הפעל 2FA</label>
                              <p className="text-sm text-gray-500">אימות דו-שלבי</p>
                            </div>
                            <button
                              onClick={() => updateSetting('security', 'enable2FA', !settings.security.enable2FA)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.security.enable2FA ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.security.enable2FA ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            מקסימום ניסיונות התחברות
                          </label>
                          <input
                            type="number"
                            value={settings.security.maxLoginAttempts}
                            onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            זמן פג תוקף סשן (שעות)
                          </label>
                          <input
                            type="number"
                            value={settings.security.sessionTimeout}
                            onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email Settings */}
                  {activeTab === 'email' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">הגדרות מייל</h2>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Host
                          </label>
                          <input
                            type="text"
                            value={settings.email.smtpHost}
                            onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Port
                          </label>
                          <input
                            type="number"
                            value={settings.email.smtpPort}
                            onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP User
                          </label>
                          <input
                            type="text"
                            value={settings.email.smtpUser}
                            onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            מייל שולח
                          </label>
                          <input
                            type="text"
                            value={settings.email.emailFrom}
                            onChange={(e) => updateSetting('email', 'emailFrom', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">הפעל התראות מייל</label>
                            <p className="text-sm text-gray-500">שליחת התראות במייל</p>
                          </div>
                          <button
                            onClick={() => updateSetting('email', 'enableEmailNotifications', !settings.email.enableEmailNotifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.email.enableEmailNotifications ? 'bg-green-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.email.enableEmailNotifications ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payments Settings */}
                  {activeTab === 'payments' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">הגדרות תשלומים</h2>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">הפעל Stripe</label>
                              <p className="text-sm text-gray-500">תשלומים בכרטיס אשראי</p>
                            </div>
                            <button
                              onClick={() => updateSetting('payments', 'enableStripe', !settings.payments.enableStripe)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.payments.enableStripe ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.payments.enableStripe ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">הפעל Payoneer</label>
                              <p className="text-sm text-gray-500">תשלומים דרך Payoneer</p>
                            </div>
                            <button
                              onClick={() => updateSetting('payments', 'enablePayoneer', !settings.payments.enablePayoneer)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.payments.enablePayoneer ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.payments.enablePayoneer ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">הפעל העברה בנקאית</label>
                              <p className="text-sm text-gray-500">תשלומים בהעברה בנקאית</p>
                            </div>
                            <button
                              onClick={() => updateSetting('payments', 'enableBankTransfer', !settings.payments.enableBankTransfer)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.payments.enableBankTransfer ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.payments.enableBankTransfer ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            מטבע
                          </label>
                          <select
                            value={settings.payments.currency}
                            onChange={(e) => updateSetting('payments', 'currency', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="ILS">שקל חדש (ILS)</option>
                            <option value="USD">דולר אמריקאי (USD)</option>
                            <option value="EUR">יורו (EUR)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            שיעור מס (%)
                          </label>
                          <input
                            type="number"
                            value={settings.payments.taxRate}
                            onChange={(e) => updateSetting('payments', 'taxRate', parseFloat(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Games Settings */}
                  {activeTab === 'games' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">הגדרות משחקים</h2>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">הפעל לוח תוצאות</label>
                              <p className="text-sm text-gray-500">הצגת לוח תוצאות</p>
                            </div>
                            <button
                              onClick={() => updateSetting('games', 'enableLeaderboards', !settings.games.enableLeaderboards)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.games.enableLeaderboards ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.games.enableLeaderboards ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">הפעל הישגים</label>
                              <p className="text-sm text-gray-500">מערכת הישגים</p>
                            </div>
                            <button
                              onClick={() => updateSetting('games', 'enableAchievements', !settings.games.enableAchievements)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.games.enableAchievements ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.games.enableAchievements ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">הפעל אתגרים יומיים</label>
                              <p className="text-sm text-gray-500">אתגרים יומיים</p>
                            </div>
                            <button
                              onClick={() => updateSetting('games', 'enableDailyChallenges', !settings.games.enableDailyChallenges)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.games.enableDailyChallenges ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.games.enableDailyChallenges ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">הפעל משחק מרובה משתתפים</label>
                              <p className="text-sm text-gray-500">משחקים מרובי משתתפים</p>
                            </div>
                            <button
                              onClick={() => updateSetting('games', 'enableMultiplayer', !settings.games.enableMultiplayer)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.games.enableMultiplayer ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.games.enableMultiplayer ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            מקסימום משחקים ליום
                          </label>
                          <input
                            type="number"
                            value={settings.games.maxGamesPerDay}
                            onChange={(e) => updateSetting('games', 'maxGamesPerDay', parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


