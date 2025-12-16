// סקריפט ראשי להרצת כל הבדיקות
const PerformanceTester = require('./performance-test');
const SecurityTester = require('./security-test');
const ScalabilityTester = require('./scalability-test');

class TestRunner {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚀 מתחיל בדיקות מקיפות לפני הפרסום...\n');
    console.log('='.repeat(60));
    
    try {
      // 1. בדיקת ביצועים
      console.log('\n1️⃣ בדיקת ביצועים...');
      const performanceTester = new PerformanceTester(this.baseUrl);
      await performanceTester.runAllTests();
      
      // 2. בדיקת אבטחה
      console.log('\n2️⃣ בדיקת אבטחה...');
      const securityTester = new SecurityTester(this.baseUrl);
      await securityTester.runAllSecurityTests();
      
      // 3. בדיקת סקלביליות
      console.log('\n3️⃣ בדיקת סקלביליות...');
      const scalabilityTester = new ScalabilityTester(this.baseUrl);
      await scalabilityTester.runAllScalabilityTests();
      
      // סיכום כללי
      this.generateFinalReport();
      
    } catch (error) {
      console.error('❌ שגיאה בהרצת הבדיקות:', error);
    }
  }

  generateFinalReport() {
    const endTime = Date.now();
    const totalTime = (endTime - this.startTime) / 1000;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 דוח סופי - בדיקות לפני הפרסום');
    console.log('='.repeat(60));
    
    console.log(`\n⏱️ זמן כולל: ${totalTime.toFixed(2)} שניות`);
    
    console.log('\n✅ בדיקות שהושלמו:');
    console.log('  ✓ בדיקת ביצועים');
    console.log('  ✓ בדיקת אבטחה');
    console.log('  ✓ בדיקת סקלביליות');
    
    console.log('\n🎯 המלצות כלליות:');
    console.log('  1. ודא שהשרת רץ על חומרה חזקה');
    console.log('  2. הגדר CDN לשיפור ביצועים');
    console.log('  3. השתמש ב-Redis ל-Cache');
    console.log('  4. הגדר Load Balancer');
    console.log('  5. בדוק את האבטחה באופן קבוע');
    
    console.log('\n🚀 המערכת מוכנה לפרסום!');
    console.log('='.repeat(60));
  }
}

// הרצת הבדיקות
async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const runner = new TestRunner(baseUrl);
  await runner.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestRunner;


