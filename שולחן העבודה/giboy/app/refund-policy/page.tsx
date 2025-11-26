'use client';

import { useState } from 'react';
import AdManager from '@/app/components/ads/AdManager';

export default function RefundPolicy() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'סקירה כללית', icon: '📋' },
    { id: 'eligibility', title: 'זכאות להחזר', icon: '✅' },
    { id: 'process', title: 'תהליך החזר', icon: '🔄' },
    { id: 'timeline', title: 'זמני החזר', icon: '⏰' },
    { id: 'exceptions', title: 'חריגים', icon: '⚠️' },
    { id: 'contact', title: 'צור קשר', icon: '📞' }
  ];

  const refundEligibility = [
    {
      category: 'מנוי פרימיום',
      conditions: [
        'החזר תוך 14 יום מרכישת המנוי',
        'לא יותר מ-3 החזרים בשנה',
        'לא נוצל תוכן פרימיום משמעותי',
        'החזר מלא או חלקי בהתאם לשימוש'
      ],
      refundType: 'מלא/חלקי'
    },
    {
      category: 'רכישות בחנות',
      conditions: [
        'החזר תוך 7 יום מרכישת הפריט',
        'הפריט לא נוצל או הורד',
        'הפריט תקין ולא פגום',
        'החזר מלא בלבד'
      ],
      refundType: 'מלא'
    },
    {
      category: 'קורסים דיגיטליים',
      conditions: [
        'החזר תוך 30 יום מתחילת הקורס',
        'לא הושלם יותר מ-20% מהקורס',
        'לא הורדו חומרי הקורס',
        'החזר מלא או חלקי בהתאם להתקדמות'
      ],
      refundType: 'מלא/חלקי'
    },
    {
      category: 'שירותי תמיכה',
      conditions: [
        'החזר תוך 48 שעות מהזמנת השירות',
        'השירות לא בוצע',
        'ביטול מראש של השירות',
        'החזר מלא בלבד'
      ],
      refundType: 'מלא'
    }
  ];

  const refundProcess = [
    {
      step: 1,
      title: 'בקשה להחזר',
      description: 'מלאו את טופס בקשת ההחזר או צרו קשר עם התמיכה',
      icon: '📝',
      time: 'מיד'
    },
    {
      step: 2,
      title: 'בדיקת זכאות',
      description: 'נבדוק את הזכאות שלכם להחזר לפי התנאים',
      icon: '🔍',
      time: '1-2 ימי עסקים'
    },
    {
      step: 3,
      title: 'אישור החזר',
      description: 'נשלח לכם אישור על אישור ההחזר',
      icon: '✅',
      time: '1-3 ימי עסקים'
    },
    {
      step: 4,
      title: 'עיבוד החזר',
      description: 'נעבד את ההחזר לאמצעי התשלום המקורי',
      icon: '💳',
      time: '3-7 ימי עסקים'
    },
    {
      step: 5,
      title: 'קבלת החזר',
      description: 'תקבלו את ההחזר בחשבון שלכם',
      icon: '💰',
      time: '1-5 ימי עסקים'
    }
  ];

  const refundTimelines = [
    {
      method: 'כרטיס אשראי',
      timeline: '3-7 ימי עסקים',
      description: 'ההחזר יופיע בחשבון הכרטיס שלכם'
    },
    {
      method: 'PayPal',
      timeline: '1-3 ימי עסקים',
      description: 'ההחזר יופיע בחשבון PayPal שלכם'
    },
    {
      method: 'העברה בנקאית',
      timeline: '5-10 ימי עסקים',
      description: 'ההחזר יועבר לחשבון הבנק שלכם'
    },
    {
      method: 'ארנק דיגיטלי',
      timeline: '1-2 ימי עסקים',
      description: 'ההחזר יופיע בארנק הדיגיטלי שלכם'
    }
  ];

  const exceptions = [
    {
      title: 'שימוש משמעותי בתוכן',
      description: 'אם נוצל תוכן פרימיום משמעותי, ההחזר יהיה חלקי או לא יאושר',
      icon: '📚'
    },
    {
      title: 'הפרת תנאי השימוש',
      description: 'הפרה של תנאי השימוש עלולה לגרום לדחיית ההחזר',
      icon: '⚠️'
    },
    {
      title: 'רכישה דרך צד שלישי',
      description: 'רכישות דרך אפליקציות או חנויות אחרות כפופות למדיניותן',
      icon: '🔗'
    },
    {
      title: 'תוכן מותאם אישית',
      description: 'תוכן שנוצר במיוחד עבורכם לא ניתן להחזר',
      icon: '🎨'
    },
    {
      title: 'שירותים שבוצעו',
      description: 'שירותים שכבר בוצעו לא ניתן להחזיר',
      icon: '✅'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <AdManager />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            💰 מדיניות החזרים
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            מידע מפורט על מדיניות ההחזרים שלנו ותהליך קבלת החזר כספי
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
                      אנו מחויבים לספק לכם חוויה מעולה ולכן מציעים מדיניות החזרים הוגנת ושקופה. 
                      מדיניות זו מסבירה מתי ואיך אתם יכולים לקבל החזר כספי על רכישותיכם.
                    </p>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                      <h3 className="text-xl font-bold text-green-800 mb-3">✅ עקרונות המדיניות</h3>
                      <ul className="text-green-700 space-y-2">
                        <li>• החזרים הוגנים ושקופים</li>
                        <li>• תהליך פשוט ומהיר</li>
                        <li>• תמיכה מלאה לכל אורך התהליך</li>
                        <li>• הגנה על זכויות הצרכן</li>
                      </ul>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-blue-800 mb-3">🎯 מטרת המדיניות</h3>
                        <p className="text-blue-700 text-sm">
                          להבטיח שאתם מרוצים מהשירותים שלנו ולספק לכם אפשרות לקבל החזר 
                          במקרים המתאימים.
                        </p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-purple-800 mb-3">⚖️ הוגנות</h3>
                        <p className="text-purple-700 text-sm">
                          המדיניות שלנו מאוזנת בין זכויותיכם כצרכנים לבין הצורך שלנו 
                          לספק שירות איכותי.
                        </p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-yellow-800 mb-3">📋 מה כלול במדיניות</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">כלול:</h4>
                          <ul className="text-gray-700 text-sm space-y-1">
                            <li>• מנויי פרימיום</li>
                            <li>• רכישות בחנות</li>
                            <li>• קורסים דיגיטליים</li>
                            <li>• שירותי תמיכה</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">לא כלול:</h4>
                          <ul className="text-gray-700 text-sm space-y-1">
                            <li>• תוכן מותאם אישית</li>
                            <li>• שירותים שבוצעו</li>
                            <li>• רכישות דרך צד שלישי</li>
                            <li>• הפרת תנאי השימוש</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Eligibility Section */}
              {activeSection === 'eligibility' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">זכאות להחזר</h2>
                  
                  <div className="space-y-6">
                    {refundEligibility.map((category, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-800">{category.category}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            category.refundType === 'מלא' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {category.refundType}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">תנאי זכאות:</h4>
                          <ul className="space-y-2">
                            {category.conditions.map((condition, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-green-500 mr-2 mt-1">✓</span>
                                <span className="text-gray-700">{condition}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-red-800 mb-3">❌ מקרים שאינם זכאים להחזר</h3>
                      <ul className="text-red-700 space-y-2">
                        <li>• שימוש משמעותי בתוכן פרימיום</li>
                        <li>• הפרה של תנאי השימוש</li>
                        <li>• רכישה דרך צד שלישי</li>
                        <li>• תוכן מותאם אישית</li>
                        <li>• שירותים שכבר בוצעו</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Process Section */}
              {activeSection === 'process' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">תהליך החזר</h2>
                  
                  <div className="space-y-6">
                    {refundProcess.map((step, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">{step.icon}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-800">
                              שלב {step.step}: {step.title}
                            </h3>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {step.time}
                            </span>
                          </div>
                          <p className="text-gray-700">{step.description}</p>
                        </div>
                      </div>
                    ))}

                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 mt-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">🚀 איך להתחיל?</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">דרך האתר:</h4>
                          <p className="text-gray-700 text-sm mb-3">
                            מלאו את טופס בקשת ההחזר בדף הפרופיל שלכם
                          </p>
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm">
                            📝 טופס בקשת החזר
                          </button>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">דרך התמיכה:</h4>
                          <p className="text-gray-700 text-sm mb-3">
                            צרו קשר עם צוות התמיכה שלנו
                          </p>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm">
                            💬 צור קשר
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Section */}
              {activeSection === 'timeline' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">זמני החזר</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-blue-800 mb-4">⏱️ זמני עיבוד</h3>
                      <p className="text-blue-700 mb-4">
                        זמני ההחזר משתנים בהתאם לאמצעי התשלום שבו השתמשתם:
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {refundTimelines.map((timeline, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">{timeline.method}</h3>
                          <div className="text-2xl font-bold text-purple-600 mb-2">{timeline.timeline}</div>
                          <p className="text-gray-700 text-sm">{timeline.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-yellow-800 mb-3">⚠️ הערות חשובות</h3>
                      <ul className="text-yellow-700 space-y-2 text-sm">
                        <li>• זמני ההחזר הם ימי עסקים (לא כולל שבתות וחגים)</li>
                        <li>• ייתכנו עיכובים בגלל הבנק או חברת האשראי</li>
                        <li>• נשלח לכם אישור כאשר ההחזר מעובד</li>
                        <li>• אם ההחזר לא הגיע תוך 14 יום, צרו איתנו קשר</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Exceptions Section */}
              {activeSection === 'exceptions' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">חריגים</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-red-800 mb-4">❌ מקרים שאינם זכאים להחזר</h3>
                      <p className="text-red-700 mb-4">
                        במקרים הבאים לא נוכל לאשר החזר כספי:
                      </p>
                    </div>

                    {exceptions.map((exception, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-2xl">{exception.icon}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{exception.title}</h3>
                            <p className="text-gray-700">{exception.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-green-800 mb-3">✅ מה כן ניתן להחזיר</h3>
                      <ul className="text-green-700 space-y-2">
                        <li>• מנוי שלא נוצל</li>
                        <li>• רכישות שלא הורדו</li>
                        <li>• שירותים שלא בוצעו</li>
                        <li>• תוכן שלא נפתח</li>
                        <li>• כפל תשלום</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Section */}
              {activeSection === 'contact' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">צור קשר</h2>
                  
                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">📞 דרכי יצירת קשר</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">דואר אלקטרוני</h4>
                          <p className="text-gray-700 text-sm mb-2">support@learningenglish.com</p>
                          <p className="text-gray-600 text-xs">זמן תגובה: 24-48 שעות</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">צ'אט ישיר</h4>
                          <p className="text-gray-700 text-sm mb-2">זמין 24/7</p>
                          <p className="text-gray-600 text-xs">זמן תגובה: מיידי</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">טלפון</h4>
                          <p className="text-gray-700 text-sm mb-2">1-800-LEARN-EN</p>
                          <p className="text-gray-600 text-xs">ימים א'-ה' 9:00-18:00</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">טופס באתר</h4>
                          <p className="text-gray-700 text-sm mb-2">דף יצירת קשר</p>
                          <p className="text-gray-600 text-xs">זמן תגובה: 24 שעות</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">📝 מידע נדרש לבקשת החזר</h3>
                        <ul className="text-gray-700 space-y-2 text-sm">
                          <li>• מספר הזמנה או חשבונית</li>
                          <li>• תאריך הרכישה</li>
                          <li>• אמצעי התשלום</li>
                          <li>• סיבת בקשת ההחזר</li>
                          <li>• פרטי קשר</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">⚡ תמיכה מהירה</h3>
                        <ul className="text-gray-700 space-y-2 text-sm">
                          <li>• צ'אט ישיר עם נציג</li>
                          <li>• מעקב אחר סטטוס הבקשה</li>
                          <li>• עדכונים באימייל</li>
                          <li>• תמיכה בשפה העברית</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-yellow-800 mb-3">💡 טיפים לבקשה יעילה</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">כתבו בצורה ברורה:</h4>
                          <p className="text-gray-700 text-sm">
                            תארו את הבעיה בצורה מפורטת וברורה
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">צרפו מסמכים:</h4>
                          <p className="text-gray-700 text-sm">
                            חשבוניות, צילומי מסך, הודעות שגיאה
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">היו סבלניים:</h4>
                          <p className="text-gray-700 text-sm">
                            תהליך הבדיקה לוקח זמן
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">שמרו על קשר:</h4>
                          <p className="text-gray-700 text-sm">
                            בדקו את הסטטוס של הבקשה
                          </p>
                        </div>
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
            רוצים לבקש החזר?
          </h3>
          <p className="text-gray-600 mb-6">
            התחילו את תהליך בקשת ההחזר עכשיו
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200">
              📝 בקשת החזר
            </button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              💬 צור קשר
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
