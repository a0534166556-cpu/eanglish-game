'use client';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            תנאי שימוש
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6 text-center">
              עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. הסכמה לתנאים</h2>
              <p className="text-gray-600 leading-relaxed">
                על ידי השימוש באתר Learning English - משחקי אנגלית, אתם מסכימים לתנאי השימוש הבאים. 
                אם אינכם מסכימים לתנאים אלה, אנא אל תשתמשו באתר.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. תיאור השירות</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Learning English הוא פלטפורמה חינוכית המספקת:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>משחקים אינטראקטיביים ללימוד אנגלית</li>
                <li>מערכת רמות מותאמת אישית</li>
                <li>מערכת הישגים ופרסים</li>
                <li>תוכן חינוכי מגוון</li>
                <li>מערכת מנויים עם הטבות נוספות</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. הרשמה וחשבון משתמש</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                כדי להשתמש בשירותים שלנו, עליכם:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>להיות בני 13 ומעלה (או לקבל אישור הורים)</li>
                <li>לספק מידע מדויק ומעודכן</li>
                <li>לשמור על סודיות הסיסמה שלכם</li>
                <li>להיות אחראיים לכל הפעילות בחשבון שלכם</li>
                <li>להתחייב לא לשתף את החשבון עם אחרים</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. התנהגות משתמש</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                אסור לכם:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>להשתמש באתר למטרות לא חוקיות</li>
                <li>להפר זכויות יוצרים או זכויות אחרות</li>
                <li>להעלות תוכן פוגעני, אלים או לא הולם</li>
                <li>לנסות לפרוץ או לפגוע באבטחת האתר</li>
                <li>להשתמש בתוכנות אוטומטיות או בוטים</li>
                <li>להפריע למשתמשים אחרים</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. תוכן משתמש</h2>
              <p className="text-gray-600 leading-relaxed">
                כל התוכן שאתם יוצרים או מעלים לאתר (כולל תגובות, ציונים, תמונות) 
                נשאר בבעלותכם, אך אתם מעניקים לנו רישיון להשתמש בו כדי לספק את השירותים שלנו.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. מנויים ותשלומים</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                שירותי המנוי שלנו:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>מחויבים מראש לתקופה שנבחרה</li>
                <li>אינם ניתנים להחזרה (למעט במקרים חריגים)</li>
                <li>מתחדשים אוטומטית אלא אם תבטלו</li>
                <li>עשויים להשתנות במחיר עם הודעה מוקדמת</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. הפסקת שירות</h2>
              <p className="text-gray-600 leading-relaxed">
                אנו רשאים להפסיק או להשעות את החשבון שלכם בכל עת אם תפרו את תנאי השימוש, 
                או מסיבות אחרות לפי שיקול דעתנו. אתם רשאים לבטל את החשבון שלכם בכל עת.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. זכויות יוצרים</h2>
              <p className="text-gray-600 leading-relaxed">
                כל התוכן באתר (כולל טקסטים, תמונות, קוד, עיצוב) מוגן בזכויות יוצרים 
                ומהווה רכושם של Learning English או של צדדים שלישיים. אסור להעתיק, 
                להפיץ או להשתמש בתוכן ללא רשות.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. אחריות והגבלות</h2>
              <p className="text-gray-600 leading-relaxed">
                השירותים שלנו מסופקים "כפי שהם" ללא אחריות מכל סוג. אנו לא נושאים באחריות 
                לנזקים עקיפים, מיוחדים או תוצאתיים הנובעים מהשימוש באתר.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">10. שינויים בתנאים</h2>
              <p className="text-gray-600 leading-relaxed">
                אנו רשאים לעדכן את תנאי השימוש מעת לעת. השינויים ייכנסו לתוקף מיד עם פרסומם. 
                המשך השימוש באתר לאחר השינויים מהווה הסכמה לתנאים החדשים.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">11. חוק רלוונטי</h2>
              <p className="text-gray-600 leading-relaxed">
                תנאי השימוש האלה נשלטים על ידי החוק הישראלי. כל סכסוך ייפתר בבתי המשפט 
                המוסמכים בישראל.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">12. יצירת קשר</h2>
              <p className="text-gray-600 leading-relaxed">
                אם יש לכם שאלות על תנאי השימוש, אתם מוזמנים ליצור איתנו קשר:
              </p>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>אימייל:</strong> pajaw13300@gmail.com<br/>
                  <strong>יוצר הפלטפורמה:</strong> יונתן סופר<br/>
                  <strong>מיקום:</strong> ישראל 🇮🇱
                </p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl text-white text-center">
              <h3 className="text-xl font-bold mb-2">צריכים עזרה?</h3>
              <p className="mb-4">הצוות שלנו כאן לעזור לכם!</p>
              <a 
                href="/contact" 
                className="inline-block bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
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


