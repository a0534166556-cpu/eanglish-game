'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-8 text-center">
            אודותינו
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎓</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">החזון שלנו</h2>
                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  להפוך את לימוד האנגלית לחוויה מהנה, אינטראקטיבית ויעילה עבור כל אחד, 
                  בכל גיל וברמה כלשהי.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">הסיפור שלנו</h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Learning English נוצר מתוך אמונה שכל אחד יכול ללמוד אנגלית בהצלחה, 
                    אם רק ימצא את הדרך הנכונה. הפלטפורמה שלנו משלבת משחקים, טכנולוגיה מתקדמת 
                    ופדגוגיה מוכחת כדי ליצור חווית למידה מהנה ויעילה.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    אנחנו מתמקדים ביצירת תוכן חינוכי איכותי שמתאים לכל רמה, 
                    עם דגש על למידה אינטראקטיבית וחווייתית שמעודדת התמדה והצלחה.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">המספרים שלנו</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">תלמידים פעילים:</span>
                      <span className="font-bold text-blue-600">10,000+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">משחקים שונים:</span>
                      <span className="font-bold text-purple-600">50+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">רמות למידה:</span>
                      <span className="font-bold text-green-600">4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">שפה:</span>
                      <span className="font-bold text-orange-600">עברית + אנגלית</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">מה הופך אותנו למיוחדים?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-4xl mb-4">🎮</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">למידה דרך משחק</h3>
                  <p className="text-gray-600">
                    משחקים אינטראקטיביים שמהנים ומלמדים בו-זמנית, 
                    כך שהלמידה הופכת לחוויה חיובית.
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">מותאם אישית</h3>
                  <p className="text-gray-600">
                    מערכת חכמה שמתאימה את התוכן לרמה שלכם 
                    ומתקדמת איתכם בקצב הנכון.
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">מערכת הישגים</h3>
                  <p className="text-gray-600">
                    פרסים, תעודות וציונים שמעודדים אתכם 
                    להמשיך ולהתקדם.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">המפתח</h2>
              <div className="max-w-2xl mx-auto">
                <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl text-white">
                    👨‍💻
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">יונתן סופר</h3>
                  <p className="text-blue-600 font-semibold mb-4 text-lg">מפתח עצמאי</p>
                  <p className="text-gray-600 leading-relaxed">
                    מפתח תוכנה עצמאי עם ניסיון בפיתוח פלטפורמות חינוכיות. 
                    Learning English פותח כדי לספק חוויית למידה איכותית ונגישה 
                    לכל מי שרוצה לשפר את האנגלית שלו.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">הערכים שלנו</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">🌟</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">איכות</h3>
                      <p className="text-gray-600">
                        אנו מחויבים לספק תוכן חינוכי איכותי ומעודכן 
                        שעומד בסטנדרטים הגבוהים ביותר.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">🤝</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">שירות</h3>
                      <p className="text-gray-600">
                        אנחנו מחויבים לספק תמיכה מעולה ולעזור לכל תלמיד 
                        להשיג את המטרות שלו. הפלטפורמה שלנו נועדה להיות ידידותית ונגישה לכולם.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">💡</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">חדשנות</h3>
                      <p className="text-gray-600">
                        אנו מחפשים תמיד דרכים חדשות ומעניינות 
                        לשפר את חוויית הלמידה.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">הצלחה</h3>
                      <p className="text-gray-600">
                        המטרה שלנו היא לראות כל תלמיד מצליח 
                        ומגיע ליעדים שלו.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">התחילו ללמוד!</h2>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">מוכנים להתחיל את המסע?</h3>
                <p className="text-lg mb-6 opacity-90">
                  גלו את כל המשחקים והתוכן החינוכי שלנו 
                  וצאו למסע למידה מהנה ויעיל!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/games" 
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                  >
                    🚀 התחילו עכשיו
                  </a>
                  <a 
                    href="/contact" 
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    📞 צרו קשר
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


