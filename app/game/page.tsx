'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameBoard from '../components/GameBoard';
import useAuthUser from '../../lib/useAuthUser';

const createGame = async (userId: string, userName: string) => {
  const response = await fetch('/api/games/word-clash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      playerId: userId,
      playerName: userName,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'יצירת המשחק נכשלה');
  }

  const data = await response.json();
  return data.gameId as string;
};

const joinGame = async (gameId: string, userId: string, userName: string) => {
  const response = await fetch('/api/games/word-clash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'join',
      gameId,
      playerId: userId,
      playerName: userName,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'הצטרפות למשחק נכשלה');
  }

  const data = await response.json();
  return data.game;
};

function resolveSymbol(game: any, userId: string): 'player1' | 'player2' | null {
  if (!game?.players || !userId) return null;
  if (game.players.player1 === userId) return 'player1';
  if (game.players.player2 === userId) return 'player2';
  return null;
}

function GamePageContent() {
  const { user, loading } = useAuthUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameId, setGameId] = useState<string>('');
  const [joinInput, setJoinInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPlayerSymbol, setCurrentPlayerSymbol] = useState<'player1' | 'player2'>('player1');
  const [ready, setReady] = useState(false);
  const connectingRef = useRef(false);

  const connectedGameIdRef = useRef<string | null>(null);

  useEffect(() => {
    const urlGameId = searchParams?.get('gameId');
    if (urlGameId && urlGameId !== gameId) {
      setGameId(urlGameId);
      setReady(false);
      connectedGameIdRef.current = null;
    }
  }, [searchParams, gameId]);

  useEffect(() => {
    if (!user || !gameId) return;
    if (connectedGameIdRef.current === gameId && ready) return;
    if (connectingRef.current) return;

    const connect = async () => {
      connectingRef.current = true;
      try {
        const response = await fetch(`/api/games/word-clash?gameId=${encodeURIComponent(gameId)}`);
        if (!response.ok) {
          setError('המשחק לא נמצא');
          setReady(false);
          connectedGameIdRef.current = null;
          return;
        }
        const data = await response.json();
        let game = data.game;
        let symbol = resolveSymbol(game, user.id);

        if (!symbol) {
          if (game.status === 'finished') {
            setError('המשחק כבר הסתיים');
            setReady(false);
            return;
          }
          if (game.players?.player2) {
            setError('המשחק מלא');
            setReady(false);
            return;
          }
          game = await joinGame(gameId, user.id, user.name || user.email || 'Player');
          symbol = resolveSymbol(game, user.id);
        }

        if (!symbol) {
          setError('לא ניתן לזהות את השחקן במשחק');
          setReady(false);
          return;
        }

        setCurrentPlayerSymbol(symbol);
        setError(null);
        connectedGameIdRef.current = gameId;
        setReady(true);
      } catch (err) {
        console.error('Error connecting to game:', err);
        setError(err instanceof Error ? err.message : 'שגיאה בחיבור למשחק');
        setReady(false);
        connectedGameIdRef.current = null;
      } finally {
        connectingRef.current = false;
      }
    };

    connect();
  }, [user, gameId, ready]);

  const handleCreateGame = async () => {
    if (!user) {
      setError('יש להתחבר כדי ליצור משחק');
      return;
    }
    try {
      setIsCreating(true);
      setError(null);
      const newGameId = await createGame(user.id, user.name || user.email || 'Player');
      setCurrentPlayerSymbol('player1');
      connectedGameIdRef.current = newGameId;
      setReady(true);
      setGameId(newGameId);
      router.replace(`/game?gameId=${newGameId}&creator=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'יצירת המשחק נכשלה');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!user) {
      setError('יש להתחבר כדי להצטרף למשחק');
      return;
    }
    const id = joinInput.trim();
    if (!id) {
      setError('הכניסו מזהה משחק');
      return;
    }
    try {
      setIsJoining(true);
      setError(null);
      const game = await joinGame(id, user.id, user.name || user.email || 'Player');
      const symbol = resolveSymbol(game, user.id) || 'player2';
      setCurrentPlayerSymbol(symbol);
      connectedGameIdRef.current = id;
      setReady(true);
      setGameId(id);
      router.replace(`/game?gameId=${id}&joined=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'הצטרפות למשחק נכשלה');
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4" dir="rtl">
        טוען...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4" dir="rtl">
        <h1 className="text-2xl font-bold mb-4">יש להתחבר כדי לשחק</h1>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          מעבר להתחברות
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4" dir="rtl">
      <h1 className="text-4xl font-bold mb-2">Word Clash</h1>
      <h2 className="text-xl text-gray-600 mb-8">קרב על המשמעות</h2>

      {error && (
        <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg mb-4 max-w-md text-center">
          {error}
        </div>
      )}

      {!gameId ? (
        <div className="flex flex-col gap-4 w-full max-w-md">
          <button
            onClick={handleCreateGame}
            disabled={isCreating}
            className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-bold"
          >
            {isCreating ? 'יוצרים משחק...' : 'צור משחק חדש'}
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="הכניסו מזהה משחק"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg text-center"
              dir="ltr"
            />
            <button
              onClick={handleJoinGame}
              disabled={isJoining || !joinInput.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isJoining ? 'מצטרף...' : 'הצטרף'}
            </button>
          </div>
        </div>
      ) : !ready ? (
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <p className="text-gray-600">מתחברים למשחק...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-4xl">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <h3 className="text-lg font-bold text-blue-800 mb-2">מזהה משחק</h3>
            <div className="bg-white p-3 rounded border font-mono text-sm break-all" dir="ltr">
              {gameId}
            </div>
            <p className="text-sm text-blue-600 mt-2">שתפו את המזהה או את הקישור עם השחקן השני</p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(gameId);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                העתק מזהה
              </button>
              <button
                onClick={() => {
                  const link = `${window.location.origin}/game?gameId=${gameId}`;
                  navigator.clipboard.writeText(link);
                }}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
              >
                העתק קישור
              </button>
            </div>
          </div>

          <GameBoard
            gameId={gameId}
            currentPlayerId={user.id}
            currentPlayerSymbol={currentPlayerSymbol}
          />
        </div>
      )}
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <GamePageContent />
    </Suspense>
  );
}
