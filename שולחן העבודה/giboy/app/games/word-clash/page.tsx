'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdManager from "@/app/components/ads/AdManager";

export default function WordClashGame() {
  const [gameId, setGameId] = useState('');
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const createGame = async () => {
    setIsCreating(true);
    setError('');
    
    try {
      const response = await fetch('/api/games/word-clash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          playerId: 'player_' + Date.now(),
          playerName: 'Player 1'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setGameId(data.gameId);
        setGameData(data.game);
        router.push(`/game?gameId=${data.gameId}`);
      } else {
        setError(data.error || 'שגיאה ביצירת המשחק');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setIsCreating(false);
    }
  };

  const joinGame = async () => {
    if (!gameId.trim()) {
      setError('אנא הכנס Game ID');
      return;
    }

    setIsJoining(true);
    setError('');
    
    try {
      const response = await fetch('/api/games/word-clash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          gameId: gameId.trim(),
          playerId: 'player_' + Date.now(),
          playerName: 'Player 2'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setGameData(data.game);
        // מעבר ישיר למשחק עם הקוד שכבר הוזן
        router.push(`/game?gameId=${gameId.trim()}&joined=true`);
      } else {
        setError(data.error || 'שגיאה בהצטרפות למשחק');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Top Banner Ad */}
      <AdManager showBanner={true} bannerPosition="top" testMode={false} />
      
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎮 Word Clash
            </h1>
            <p className="text-xl text-gray-600">
              משחק מילים מרובה משתתפים - נחשו את המילה הנכונה!
            </p>
          </div>

          {/* Game Options */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Create Game */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  צרו משחק חדש
                </h2>
                <p className="text-gray-600 mb-6">
                  צרו משחק חדש וחכו לשחקן שני שיצטרף
                </p>
                <button
                  onClick={createGame}
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'יוצר משחק...' : '🚀 צרו משחק חדש'}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">או</span>
                </div>
              </div>

              {/* Join Game */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  הצטרפו למשחק קיים
                </h2>
                <p className="text-gray-600 mb-6">
                  הכנסו את ה-Game ID כדי להצטרף למשחק
                </p>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="הכניסו Game ID..."
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                  />
                  <button
                    onClick={joinGame}
                    disabled={isJoining || !gameId.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:from-green-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isJoining ? 'מצטרף...' : '🎯 הצטרפו למשחק'}
                  </button>
                </div>
              </div>
            </div>

            {/* Back to Games */}
            <div className="mt-8 text-center">
              <Link
                href="/games"
                className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                ← חזרה למשחקים
              </Link>
            </div>
          </div>

          {/* Game Info */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              איך לשחק?
            </h3>
            <ul className="text-blue-800 space-y-2">
              <li>• כל שחקן מקבל הגדרות שונות לאותה מילה</li>
              <li>• נחשו איזו הגדרה נכונה למילה</li>
              <li>• השתמשו בכוחות מיוחדים כדי לעזור לעצמכם</li>
              <li>• השחקן עם הכי הרבה נקודות מנצח!</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Banner Ad */}
      <AdManager showBanner={true} bannerPosition="bottom" testMode={false} />
    </div>
  );
}
