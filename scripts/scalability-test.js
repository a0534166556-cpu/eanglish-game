// בדיקת סקלביליות מקיפה
const axios = require('axios');
const cluster = require('cluster');
const os = require('os');

class ScalabilityTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = [];
    this.bottlenecks = [];
  }

  // בדיקת עומס הולך וגדל
  async testProgressiveLoad() {
    console.log('\n📈 בדיקת עומס הולך וגדל...');
    
    const loadLevels = [10, 50, 100, 200, 500, 1000];
    const results = [];
    
    for (const users of loadLevels) {
      console.log(`\n👥 בדיקת ${users} משתמשים...`);
      
      const startTime = Date.now();
      const promises = [];
      
      // יצירת בקשות
      for (let i = 0; i < users; i++) {
        promises.push(this.simulateUser());
      }
      
      const responses = await Promise.allSettled(promises);
      const endTime = Date.now();
      
      const successful = responses.filter(r => r.status === 'fulfilled').length;
      const failed = responses.filter(r => r.status === 'rejected').length;
      const duration = endTime - startTime;
      
      const result = {
        users,
        successful,
        failed,
        duration,
        requestsPerSecond: users / (duration / 1000),
        successRate: (successful / users) * 100
      };
      
      results.push(result);
      
      console.log(`  ✅ הצלחה: ${successful}/${users} (${result.successRate.toFixed(1)}%)`);
      console.log(`  ⏱️ זמן: ${duration}ms`);
      console.log(`  🚀 בקשות/שנייה: ${result.requestsPerSecond.toFixed(1)}`);
      
      // זיהוי bottlenecks
      if (result.successRate < 95) {
        this.bottlenecks.push({
          type: 'High Failure Rate',
          users,
          successRate: result.successRate
        });
      }
      
      if (result.requestsPerSecond < 10) {
        this.bottlenecks.push({
          type: 'Low Throughput',
          users,
          requestsPerSecond: result.requestsPerSecond
        });
      }
      
      if (duration > 10000) {
        this.bottlenecks.push({
          type: 'Slow Response',
          users,
          duration
        });
      }
    }
    
    return results;
  }

  // סימולציה של משתמש
  async simulateUser() {
    const actions = [
      () => axios.get(`${this.baseUrl}/`),
      () => axios.get(`${this.baseUrl}/games`),
      () => axios.get(`${this.baseUrl}/api/health`),
      () => axios.get(`${this.baseUrl}/api/analytics/dashboard`),
      () => axios.post(`${this.baseUrl}/api/games/update-stats`, {
        gameId: 'test',
        score: Math.floor(Math.random() * 1000)
      })
    ];
    
    // ביצוע 3-5 פעולות אקראיות
    const numActions = Math.floor(Math.random() * 3) + 3;
    const selectedActions = actions.sort(() => 0.5 - Math.random()).slice(0, numActions);
    
    for (const action of selectedActions) {
      try {
        await action();
        // הפסקה קצרה בין פעולות
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      } catch (error) {
        throw error;
      }
    }
  }

  // בדיקת זיכרון תחת עומס
  async testMemoryUnderLoad() {
    console.log('\n💾 בדיקת זיכרון תחת עומס...');
    
    const memBefore = process.memoryUsage();
    const initialHeap = memBefore.heapUsed;
    
    // יצירת עומס
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(this.simulateUser());
    }
    
    await Promise.allSettled(promises);
    
    const memAfter = process.memoryUsage();
    const finalHeap = memAfter.heapUsed;
    const memoryIncrease = finalHeap - initialHeap;
    
    console.log(`  📊 זיכרון התחלתי: ${(initialHeap / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  📊 זיכרון סופי: ${(finalHeap / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  📈 עלייה: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
    
    if (memoryIncrease > 100 * 1024 * 1024) { // 100MB
      this.bottlenecks.push({
        type: 'Memory Leak',
        memoryIncrease: memoryIncrease / 1024 / 1024
      });
    }
    
    return {
      initial: initialHeap,
      final: finalHeap,
      increase: memoryIncrease
    };
  }

  // בדיקת CPU תחת עומס
  async testCPUUnderLoad() {
    console.log('\n⚡ בדיקת CPU תחת עומס...');
    
    const startTime = Date.now();
    const startUsage = process.cpuUsage();
    
    // יצירת עומס CPU
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(this.cpuIntensiveTask());
    }
    
    await Promise.allSettled(promises);
    
    const endTime = Date.now();
    const endUsage = process.cpuUsage(startUsage);
    const duration = endTime - startTime;
    
    const cpuTime = (endUsage.user + endUsage.system) / 1000; // microseconds to milliseconds
    const cpuPercent = (cpuTime / duration) * 100;
    
    console.log(`  ⚡ זמן CPU: ${cpuTime.toFixed(2)}ms`);
    console.log(`  📊 אחוז CPU: ${cpuPercent.toFixed(2)}%`);
    
    if (cpuPercent > 80) {
      this.bottlenecks.push({
        type: 'High CPU Usage',
        cpuPercent
      });
    }
    
    return {
      cpuTime,
      cpuPercent,
      duration
    };
  }

  // משימה אינטנסיבית ל-CPU
  async cpuIntensiveTask() {
    return new Promise((resolve) => {
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i);
      }
      resolve(result);
    });
  }

  // בדיקת בסיס נתונים תחת עומס
  async testDatabaseUnderLoad() {
    console.log('\n🗄️ בדיקת בסיס נתונים תחת עומס...');
    
    const dbEndpoints = [
      '/api/user/1',
      '/api/analytics/dashboard',
      '/api/games/update-stats'
    ];
    
    const results = [];
    
    for (const endpoint of dbEndpoints) {
      const startTime = Date.now();
      const promises = [];
      
      // 50 בקשות במקביל
      for (let i = 0; i < 50; i++) {
        promises.push(axios.get(`${this.baseUrl}${endpoint}`));
      }
      
      const responses = await Promise.allSettled(promises);
      const endTime = Date.now();
      
      const successful = responses.filter(r => r.status === 'fulfilled').length;
      const failed = responses.filter(r => r.status === 'rejected').length;
      const duration = endTime - startTime;
      
      results.push({
        endpoint,
        successful,
        failed,
        duration,
        requestsPerSecond: 50 / (duration / 1000)
      });
      
      console.log(`  📊 ${endpoint}: ${successful}/50 (${duration}ms)`);
      
      if (failed > 10) {
        this.bottlenecks.push({
          type: 'Database Bottleneck',
          endpoint,
          failed
        });
      }
    }
    
    return results;
  }

  // בדיקת רשת
  async testNetworkBandwidth() {
    console.log('\n🌐 בדיקת רוחב פס...');
    
    const largeData = 'x'.repeat(1024 * 1024); // 1MB
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${this.baseUrl}/api/games/update-stats`, {
        data: largeData
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      const bandwidth = (largeData.length * 8) / (duration / 1000) / 1024 / 1024; // Mbps
      
      console.log(`  📊 רוחב פס: ${bandwidth.toFixed(2)} Mbps`);
      
      if (bandwidth < 1) {
        this.bottlenecks.push({
          type: 'Low Bandwidth',
          bandwidth
        });
      }
      
      return { bandwidth, duration };
    } catch (error) {
      console.log(`  ❌ שגיאה: ${error.message}`);
      return { bandwidth: 0, duration: 0 };
    }
  }

  // הרצת כל בדיקות הסקלביליות
  async runAllScalabilityTests() {
    console.log('🚀 מתחיל בדיקות סקלביליות מקיפות...\n');
    
    // בדיקת עומס הולך וגדל
    const loadResults = await this.testProgressiveLoad();
    
    // בדיקת זיכרון
    const memoryResults = await this.testMemoryUnderLoad();
    
    // בדיקת CPU
    const cpuResults = await this.testCPUUnderLoad();
    
    // בדיקת בסיס נתונים
    const dbResults = await this.testDatabaseUnderLoad();
    
    // בדיקת רשת
    const networkResults = await this.testNetworkBandwidth();
    
    // סיכום
    this.generateScalabilityReport(loadResults, memoryResults, cpuResults, dbResults, networkResults);
  }

  // יצירת דוח סקלביליות
  generateScalabilityReport(load, memory, cpu, db, network) {
    console.log('\n📊 דוח סקלביליות:');
    console.log('='.repeat(50));
    
    // מקסימום משתמשים
    const maxUsers = load.reduce((max, result) => 
      result.successRate > 95 ? Math.max(max, result.users) : max, 0
    );
    
    console.log(`\n👥 מקסימום משתמשים: ${maxUsers}`);
    
    // ביצועים
    const bestPerformance = load.reduce((best, result) => 
      result.requestsPerSecond > best.requestsPerSecond ? result : best
    );
    
    console.log(`🚀 ביצועים מקסימליים: ${bestPerformance.requestsPerSecond.toFixed(1)} בקשות/שנייה`);
    
    // זיכרון
    console.log(`\n💾 זיכרון:`);
    console.log(`  📊 עלייה: ${(memory.increase / 1024 / 1024).toFixed(2)} MB`);
    
    // CPU
    console.log(`\n⚡ CPU:`);
    console.log(`  📊 אחוז מקסימלי: ${cpu.cpuPercent.toFixed(2)}%`);
    
    // בסיס נתונים
    console.log(`\n🗄️ בסיס נתונים:`);
    db.forEach(result => {
      console.log(`  📊 ${result.endpoint}: ${result.requestsPerSecond.toFixed(1)} בקשות/שנייה`);
    });
    
    // רשת
    console.log(`\n🌐 רשת:`);
    console.log(`  📊 רוחב פס: ${network.bandwidth.toFixed(2)} Mbps`);
    
    // Bottlenecks
    console.log(`\n⚠️ Bottlenecks שנמצאו: ${this.bottlenecks.length}`);
    this.bottlenecks.forEach(bottleneck => {
      console.log(`  🔴 ${bottleneck.type}: ${JSON.stringify(bottleneck)}`);
    });
    
    // המלצות
    console.log('\n💡 המלצות לסקלביליות:');
    
    if (maxUsers < 100) {
      console.log('⚠️ מקסימום משתמשים נמוך - שקול להגדיל משאבי שרת');
    }
    
    if (bestPerformance.requestsPerSecond < 50) {
      console.log('⚠️ ביצועים נמוכים - שקול לבדוק את הקוד');
    }
    
    if (memory.increase > 200 * 1024 * 1024) {
      console.log('⚠️ עלייה גבוהה בזיכרון - שקול לבדוק memory leaks');
    }
    
    if (cpu.cpuPercent > 80) {
      console.log('⚠️ CPU גבוה - שקול להגדיל משאבי CPU');
    }
    
    if (this.bottlenecks.some(b => b.type.includes('Database'))) {
      console.log('⚠️ בעיות בסיס נתונים - שקול לבדוק indexes ו-queries');
    }
    
    if (network.bandwidth < 1) {
      console.log('⚠️ רוחב פס נמוך - שקול לשפר את הרשת');
    }
    
    console.log('\n✅ בדיקות סקלביליות הושלמו!');
  }
}

// הרצת הבדיקות
async function main() {
  const tester = new ScalabilityTester();
  await tester.runAllScalabilityTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ScalabilityTester;


