"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthUser from "@/lib/useAuthUser";
import { io, Socket } from "socket.io-client";

type GameState = {
  status: 'waiting' | 'playing' | 'finished';
  currentQuestion: number;
  questions: any[];
  player1: {
    name: string;
    score: number;
    ready: boolean;
  };
  player2: {
    name: string;
    score: number;
    ready: boolean;
  };
  currentPlayer: 1 | 2;
  timer: number;
};

type Message = {
  sender: string;
  text: string;
  timestamp: Date;
};

export default function MultiplayerGame() {
  const { user, loading } = useAuthUser();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    status: 'waiting',
    currentQuestion: 0,
    questions: [],
    player1: { name: '', score: 0, ready: false },
    player2: { name: '', score: 0, ready: false },
    currentPlayer: 1,
    timer: 30
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/');
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      if (user) {
        newSocket.emit('join-game', {
          userId: user.id,
          username: user.name
        });
      }
    });

    newSocket.on('game-state', (state: GameState) => {
      setGameState(state);
      
      // אם המשחק התחיל, אתחל טיימר מסונכרן
      if (state.status === 'playing' && !gameStartTime) {
        setGameStartTime(Date.now());
        setTimeLeft(state.timer);
      }
    });

    newSocket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('error', (error: string) => {
      setError(error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, loading, router]);

  // טיימר מסונכרן
  useEffect(() => {
    if (gameState.status !== 'playing' || !gameStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
      const remaining = Math.max(0, gameState.timer - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        // הזמן נגמר - שליחת תשובה אוטומטית
        if (socket) {
          socket.emit('answer', -1); // תשובה שגויה
        }
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.status, gameStartTime, gameState.timer, socket]);

  const handleReady = () => {
    if (socket) {
      socket.emit('player-ready');
    }
  };

  const handleAnswer = (answer: number) => {
    if (socket) {
      socket.emit('answer', answer);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && newMessage.trim()) {
      socket.emit('chat-message', newMessage);
      setNewMessage('');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">מתחבר לשרת...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p className="text-xl">{error}</p>
          <button 
            onClick={() => router.push('/games')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            חזרה למשחקים
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Game Area */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">קרב זוגי מקוון</h2>
              <div className="text-sm text-gray-500">
                {gameState.status === 'waiting' ? 'מחפש שחקן...' : 'משחק פעיל'}
              </div>
            </div>

            {gameState.status === 'waiting' && (
              <div className="text-center py-8">
                <p className="mb-4">מחכה לשחקן נוסף...</p>
                <button
                  onClick={handleReady}
                  disabled={gameState.player1.ready}
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                  {gameState.player1.ready ? 'מוכן' : 'אני מוכן'}
                </button>
              </div>
            )}

            {gameState.status === 'playing' && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className={`p-2 rounded ${gameState.currentPlayer === 1 ? 'bg-blue-100' : ''}`}>
                    {gameState.player1.name}: {gameState.player1.score}
                  </div>
                  <div className={`p-2 rounded ${gameState.currentPlayer === 2 ? 'bg-blue-100' : ''}`}>
                    {gameState.player2.name}: {gameState.player2.score}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-bold">שאלה {gameState.currentQuestion + 1}</p>
                    <div className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-blue-500'}`}>
                      ⏰ {timeLeft} שניות
                    </div>
                  </div>
                  <p className="text-2xl mt-4">{gameState.questions[gameState.currentQuestion]?.text}</p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {gameState.questions[gameState.currentQuestion]?.options.map((option: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        className="p-4 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {gameState.status === 'finished' && (
              <div className="text-center py-8">
                <h3 className="text-2xl font-bold mb-4">המשחק הסתיים!</h3>
                <div className="space-y-4">
                  <div className="text-xl">
                    {gameState.player1.score > gameState.player2.score ? (
                      <p>{gameState.player1.name} ניצח!</p>
                    ) : gameState.player2.score > gameState.player1.score ? (
                      <p>{gameState.player2.name} ניצח!</p>
                    ) : (
                      <p>תיקו!</p>
                    )}
                  </div>
                  <button
                    onClick={() => router.push('/games')}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    חזרה למשחקים
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-4">צ'אט</h3>
            <div className="h-96 overflow-y-auto mb-4 space-y-2">
              {messages.map((message, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded">
                  <p className="font-bold">{message.sender}</p>
                  <p>{message.text}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="הקלד הודעה..."
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                שלח
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 