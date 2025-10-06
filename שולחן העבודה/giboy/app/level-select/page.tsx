'use client';

import { useState } from 'react';
import Link from 'next/link';

const levels = [
  { id: 'beginner', name: 'מתחיל', description: 'לומדים את הבסיס', icon: '🌱', color: 'from-green-400 to-green-600' },
  { id: 'intermediate', name: 'בינוני', description: 'משפרים את היכולות', icon: '🌿', color: 'from-yellow-400 to-yellow-600' },
  { id: 'advanced', name: 'מתקדם', description: 'מאתגרים את עצמך', icon: '🌳', color: 'from-purple-400 to-purple-600' },
  { id: 'extreme', name: 'אקסטרים', description: 'לוחמים אמיתיים באנגלית!', icon: '🔥', color: 'from-red-500 to-yellow-600' },
];

export default function LevelSelect() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* רקע דינמי */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full blur-3xl opacity-40 animate-pulse-slow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tr from-green-400 via-blue-300 to-blue-700 rounded-full blur-3xl opacity-40 animate-pulse-slow" />
      </div>
      <div className="max-w-5xl w-full mx-auto z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-12 drop-shadow-xl tracking-tight animate-fade-in">
          בחר את הרמה שלך
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`relative group bg-white bg-opacity-90 rounded-3xl shadow-2xl p-12 cursor-pointer transition-all duration-300 border-4
                ${selectedLevel === level.id ? 'border-yellow-400 scale-105 shadow-yellow-300/60' : 'border-transparent'}
                hover:scale-105 hover:border-blue-400 hover:shadow-blue-200/60 animate-fade-in`}
              onClick={() => setSelectedLevel(level.id)}
              style={{ minHeight: '200px', minWidth: '0', maxWidth: '340px', margin: '0 auto' }}
            >
              <div className={`absolute -top-12 left-1/2 -translate-x-1/2 text-6xl drop-shadow-2xl select-none transition-all duration-300
                ${selectedLevel === level.id ? 'scale-125' : ''}`}>{level.icon}</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 mt-10 text-center tracking-tight">{level.name}</h2>
              <p className="text-gray-600 text-center mb-6 text-lg font-medium">{level.description}</p>
              <div className={`h-2 w-2/3 mx-auto rounded-full bg-gradient-to-r ${level.color} mb-2`}></div>
              {selectedLevel === level.id && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-bounce">נבחר!</div>
              )}
            </div>
          ))}
        </div>
        {selectedLevel && (
          <div className="mt-16 text-center animate-fade-in">
            <Link href={`/games?level=${selectedLevel}`}>
              <button className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-16 py-5 rounded-full text-3xl font-extrabold shadow-2xl hover:from-blue-500 hover:to-green-400 hover:scale-105 transition-all duration-200 tracking-tight ring-4 ring-yellow-300/40 animate-glow">
                המשך לבחירת משחק
              </button>
            </Link>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse-slow { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        .animate-pulse-slow { animation: pulse-slow 6s infinite; }
        @keyframes fade-in { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
        @keyframes glow { 0%,100%{box-shadow:0 0 32px 8px #ffe06644;} 50%{box-shadow:0 0 48px 16px #ffe06699;} }
        .animate-glow { animation: glow 2.5s infinite; }
      `}</style>
    </main>
  );
} 