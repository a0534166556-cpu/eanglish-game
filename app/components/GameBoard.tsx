'use client';

import { useEffect, useState } from 'react';
import { Game, Player } from '../../types/game';
// import { subscribeToGame, makeMove, sendChatMessage, useRevealLetter, useSkipWord } from '../../lib/game';

interface GameBoardProps {
  gameId: string;
  currentPlayerId: string;
  currentPlayerSymbol: Player;
}

export default function GameBoard({ gameId, currentPlayerId, currentPlayerSymbol }: GameBoardProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [revealedLetter, setRevealedLetter] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [skipError, setSkipError] = useState<string | null>(null);
  const [skipSuccess, setSkipSuccess] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  
  // מערכת אימוג'ים
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState<string | null>(null);
  const [emojiHistory, setEmojiHistory] = useState<string[]>([]);

  const EMOJI_REACTIONS = [
    { emoji: '😊', name: 'שמח', color: 'bg-yellow-100 hover:bg-yellow-200' },
    { emoji: '😢', name: 'עצוב', color: 'bg-blue-100 hover:bg-blue-200' },
    { emoji: '😠', name: 'כועס', color: 'bg-red-100 hover:bg-red-200' },
    { emoji: '😍', name: 'מאוהב', color: 'bg-pink-100 hover:bg-pink-200' },
    { emoji: '🤔', name: 'חושב', color: 'bg-gray-100 hover:bg-gray-200' },
    { emoji: '😴', name: 'עייף', color: 'bg-purple-100 hover:bg-purple-200' },
    { emoji: '🎉', name: 'מחגג', color: 'bg-green-100 hover:bg-green-200' },
    { emoji: '😱', name: 'מפוחד', color: 'bg-orange-100 hover:bg-orange-200' },
    { emoji: '🤯', name: 'מופתע', color: 'bg-indigo-100 hover:bg-indigo-200' },
    { emoji: '😎', name: 'מגניב', color: 'bg-cyan-100 hover:bg-cyan-200' },
  ];

  const sendEmoji = (emoji: string) => {
    setCurrentEmoji(emoji);
    setEmojiHistory(prev => [emoji, ...prev.slice(0, 2)]); // שמירת 3 אימוג'ים אחרונים
    setShowEmojiPicker(false);
    
    // איפוס האימוג'י הנוכחי אחרי 3 שניות
    setTimeout(() => {
      setCurrentEmoji(null);
    }, 3000);
  };

  // ניקוי אימוג'ים ישנים
  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiHistory(prev => prev.slice(0, -1));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        console.log('Fetching game:', gameId);
        const response = await fetch(`/api/games/word-clash?gameId=${gameId}`);
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Game data:', data.game);
          console.log('Game status:', data.game.status);
          console.log('Players:', data.game.players);
          setGame(data.game);
          setError(null);
          
          // If game status changed to active, show success message
          if (data.game.status === 'active' && data.game.players.player2) {
            console.log('Game is now active with two players!');
            // Start timer when game becomes active (only once)
            setIsTimerActive(prev => {
              if (!prev) {
                setTimeLeft(15);
                return true;
              }
              return prev;
            });
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch game:', response.status, errorText);
          setError(`Failed to load game: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching game:', err);
        setError(`Failed to load game: ${err}`);
      }
    };

    if (gameId) {
      console.log('Starting game fetch for:', gameId);
      fetchGame();
      // Poll for game updates every 2 seconds to reduce load
      const interval = setInterval(() => {
        console.log('Polling for game updates...');
        fetchGame();
      }, 2000);
      return () => {
        console.log('Clearing interval');
        clearInterval(interval);
      };
    }
  }, [gameId]); // Removed isTimerActive from dependencies to prevent infinite loop

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Time's up!
      setIsTimerActive(false);
      alert('הזמן נגמר! עוברים לשאלה הבאה...');
      // Reset timer for next question
      setTimeLeft(15);
    }
    return () => clearTimeout(timer);
  }, [isTimerActive, timeLeft]);

  const handleAnswer = async (type: 'definition' | 'sentence', index: number) => {
    if (!game) return;

    try {
      const response = await fetch('/api/games/word-clash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move',
          gameId: gameId,
          playerId: currentPlayerId,
          answer: type,
          selectedIndex: index
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGame(data.game);
        setError(null);

        // Show feedback
        if (data.game.lastMove?.isCorrect) {
          alert('נכון! +10 נקודות! 🎉');
        } else {
          alert('לא נכון! 😔');
        }
      } else {
        setError('Failed to submit answer');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-4xl font-bold mb-2">Word Clash</div>
        <div className="text-xl text-gray-600 mb-8">Battle for Meaning</div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="mt-4 text-lg">טוען משחק...</div>
      </div>
    );
  }

  const currentWord = game.currentWord;
  const playerState = game.playerStates[currentPlayerSymbol];
  const opponentState = game.playerStates[currentPlayerSymbol === 'player1' ? 'player2' : 'player1'];

  const bothAnswered = game.lastMove && game.lastMove.player !== currentPlayerSymbol;

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {error && (
        <div className="text-red-500 bg-red-100 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between w-full max-w-2xl">
        <div className="text-center">
          <h3 className="font-bold">Your Score</h3>
          <p className="text-2xl">{playerState.score}</p>
        </div>
        <div className="text-center">
          <h3 className="font-bold">Round</h3>
          <p className="text-2xl">{game.currentRound + 1}/{game.maxRounds}</p>
        </div>
        <div className="text-center">
          <h3 className="font-bold">Opponent Score</h3>
          <p className="text-2xl">{opponentState.score}</p>
        </div>
      </div>

      {game.status === 'waiting' && (
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-4">ממתינים לשחקן נוסף...</div>
          <div className="text-lg text-gray-600 mb-4">שתף את ה-Game ID עם חבר:</div>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-lg mb-4">{gameId}</div>
          <div className="text-sm text-gray-500">המשחק יתחיל אוטומטית כששחקן שני יצטרף</div>
        </div>
      )}

      {game.status === 'active' && currentWord && (
        <>
          <div className="text-center mb-4">
            <div className="text-xl font-bold text-green-600 mb-2">המשחק התחיל! 🎮</div>
            <div className="text-sm text-gray-600">
              {game.players.player2 ? 'שני שחקנים מחוברים' : 'מחכים לשחקן שני...'}
            </div>
          </div>
          <div className="flex gap-2 my-4 justify-center">
            <button
              disabled={playerState.powerUps?.revealLetter <= 0}
              onClick={async () => {
                setRevealError(null);
                setRevealedLetter(null);
                try {
                  if (game && game.currentWord) {
                    const letters = game.currentWord.word.split('');
                    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
                    setRevealedLetter(randomLetter);
                    
                    // Update power-ups
                    const updatedGame = {
                      ...game,
                      playerStates: {
                        ...game.playerStates,
                        [currentPlayerSymbol]: {
                          ...game.playerStates[currentPlayerSymbol],
                          powerUps: {
                            ...game.playerStates[currentPlayerSymbol].powerUps,
                            revealLetter: game.playerStates[currentPlayerSymbol].powerUps.revealLetter - 1
                          }
                        }
                      }
                    };
                    setGame(updatedGame);
                  }
                } catch (e: any) {
                  setRevealError(e.message || 'שגיאה');
                }
              }}
              className="bg-yellow-300 px-3 py-1 rounded font-bold disabled:bg-gray-300"
            >
              הצג אות ({playerState.powerUps?.revealLetter || 0})
            </button>
            <button
              disabled={playerState.powerUps?.skipWord <= 0}
              onClick={async () => {
                setSkipError(null);
                setSkipSuccess(false);
                try {
                  if (game) {
                    // Update power-ups
                    const updatedGame = {
                      ...game,
                      playerStates: {
                        ...game.playerStates,
                        [currentPlayerSymbol]: {
                          ...game.playerStates[currentPlayerSymbol],
                          powerUps: {
                            ...game.playerStates[currentPlayerSymbol].powerUps,
                            skipWord: game.playerStates[currentPlayerSymbol].powerUps.skipWord - 1
                          }
                        }
                      }
                    };
                    setGame(updatedGame);
                    setSkipSuccess(true);
                    setTimeout(() => setSkipSuccess(false), 1500);
                  }
                } catch (e: any) {
                  setSkipError(e.message || 'שגיאה');
                }
              }}
              className="bg-blue-300 px-3 py-1 rounded font-bold disabled:bg-gray-300"
            >
              דלג ({playerState.powerUps?.skipWord || 0})
            </button>
            <button
              disabled={playerState.powerUps?.freezeOpponent <= 0}
              onClick={() => alert('הקפא יריב - בקרוב!')}
              className="bg-purple-300 px-3 py-1 rounded font-bold"
            >
              הקפא יריב ({playerState.powerUps?.freezeOpponent || 0})
            </button>
          </div>
          <div className="text-center mt-2">
            {revealError && <div className="text-red-500">{revealError}</div>}
            {game && game.revealedLetters && game.revealedLetters[currentPlayerSymbol] && game.revealedLetters[currentPlayerSymbol].length > 0 && (
              <div className="text-lg font-mono text-blue-700">
                אותיות שנחשפו: {game.revealedLetters[currentPlayerSymbol].join(', ')}
              </div>
            )}
            {revealedLetter && (
              <div className="text-green-700 font-bold animate-bounce">האות שנחשפה: {revealedLetter}</div>
            )}
            {skipError && <div className="text-red-500">{skipError}</div>}
            {skipSuccess && <div className="text-green-700 font-bold animate-bounce">דילגת על המילה!</div>}
          </div>
          <div className="w-full max-w-2xl space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{currentWord.word}</h2>
              <p className="text-gray-600 mb-4">בחרו את ההגדרה והמשפט הנכונים</p>
              
              {/* Timer */}
              <div className="mb-4">
                <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : timeLeft <= 10 ? 'text-orange-500' : 'text-green-500'}`}>
                  ⏰ {timeLeft} שניות
                </div>
              </div>
              
              <div className="bg-blue-100 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-lg mb-2">הסבר:</h3>
                <p className="text-gray-700">
                  {currentWord.word === 'APPLE' ? 
                    'תבחרו את ההגדרה הנכונה למילה "APPLE" ואת המשפט שמשתמש במילה בצורה נכונה. יש רק תשובה נכונה אחת לכל קטגוריה!' :
                    'תבחרו את ההגדרה הנכונה למילה ואת המשפט שמשתמש במילה בצורה נכונה. יש רק תשובה נכונה אחת לכל קטגוריה!'
                  }
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">הגדרות:</h3>
                <div className="space-y-2">
                  {currentWord.definitions.map((def, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer('definition', index)}
                      disabled={game.lastMove?.player === currentPlayerSymbol || !isTimerActive}
                      className={`
                        w-full p-3 text-left rounded transition-all duration-200
                        ${game.lastMove?.player === currentPlayerSymbol || !isTimerActive ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-blue-50 cursor-pointer'}
                        ${game.lastMove?.answer === 'definition' && game.lastMove.selectedIndex === index
                          ? game.lastMove.isCorrect ? 'border-2 border-green-500 bg-green-50 animate-pulse' : 'border-2 border-red-500 bg-red-50 animate-shake'
                          : 'border border-gray-200'}
                      `}
                    >
                      {def}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">משפטי דוגמה:</h3>
                <div className="space-y-2">
                  {currentWord.sentences.map((sentence, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer('sentence', index)}
                      disabled={game.lastMove?.player === currentPlayerSymbol || !isTimerActive}
                      className={`
                        w-full p-3 text-left rounded transition-all duration-200
                        ${game.lastMove?.player === currentPlayerSymbol || !isTimerActive ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-blue-50 cursor-pointer'}
                        ${game.lastMove?.answer === 'sentence' && game.lastMove.selectedIndex === index
                          ? game.lastMove.isCorrect ? 'border-2 border-green-500 bg-green-50 animate-pulse' : 'border-2 border-red-500 bg-red-50 animate-shake'
                          : 'border border-gray-200'}
                      `}
                    >
                      {sentence}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {game.lastMove?.player === currentPlayerSymbol && !bothAnswered && (
              <div className="text-lg text-blue-700 font-bold animate-pulse mt-4">ענית! מחכים לתשובת היריב...</div>
            )}
            {bothAnswered && (
              <div className="text-lg text-green-700 font-bold animate-bounce mt-4">היריב ענה! מחכים לסיבוב הבא...</div>
            )}

            <div className="mt-6 flex justify-center">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2000);
                }}
              >
                העתק קישור למשחק
              </button>
              {showToast && (
                <div className="fixed bottom-8 right-8 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
                  הקישור הועתק!
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {game.status === 'finished' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {game.winner === 'draw' ? "It's a draw!" : 
             game.winner === currentPlayerSymbol ? 'You won!' : 'You lost!'}
          </h2>
          <p className="text-xl">Final Score: {playerState.score} - {opponentState.score}</p>
        </div>
      )}

      {/* מערכת אימוג'ים */}
      {game && (
        <div className="w-full max-w-2xl mt-8 bg-white bg-opacity-90 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">תגובות מהירות</h3>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center gap-2"
            >
              😊 שליחת אימוג'י
            </button>
          </div>

          {/* בחירת אימוג'י */}
          {showEmojiPicker && (
            <div className="grid grid-cols-5 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
              {EMOJI_REACTIONS.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => sendEmoji(reaction.emoji)}
                  className={`p-2 rounded-lg transition-all duration-200 ${reaction.color} hover:scale-110`}
                  title={reaction.name}
                >
                  <span className="text-2xl">{reaction.emoji}</span>
                </button>
              ))}
            </div>
          )}

          {/* אימוג'י נוכחי */}
          {currentEmoji && (
            <div className="text-center mb-4">
              <div className="text-6xl animate-bounce">{currentEmoji}</div>
              <p className="text-sm text-gray-600 mt-2">שלחת אימוג'י!</p>
            </div>
          )}

          {/* היסטוריית אימוג'ים */}
          {emojiHistory.length > 0 && (
            <div className="flex justify-center gap-2 mb-4">
              {emojiHistory.map((emoji, index) => (
                <div
                  key={index}
                  className="text-2xl animate-fade-in opacity-80"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* קומפוננטת צ'אט */}
      {game && (
        <div className="w-full max-w-2xl mt-4 bg-white bg-opacity-80 rounded-lg shadow p-4">
          <div className="h-40 overflow-y-auto mb-2 border-b pb-2">
            {game.chatMessages && game.chatMessages.length > 0 ? (
              game.chatMessages.map((msg, idx) => (
                <div key={idx} className={`mb-1 text-sm ${msg.sender === currentPlayerId ? 'text-blue-700 text-right' : 'text-gray-800 text-left'}`}>
                  <span className="font-bold">{msg.sender === currentPlayerId ? 'אתה' : 'יריב'}: </span>{msg.text}
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center">אין הודעות עדיין</div>
            )}
          </div>
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!chatInput.trim()) return;
              // await sendChatMessage(gameId, currentPlayerId, chatInput.trim());
              setChatInput('');
            }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-400"
              placeholder="כתוב הודעה..."
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              שלח
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes shake { 0%{transform:translateX(0);} 20%{transform:translateX(-5px);} 40%{transform:translateX(5px);} 60%{transform:translateX(-5px);} 80%{transform:translateX(5px);} 100%{transform:translateX(0);} }
        .animate-shake { animation: shake 0.4s; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
        .animate-fade-in { animation: fade-in 0.4s; }
      `}</style>
    </div>
  );
} 