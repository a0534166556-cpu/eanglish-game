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

function GameBoardWrapper({ gameId, user }: { gameId: string; user: any }) {
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/games/word-clash?gameId=${gameId}`);
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setGame(data.game);
            setError(null);
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Failed to load game' }));
          if (isMounted) {
            setError(errorData.error || 'שגיאה בטעינת המשחק');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error fetching game:', err);
        if (isMounted) {
          setError('שגיאה בחיבור לשרת');
          setLoading(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchGame();
    const interval = setInterval(fetchGame, 2000); // עדכון כל 2 שניות
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [gameId]);

  if (loading && !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-xl text-gray-600">טוען משחק...</p>
      </div>
    );
  }

  if (error && !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <h3 className="text-lg font-bold mb-2">שגיאה בטעינת המשחק</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/games/word-clash'}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            חזרה לדף המשחק
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg max-w-md text-center">
          <h3 className="text-lg font-bold mb-2">המשחק לא נמצא</h3>
          <p className="mb-4">המשחק עם ה-ID הזה לא קיים או נמחק.</p>
          <button
            onClick={() => window.location.href = '/games/word-clash'}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            חזרה לדף המשחק
          </button>
        </div>
      </div>
    );
  }

  // זיהוי השחקן לפי ה-ID שלו במשחק
  let currentPlayerSymbol: 'player1' | 'player2' = 'player1';
  if (game.players.player1 === user.id) {
    currentPlayerSymbol = 'player1';
  } else if (game.players.player2 === user.id) {
    currentPlayerSymbol = 'player2';
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl">
      {/* Game ID Display */}
      <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
        <h3 className="text-lg font-bold text-blue-800 mb-2">Game ID</h3>
        <div className="bg-white p-3 rounded border font-mono text-lg break-all">
          {gameId}
        </div>
        <p className="text-sm text-blue-600 mt-2">
          {game.status === 'waiting' ? 'שתף את ה-ID הזה עם השחקן השני' : 'המשחק פעיל!'}
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
        currentPlayerSymbol={currentPlayerSymbol}
      />
    </div>
  );
}

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
    
    if (urlGameId && user) {
      setGameId(urlGameId);
      // אם המשתמש הצטרף למשחק, ננסה להתחבר אוטומטית
      if (joined === 'true') {
        handleAutoJoin(urlGameId);
      }
      // לא נכנסים אוטומטית - המשתמש צריך להצטרף ידנית
    }
  }, [searchParams, user]);

  const handleAutoJoin = async (gameIdToJoin: string) => {
    if (!user) {
      console.log('No user, cannot auto-join');
      return;
    }
    
    try {
      console.log('Auto joining game:', gameIdToJoin, 'for user:', user.id, user.name);
      const response = await fetch('/api/games/word-clash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          gameId: gameIdToJoin,
          playerId: user.id,
          playerName: user.name || user.email || 'Player'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to join game:', response.status, errorData);
        // אם המשחק כבר מלא או שהמשתמש כבר במשחק, זה בסדר
        if (errorData.error?.includes('full') || errorData.error?.includes('already')) {
          console.log('Game is full or user already in game, continuing...');
          setError(null);
        } else {
          setError(errorData.error || 'Failed to join game');
        }
        return;
      }
      
      const data = await response.json();
      console.log('Successfully auto-joined game:', data);
      setError(null);
    } catch (err) {
      console.error('Error auto-joining game:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to join game';
      setError(errorMessage);
    }
  };

  const handleAutoJoinAsCreator = async (gameIdToJoin: string) => {
    if (!user) {
      console.log('No user, cannot check/join as creator');
      return;
    }
    
    try {
      // בדוק אם המשחק קיים ואם המשתמש הוא player1
      const response = await fetch(`/api/games/word-clash?gameId=${gameIdToJoin}`);
      if (response.ok) {
        const data = await response.json();
        const game = data.game;
        
        console.log('Game data:', game);
        console.log('User ID:', user.id);
        console.log('Player1:', game.players.player1);
        console.log('Player2:', game.players.player2);
        
        // אם המשתמש הוא player1, הוא כבר במשחק - אין צורך להצטרף שוב
        if (game.players.player1 === user.id) {
          console.log('User is already player1 in this game, no need to join');
          setError(null);
          return;
        }
        
        // אם המשתמש הוא player2, הוא כבר במשחק - אין צורך להצטרף שוב
        if (game.players.player2 === user.id) {
          console.log('User is already player2 in this game, no need to join');
          setError(null);
          return;
        }
        
        // אם המשחק עדיין מחכה לשחקן שני והמשתמש לא במשחק, נצטרף
        if (game.status === 'waiting' && !game.players.player2) {
          console.log('Game is waiting for player2, joining as player2');
          const joinResponse = await fetch('/api/games/word-clash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'join',
              gameId: gameIdToJoin,
              playerId: user.id,
              playerName: user.name || user.email || 'Player'
            })
          });
          
          if (!joinResponse.ok) {
            const errorData = await joinResponse.json();
            console.error('Failed to join game as creator:', joinResponse.status, errorData);
            setError(errorData.error || 'Failed to join game');
          } else {
            console.log('Successfully joined game as creator');
            setError(null);
          }
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to get game:', response.status, errorData);
        setError(errorData.error || 'Failed to load game');
      }
    } catch (err) {
      console.error('Error checking/joining game as creator:', err);
      setError(err instanceof Error ? err.message : 'Failed to check game');
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
      // Automatically join the game as creator
      try {
        await joinGame(newGameId, user.id, user.name);
        console.log('Creator automatically joined the game');
      } catch (err) {
        console.error('Error auto-joining as creator:', err);
      }
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
        <GameBoardWrapper gameId={gameId} user={user} />
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