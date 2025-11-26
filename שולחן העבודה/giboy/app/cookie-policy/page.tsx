'use client';

import { useState } from 'react';
import AdManager from '@/app/components/ads/AdManager';

export default function CookiePolicy() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'סקירה כללית', icon: '📋' },
    { id: 'types', title: 'סוגי עוגיות', icon: '🍪' },
    { id: 'usage', title: 'שימוש בעוגיות', icon: '⚙️' },
    { id: 'management', title: 'ניהול עוגיות', icon: '🔧' },
    { id: 'third-party', title: 'עוגיות צד שלישי', icon: '🔗' },
    { id: 'updates', title: 'עדכונים', icon: '🔄' }
  ];

  const cookieTypes = [
    {
      name: 'עוגיות הכרחיות',
      description: 'עוגיות אלה הכרחיות לתפקוד הבסיסי של האתר',
      examples: ['שמירת העדפות שפה', 'זיהוי משתמשים מחוברים', 'אבטחת האתר'],
      necessary: true
    },
    {
      name: 'עוגיות ביצועים',
      description: 'עוגיות אלה עוזרות לנו להבין איך משתמשים באתר',
      examples: ['סטטיסטיקות שימוש', 'זמני טעינה', 'שגיאות טכניות'],
      necessary: false
    },
    {
      name: 'עוגיות פונקציונליות',
      description: 'עוגיות אלה משפרות את הפונקציונליות של האתר',
      examples: ['שמירת העדפות אישיות', 'זכירת הגדרות', 'התאמה אישית'],
      necessary: false
    },
    {
      name: 'עוגיות פרסום',
      description: 'עוגיות אלה משמשות להצגת פרסומות רלוונטיות',
      examples: ['פרסומות מותאמות', 'מדידת יעילות פרסום', 'מניעת הצגת פרסומות כפולות'],
      necessary: false
    }
  ];

  const thirdPartyServices = [
    {
      name: 'Google Analytics',
      purpose: 'ניתוח תנועה ואנליטיקה',
      cookies: ['_ga', '_gid', '_gat'],
      moreInfo: 'https://policies.google.com/privacy'
    },
    {
      name: 'Facebook Pixel',
      purpose: 'מדידת יעילות פרסום',
      cookies: ['_fbp', '_fbc'],
      moreInfo: 'https://www.facebook.com/policies/cookies'
    },
    {
      name: 'YouTube',
      purpose: 'הטמעת סרטונים',
      cookies: ['VISITOR_INFO1_LIVE', 'YSC'],
      moreInfo: 'https://policies.google.com/privacy'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <AdManager />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🍪 מדיניות עוגיות
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            מידע מפורט על השימוש שלנו בעוגיות (Cookies) ואיך אתם יכולים לנהל אותן
          </p>
          <p className="text-sm text-gray-500 mt-4">
            עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">תוכן עניינים</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-right p-3 rounded-lg transition-colors duration-200 ${
                      activeSection === section.id
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
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

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">סקירה כללית</h2>
                  
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-700 mb-6">
                      אנו משתמשים בעוגיות (Cookies) כדי לשפר את החוויה שלכם באתר שלנו. 
                      מדיניות זו מסבירה איך אנו משתמשים בעוגיות, איזה סוגי עוגיות אנו משתמשים, 
                      ואיך אתם יכולים לנהל את העוגיות שלכם.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                      <h3 className="text-xl font-bold text-blue-800 mb-3">מה הן עוגיות?</h3>
                      <p className="text-blue-700">
                        עוגיות הן קבצי טקסט קטנים שנשמרים במכשיר שלכם כאשר אתם מבקרים באתר. 
                        הן עוזרות לאתר לזכור מידע על הביקור שלכם, כמו העדפות השפה והגדרות אחרות.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-green-800 mb-3">✅ יתרונות</h3>
                        <ul className="text-green-700 space-y-2">
                          <li>• חוויה מותאמת אישית</li>
                          <li>• שמירת העדפות</li>
                          <li>• שיפור ביצועים</li>
                          <li>• אבטחה משופרת</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-yellow-800 mb-3">⚠️ חשוב לדעת</h3>
                        <ul className="text-yellow-700 space-y-2">
                          <li>• אתם יכולים למחוק עוגיות</li>
                          <li>• אתם יכולים לבחור איזה עוגיות לקבל</li>
                          <li>• חלק מהפונקציות עלולות לא לעבוד ללא עוגיות</li>
                          <li>• המידע שלכם מוגן</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Types Section */}
              {activeSection === 'types' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">סוגי עוגיות</h2>
                  
                  <div className="space-y-6">
                    {cookieTypes.map((type, index) => (
                      <div key={index} className={`border rounded-lg p-6 ${
                        type.necessary ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-800">{type.name}</h3>
                          {type.necessary && (
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                              הכרחי
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-4">{type.description}</p>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">דוגמאות:</h4>
                          <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {type.examples.map((example, idx) => (
                              <li key={idx}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage Section */}
              {activeSection === 'usage' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">שימוש בעוגיות</h2>
                  
                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">איך אנו משתמשים בעוגיות?</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">🎯 התאמה אישית</h4>
                          <p className="text-gray-700 text-sm">
                            אנו משתמשים בעוגיות כדי לזכור את ההעדפות שלכם ולהתאים את האתר לצרכים שלכם.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">📊 אנליטיקה</h4>
                          <p className="text-gray-700 text-sm">
                            עוגיות עוזרות לנו להבין איך משתמשים באתר ולשפר את החוויה.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">🔒 אבטחה</h4>
                          <p className="text-gray-700 text-sm">
                            אנו משתמשים בעוגיות כדי להגן על האתר ולמנוע פעילות זדונית.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">💳 תשלומים</h4>
                          <p className="text-gray-700 text-sm">
                            עוגיות הכרחיות לעיבוד תשלומים ולמניעת הונאות.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-blue-800 mb-4">זמן שמירה</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">24 שעות</div>
                          <div className="text-blue-700 text-sm">עוגיות זמניות</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">30 יום</div>
                          <div className="text-blue-700 text-sm">עוגיות ביצועים</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">1 שנה</div>
                          <div className="text-blue-700 text-sm">עוגיות העדפות</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Management Section */}
              {activeSection === 'management' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">ניהול עוגיות</h2>
                  
                  <div className="space-y-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-green-800 mb-4">איך לנהל עוגיות</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">1. הגדרות דפדפן</h4>
                          <p className="text-gray-700 text-sm mb-2">
                            רוב הדפדפנים מאפשרים לכם לנהל עוגיות דרך ההגדרות:
                          </p>
                          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4">
                            <li>Chrome: הגדרות → פרטיות ואבטחה → עוגיות</li>
                            <li>Firefox: אפשרויות → פרטיות ואבטחה → עוגיות</li>
                            <li>Safari: העדפות → פרטיות → עוגיות</li>
                            <li>Edge: הגדרות → עוגיות ואתרים</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">2. כלי ניהול באתר</h4>
                          <p className="text-gray-700 text-sm mb-2">
                            אתם יכולים לנהל את העדפות העוגיות שלכם ישירות באתר:
                          </p>
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                            🔧 ניהול העדפות עוגיות
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-yellow-800 mb-3">⚠️ אזהרה</h3>
                        <p className="text-yellow-700 text-sm">
                          מחיקת עוגיות עלולה לגרום לחלק מהפונקציות באתר לא לעבוד כראוי, 
                          כולל שמירת התחברות והעדפות אישיות.
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-blue-800 mb-3">💡 טיפ</h3>
                        <p className="text-blue-700 text-sm">
                          אתם יכולים לבחור למחוק רק עוגיות מסוימות או להגדיר שהדפדפן 
                          ימחק אותן אוטומטית בסיום הגלישה.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Third Party Section */}
              {activeSection === 'third-party' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">עוגיות צד שלישי</h2>
                  
                  <div className="space-y-6">
                    <p className="text-lg text-gray-700">
                      אנו משתמשים בשירותים של צדדים שלישיים שעלולים להציב עוגיות במכשיר שלכם. 
                      להלן רשימה של השירותים העיקריים:
                    </p>

                    {thirdPartyServices.map((service, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-800">{service.name}</h3>
                          <a 
                            href={service.moreInfo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            מידע נוסף →
                          </a>
                        </div>
                        <p className="text-gray-700 mb-4">{service.purpose}</p>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">עוגיות:</h4>
                          <div className="flex flex-wrap gap-2">
                            {service.cookies.map((cookie, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-mono">
                                {cookie}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-orange-800 mb-3">📝 הערה חשובה</h3>
                      <p className="text-orange-700 text-sm">
                        אנו לא שולטים על העוגיות שמציבים שירותי צד שלישי. 
                        כדי לנהל אותן, עליכם לעיין במדיניות הפרטיות של כל שירות בנפרד.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Updates Section */}
              {activeSection === 'updates' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">עדכונים</h2>
                  
                  <div className="space-y-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-blue-800 mb-4">מדיניות מתעדכנת</h3>
                      <p className="text-blue-700 mb-4">
                        אנו עשויים לעדכן את מדיניות העוגיות שלנו מעת לעת. 
                        כאשר נעדכן את המדיניות, נפרסם הודעה באתר ונעדכן את התאריך למעלה.
                      </p>
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">עדכונים אחרונים:</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• {new Date().toLocaleDateString('he-IL')} - עדכון מדיניות עוגיות</li>
                          <li>• הוספת מידע על עוגיות צד שלישי</li>
                          <li>• שיפור כלי ניהול העדפות</li>
                        </ul>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-green-800 mb-3">📧 עדכונים באימייל</h3>
                        <p className="text-green-700 text-sm mb-4">
                          רוצים לקבל עדכונים על שינויים במדיניות? הרשמו לרשימת התפוצה שלנו.
                        </p>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm">
                          הרשמה לעדכונים
                        </button>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-purple-800 mb-3">❓ שאלות?</h3>
                        <p className="text-purple-700 text-sm mb-4">
                          יש לכם שאלות על מדיניות העוגיות? צרו איתנו קשר!
                        </p>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm">
                          צור קשר
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            ניהול העדפות העוגיות שלכם
          </h3>
          <p className="text-gray-600 mb-6">
            אתם יכולים לנהל את העדפות העוגיות שלכם בכל עת
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200">
              🔧 ניהול העדפות
            </button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              📧 צור קשר
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200">
              ❓ שאלות נפוצות
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
