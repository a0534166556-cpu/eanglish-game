// בדיקת ביצועים מקיפה
const axios = require('axios');
const fs = require('fs');

class PerformanceTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = [];
    this.errors = [];
  }

  // בדיקת זמן תגובה
  async testResponseTime(endpoint, method = 'GET', data = null) {
    const start = Date.now();
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        data,
        timeout: 10000
      });
      const duration = Date.now() - start;
      
      this.results.push({
        endpoint,
        method,
        status: response.status,
        duration,
        success: true
      });
      
      return { success: true, duration, status: response.status };
    } catch (error) {
      const duration = Date.now() - start;
      this.errors.push({
        endpoint,
        method,
        error: error.message,
        duration
      });
      
      return { success: false, duration, error: error.message };
    }
  }

  // בדיקת עומס (Load Testing)
  async loadTest(endpoint, concurrentUsers = 50, requestsPerUser = 10) {
    console.log(`\n🔥 בדיקת עומס: ${concurrentUsers} משתמשים, ${requestsPerUser} בקשות לכל משתמש`);
    
    const promises = [];
    const startTime = Date.now();
    
    for (let user = 0; user < concurrentUsers; user++) {
      for (let req = 0; req < requestsPerUser; req++) {
        promises.push(this.testResponseTime(endpoint));
      }
    }
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    
    console.log(`✅ הצלחה: ${successful}/${results.length} (${(successful/results.length*100).toFixed(1)}%)`);
    console.log(`⏱️ זמן ממוצע: ${avgDuration.toFixed(0)}ms`);
    console.log(`🚀 בקשות לשנייה: ${(results.length / (totalTime/1000)).toFixed(1)}`);
    
    return {
      total: results.length,
      successful,
      failed,
      avgDuration,
      requestsPerSecond: results.length / (totalTime/1000)
    };
  }

  // בדיקת זיכרון
  async testMemoryUsage() {
    const memBefore = process.memoryUsage();
    
    // ביצוע פעולות שונות
    await this.testResponseTime('/api/health');
    await this.testResponseTime('/games');
    await this.testResponseTime('/api/analytics/dashboard');
    
    const memAfter = process.memoryUsage();
    
    return {
      before: memBefore,
      after: memAfter,
      difference: {
        rss: memAfter.rss - memBefore.rss,
        heapUsed: memAfter.heapUsed - memBefore.heapUsed,
        heapTotal: memAfter.heapTotal - memBefore.heapTotal
      }
    };
  }

  // בדיקת בסיס נתונים
  async testDatabasePerformance() {
    console.log('\n🗄️ בדיקת ביצועי בסיס נתונים...');
    
    const tests = [
      { endpoint: '/api/user/1', name: 'קבלת משתמש' },
      { endpoint: '/api/analytics/dashboard', name: 'דשבורד' },
      { endpoint: '/api/games/update-stats', method: 'POST', name: 'עדכון סטטיסטיקות' }
    ];
    
    const results = [];
    
    for (const test of tests) {
      const result = await this.testResponseTime(test.endpoint, test.method);
      results.push({
        name: test.name,
        ...result
      });
    }
    
    return results;
  }

  // בדיקת אבטחה
  async testSecurity() {
    console.log('\n🔒 בדיקת אבטחה...');
    
    const securityTests = [
      { endpoint: '/api/admin/all-users', name: 'גישה לא מורשית' },
      { endpoint: '/api/user/999999', name: 'משתמש לא קיים' },
      { endpoint: '/api/health', name: 'Health Check' }
    ];
    
    const results = [];
    
    for (const test of securityTests) {
      const result = await this.testResponseTime(test.endpoint);
      results.push({
        name: test.name,
        ...result
      });
    }
    
    return results;
  }

  // בדיקת API endpoints
  async testAllEndpoints() {
    console.log('\n🌐 בדיקת כל ה-API endpoints...');
    
    const endpoints = [
      '/',
      '/games',
      '/api/health',
      '/api/analytics/dashboard',
      '/api/user/1',
      '/admin/email-test'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      const result = await this.testResponseTime(endpoint);
      results.push({
        endpoint,
        ...result
      });
    }
    
    return results;
  }

  // הרצת כל הבדיקות
  async runAllTests() {
    console.log('🚀 מתחיל בדיקות ביצועים מקיפות...\n');
    
    // בדיקת endpoints בסיסיים
    console.log('1️⃣ בדיקת endpoints בסיסיים...');
    await this.testAllEndpoints();
    
    // בדיקת עומס
    console.log('\n2️⃣ בדיקת עומס...');
    const loadTestResults = await this.loadTest('/api/health', 100, 5);
    
    // בדיקת זיכרון
    console.log('\n3️⃣ בדיקת זיכרון...');
    const memoryResults = await this.testMemoryUsage();
    
    // בדיקת בסיס נתונים
    console.log('\n4️⃣ בדיקת בסיס נתונים...');
    const dbResults = await this.testDatabasePerformance();
    
    // בדיקת אבטחה
    console.log('\n5️⃣ בדיקת אבטחה...');
    const securityResults = await this.testSecurity();
    
    // סיכום
    this.generateReport(loadTestResults, memoryResults, dbResults, securityResults);
  }

  // יצירת דוח
  generateReport(loadTest, memory, db, security) {
    console.log('\n📊 דוח ביצועים:');
    console.log('='.repeat(50));
    
    console.log('\n🔥 בדיקת עומס:');
    console.log(`✅ הצלחה: ${loadTest.successful}/${loadTest.total} (${(loadTest.successful/loadTest.total*100).toFixed(1)}%)`);
    console.log(`⏱️ זמן ממוצע: ${loadTest.avgDuration.toFixed(0)}ms`);
    console.log(`🚀 בקשות לשנייה: ${loadTest.requestsPerSecond.toFixed(1)}`);
    
    console.log('\n💾 זיכרון:');
    console.log(`📈 RSS: ${(memory.difference.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📈 Heap Used: ${(memory.difference.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n🗄️ בסיס נתונים:');
    db.forEach(test => {
      console.log(`  ${test.name}: ${test.success ? '✅' : '❌'} ${test.duration}ms`);
    });
    
    console.log('\n🔒 אבטחה:');
    security.forEach(test => {
      console.log(`  ${test.name}: ${test.success ? '✅' : '❌'} ${test.duration}ms`);
    });
    
    // המלצות
    console.log('\n💡 המלצות:');
    if (loadTest.avgDuration > 1000) {
      console.log('⚠️ זמן תגובה איטי - שקול להגדיל משאבי שרת');
    }
    if (loadTest.requestsPerSecond < 10) {
      console.log('⚠️ ביצועים נמוכים - שקול לבדוק את הקוד');
    }
    if (memory.difference.heapUsed > 100 * 1024 * 1024) {
      console.log('⚠️ זיכרון גבוה - שקול לבדוק memory leaks');
    }
    
    console.log('\n✅ בדיקות הושלמו!');
  }
}

// הרצת הבדיקות
async function main() {
  const tester = new PerformanceTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = PerformanceTester;


