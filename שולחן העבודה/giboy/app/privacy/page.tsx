'use client';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            מדיניות פרטיות
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6 text-center">
              עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. מבוא</h2>
              <p className="text-gray-600 leading-relaxed">
                ברוכים הבאים לאתר Learning English - משחקי אנגלית. אנו מחויבים להגן על הפרטיות שלכם 
                ולהבטיח שהמידע האישי שלכם מטופל בצורה בטוחה ואחראית.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. איסוף מידע</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                אנו אוספים מידע אישי בכמה דרכים:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>מידע שתספקו בעת הרשמה (שם, כתובת אימייל, גיל)</li>
                <li>מידע על התקדמותכם במשחקים ובמטלות</li>
                <li>מידע טכני על המכשיר והדפדפן שלכם</li>
                <li>מידע על השימוש באתר (דפים שנצפו, זמן שהייה)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. שימוש במידע</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                אנו משתמשים במידע האישי שלכם כדי:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>לספק לכם שירותי למידה מותאמים אישית</li>
                <li>לעקוב אחר ההתקדמות שלכם ולשפר את החוויה</li>
                <li>לשלוח לכם עדכונים וחומרי לימוד</li>
                <li>לשפר את האתר והשירותים שלנו</li>
                <li>לענות על שאלותיכם ולספק תמיכה</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. שיתוף מידע</h2>
              <p className="text-gray-600 leading-relaxed">
                אנו לא מוכרים, משכירים או חושפים את המידע האישי שלכם לצדדים שלישיים, 
                למעט במקרים הבאים:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
                <li>כאשר אתם נותנים לנו רשות מפורשת</li>
                <li>כאשר הדבר נדרש על פי חוק</li>
                <li>עם ספקי שירותים מהימנים שעובדים עבורנו (כמו Google AdSense)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. אבטחת מידע</h2>
              <p className="text-gray-600 leading-relaxed">
                אנו משתמשים באמצעי אבטחה מתקדמים כדי להגן על המידע האישי שלכם, 
                כולל הצפנה, גישה מוגבלת למידע, ובדיקות אבטחה קבועות.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. עוגיות (Cookies)</h2>
              <p className="text-gray-600 leading-relaxed">
                האתר שלנו משתמש בעוגיות כדי לשפר את החוויה שלכם, לעקוב אחר ההתקדמות, 
                ולהציג פרסומות מותאמות. אתם יכולים לבטל את השימוש בעוגיות בהגדרות הדפדפן שלכם.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. זכויותיכם</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                יש לכם זכות:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>לגשת למידע האישי שלכם</li>
                <li>לתקן מידע שגוי או לא מעודכן</li>
                <li>למחוק את החשבון שלכם</li>
                <li>להתנגד לעיבוד המידע שלכם</li>
                <li>לבקש העברה של המידע שלכם</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. יצירת קשר</h2>
              <p className="text-gray-600 leading-relaxed">
                אם יש לכם שאלות על מדיניות הפרטיות הזו, אתם מוזמנים ליצור איתנו קשר:
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>אימייל:</strong> pajaw13300@gmail.com<br/>
                  <strong>יוצר הפלטפורמה:</strong> יונתן סופר<br/>
                  <strong>מיקום:</strong> ישראל 🇮🇱
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. שינויים במדיניות</h2>
              <p className="text-gray-600 leading-relaxed">
                אנו עשויים לעדכן את מדיניות הפרטיות הזו מעת לעת. כל שינוי יפורסם בדף זה 
                עם תאריך העדכון. אנו ממליצים לכם לבדוק את הדף הזה באופן קבוע.
              </p>
            </section>

            <div className="mt-12 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white text-center">
              <h3 className="text-xl font-bold mb-2">שאלות נוספות?</h3>
              <p className="mb-4">אנחנו כאן לעזור לכם!</p>
              <a 
                href="/contact" 
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                צרו קשר
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


