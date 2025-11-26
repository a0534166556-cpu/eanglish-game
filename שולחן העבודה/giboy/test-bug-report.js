// בדיקה מהירה של מערכת דיווחי באגים
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBugReport() {
  try {
    console.log('🐛 בודק מערכת דיווחי באגים...\n');
    
    // בדוק אם יש דיווחים
    const reports = await prisma.bugReport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`📊 סה"כ דיווחים במערכת: ${reports.length}`);
    
    if (reports.length > 0) {
      console.log('\n📝 דיווחים אחרונים:');
      reports.forEach((report, i) => {
        console.log(`  ${i + 1}. ${report.description.substring(0, 50)}...`);
        console.log(`     סטטוס: ${report.status} | עדיפות: ${report.priority}`);
        console.log(`     תאריך: ${report.createdAt.toLocaleDateString('he-IL')}`);
        console.log('');
      });
    } else {
      console.log('  ⚠️ אין דיווחים עדיין');
      console.log('  💡 נסה לשלוח דיווח בדף report-bug');
    }
    
    // בדוק סטטיסטיקות
    const stats = await prisma.bugReport.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    
    console.log('📈 סטטיסטיקות לפי סטטוס:');
    stats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count.id} דיווחים`);
    });
    
    console.log('\n✅ בדיקה הושלמה!');
    
  } catch (error) {
    console.error('❌ שגיאה:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testBugReport();


