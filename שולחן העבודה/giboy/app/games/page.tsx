'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AdBanner from '@/app/components/common/AdBanner';
import { useSubscription } from '@/lib/useSubscription';

const games = [
  {
    id: 'kids-games',
    name: 'משחקים לילדים',
    description: 'משחקים מיוחדים לילדים קטנים - אותיות, צבעים, ספירה ועוד!',
    icon: '🎈',
    color: 'from-pink-400 to-purple-500',
    href: '/games/kids',
  },
  {
    id: 'word-clash',
    name: 'Word Clash: Battle for Meaning',
    description: 'משחק אונליין של זיהוי ושימוש במילים באנגלית בזמן אמת!',
    icon: '⚡',
    color: 'from-purple-500 to-yellow-400',
    href: '/games/word-clash',
    isPremium: true, // משחק בתשלום
  },
  {
    id: 'picture-description-duel',
    name: 'משחק קרב זוגי',
    description: 'תיאור תמונה - שחקן נגד שחקן או נגד בוט חכם',
    icon: '⚔️',
    color: 'from-yellow-400 to-pink-500',
    href: '/games/picture-description-duel',
  },
  {
    id: 'mixed-quiz',
    name: 'חידון מעורב',
    description: 'שאלות מכל הסוגים: הבנה, אוצר מילים, דקדוק, קריאה ועוד! מעשיר את הידע הכללי שלך',
    icon: '🗣️',
    color: 'from-orange-400 to-pink-600',
    isAdvanced: true, // משחק בנפרד למתקדמים ביותר
  },
  {
    id: 'matching-pairs',
    name: 'משחק הזיכרון',
    description: 'התאם בין מילים באנגלית לתרגום או תמונה',
    icon: '🔤',
    color: 'from-pink-400 to-pink-600',
  },
  {
    id: 'fill-blanks',
    name: 'השלמת משפטים',
    description: 'השלם את המילה החסרה במשפט',
    icon: '📝',
    color: 'from-yellow-400 to-yellow-600',
  },
  {
    id: 'sentence-scramble',
    name: 'הזזת מילים',
    description: 'סדר את המילים בסדר הנכון',
    icon: '🔄',
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'multiple-choice',
    name: 'בחירה מרובה',
    description: 'בחר את התשובה הנכונה',
    icon: '📋',
    color: 'from-green-400 to-green-600',
  },
  {
    id: 'true-false',
    name: 'נכון/לא נכון',
    description: 'החלט אם המשפט נכון או לא',
    icon: '✅',
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: 'listening',
    name: 'האזנה והקלטה',
    description: 'האזן וענה על שאלות',
    icon: '🎧',
    color: 'from-indigo-400 to-indigo-600',
  },
  {
    id: 'image-description',
    name: 'תיאור תמונה',
    description: 'תאר את התמונה באנגלית',
    icon: '🖼️',
    color: 'from-teal-400 to-teal-600',
  },
];

const levelLabels: Record<string, { label: string, icon: string, color: string }> = {
  beginner: { label: 'מתחיל', icon: '🌱', color: 'from-green-400 to-green-600' },
  intermediate: { label: 'בינוני', icon: '🌿', color: 'from-yellow-400 to-yellow-600' },
  advanced: { label: 'מתקדם', icon: '🌳', color: 'from-purple-400 to-purple-600' },
  extreme: { label: 'אקסטרים', icon: '🔥', color: 'from-red-500 to-yellow-600' },
};

export default function GamesWrapper() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <Games />
    </Suspense>
  );
}

function Games() {
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();
  const level = searchParams?.get('level') || '';
  const levelObj = levelLabels[level];
  const { isSubscribed, isLoading, isPremium } = useSubscription();
  const [hasPremiumPass, setHasPremiumPass] = useState(false);

  // בדיקת כרטיס פרמיום מפרסומת
  useEffect(() => {
    const checkPremiumPass = () => {
      const premiumPasses = JSON.parse(localStorage.getItem('premium-passes') || '{}');
      setHasPremiumPass((premiumPasses['word-clash'] || 0) > 0);
    };
    
    checkPremiumPass();
    // האזנה לשינויים ב-localStorage
    const handleStorageChange = () => checkPremiumPass();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('premiumPassUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('premiumPassUpdated', handleStorageChange);
    };
  }, []);

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-300 to-blue-700 p-8 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🎮</div>
          <div className="text-xl">טוען משחקים...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-300 to-blue-700 p-4 md:p-8">
      <div className="max-w-6xl w-full mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-10 gap-4">
          <h1 className="text-2xl md:text-4xl font-extrabold text-white text-center md:text-right drop-shadow-lg flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <span>משחקים</span>
            {levelObj && (
              <span className={`inline-flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-bold text-lg md:text-xl shadow bg-gradient-to-r ${levelObj.color} text-white`}>
                <span className="text-xl md:text-2xl">{levelObj.icon}</span> {levelObj.label}
              </span>
            )}
          </h1>
          <Link href="/level-select">
            <button className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-4 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-lg font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200">
              ← חזרה לבחירת רמה
            </button>
          </Link>
        </div>
        <div className="mb-6 md:mb-10 text-center">
          <div className="text-lg md:text-2xl text-white font-bold mb-2">
            🎮 משחקים חינמיים + Word Clash במנוי! 🎮
          </div>
          
          {!levelObj ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg max-w-2xl mx-auto mb-4">
              <div className="flex items-center">
                <div className="text-3xl mr-3">⚠️</div>
                <div>
                  <p className="font-bold text-lg mb-2">נא בחר רמה לפני שתשחק!</p>
                  <p className="text-sm">
                    כדי שהמשחקים יתאימו לרמה שלך, אנא בחר רמה קודם.
                    זה יעזור לך ללמוד בקצב הנכון לך.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm md:text-lg text-white mb-4">
              רמת {levelObj.label} נבחרה - המשחקים מותאמים לרמה שלך!
            </div>
          )}
          
          <Link href="/level-select">
            <button className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-4 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-lg font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200">
              {levelObj ? 'שנה רמה' : 'בחר רמה עכשיו'}
            </button>
          </Link>
        </div>
        <div className="mb-6 md:mb-10 flex justify-center">
          <input
            type="text"
            placeholder="חיפוש משחק..."
            className="w-full max-w-md p-3 md:p-4 rounded-full shadow-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 text-sm md:text-lg text-center transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Ad Banner */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <div className="inline-block bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
              <p className="font-bold">💡 טיפ: מנוי יסיר את כל הפרסומות ויפתח הטבות נוספות!</p>
            </div>
          </div>
          <AdBanner adId="games-page-banner" />
        </div>
        <div className="flex flex-col gap-4 md:gap-8">
          {/* Big cards side by side */}
          <div className="flex flex-col lg:flex-row justify-center items-center gap-4 md:gap-8 mb-4 md:mb-8">
            {filteredGames.filter(g => g.id === 'word-clash' || g.id === 'picture-description-duel' || g.id === 'mixed-quiz').map((game) => {
              // בדיקה אם יש גישה למשחק Word Clash (מנוי או כרטיס מפרסומת)
              const hasAccess = game.id === 'word-clash' 
                ? (isSubscribed || hasPremiumPass)
                : isSubscribed;
              
              return (
              <div key={game.id} className="relative">
                {game.isPremium && !hasAccess ? (
                  <div className="relative group bg-white bg-opacity-90 rounded-2xl shadow-2xl p-4 md:p-6 cursor-pointer transition-all duration-300 border-4 border-purple-500 animate-glow-card z-10 w-full max-w-[300px] md:max-w-[340px] min-h-[200px] md:min-h-[260px] flex flex-col items-center hover:shadow-[0_0_40px_10px_rgba(147,51,234,0.3)]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 select-none text-[4rem] drop-shadow-2xl animate-bounce-slow bg-gradient-to-r from-purple-400 via-pink-400 to-pink-600 bg-clip-text text-transparent">
                      {game.icon}
                    </div>
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ⭐ מנוי
                    </div>
                    {game.isAdvanced && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs md:text-sm font-bold animate-pulse">
                        ⭐ למתקדמים ביותר
                      </div>
                    )}
                    <h2 className="text-center font-extrabold text-lg md:text-2xl mt-8 md:mt-10 text-purple-700">{game.name}</h2>
                    <p className="text-center mb-4 text-sm md:text-base text-pink-700 font-bold">{game.description}</p>
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 mb-2">נדרש מנוי כדי לשחק</p>
                      <Link href="/subscription/purchase" className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300">
                        שדרג למנוי
                      </Link>
                    </div>
                    <div className="h-2 w-2/3 mx-auto rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-pink-600 animate-pulse"></div>
                  </div>
                ) : (
                  <Link href={`${game.href || `/games/${game.id}`}${level ? `?level=${level}` : ''}`}>
                    <div className="relative group bg-white bg-opacity-90 rounded-2xl shadow-2xl p-4 md:p-6 cursor-pointer transition-all duration-300 border-4 border-yellow-500 animate-glow-card z-10 w-full max-w-[300px] md:max-w-[340px] min-h-[200px] md:min-h-[260px] flex flex-col items-center hover:shadow-[0_0_40px_10px_rgba(255,200,0,0.3)]">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 select-none text-[4rem] drop-shadow-2xl animate-bounce-slow bg-gradient-to-r from-yellow-400 via-pink-400 to-pink-600 bg-clip-text text-transparent">
                    {game.icon}
                  </div>
                      {game.isPremium && isSubscribed && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-green-400 to-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          ✅ מנוי
                        </div>
                      )}
                      <h2 className="text-center font-extrabold text-lg md:text-2xl mt-8 md:mt-10 text-yellow-700">{game.name}</h2>
                      {game.isAdvanced && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs md:text-sm font-bold animate-pulse">
                          ⭐ למתקדמים ביותר
                        </div>
                      )}
                      <p className="text-center mb-4 text-sm md:text-base text-pink-700 font-bold">{game.description}</p>
                  <div className="h-2 w-2/3 mx-auto rounded-full bg-gradient-to-r from-yellow-400 via-pink-400 to-pink-600 animate-pulse"></div>
                  <div className="absolute inset-0 pointer-events-none z-0">
                    <svg className="absolute top-0 left-0 w-full h-full animate-confetti" viewBox="0 0 100 100">
                      <circle cx="20" cy="20" r="2" fill="#FFD700" />
                      <circle cx="80" cy="30" r="1.5" fill="#FF69B4" />
                      <circle cx="50" cy="80" r="2.5" fill="#FFB347" />
                      <circle cx="70" cy="60" r="1.8" fill="#FF69B4" />
                      <circle cx="30" cy="70" r="1.2" fill="#FFD700" />
                    </svg>
                  </div>
                    </div>
                  </Link>
                )}
              </div>
            );
            })}
          </div>
          {/* Regular grid for the rest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-10">
            {filteredGames.filter(g => g.id !== 'word-clash' && g.id !== 'picture-description-duel' && g.id !== 'mixed-quiz').map((game) => (
              <Link href={`${game.href || `/games/${game.id}`}${level ? `?level=${level}` : ''}`} key={game.id}>
                <div className={`relative group bg-white bg-opacity-90 rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 cursor-pointer transition-all duration-300 border-2 hover:scale-105 hover:border-blue-400`}>
                  <div className={`absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 text-4xl md:text-6xl drop-shadow-xl select-none bg-gradient-to-r ${game.color} bg-clip-text text-transparent`}>{game.icon}</div>
                  {game.isAdvanced && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse z-10">
                      ⭐ למתקדמים ביותר
                    </div>
                  )}
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 mt-6 md:mt-8 text-center">{game.name}</h2>
                  <p className="text-sm md:text-base text-gray-600 text-center mb-4">{game.description}</p>
                  <div className={`h-2 w-2/3 mx-auto rounded-full bg-gradient-to-r ${game.color}`}></div>
                </div>
              </Link>
            ))}
          </div>

          {/* Learned Words Section */}
          <div className="mt-16 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                📚 המילים שלמדת
              </h2>
              <p className="text-lg text-gray-600">
                צפה בכל המילים והביטויים שלמדת מכל המשחקים
              </p>
            </div>
            
            <div className="flex justify-center">
              <Link href="/learned-words" className="group">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-4">
                  <div className="text-4xl">📚</div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold">מילים נלמדות</h3>
                    <p className="text-blue-100">צפה בהתקדמות הלמידה שלך</p>
                  </div>
                  <div className="text-2xl group-hover:translate-x-2 transition-transform duration-300">→</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style>{`
      @keyframes glow-card { 0%,100%{box-shadow:0 0 30px 10px #ffe066;} 50%{box-shadow:0 0 60px 20px #ffb347;} }
      .animate-glow-card { animation: glow-card 2.5s infinite alternate; }
      @keyframes bounce-slow { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-10px) scale(1.08);} }
      .animate-bounce-slow { animation: bounce-slow 2.2s infinite; }
      @keyframes confetti { 0%,100%{opacity:0.7;} 50%{opacity:1;} }
      .animate-confetti { animation: confetti 2.5s infinite alternate; }
      `}</style>
    </main>
  );
} 