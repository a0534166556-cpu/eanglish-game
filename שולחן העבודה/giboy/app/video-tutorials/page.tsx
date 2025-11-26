'use client';

import { useState } from 'react';
import AdManager from '@/app/components/ads/AdManager';

export default function VideoTutorials() {
  const [selectedCategory, setSelectedCategory] = useState('getting-started');

  const categories = [
    {
      id: 'getting-started',
      title: 'התחלת עבודה',
      icon: '🚀',
      color: 'blue'
    },
    {
      id: 'games',
      title: 'משחקים',
      icon: '🎮',
      color: 'green'
    },
    {
      id: 'profile',
      title: 'פרופיל והישגים',
      icon: '👤',
      color: 'purple'
    },
    {
      id: 'subscription',
      title: 'מנוי וחנות',
      icon: '💳',
      color: 'orange'
    },
    {
      id: 'advanced',
      title: 'תכונות מתקדמות',
      icon: '⚡',
      color: 'red'
    }
  ];

  const tutorials = {
    'getting-started': [
      {
        id: 1,
        title: 'איך להתחיל להשתמש בפלטפורמה',
        duration: '5:30',
        description: 'מדריך מקיף להתחלת העבודה עם הפלטפורמה',
        thumbnail: '🎬',
        level: 'מתחיל'
      },
      {
        id: 2,
        title: 'הרשמה והתחברות',
        duration: '3:15',
        description: 'איך ליצור חשבון ולהתחבר',
        thumbnail: '📝',
        level: 'מתחיל'
      },
      {
        id: 3,
        title: 'בחירת רמת לימוד',
        duration: '4:20',
        description: 'איך לבחור את הרמה המתאימה לכם',
        thumbnail: '📊',
        level: 'מתחיל'
      }
    ],
    'games': [
      {
        id: 4,
        title: 'משחק בחירה מרובה',
        duration: '6:45',
        description: 'איך לשחק במשחק הבחירה המרובה',
        thumbnail: '🎯',
        level: 'בינוני'
      },
      {
        id: 5,
        title: 'משחק נכון/לא נכון',
        duration: '4:10',
        description: 'טיפים למשחק נכון/לא נכון',
        thumbnail: '✅',
        level: 'בינוני'
      },
      {
        id: 6,
        title: 'השלמת משפטים',
        duration: '5:55',
        description: 'אסטרטגיות להשלמת משפטים',
        thumbnail: '📝',
        level: 'מתקדם'
      },
      {
        id: 7,
        title: 'סידור משפטים',
        duration: '7:20',
        description: 'איך לסדר משפטים בצורה נכונה',
        thumbnail: '🔀',
        level: 'מתקדם'
      }
    ],
    'profile': [
      {
        id: 8,
        title: 'הכרת דף הפרופיל',
        duration: '4:30',
        description: 'סיור בדף הפרופיל והתכונות',
        thumbnail: '👤',
        level: 'מתחיל'
      },
      {
        id: 9,
        title: 'מערכת ההישגים',
        duration: '6:15',
        description: 'איך לצבור הישגים ולהתקדם',
        thumbnail: '🏆',
        level: 'בינוני'
      },
      {
        id: 10,
        title: 'סטטיסטיקות מפורטות',
        duration: '5:40',
        description: 'הבנת הסטטיסטיקות והנתונים',
        thumbnail: '📈',
        level: 'מתקדם'
      }
    ],
    'subscription': [
      {
        id: 11,
        title: 'רכישת מנוי פרימיום',
        duration: '3:45',
        description: 'איך לרכוש מנוי פרימיום',
        thumbnail: '💳',
        level: 'מתחיל'
      },
      {
        id: 12,
        title: 'שימוש בחנות',
        duration: '4:50',
        description: 'איך להשתמש בחנות ולרכוש פריטים',
        thumbnail: '🛒',
        level: 'בינוני'
      },
      {
        id: 13,
        title: 'ניהול תשלומים',
        duration: '5:25',
        description: 'ניהול אמצעי תשלום וחשבונות',
        thumbnail: '💰',
        level: 'מתקדם'
      }
    ],
    'advanced': [
      {
        id: 14,
        title: 'משחקים מרובי משתתפים',
        duration: '8:30',
        description: 'איך לשחק עם חברים',
        thumbnail: '👥',
        level: 'מתקדם'
      },
      {
        id: 15,
        title: 'טיפים למתקדמים',
        duration: '10:15',
        description: 'טיפים וטריקים למשתמשים מתקדמים',
        thumbnail: '⚡',
        level: 'מתקדם'
      },
      {
        id: 16,
        title: 'התאמה אישית',
        duration: '6:40',
        description: 'איך להתאים את הפלטפורמה לצרכים שלכם',
        thumbnail: '⚙️',
        level: 'מתקדם'
      }
    ]
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'מתחיל': 'bg-green-100 text-green-800',
      'בינוני': 'bg-yellow-100 text-yellow-800',
      'מתקדם': 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || colors['מתחיל'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <AdManager />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎥 מדריכי וידאו
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            למדו איך להשתמש בפלטפורמה באמצעות מדריכי וידאו מפורטים
          </p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">קטגוריות</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedCategory === category.id
                    ? getColorClasses(category.color)
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-semibold">{category.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tutorials Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {categories.find(c => c.id === selectedCategory)?.title}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials[selectedCategory as keyof typeof tutorials]?.map((tutorial) => (
              <div key={tutorial.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
                {/* Thumbnail */}
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-48 flex items-center justify-center">
                  <div className="text-6xl">{tutorial.thumbnail}</div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(tutorial.level)}`}>
                      {tutorial.level}
                    </span>
                    <span className="text-sm text-gray-500">{tutorial.duration}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {tutorial.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tutorial.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center">
                      <span className="mr-2">▶️</span>
                      צפה עכשיו
                    </button>
                    <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                      <span className="text-lg">🔖</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            🚀 מדריכים חדשים בדרך!
          </h3>
          <p className="text-gray-600 mb-6">
            אנו עובדים על מדריכי וידאו נוספים שיעזרו לכם ללמוד אנגלית בצורה הטובה ביותר.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
              📱 אפליקציה למובייל
            </span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
              🎧 משחקי האזנה
            </span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
              💬 צ'אט עם מורים
            </span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
              📚 קורסים מותאמים
            </span>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            יש לכם רעיונות למדריכים?
          </h3>
          <p className="text-gray-600 mb-6">
            נשמח לשמוע מכם איזה מדריכי וידאו נוספים הייתם רוצים לראות!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              📧 שלחו לנו רעיון
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200">
              💬 צ'אט עם התמיכה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
