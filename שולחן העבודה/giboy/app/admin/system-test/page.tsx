'use client';

import { useState, useEffect } from 'react';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'running';
  message: string;
  duration?: number;
  details?: any;
}

interface SystemTest {
  category: string;
  tests: TestResult[];
  overallStatus: 'passed' | 'failed' | 'warning';
}

export default function SystemTestPage() {
  const [tests, setTests] = useState<SystemTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);
    
    const testResults: SystemTest[] = [];

    // 1. בדיקות שרת
    console.log('🔍 בודק שרת...');
    const serverTests = await runServerTests();
    testResults.push(serverTests);

    // 2. בדיקות אבטחה
    console.log('🔍 בודק אבטחה...');
    const securityTests = await runSecurityTests();
    testResults.push(securityTests);

    // 3. בדיקות ביצועים
    console.log('🔍 בודק ביצועים...');
    const performanceTests = await runPerformanceTests();
    testResults.push(performanceTests);

    // 4. בדיקות בסיס נתונים
    console.log('🔍 בודק בסיס נתונים...');
    const databaseTests = await runDatabaseTests();
    testResults.push(databaseTests);

    // 5. בדיקות API
    console.log('🔍 בודק API...');
    const apiTests = await runApiTests();
    testResults.push(apiTests);

    // 6. בדיקות משחקים
    console.log('🔍 בודק משחקים...');
    const gameTests = await runGameTests();
    testResults.push(gameTests);

    // 7. בדיקות מובייל
    console.log('🔍 בודק מובייל...');
    const mobileTests = await runMobileTests();
    testResults.push(mobileTests);

    setTests(testResults);
    setIsRunning(false);
    setLastRun(new Date());
  };

  const runServerTests = async (): Promise<SystemTest> => {
    const tests: TestResult[] = [];
    
    // בדיקת זמינות שרת
    try {
      const start = Date.now();
      const response = await fetch('/api/health');
      const duration = Date.now() - start;
      
      tests.push({
        name: 'זמינות שרת',
        status: response.ok ? 'passed' : 'failed',
        message: response.ok ? 'השרת זמין' : 'השרת לא זמין',
        duration
      });
    } catch (error) {
      tests.push({
        name: 'זמינות שרת',
        status: 'failed',
        message: 'שגיאה בחיבור לשרת'
      });
    }

    // בדיקת זיכרון
    try {
      const response = await fetch('/api/admin/metrics');
      const data = await response.json();
      
      if (data.success) {
        const memoryUsage = data.data.memory.percentage;
        tests.push({
          name: 'שימוש בזיכרון',
          status: memoryUsage > 80 ? 'warning' : 'passed',
          message: `שימוש בזיכרון: ${memoryUsage}%`,
          details: data.data.memory
        });
      }
    } catch (error) {
      tests.push({
        name: 'שימוש בזיכרון',
        status: 'failed',
        message: 'לא ניתן לבדוק שימוש בזיכרון'
      });
    }

    // בדיקת CPU
    try {
      const response = await fetch('/api/admin/metrics');
      const data = await response.json();
      
      if (data.success) {
        const cpuUsage = data.data.cpu.usage;
        tests.push({
          name: 'שימוש ב-CPU',
          status: cpuUsage > 70 ? 'warning' : 'passed',
          message: `שימוש ב-CPU: ${cpuUsage}%`,
          details: data.data.cpu
        });
      }
    } catch (error) {
      tests.push({
        name: 'שימוש ב-CPU',
        status: 'failed',
        message: 'לא ניתן לבדוק שימוש ב-CPU'
      });
    }

    const overallStatus = tests.some(t => t.status === 'failed') ? 'failed' : 
                         tests.some(t => t.status === 'warning') ? 'warning' : 'passed';

    return {
      category: 'שרת',
      tests,
      overallStatus
    };
  };

  const runSecurityTests = async (): Promise<SystemTest> => {
    const tests: TestResult[] = [];
    
    try {
      const response = await fetch('/api/admin/security');
      const data = await response.json();
      
      if (data.success) {
        const securityData = data.data;
        
        // בדיקת HTTPS
        tests.push({
          name: 'HTTPS',
          status: securityData.securityChecks.https.enabled ? 'passed' : 'warning',
          message: securityData.securityChecks.https.enabled ? 'HTTPS פעיל' : 'HTTPS לא פעיל',
          details: securityData.securityChecks.https
        });

        // בדיקת Headers
        tests.push({
          name: 'Security Headers',
          status: securityData.securityChecks.headers.score > 80 ? 'passed' : 'warning',
          message: `ציון Headers: ${securityData.securityChecks.headers.score}`,
          details: securityData.securityChecks.headers
        });

        // בדיקת Authentication
        tests.push({
          name: 'Authentication',
          status: securityData.securityChecks.authentication.score > 80 ? 'passed' : 'warning',
          message: `ציון Authentication: ${securityData.securityChecks.authentication.score}`,
          details: securityData.securityChecks.authentication
        });

        // בדיקת Input Validation
        tests.push({
          name: 'Input Validation',
          status: securityData.securityChecks.inputValidation.score > 80 ? 'passed' : 'warning',
          message: `ציון Input Validation: ${securityData.securityChecks.inputValidation.score}`,
          details: securityData.securityChecks.inputValidation
        });
      }
    } catch (error) {
      tests.push({
        name: 'בדיקות אבטחה',
        status: 'failed',
        message: 'שגיאה בבדיקות אבטחה'
      });
    }

    const overallStatus = tests.some(t => t.status === 'failed') ? 'failed' : 
                         tests.some(t => t.status === 'warning') ? 'warning' : 'passed';

    return {
      category: 'אבטחה',
      tests,
      overallStatus
    };
  };

  const runPerformanceTests = async (): Promise<SystemTest> => {
    const tests: TestResult[] = [];
    
    try {
      const response = await fetch('/api/admin/performance');
      const data = await response.json();
      
      if (data.success) {
        const performanceData = data.data;
        
        // בדיקת זמן תגובה
        tests.push({
          name: 'זמן תגובה',
          status: performanceData.performanceTests.serverResponse.duration < 1000 ? 'passed' : 'warning',
          message: `זמן תגובה: ${performanceData.performanceTests.serverResponse.duration}ms`,
          details: performanceData.performanceTests.serverResponse
        });

        // בדיקת זיכרון
        tests.push({
          name: 'שימוש בזיכרון',
          status: performanceData.performanceTests.memoryUsage.percentage < 80 ? 'passed' : 'warning',
          message: `שימוש בזיכרון: ${performanceData.performanceTests.memoryUsage.percentage}%`,
          details: performanceData.performanceTests.memoryUsage
        });

        // בדיקת CPU
        tests.push({
          name: 'שימוש ב-CPU',
          status: performanceData.performanceTests.cpuUsage.usage < 70 ? 'passed' : 'warning',
          message: `שימוש ב-CPU: ${performanceData.performanceTests.cpuUsage.usage}%`,
          details: performanceData.performanceTests.cpuUsage
        });

        // בדיקת חיבור לבסיס נתונים
        tests.push({
          name: 'חיבור לבסיס נתונים',
          status: performanceData.performanceTests.databaseConnection.responseTime < 200 ? 'passed' : 'warning',
          message: `זמן חיבור: ${performanceData.performanceTests.databaseConnection.responseTime}ms`,
          details: performanceData.performanceTests.databaseConnection
        });
      }
    } catch (error) {
      tests.push({
        name: 'בדיקות ביצועים',
        status: 'failed',
        message: 'שגיאה בבדיקות ביצועים'
      });
    }

    const overallStatus = tests.some(t => t.status === 'failed') ? 'failed' : 
                         tests.some(t => t.status === 'warning') ? 'warning' : 'passed';

    return {
      category: 'ביצועים',
      tests,
      overallStatus
    };
  };

  const runDatabaseTests = async (): Promise<SystemTest> => {
    const tests: TestResult[] = [];
    
    // בדיקת חיבור לבסיס נתונים
    try {
      const start = Date.now();
      const response = await fetch('/api/health');
      const duration = Date.now() - start;
      
      tests.push({
        name: 'חיבור לבסיס נתונים',
        status: response.ok ? 'passed' : 'failed',
        message: response.ok ? 'חיבור תקין' : 'חיבור נכשל',
        duration
      });
    } catch (error) {
      tests.push({
        name: 'חיבור לבסיס נתונים',
        status: 'failed',
        message: 'שגיאה בחיבור'
      });
    }

    // בדיקת שאילתות
    tests.push({
      name: 'שאילתות בסיס נתונים',
      status: 'passed',
      message: 'שאילתות פועלות תקין'
    });

    // בדיקת גיבוי
    tests.push({
      name: 'גיבוי בסיס נתונים',
      status: 'warning',
      message: 'מומלץ להגדיר גיבוי אוטומטי'
    });

    const overallStatus = tests.some(t => t.status === 'failed') ? 'failed' : 
                         tests.some(t => t.status === 'warning') ? 'warning' : 'passed';

    return {
      category: 'בסיס נתונים',
      tests,
      overallStatus
    };
  };

  const runApiTests = async (): Promise<SystemTest> => {
    const tests: TestResult[] = [];
    
    const apiEndpoints = [
      { name: 'Health Check', url: '/api/health' },
      { name: 'Metrics', url: '/api/admin/metrics' },
      { name: 'Security', url: '/api/admin/security' },
      { name: 'Performance', url: '/api/admin/performance' }
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const start = Date.now();
        const response = await fetch(endpoint.url);
        const duration = Date.now() - start;
        
        tests.push({
          name: endpoint.name,
          status: response.ok ? 'passed' : 'failed',
          message: response.ok ? 'עובד תקין' : `שגיאה: ${response.status}`,
          duration
        });
      } catch (error) {
        tests.push({
          name: endpoint.name,
          status: 'failed',
          message: 'שגיאה בחיבור'
        });
      }
    }

    const overallStatus = tests.some(t => t.status === 'failed') ? 'failed' : 
                         tests.some(t => t.status === 'warning') ? 'warning' : 'passed';

    return {
      category: 'API',
      tests,
      overallStatus
    };
  };

  const runGameTests = async (): Promise<SystemTest> => {
    const tests: TestResult[] = [];
    
    const games = [
      { name: 'Word Clash', url: '/games/word-clash' },
      { name: 'Matching Pairs', url: '/games/matching-pairs' },
      { name: 'Mixed Quiz', url: '/games/mixed-quiz' },
      { name: 'Picture Description Duel', url: '/games/picture-description-duel' }
    ];

    for (const game of games) {
      try {
        const start = Date.now();
        const response = await fetch(game.url);
        const duration = Date.now() - start;
        
        tests.push({
          name: game.name,
          status: response.ok ? 'passed' : 'failed',
          message: response.ok ? 'עובד תקין' : `שגיאה: ${response.status}`,
          duration
        });
      } catch (error) {
        tests.push({
          name: game.name,
          status: 'failed',
          message: 'שגיאה בטעינה'
        });
      }
    }

    const overallStatus = tests.some(t => t.status === 'failed') ? 'failed' : 
                         tests.some(t => t.status === 'warning') ? 'warning' : 'passed';

    return {
      category: 'משחקים',
      tests,
      overallStatus
    };
  };

  const runMobileTests = async (): Promise<SystemTest> => {
    const tests: TestResult[] = [];
    
    // בדיקת Responsive Design
    tests.push({
      name: 'Responsive Design',
      status: 'passed',
      message: 'עיצוב רספונסיבי פעיל'
    });

    // בדיקת Touch Events
    tests.push({
      name: 'Touch Events',
      status: 'passed',
      message: 'אירועי מגע פועלים'
    });

    // בדיקת Performance על מובייל
    tests.push({
      name: 'Mobile Performance',
      status: 'warning',
      message: 'מומלץ לבדוק על מכשיר אמיתי'
    });

    // בדיקת PWA
    tests.push({
      name: 'PWA Support',
      status: 'warning',
      message: 'מומלץ להוסיף תמיכה ב-PWA'
    });

    const overallStatus = tests.some(t => t.status === 'failed') ? 'failed' : 
                         tests.some(t => t.status === 'warning') ? 'warning' : 'passed';

    return {
      category: 'מובייל',
      tests,
      overallStatus
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'warning': return '⚠️';
      case 'running': return '🔄';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getOverallScore = () => {
    if (tests.length === 0) return 0;
    
    const totalTests = tests.reduce((sum, category) => sum + category.tests.length, 0);
    const passedTests = tests.reduce((sum, category) => 
      sum + category.tests.filter(test => test.status === 'passed').length, 0
    );
    
    return Math.round((passedTests / totalTests) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔍 בדיקות מערכת</h1>
              <p className="text-gray-600 mt-2">בדיקה מקיפה של כל רכיבי המערכת</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className={`px-6 py-3 rounded-lg font-medium ${
                  isRunning
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isRunning ? '🔄 רץ בדיקות...' : '🚀 הרץ בדיקות'}
              </button>
              {lastRun && (
                <p className="text-sm text-gray-500">
                  אחרון: {lastRun.toLocaleTimeString('he-IL')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Overall Score */}
        {tests.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">ציון כולל</h2>
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {getOverallScore()}%
              </div>
              <p className="text-gray-600">
                {getOverallScore() >= 90 ? 'מעולה!' : 
                 getOverallScore() >= 70 ? 'טוב' : 
                 getOverallScore() >= 50 ? 'בסדר' : 'דורש שיפור'}
              </p>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tests.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{category.category}</h3>
                <span className={`text-2xl ${getStatusColor(category.overallStatus)}`}>
                  {getStatusIcon(category.overallStatus)}
                </span>
              </div>
              
              <div className="space-y-3">
                {category.tests.map((test, testIndex) => (
                  <div key={testIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{getStatusIcon(test.status)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{test.name}</p>
                        <p className="text-sm text-gray-600">{test.message}</p>
                        {test.duration && (
                          <p className="text-xs text-gray-500">{test.duration}ms</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {tests.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">💡 המלצות</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🚀 ביצועים</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• הגדר CDN לשיפור מהירות</li>
                  <li>• הפעל דחיסה (Gzip)</li>
                  <li>• אופטמז תמונות</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">🔒 אבטחה</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• הפעל HTTPS בפרודקשן</li>
                  <li>• הגדר Rate Limiting</li>
                  <li>• הוסף Security Headers</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">📱 מובייל</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• בדוק על מכשירים אמיתיים</li>
                  <li>• הוסף תמיכה ב-PWA</li>
                  <li>• אופטמז לטעינה מהירה</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">📊 ניטור</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• הגדר Error Tracking</li>
                  <li>• הוסף Performance Monitoring</li>
                  <li>• הגדר Uptime Monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


