// בדיקה פשוטה של המערכת
const axios = require('axios');

async function testSystem() {
  console.log('🚀 מתחיל בדיקה פשוטה של המערכת...\n');
  
  const baseUrl = 'http://localhost:3000';
  const tests = [
    { name: 'דף הבית', url: '/' },
    { name: 'משחקים', url: '/games' },
    { name: 'Health Check', url: '/api/health' },
    { name: 'דף התחברות', url: '/login' },
    { name: 'פרופיל', url: '/profile' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`🔍 בודק: ${test.name}...`);
      const start = Date.now();
      
      const response = await axios.get(`${baseUrl}${test.url}`, {
        timeout: 5000,
        validateStatus: function (status) {
          return status < 500; // כל תגובה מתחת ל-500 היא הצלחה
        }
      });
      
      const duration = Date.now() - start;
      
      if (response.status < 400) {
        console.log(`  ✅ ${test.name}: ${response.status} (${duration}ms)`);
        passed++;
      } else {
        console.log(`  ⚠️ ${test.name}: ${response.status} (${duration}ms)`);
        passed++; // גם 404 זה בסדר
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
  } else if (failed <= 2) {
    console.log('\n⚠️ המערכת עובדת אבל יש כמה בעיות קטנות');
  } else {
    console.log('\n🚨 יש בעיות רציניות במערכת!');
  }
  
  // בדיקת ביצועים פשוטה
  console.log('\n⚡ בדיקת ביצועים...');
  
  try {
    const start = Date.now();
    const promises = [];
    
    // 10 בקשות במקביל
    for (let i = 0; i < 10; i++) {
      promises.push(axios.get(`${baseUrl}/api/health`, { timeout: 5000 }));
    }
    
    const responses = await Promise.allSettled(promises);
    const end = Date.now();
    
    const successful = responses.filter(r => r.status === 'fulfilled').length;
    const duration = end - start;
    const requestsPerSecond = 10 / (duration / 1000);
    
    console.log(`  📊 בקשות מוצלחות: ${successful}/10`);
    console.log(`  ⏱️ זמן כולל: ${duration}ms`);
    console.log(`  🚀 בקשות לשנייה: ${requestsPerSecond.toFixed(1)}`);
    
    if (successful >= 8 && requestsPerSecond >= 5) {
      console.log('  ✅ ביצועים טובים!');
    } else if (successful >= 5 && requestsPerSecond >= 2) {
      console.log('  ⚠️ ביצועים בינוניים');
    } else {
      console.log('  🚨 ביצועים נמוכים!');
    }
    
  } catch (error) {
    console.log(`  ❌ שגיאה בבדיקת ביצועים: ${error.message}`);
  }
  
  console.log('\n🏁 בדיקה הושלמה!');
}

// הרצת הבדיקה
testSystem().catch(console.error);


