'use client';

import { useState, useEffect } from 'react';

interface ReportData {
  period: string;
  users: {
    total: number;
    new: number;
    active: number;
    retention: number;
  };
  games: {
    totalPlays: number;
    averageScore: number;
    completionRate: number;
    topGame: string;
  };
  revenue: {
    total: number;
    monthly: number;
    weekly: number;
    daily: number;
    growth: number;
  };
  performance: {
    pageLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
    uptime: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      
      // סימולציה של נתוני דוחות
      const mockReportData: ReportData = {
        period: selectedPeriod,
        users: {
          total: Math.floor(Math.random() * 2000) + 1000,
          new: Math.floor(Math.random() * 100) + 50,
          active: Math.floor(Math.random() * 200) + 100,
          retention: Math.floor(Math.random() * 30) + 70
        },
        games: {
          totalPlays: Math.floor(Math.random() * 10000) + 5000,
          averageScore: Math.floor(Math.random() * 200) + 300,
          completionRate: Math.floor(Math.random() * 20) + 80,
          topGame: ['Word Clash', 'Matching Pairs', 'Mixed Quiz'][Math.floor(Math.random() * 3)]
        },
        revenue: {
          total: Math.floor(Math.random() * 50000) + 20000,
          monthly: Math.floor(Math.random() * 10000) + 5000,
          weekly: Math.floor(Math.random() * 3000) + 1000,
          daily: Math.floor(Math.random() * 500) + 200,
          growth: Math.floor(Math.random() * 50) + 10
        },
        performance: {
          pageLoadTime: Math.floor(Math.random() * 1000) + 500,
          apiResponseTime: Math.floor(Math.random() * 500) + 200,
          errorRate: Math.random() * 5,
          uptime: Math.random() * 10 + 90
        }
      };

      setReportData(mockReportData);

      // יצירת נתוני גרף
      const mockChartData: ChartData = {
        labels: generateLabels(selectedPeriod),
        datasets: [
          {
            label: 'משתמשים פעילים',
            data: generateRandomData(selectedPeriod),
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 1)'
          },
          {
            label: 'הכנסות',
            data: generateRandomData(selectedPeriod, 1000),
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgba(34, 197, 94, 1)'
          }
        ]
      };

      setChartData(mockChartData);

    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateLabels = (period: string): string[] => {
    switch (period) {
      case 'day':
        return Array.from({ length: 24 }, (_, i) => `${i}:00`);
      case 'week':
        return ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
      case 'month':
        return Array.from({ length: 30 }, (_, i) => `${i + 1}`);
      case 'year':
        return ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
      default:
        return [];
    }
  };

  const generateRandomData = (period: string, multiplier: number = 100): number[] => {
    const length = period === 'day' ? 24 : period === 'week' ? 7 : period === 'month' ? 30 : 12;
    return Array.from({ length }, () => Math.floor(Math.random() * multiplier));
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'day': return 'יום';
      case 'week': return 'שבוע';
      case 'month': return 'חודש';
      case 'year': return 'שנה';
      default: return 'לא ידוע';
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('he-IL');
  };

  const formatCurrency = (num: number) => {
    return `₪${num.toLocaleString('he-IL')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתוני דוחות...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">📊 דוחות מפורטים</h1>
              <p className="text-gray-600 mt-2">ניתוח מפורט של ביצועי המערכת</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="day">יום</option>
                <option value="week">שבוע</option>
                <option value="month">חודש</option>
                <option value="year">שנה</option>
              </select>
              <button
                onClick={loadReportData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 רענן
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {reportData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">משתמשים</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(reportData.users.total)}</p>
                  <p className="text-sm text-green-600">+{formatNumber(reportData.users.new)} חדשים</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">🎮</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">משחקים</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(reportData.games.totalPlays)}</p>
                  <p className="text-sm text-blue-600">{reportData.games.completionRate}% השלמה</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">הכנסות</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.revenue.total)}</p>
                  <p className="text-sm text-green-600">+{reportData.revenue.growth}% צמיחה</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ביצועים</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.performance.pageLoadTime}ms</p>
                  <p className="text-sm text-green-600">{reportData.performance.uptime.toFixed(1)}% זמינות</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">משתמשים פעילים</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-gray-600">גרף משתמשים פעילים</p>
                  <p className="text-sm text-gray-500">לפי {getPeriodText(selectedPeriod)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">הכנסות</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">💰</div>
                  <p className="text-gray-600">גרף הכנסות</p>
                  <p className="text-sm text-gray-500">לפי {getPeriodText(selectedPeriod)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Reports */}
        {reportData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Users Report */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📊 דוח משתמשים</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">סה"כ משתמשים:</span>
                  <span className="font-medium">{formatNumber(reportData.users.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">משתמשים חדשים:</span>
                  <span className="font-medium text-green-600">+{formatNumber(reportData.users.new)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">משתמשים פעילים:</span>
                  <span className="font-medium text-blue-600">{formatNumber(reportData.users.active)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">אחוז שמירה:</span>
                  <span className="font-medium text-purple-600">{reportData.users.retention}%</span>
                </div>
              </div>
            </div>

            {/* Games Report */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🎮 דוח משחקים</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">סה"כ משחקים:</span>
                  <span className="font-medium">{formatNumber(reportData.games.totalPlays)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ציון ממוצע:</span>
                  <span className="font-medium text-green-600">{reportData.games.averageScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">אחוז השלמה:</span>
                  <span className="font-medium text-blue-600">{reportData.games.completionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">משחק פופולרי:</span>
                  <span className="font-medium text-purple-600">{reportData.games.topGame}</span>
                </div>
              </div>
            </div>

            {/* Revenue Report */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💰 דוח הכנסות</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">סה"כ הכנסות:</span>
                  <span className="font-medium">{formatCurrency(reportData.revenue.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">הכנסות חודשיות:</span>
                  <span className="font-medium text-green-600">{formatCurrency(reportData.revenue.monthly)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">הכנסות שבועיות:</span>
                  <span className="font-medium text-blue-600">{formatCurrency(reportData.revenue.weekly)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">הכנסות יומיות:</span>
                  <span className="font-medium text-purple-600">{formatCurrency(reportData.revenue.daily)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">צמיחה:</span>
                  <span className="font-medium text-green-600">+{reportData.revenue.growth}%</span>
                </div>
              </div>
            </div>

            {/* Performance Report */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ דוח ביצועים</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">זמן טעינת דף:</span>
                  <span className="font-medium">{reportData.performance.pageLoadTime}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">זמן תגובת API:</span>
                  <span className="font-medium text-green-600">{reportData.performance.apiResponseTime}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">שיעור שגיאות:</span>
                  <span className="font-medium text-blue-600">{reportData.performance.errorRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">זמינות:</span>
                  <span className="font-medium text-purple-600">{reportData.performance.uptime.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📤 ייצוא דוחות</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="text-2xl mb-2">📄</div>
              <p className="font-medium text-blue-900">PDF</p>
            </button>
            <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-green-900">Excel</p>
            </button>
            <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <div className="text-2xl mb-2">📈</div>
              <p className="font-medium text-yellow-900">CSV</p>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="text-2xl mb-2">📧</div>
              <p className="font-medium text-purple-900">מייל</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


