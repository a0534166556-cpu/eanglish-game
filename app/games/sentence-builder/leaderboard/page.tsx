'use client';
import { useState, useEffect } from 'react';

const DIFFICULTIES = [
  { key: 'easy', label: 'קל' },
  { key: 'medium', label: 'בינוני' },
  { key: 'hard', label: 'קשה' },
];

function getAllLeaderboards() {
  return DIFFICULTIES.flatMap(d => {
    const arr = JSON.parse(localStorage.getItem(`sb-leaderboard-${d.key}`) || '[]');
    return arr.map((entry: any) => ({ ...entry, difficulty: d.label, diffKey: d.key }));
  });
}

function getPlayerImg(name: string) {
  // מחזיר תמונה מה-localStorage לפי שם
  return localStorage.getItem('sb-playerImg') || '';
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState<'score' | 'time'>('score');
  const [playerImgs, setPlayerImgs] = useState<Record<string, string>>({});

  useEffect(() => {
    // נטען את כל הנתונים מה-localStorage רק בדפדפן
    if (typeof window !== 'undefined') {
      const allEntries = DIFFICULTIES.flatMap(d => {
        const arr = JSON.parse(localStorage.getItem(`sb-leaderboard-${d.key}`) || '[]');
        return arr.map((entry: any) => ({ ...entry, difficulty: d.label, diffKey: d.key }));
      });
      setEntries(allEntries);
      // נטען תמונות שחקנים (אם יש)
      const imgs: Record<string, string> = {};
      allEntries.forEach(e => {
        const img = localStorage.getItem('sb-playerImg');
        if (img) imgs[e.name] = img;
      });
      setPlayerImgs(imgs);
      window.addEventListener('storage', () => {
        const updatedEntries = DIFFICULTIES.flatMap(d => {
          const arr = JSON.parse(localStorage.getItem(`sb-leaderboard-${d.key}`) || '[]');
          return arr.map((entry: any) => ({ ...entry, difficulty: d.label, diffKey: d.key }));
        });
        setEntries(updatedEntries);
      });
    }
    // eslint-disable-next-line
  }, []);

  const filtered = filter === 'all' ? entries : entries.filter(e => e.diffKey === filter);
  const sorted = [...filtered].sort((a, b) => sort === 'score' ? b.score - a.score : a.time - b.time);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-400 via-green-200 to-blue-700 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 text-center mb-6 drop-shadow-lg">לוח מובילים</h1>
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full font-bold shadow ${filter==='all'?'bg-blue-600 text-white':'bg-white text-blue-700 hover:bg-blue-100'}`}>הכל</button>
          {DIFFICULTIES.map(d => (
            <button key={d.key} onClick={() => setFilter(d.key)} className={`px-4 py-2 rounded-full font-bold shadow ${filter===d.key?'bg-blue-600 text-white':'bg-white text-blue-700 hover:bg-blue-100'}`}>{d.label}</button>
          ))}
        </div>
        <div className="flex gap-4 justify-center mb-4">
          <button onClick={() => setSort('score')} className={`px-3 py-1 rounded font-bold ${sort==='score'?'bg-green-400 text-white':'bg-gray-100 text-green-700'}`}>מיון לפי ניקוד</button>
          <button onClick={() => setSort('time')} className={`px-3 py-1 rounded font-bold ${sort==='time'?'bg-pink-400 text-white':'bg-gray-100 text-pink-700'}`}>מיון לפי מהירות</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-blue-100">
                <th className="rounded-l-xl">#</th>
                <th>תמונה</th>
                <th>שם</th>
                <th>ניקוד</th>
                <th>זמן (ש׳)</th>
                <th>רמה</th>
                <th className="rounded-r-xl">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={7} className="text-gray-400 py-6">אין תוצאות עדיין</td></tr>
              )}
              {sorted.map((entry, idx) => (
                <tr key={idx} className="bg-blue-50 hover:bg-blue-200 transition-all">
                  <td className="font-bold text-blue-700">{idx+1}</td>
                  <td>
                    {playerImgs[entry.name] ? (
                      <img src={playerImgs[entry.name]} alt="avatar" className="w-8 h-8 rounded-full mx-auto" />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </td>
                  <td>{entry.name}</td>
                  <td className="font-bold text-green-700">{entry.score}</td>
                  <td>{entry.time}</td>
                  <td>{entry.difficulty}</td>
                  <td>{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-8">
          <a href="/games/sentence-builder" className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200">חזרה למשחק</a>
        </div>
      </div>
    </main>
  );
} 