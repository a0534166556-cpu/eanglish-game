'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'הכל', icon: '📚' },
    { id: 'grammar', name: 'דקדוק', icon: '📝' },
    { id: 'vocabulary', name: 'אוצר מילים', icon: '📖' },
    { id: 'pronunciation', name: 'הגייה', icon: '🗣️' },
    { id: 'tips', name: 'טיפים', icon: '💡' },
    { id: 'culture', name: 'תרבות', icon: '🌍' }
  ];

  const articles = [
    {
      id: 1,
      title: '10 הטיפים הטובים ביותר ללימוד אנגלית',
      excerpt: 'גלה את הסודות של לומדי אנגלית מצליחים ואיך תוכל להצטרף אליהם.',
      category: 'tips',
      readTime: '5 דקות',
      difficulty: 'מתחיל',
      image: '💡',
      publishedAt: '2024-01-15',
      featured: true
    },
    {
      id: 2,
      title: 'כללי הדקדוק הבסיסיים שאתה חייב לדעת',
      excerpt: 'מדריך מקיף לכללי הדקדוק החשובים ביותר באנגלית עם דוגמאות מעשיות.',
      category: 'grammar',
      readTime: '8 דקות',
      difficulty: 'מתחיל',
      image: '📝',
      publishedAt: '2024-01-12'
    },
    {
      id: 3,
      title: 'איך לבנות אוצר מילים חזק באנגלית',
      excerpt: 'טכניקות מוכחות להרחבת אוצר המילים שלך ולזכירה לטווח הארוך.',
      category: 'vocabulary',
      readTime: '6 דקות',
      difficulty: 'בינוני',
      image: '📖',
      publishedAt: '2024-01-10'
    },
    {
      id: 4,
      title: 'הגייה נכונה - המדריך המלא',
      excerpt: 'למד להגות נכון את הצלילים הקשים ביותר באנגלית עם תרגילים מעשיים.',
      category: 'pronunciation',
      readTime: '7 דקות',
      difficulty: 'בינוני',
      image: '🗣️',
      publishedAt: '2024-01-08'
    },
    {
      id: 5,
      title: 'הבדלים בין אנגלית בריטית לאמריקאית',
      excerpt: 'גלה את ההבדלים העיקריים בין השפה הבריטית לאמריקאית.',
      category: 'culture',
      readTime: '4 דקות',
      difficulty: 'מתקדם',
      image: '🌍',
      publishedAt: '2024-01-05'
    },
    {
      id: 6,
      title: 'איך להתגבר על פחד לדבר אנגלית',
      excerpt: 'טכניקות פסיכולוגיות שיעזרו לך להתחיל לדבר אנגלית בביטחון.',
      category: 'tips',
      readTime: '5 דקות',
      difficulty: 'מתחיל',
      image: '💪',
      publishedAt: '2024-01-03'
    },
    {
      id: 7,
      title: 'זמנים באנגלית - המדריך המקוצר',
      excerpt: 'כל הזמנים החשובים באנגלית במקום אחד עם דוגמאות ברורות.',
      category: 'grammar',
      readTime: '10 דקות',
      difficulty: 'בינוני',
      image: '⏰',
      publishedAt: '2024-01-01'
    },
    {
      id: 8,
      title: 'איך לקרוא ספרים באנגלית בלי לעצור כל רגע',
      excerpt: 'אסטרטגיות לקריאה שוטפת באנגלית שתהפוך את הקריאה לחוויה מהנה.',
      category: 'tips',
      readTime: '6 דקות',
      difficulty: 'מתקדם',
      image: '📚',
      publishedAt: '2023-12-28'
    }
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const featuredArticle = articles.find(article => article.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            מאמרים חינוכיים
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            למדו אנגלית דרך מאמרים מקצועיים, טיפים מעשיים ומדריכים מפורטים 
            שיעזרו לכם לשפר את האנגלית שלכם.
          </p>
        </div>

        {/* Featured Article */}
        {featuredArticle && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">מאמר מומלץ</h2>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">{featuredArticle.image}</span>
                <div>
                  <div className="flex items-center space-x-4 text-sm opacity-90">
                    <span>{featuredArticle.readTime}</span>
                    <span>•</span>
                    <span>{featuredArticle.difficulty}</span>
                    <span>•</span>
                    <span>{new Date(featuredArticle.publishedAt).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-4">{featuredArticle.title}</h3>
              <p className="text-xl opacity-90 mb-6">{featuredArticle.excerpt}</p>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                קראו עכשיו
              </button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{article.image}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{article.readTime}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      article.difficulty === 'מתחיל' ? 'bg-green-100 text-green-800' :
                      article.difficulty === 'בינוני' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {article.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                {article.title}
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {article.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {new Date(article.publishedAt).toLocaleDateString('he-IL')}
                </span>
                <button className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                  קראו עוד →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Articles Message */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">לא נמצאו מאמרים</h3>
            <p className="text-gray-600 mb-6">נסו לבחור קטגוריה אחרת או לחזור מאוחר יותר.</p>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              הצג את כל המאמרים
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">מוכנים להתחיל ללמוד?</h2>
          <p className="text-xl mb-6 opacity-90">
            הצטרפו לאלפי תלמידים שכבר משפרים את האנגלית שלהם דרך המשחקים שלנו!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/games" 
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              🎮 התחילו לשחק
            </Link>
            <Link 
              href="/level-select" 
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-green-600 transition-colors"
            >
              📚 בחרו רמה
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


