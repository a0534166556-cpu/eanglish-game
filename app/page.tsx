'use client';

// import { useAnalytics } from '@/lib/useAnalytics';
import AdBanner from '@/app/components/common/AdBanner';
import AdManager from '@/app/components/ads/AdManager';
import '@/app/components/ads/ads.css';

export default function Home() {
  // const { trackBehavior } = useAnalytics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Top Banner Ad */}
      <AdManager showBanner={true} bannerPosition="top" testMode={false} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
              🎯 הפלטפורמה המובילה ללימוד אנגלית
            </div>
            
            <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Learning English
              </span>
              <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-gray-700 mt-4">
                ברוכים הבאים
              </span>
            </h1>
            
            <p className="mt-8 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
              למדו אנגלית בדרך הכי כיפית ומהנה! משחקים אינטראקטיביים, רמות מותאמות אישית, 
              וחנות פרסים מיוחדת. התחילו את המסע שלכם עוד היום!
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/games" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                // onClick={() => trackBehavior('click', 'cta-games')}
              >
                🚀 התחילו עכשיו
              </a>
              <a 
                href="/level-select" 
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-bold text-lg rounded-full border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                // onClick={() => trackBehavior('click', 'cta-levels')}
              >
                📚 בחרו רמה
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Banner */}
      <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AdBanner adId="homepage-banner" />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">מה תקבלו כאן?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              כל מה שצריך כדי ללמוד אנגלית בהצלחה, במקום אחד
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Games Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  🎮
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">משחקים אינטראקטיביים</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  מגוון רחב של משחקים מהנים ומאתגרים שיעזרו לכם לשפר את האנגלית שלכם 
                  בדרך הכי כיפית שיש. ממילוי חללים ועד משחקי זיכרון.
                </p>
                <a href="/games" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-2 transition-transform duration-300">
                  התחילו לשחק 
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Levels Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  🏆
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">רמות מותאמות</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  התקדמו דרך רמות שונות המותאמות לרמה שלכם. מהתחלה ועד מתקדמים, 
                  כל שלב בנוי במיוחד כדי להביא אתכם להצלחה.
                </p>
                <a href="/level-select" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 group-hover:translate-x-2 transition-transform duration-300">
                  בחרו רמה
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Shop Card */}
            <div className="group relative md:col-span-2 lg:col-span-1">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  🛒
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">חנות פרסים</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  צברו נקודות במשחקים והשתמשו בהן כדי לרכוש פרסים מיוחדים, 
                  תעודות הישג, ופריטים אקסקלוסיביים שיעזרו לכם להמשיך ללמוד.
                </p>
                <a href="/shop" className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700 group-hover:translate-x-2 transition-transform duration-300">
                  גשו לחנות
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-16">
            <h2 className="text-4xl font-bold mb-4">למה אלפי תלמידים בוחרים בנו?</h2>
            <p className="text-xl opacity-90">התוצאות מדברות בעד עצמן</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">10,000+</div>
              <div className="text-xl text-blue-100">תלמידים פעילים</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">95%</div>
              <div className="text-xl text-blue-100">שיפור ברמה</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-xl text-blue-100">משחקים שונים</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">מוכנים להתחיל את המסע?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            הצטרפו לאלפי תלמידים שכבר משפרים את האנגלית שלהם בדרך הכי כיפית שיש
          </p>
          <a href="/games" className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl">
            🚀 התחילו עכשיו - זה בחינם!
          </a>
        </div>
      </div>

      {/* Bottom Banner Ad */}
      <AdManager showBanner={true} bannerPosition="bottom" testMode={false} />
      
      {/* Rewarded Ad Section */}
      <div className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">🎁 קבלו פרסים בחינם!</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            צפו במודעות קצרות וקבלו 300 יהלומים, מטבעות ונקודות נוספות למשחקים!
          </p>
          <AdManager showRewarded={true} testMode={false} />
        </div>
      </div>
    </div>
  );
}
