// בדיקה מהירה של המערכת
const http = require('http');

async function quickTest() {
  console.log('🚀 מתחיל בדיקה מהירה של המערכת...\n');
  
  const tests = [
    { name: 'דף הבית', path: '/' },
    { name: 'משחקים', path: '/games' },
    { name: 'התחברות', path: '/login' },
    { name: 'פרופיל', path: '/profile' },
    { name: 'Health Check', path: '/api/health' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`🔍 בודק: ${test.name}...`);
      
      const result = await makeRequest(`http://localhost:3000${test.path}`);
      
      if (result.success) {
        console.log(`  ✅ ${test.name}: ${result.status} (${result.duration}ms)`);
        passed++;
      } else {
        console.log(`  ❌ ${test.name}: ${result.error}`);
        failed++;
      }
      
    } catch (error) {
      console.log(`  ❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 תוצאות:`);
  console.log(`  ✅ הצלחה: ${passed}`);
  console.log(`  ❌ כישלון: ${failed}`);
  console.log(`  📈 אחוז הצלחה: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 המערכת עובדת מצוין!');
    console.log('✅ אתה יכול להמשיך לפרסום!');
  } else if (failed <= 2) {
    console.log('\n⚠️ המערכת עובדת אבל יש כמה בעיות קטנות');
    console.log('🔧 תקן את הבעיות לפני הפרסום');
  } else {
    console.log('\n🚨 יש בעיות רציניות במערכת!');
    console.log('❌ אל תפרסם עד שתתקן את הבעיות');
  }
  
  console.log('\n💡 המלצות:');
  console.log('  1. ודא שהשרת רץ: npm run dev');
  console.log('  2. בדוק בדפדפן: http://localhost:3000');
  console.log('  3. בדוק את כל הדפים');
  console.log('  4. בדוק על מובייל');
  console.log('  5. בדוק עומס עם 100+ משתמשים');
}

function makeRequest(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    
    const req = http.get(url, (res) => {
      const duration = Date.now() - start;
      resolve({
        success: true,
        status: res.statusCode,
        duration
      });
    });
    
    req.on('error', (error) => {
      const duration = Date.now() - start;
      resolve({
        success: false,
        error: error.message,
        duration
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout',
        duration: 5000
      });
    });
  });
}

// הרצת הבדיקה
quickTest().catch(console.error);


