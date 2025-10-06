'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import { createGame, joinGame } from '../../lib/game';
import GameBoard from '../components/GameBoard';
import useAuthUser from '../../lib/useAuthUser';

const createGame = async (userId: string, userName: string) => {
  const response = await fetch('/api/games/word-clash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      playerId: userId,
      playerName: userName
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create game');
  }
  
  const data = await response.json();
  return data.gameId;
};

const joinGame = async (gameId: string, userId: string, userName: string) => {
  const response = await fetch('/api/games/word-clash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'join',
      gameId: gameId,
      playerId: userId,
      playerName: userName
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to join game');
  }
  
  return true;
};

function GamePageContent() {
  const { user, loading } = useAuthUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameId, setGameId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // בדיקה אם המשתמש הגיע עם gameId מה-URL
  useEffect(() => {
    const urlGameId = searchParams?.get('gameId');
    const joined = searchParams?.get('joined');
    
    if (urlGameId) {
      setGameId(urlGameId);
      // אם המשתמש הצטרף למשחק, ננסה להתחבר אוטומטית
      if (joined === 'true' && user) {
        handleAutoJoin(urlGameId);
      }
    }
  }, [searchParams, user]);

  const handleAutoJoin = async (gameIdToJoin: string) => {
    if (!user) return;
    
    try {
      console.log('Auto joining game:', gameIdToJoin, 'for user:', user.id, user.name);
      await joinGame(gameIdToJoin, user.id, user.name);
      console.log('Successfully auto-joined game');
      setError(null);
    } catch (err) {
      console.error('Error auto-joining game:', err);
      setError(err instanceof Error ? err.message : 'Failed to join game');
    }
  };

  const handleCreateGame = async () => {
    if (!user) {
      setError('You must be logged in to create a game');
      return;
    }
    try {
      console.log('Creating game for user:', user.id, user.name);
      setIsCreating(true);
      const newGameId = await createGame(user.id, user.name);
      console.log('Created game with ID:', newGameId);
      setGameId(newGameId);
      setError(null);
    } catch (err) {
      console.error('Error creating game:', err);
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!user) {
      setError('You must be logged in to join a game');
      return;
    }
    if (!gameId) {
      setError('Please enter a game ID');
      return;
    }
    try {
      console.log('Joining game:', gameId, 'for user:', user.id, user.name);
      await joinGame(gameId, user.id, user.name);
      console.log('Successfully joined game');
      setError(null);
      // Force refresh the page to show the game
      window.location.reload();
    } catch (err) {
      console.error('Error joining game:', err);
      setError(err instanceof Error ? err.message : 'Failed to join game');
    }
  };

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-screen p-4">טוען...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-2">Word Clash</h1>
      <h2 className="text-xl text-gray-600 mb-8">Battle for Meaning</h2>

      {error && (
        <div className="text-red-500 bg-red-100 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {!gameId ? (
        <div className="flex flex-col gap-4 w-full max-w-md">
          <button
            onClick={handleCreateGame}
            disabled={isCreating}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {isCreating ? 'Creating Game...' : 'Create New Game'}
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Game ID"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="flex-1 px-4 py-2 border rounded"
            />
            <button
              onClick={handleJoinGame}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Join Game
            </button>
          </div>
        </div>
      ) : gameId === "1" ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <div className="text-red-500 bg-red-100 p-4 rounded-lg text-center">
            <h3 className="text-lg font-bold mb-2">שגיאה!</h3>
            <p>Game ID "1" לא קיים. אנא צור משחק חדש או הכנס Game ID אמיתי.</p>
          </div>
          <button
            onClick={() => setGameId('')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            חזור לתפריט
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-4xl">
          {/* Game ID Display */}
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
            <h3 className="text-lg font-bold text-blue-800 mb-2">Game ID</h3>
            <div className="bg-white p-3 rounded border font-mono text-lg break-all">
              {gameId}
            </div>
            <p className="text-sm text-blue-600 mt-2">
              שתף את ה-ID הזה עם השחקן השני
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(gameId);
                alert('Game ID הועתק!');
              }}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              העתק Game ID
            </button>
          </div>
          
          <GameBoard
            gameId={gameId}
            currentPlayerId={user.id}
            currentPlayerSymbol="player1"
          />
        </div>
      )}
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <GamePageContent />
    </Suspense>
  );
} 