'use client';

import Link from 'next/link';
import { useState } from 'react';

const kidsGames = [
  {
    id: 'classroom-game',
    name: '🎓 משחק כיתה למורים',
    description: 'משחק מיוחד למורים - צור משחק לכיתה שלמה!',
    icon: '🎓',
    color: 'from-purple-500 to-indigo-600',
    href: '/classroom-teacher',
    isSpecial: true
  },
  {
    id: 'letters-match',
    name: 'התאמת אותיות',
    description: 'התאם אות גדולה לאות קטנה!',
    icon: '🔤',
    color: 'from-pink-400 to-pink-600',
    href: '/games/kids/letters-match'
  },
  {
    id: 'sound-words',
    name: 'צליל המילה',
    description: 'שמע את המילה ובחר את התמונה הנכונה!',
    icon: '🔊',
    color: 'from-blue-400 to-blue-600',
    href: '/games/kids/sound-words'
  },
  {
    id: 'easy-vocab',
    name: 'מילים ראשונות',
    description: 'למד מילים פשוטות באנגלית!',
    icon: '📖',
    color: 'from-green-400 to-green-600',
    href: '/games/kids/easy-vocab'
  },
  {
    id: 'counting',
    name: 'ספירה ומספרים',
    description: 'ספור עצמים ולמד מספרים!',
    icon: '🔢',
    color: 'from-purple-400 to-purple-600',
    href: '/games/kids/counting'
  },
  {
    id: 'shapes-colors',
    name: 'צורות וצבעים',
    description: 'זהה צורות וצבעים!',
    icon: '🎨',
    color: 'from-yellow-400 to-orange-500',
    href: '/games/kids/shapes-colors'
  },
  {
    id: 'opposites',
    name: 'ניגודים',
    description: 'למד מילים הפוכות באנגלית!',
    icon: '⚖️',
    color: 'from-red-400 to-purple-500',
    href: '/games/kids/opposites'
  },
  {
    id: 'body-parts',
    name: 'חלקי הגוף',
    description: 'למד את חלקי הגוף באנגלית!',
    icon: '👃',
    color: 'from-orange-400 to-red-500',
    href: '/games/kids/body-parts'
  },
  {
    id: 'animals',
    name: 'בעלי חיים',
    description: 'למד שמות של בעלי חיים!',
    icon: '🐘',
    color: 'from-teal-400 to-green-500',
    href: '/games/kids/animals'
  },
  {
    id: 'actions',
    name: 'פעולות',
    description: 'למד פעלים ופעולות באנגלית!',
    icon: '🏃',
    color: 'from-cyan-400 to-blue-500',
    href: '/games/kids/actions'
  },
  {
    id: 'days-week',
    name: 'ימי השבוע',
    description: 'למד את ימות השבוע באנגלית!',
    icon: '📅',
    color: 'from-indigo-400 to-purple-500',
    href: '/games/kids/days-week'
  },
  {
    id: 'weather',
    name: 'מזג אוויר',
    description: 'למד מילים על מזג האוויר!',
    icon: '☀️',
    color: 'from-sky-400 to-blue-500',
    href: '/games/kids/weather'
  },
  {
    id: 'food-drinks',
    name: 'אוכל ומשקאות',
    description: 'למד שמות של אוכל ומשקאות!',
    icon: '🍕',
    color: 'from-yellow-400 to-red-500',
    href: '/games/kids/food-drinks'
  },
  {
    id: 'home-items',
    name: 'בבית',
    description: 'למד שמות של חפצים בבית!',
    icon: '🏠',
    color: 'from-amber-400 to-rose-500',
    href: '/games/kids/home-items'
  },
  {
    id: 'vehicles',
    name: 'כלי תחבורה',
    description: 'למד שמות של כלי תחבורה!',
    icon: '🚗',
    color: 'from-blue-400 to-teal-500',
    href: '/games/kids/vehicles'
  },
  {
    id: 'numbers-big',
    name: 'מספרים גדולים',
    description: 'למד מספרים גדולים באנגלית!',
    icon: '🔢',
    color: 'from-lime-400 to-emerald-500',
    href: '/games/kids/numbers-big'
  },
  {
    id: 'family',
    name: 'משפחה',
    description: 'למד מילים על המשפחה!',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-pink-400 to-red-500',
    href: '/games/kids/family'
  },
  {
    id: 'emotions',
    name: 'רגשות',
    description: 'למד מילים על רגשות!',
    icon: '😊',
    color: 'from-yellow-400 to-purple-500',
    href: '/games/kids/emotions'
  },
  {
    id: 'clothes',
    name: 'בגדים',
    description: 'למד שמות של בגדים!',
    icon: '👕',
    color: 'from-teal-400 to-blue-500',
    href: '/games/kids/clothes'
  },
  {
    id: 'instruments',
    name: 'כלי נגינה',
    description: 'למד שמות של כלי נגינה!',
    icon: '🎵',
    color: 'from-violet-400 to-fuchsia-500',
    href: '/games/kids/instruments'
  },
  {
    id: 'school',
    name: 'בבית הספר',
    description: 'למד מילים על בית הספר!',
    icon: '🏫',
    color: 'from-indigo-400 to-purple-500',
    href: '/games/kids/school'
  }
];

export default function KidsGamesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGames = kidsGames.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-blue-400 p-4 md:p-8">
      <div className="max-w-6xl w-full mx-auto">
        <div className="flex flex-col items-center justify-center mb-8 md:mb-12">
          <div className="text-6xl md:text-8xl mb-4 animate-bounce">🎈</div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white text-center drop-shadow-lg mb-4">
            משחקים לילדים 🎮
          </h1>
          <p className="text-lg md:text-xl text-white text-center font-bold mb-6">
            משחקים כיפיים ללימוד אנגלית לילדים קטנים! 🌈
          </p>
          
          <Link href="/games">
            <button className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 text-white px-6 md:px-10 py-3 md:py-4 rounded-full text-base md:text-xl font-bold shadow-lg hover:from-purple-500 hover:to-yellow-400 transition-all duration-200 hover:scale-105">
              ← חזרה לכל המשחקים
            </button>
          </Link>
        </div>

        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="חיפוש משחק..."
            className="w-full max-w-md p-4 rounded-full shadow-xl border-4 border-pink-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-300 text-lg text-center transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredGames.map((game) => (
            <Link href={game.href} key={game.id}>
              <div className={`relative group rounded-3xl shadow-2xl p-6 md:p-8 cursor-pointer transition-all duration-300 border-4 hover:scale-105 hover:shadow-3xl ${
                game.isSpecial 
                  ? 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-300 hover:border-purple-400' 
                  : 'bg-white bg-opacity-95 border-white hover:border-pink-300'
              }`}>
                {game.isSpecial && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    מיוחד!
                  </div>
                )}
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 text-6xl md:text-7xl drop-shadow-2xl select-none animate-bounce-slow`}>
                  {game.icon}
                </div>
                <h2 className={`text-xl md:text-2xl font-extrabold mb-3 mt-8 text-center ${
                  game.isSpecial ? 'text-purple-800' : 'text-gray-800'
                }`}>
                  {game.name}
                </h2>
                <p className={`text-base md:text-lg text-center mb-4 leading-relaxed ${
                  game.isSpecial ? 'text-purple-600' : 'text-gray-600'
                }`}>
                  {game.description}
                </p>
                <div className={`h-3 w-3/4 mx-auto rounded-full bg-gradient-to-r ${game.color}`}></div>
                
                {/* כוכבים מעופפים */}
                <div className="absolute top-2 right-2 text-2xl animate-pulse">⭐</div>
                <div className="absolute bottom-2 left-2 text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
                
                {game.isSpecial && (
                  <div className="absolute top-2 left-2 text-2xl animate-pulse">👨‍🏫</div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* סרגל עידוד */}
        <div className="mt-12 text-center bg-white bg-opacity-90 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="text-4xl mb-4">🌟</div>
          <h2 className="text-2xl md:text-3xl font-bold text-purple-600 mb-3">כל הכבוד!</h2>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            המשחקים האלה עוזרים לילדים ללמוד אנגלית בצורה מהנה וקלה!
            <br />
            המשיכו לשחק ולהשתפר! 🚀
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow { 
          0%, 100% { transform: translateY(0) scale(1); } 
          50% { transform: translateY(-15px) scale(1.1); } 
        }
        .animate-bounce-slow { animation: bounce-slow 2s infinite; }
      `}</style>
    </main>
  );
}

