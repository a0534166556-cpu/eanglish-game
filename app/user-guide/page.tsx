'use client';

import { useState } from 'react';
import AdManager from '@/app/components/ads/AdManager';

export default function UserGuide() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'התחלת עבודה',
      icon: '🚀'
    },
    {
      id: 'games',
      title: 'משחקים',
      icon: '🎮'
    },
    {
      id: 'levels',
      title: 'רמות למידה',
      icon: '📚'
    },
    {
      id: 'profile',
      title: 'פרופיל והישגים',
      icon: '👤'
    },
    {
      id: 'subscription',
      title: 'מנוי וחנות',
      icon: '💳'
    },
    {
      id: 'troubleshooting',
      title: 'פתרון בעיות',
      icon: '🔧'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <AdManager />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📖 מדריך משתמש
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            המדריך המלא לשימוש בפלטפורמת לימוד האנגלית שלנו
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">תוכן עניינים</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-right p-3 rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-purple-100 text-purple-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {activeSection === 'getting-started' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">🚀 התחלת עבודה</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">ברוכים הבאים!</h3>
                      <p className="text-gray-600 leading-relaxed">
                        פלטפורמת לימוד האנגלית שלנו מציעה לכם דרך מהנה ואינטראקטיבית לשפר את כישורי השפה האנגלית שלכם.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">איך להתחיל?</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>הירשמו לאתר או התחברו לחשבון הקיים</li>
                        <li>בחרו את רמת האנגלית שלכם</li>
                        <li>התחילו לשחק במשחקים השונים</li>
                        <li>עקבו אחר ההתקדמות שלכם בדף הפרופיל</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">תכונות עיקריות</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>משחקים אינטראקטיביים ומהנים</li>
                        <li>מערכת רמות מותאמת אישית</li>
                        <li>מעקב אחר התקדמות והישגים</li>
                        <li>אוצר מילים מקיף לכל רמה</li>
                        <li>משחקים מרובי משתתפים</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'games' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">🎮 משחקים</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">סוגי משחקים</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">בחירה מרובה</h4>
                          <p className="text-blue-600 text-sm">בחרו את התשובה הנכונה מבין מספר אפשרויות</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">נכון/לא נכון</h4>
                          <p className="text-green-600 text-sm">החליטו אם המשפט נכון או לא</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-purple-800 mb-2">השלמת משפטים</h4>
                          <p className="text-purple-600 text-sm">השלימו את המילה החסרה במשפט</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-800 mb-2">סידור משפטים</h4>
                          <p className="text-orange-600 text-sm">סדרו את המילים למשפט נכון</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">איך לשחק?</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>בחרו משחק מהדף הראשי</li>
                        <li>בחרו את רמת הקושי המתאימה לכם</li>
                        <li>קראו את ההוראות בקפידה</li>
                        <li>התחילו לשחק וענו על השאלות</li>
                        <li>עקבו אחר הניקוד וההתקדמות שלכם</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'levels' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">📚 רמות למידה</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">מערכת הרמות</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-green-100 p-4 rounded-lg text-center">
                          <div className="text-2xl mb-2">🟢</div>
                          <h4 className="font-semibold text-green-800">קל</h4>
                          <p className="text-green-600 text-sm">מילים בסיסיות ומשפטים קצרים</p>
                        </div>
                        <div className="bg-yellow-100 p-4 rounded-lg text-center">
                          <div className="text-2xl mb-2">🟡</div>
                          <h4 className="font-semibold text-yellow-800">בינוני</h4>
                          <p className="text-yellow-600 text-sm">מילים יומיומיות ומשפטים מורכבים</p>
                        </div>
                        <div className="bg-orange-100 p-4 rounded-lg text-center">
                          <div className="text-2xl mb-2">🟠</div>
                          <h4 className="font-semibold text-orange-800">קשה</h4>
                          <p className="text-orange-600 text-sm">מילים מתקדמות ותוכן מורכב</p>
                        </div>
                        <div className="bg-red-100 p-4 rounded-lg text-center">
                          <div className="text-2xl mb-2">🔴</div>
                          <h4 className="font-semibold text-red-800">אקסטרים</h4>
                          <p className="text-red-600 text-sm">מילים מקצועיות ותוכן מתקדם</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">איך לבחור רמה?</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>התחילו ברמה הקלה כדי להכיר את המערכת</li>
                        <li>עברו לרמה גבוהה יותר כשאתם מרגישים בנוח</li>
                        <li>המערכת תציע לכם רמות מתאימות בהתבסס על הביצועים שלכם</li>
                        <li>אל תפחדו לנסות רמות קשות - זה חלק מהלמידה!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'profile' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">👤 פרופיל והישגים</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">דף הפרופיל</h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        בדף הפרופיל תוכלו לראות את כל המידע על ההתקדמות שלכם:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>ניקוד כולל בכל המשחקים</li>
                        <li>רמת האנגלית הנוכחית שלכם</li>
                        <li>הישגים שצברתם</li>
                        <li>סטטיסטיקות מפורטות</li>
                        <li>אווטאר ותגים</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">מערכת הישגים</h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        צברו הישגים מיוחדים על ידי השלמת משימות שונות:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-yellow-800 mb-2">🏆 הישגי ניקוד</h4>
                          <p className="text-yellow-600 text-sm">צברו ניקוד גבוה במשחקים</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">🎯 הישגי דיוק</h4>
                          <p className="text-blue-600 text-sm">השיגו אחוזי דיוק גבוהים</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">⚡ הישגי מהירות</h4>
                          <p className="text-green-600 text-sm">השלימו משחקים במהירות</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-purple-800 mb-2">🔥 הישגי רצף</h4>
                          <p className="text-purple-600 text-sm">השיגו רצף של תשובות נכונות</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'subscription' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">💳 מנוי וחנות</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">מנוי פרימיום</h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        מנוי פרימיום פותח בפניכם תכונות נוספות ומשחקים מתקדמים:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>גישה לכל המשחקים והרמות</li>
                        <li>משחקים מרובי משתתפים</li>
                        <li>סטטיסטיקות מפורטות</li>
                        <li>אין פרסומות</li>
                        <li>תמיכה עדיפות</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">חנות</h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        בחנות תוכלו לרכוש:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>מטבעות וירטואליים</li>
                        <li>אווטארים מיוחדים</li>
                        <li>תגים ייחודיים</li>
                        <li>תכונות נוספות</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">אמצעי תשלום</h3>
                      <p className="text-gray-600 leading-relaxed">
                        אנו תומכים במגוון אמצעי תשלום בטוחים ונוחים לשימוש.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'troubleshooting' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">🔧 פתרון בעיות</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">בעיות נפוצות</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-red-50 border-l-4 border-red-400 p-4">
                          <h4 className="font-semibold text-red-800 mb-2">המשחק לא נטען</h4>
                          <p className="text-red-600 text-sm mb-2">פתרונות אפשריים:</p>
                          <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                            <li>רעננו את הדף (F5)</li>
                            <li>נקו את מטמון הדפדפן</li>
                            <li>בדקו את החיבור לאינטרנט</li>
                            <li>נסו דפדפן אחר</li>
                          </ul>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                          <h4 className="font-semibold text-yellow-800 mb-2">הניקוד לא מתעדכן</h4>
                          <p className="text-yellow-600 text-sm mb-2">פתרונות אפשריים:</p>
                          <ul className="list-disc list-inside text-yellow-600 text-sm space-y-1">
                            <li>המתינו מספר שניות</li>
                            <li>רעננו את הדף</li>
                            <li>בדקו את החיבור לאינטרנט</li>
                            <li>התחברו מחדש לחשבון</li>
                          </ul>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">בעיות אודיו</h4>
                          <p className="text-blue-600 text-sm mb-2">פתרונות אפשריים:</p>
                          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
                            <li>בדקו את עוצמת הקול</li>
                            <li>בדקו שהדפדפן מאפשר אודיו</li>
                            <li>נסו דפדפן אחר</li>
                            <li>בדקו את הגדרות הדפדפן</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">צריכים עזרה נוספת?</h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        אם לא מצאתם פתרון לבעיה שלכם, אנא צרו איתנו קשר:
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">
                          📧 אימייל: support@learning-english.com<br/>
                          💬 צ'אט: זמין 24/7<br/>
                          📞 טלפון: 1-800-LEARN-EN
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
