'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useAuthUser from '@/lib/useAuthUser';

interface LeaderboardEntry {
  place: number;
  id: string;
  name: string;
  profileImage: string | null;
  selectedTag: string | null;
  level: number;
  rank: { id: string; name: string; icon: string; color: string };
  rankProgress: number;
  points: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  achievementsCompleted: number;
}

type SortMode = 'level' | 'points' | 'rank';

const MEDALS = ['🥇', '🥈', '🥉'];

const RANK_ORDER = [
  'myth',
  'legend',
  'champion',
  'grandmaster',
  'master',
  'expert',
  'skilled',
  'student',
  'learner',
  'beginner',
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('level');
  const { user } = useAuthUser();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard?limit=100');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'שגיאה בטעינה');
        setEntries(data.leaderboard || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת הדירוג');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const sorted = [...entries]
    .sort((a, b) => {
      if (sortMode === 'level') {
        if (b.level !== a.level) return b.level - a.level;
        if (b.points !== a.points) return b.points - a.points;
        return b.gamesWon - a.gamesWon;
      }
      if (sortMode === 'points') {
        if (b.points !== a.points) return b.points - a.points;
        return b.level - a.level;
      }
      const diff = RANK_ORDER.indexOf(a.rank.id) - RANK_ORDER.indexOf(b.rank.id);
      if (diff !== 0) return diff;
      return b.level - a.level;
    })
    .map((entry, idx) => ({ ...entry, place: idx + 1 }));

  const currentUserEntry = user?.id ? sorted.find((e) => e.id === user.id) : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-cyan-100 py-8 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-3">
            🏆 לוח דירוג שחקנים
          </h1>
          <p className="text-lg text-gray-600">
            דירוג לפי רמה, דרגה וסטטיסטיקות — מי ברמה הגבוהה ביותר?
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {(
            [
              { key: 'level' as SortMode, label: 'לפי רמה' },
              { key: 'points' as SortMode, label: 'לפי נקודות' },
              { key: 'rank' as SortMode, label: 'לפי דרגה' },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortMode(key)}
              className={`px-5 py-2 rounded-full font-bold shadow transition-all ${
                sortMode === key
                  ? 'bg-indigo-600 text-white scale-105'
                  : 'bg-white text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {currentUserEntry && (
          <div className="mb-6 bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-400 rounded-xl p-4 text-center">
            <span className="font-bold text-amber-900">
              המיקום שלך: מקום #{currentUserEntry.place} | רמה {currentUserEntry.level} |{' '}
              {currentUserEntry.rank.icon} {currentUserEntry.rank.name}
            </span>
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-xl text-indigo-600 font-semibold animate-pulse">
            טוען דירוג...
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-center mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <th className="py-4 px-3 font-bold">מקום</th>
                    <th className="py-4 px-3 font-bold">שחקן</th>
                    <th className="py-4 px-3 font-bold">רמה</th>
                    <th className="py-4 px-3 font-bold">דרגה</th>
                    <th className="py-4 px-3 font-bold">נקודות</th>
                    <th className="py-4 px-3 font-bold">משחקים</th>
                    <th className="py-4 px-3 font-bold">ניצחונות</th>
                    <th className="py-4 px-3 font-bold">% ניצחון</th>
                    <th className="py-4 px-3 font-bold">הישגים</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-gray-400">
                        אין שחקנים בדירוג עדיין
                      </td>
                    </tr>
                  )}
                  {sorted.map((entry) => {
                    const isCurrentUser = user?.id === entry.id;
                    const placeDisplay =
                      entry.place <= 3 ? MEDALS[entry.place - 1] : entry.place;

                    return (
                      <tr
                        key={entry.id}
                        className={`border-b border-gray-100 transition-colors ${
                          isCurrentUser
                            ? 'bg-amber-50 ring-2 ring-amber-300 ring-inset'
                            : entry.place <= 3
                              ? 'bg-indigo-50/50'
                              : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-2 font-extrabold text-lg text-indigo-700">
                          {placeDisplay}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-center gap-2">
                            {entry.profileImage ? (
                              <img
                                src={entry.profileImage}
                                alt=""
                                className="w-9 h-9 rounded-full object-cover border-2 border-indigo-200"
                              />
                            ) : (
                              <span className="text-2xl">👤</span>
                            )}
                            <span
                              className={`font-semibold ${isCurrentUser ? 'text-amber-800' : 'text-gray-800'}`}
                            >
                              {entry.name}
                              {isCurrentUser && ' (את/ה)'}
                            </span>
                            {entry.selectedTag && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                {entry.selectedTag}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full">
                            ⭐ {entry.level}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex items-center gap-1 bg-gradient-to-r ${entry.rank.color} text-white font-bold px-3 py-1 rounded-full text-sm`}
                          >
                            {entry.rank.icon} {entry.rank.name}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-bold text-green-700">
                          {entry.points.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-gray-700">{entry.gamesPlayed}</td>
                        <td className="py-3 px-2 text-gray-700">{entry.gamesWon}</td>
                        <td className="py-3 px-2 text-gray-700">{entry.winRate}%</td>
                        <td className="py-3 px-2 text-purple-700 font-semibold">
                          🏅 {entry.achievementsCompleted}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link
            href="/games"
            className="bg-white text-indigo-700 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-50 transition-all"
          >
            ← חזרה למשחקים
          </Link>
          <Link
            href="/games/word-clash"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            🎮 Word Clash
          </Link>
        </div>
      </div>
    </main>
  );
}
