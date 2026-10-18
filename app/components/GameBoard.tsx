'use client';

import { useEffect, useState, useRef } from 'react';
import { Game, Player } from '../../types/game';

const QUESTION_MS = 20000;

interface GameBoardProps {
  gameId: string;
  currentPlayerId: string;
  currentPlayerSymbol: Player;
}

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
  { emoji: '👍', name: 'כל הכבוד', color: 'bg-green-100 hover:bg-green-200' },
  { emoji: '😂', name: 'מצחיק', color: 'bg-yellow-100 hover:bg-yellow-200' },
  { emoji: '❤️', name: 'לב', color: 'bg-pink-100 hover:bg-pink-200' },
  { emoji: '🔥', name: 'אש', color: 'bg-orange-100 hover:bg-orange-200' },
];

function computeTimeLeft(game: Game | null): number {
  if (!game || game.status !== 'active' || !game.currentWord) return 0;
  const started = game.currentWord.startedAt || game.updatedAt || Date.now();
  const left = Math.ceil((QUESTION_MS - (Date.now() - started)) / 1000);
  return Math.min(20, Math.max(0, left));
}

export default function GameBoard({ gameId, currentPlayerId, currentPlayerSymbol: initialSymbol }: GameBoardProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(20);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    myScore?: number;
    opponentScore?: number;
  } | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [mySelectedIndex, setMySelectedIndex] = useState<number | null>(null);
  const [currentPlayerSymbol, setCurrentPlayerSymbol] = useState<Player>(initialSymbol);

  const hasAnsweredRef = useRef(false);
  const timeoutSentRef = useRef(false);
  const submittingRef = useRef(false);
  const lockedRoundRef = useRef<number | null>(null);
  const lastFeedbackKeyRef = useRef<string | null>(null);
  const statsUpdatedRef = useRef(false);
  const lastSeenEmojiTimeRef = useRef(0);
  const emojiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emojiCooldownRef = useRef(0);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [displayEmoji, setDisplayEmoji] = useState<{ emoji: string; fromMe: boolean } | null>(null);
  const [emojiSending, setEmojiSending] = useState(false);

  useEffect(() => {
    setCurrentPlayerSymbol(initialSymbol);
  }, [initialSymbol]);

  useEffect(() => {
    hasAnsweredRef.current = hasAnswered;
  }, [hasAnswered]);

  const showFeedback = (g: Game, symbol: Player) => {
    const move = g.lastMove;
    if (!move || move.player !== symbol) return;
    const key = `${move.time}_${move.answer}_${move.selectedIndex}`;
    if (lastFeedbackKeyRef.current === key) return;
    lastFeedbackKeyRef.current = key;

    const myScore = g.playerStates[symbol]?.score || 0;
    const opp = g.playerStates[symbol === 'player1' ? 'player2' : 'player1']?.score || 0;
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    if (move.answer === 'timeout') {
      setFeedbackMessage({ type: 'info', text: 'נגמר הזמן ⏰', myScore, opponentScore: opp });
    } else if (move.isCorrect) {
      setFeedbackMessage({ type: 'success', text: 'נכון! +10 נקודות 🎉', myScore, opponentScore: opp });
    } else {
      setFeedbackMessage({ type: 'error', text: 'לא נכון 😔', myScore, opponentScore: opp });
    }
    feedbackTimeoutRef.current = setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const adoptGame = (g: Game) => {
    let symbol: Player = currentPlayerSymbol;
    if (g.players?.player1 === currentPlayerId) symbol = 'player1';
    else if (g.players?.player2 === currentPlayerId) symbol = 'player2';
    if (symbol !== currentPlayerSymbol) setCurrentPlayerSymbol(symbol);

    const answered = g.playerStates?.[symbol]?.hasAnswered === true;
    const roundChanged = lockedRoundRef.current !== g.currentRound;

    if (roundChanged) {
      lockedRoundRef.current = g.currentRound;
      timeoutSentRef.current = false;
      setMySelectedIndex(null);
      submittingRef.current = false;
    }

    setHasAnswered(answered);
    hasAnsweredRef.current = answered;
    setGame(g);
    setError(null);

    if (g.lastMove) showFeedback(g, symbol);

    const incoming = g.lastEmoji;
    if (
      incoming?.emoji &&
      incoming.time &&
      incoming.time !== lastSeenEmojiTimeRef.current &&
      Date.now() - incoming.time < 8000 &&
      incoming.sender !== currentPlayerId
    ) {
      lastSeenEmojiTimeRef.current = incoming.time;
      showEmojiBurst(incoming.emoji, false);
    }

    return symbol;
  };

  const submitMove = async (payload: {
    answer: 'definition' | 'sentence' | 'timeout';
    selectedIndex: number;
    round: number;
  }) => {
    if (submittingRef.current) return;
    if (payload.answer === 'timeout' && timeoutSentRef.current) return;

    submittingRef.current = true;
    if (payload.answer === 'timeout') timeoutSentRef.current = true;

    setHasAnswered(true);
    hasAnsweredRef.current = true;

    try {
      const response = await fetch('/api/games/word-clash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move',
          gameId,
          playerId: currentPlayerId,
          answer: payload.answer,
          selectedIndex: payload.selectedIndex,
          round: payload.round,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.game) adoptGame(data.game);
      } else if (payload.answer === 'timeout') {
        // allow one retry on next tick if server rejected
        timeoutSentRef.current = false;
        setHasAnswered(false);
        hasAnsweredRef.current = false;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'שליחת התשובה נכשלה' }));
        setError(errorData.error || 'שליחת התשובה נכשלה');
        setHasAnswered(false);
        hasAnsweredRef.current = false;
        setMySelectedIndex(null);
      }
    } catch (e) {
      console.error('move failed', e);
      if (payload.answer === 'timeout') timeoutSentRef.current = false;
      setHasAnswered(false);
      hasAnsweredRef.current = false;
      setMySelectedIndex(null);
      setError('שגיאה בשליחת התשובה');
    } finally {
      submittingRef.current = false;
    }
  };

  // Poll server — single source of truth
  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch(`/api/games/word-clash?gameId=${encodeURIComponent(gameId)}`);
        if (!response.ok || cancelled) return;
        const data = await response.json();
        if (!cancelled && data.game) adoptGame(data.game);
      } catch (err) {
        if (!cancelled) {
          console.error('poll failed', err);
          setError('שגיאה בטעינת המשחק');
        }
      }
    };

    poll();
    const interval = setInterval(poll, 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, currentPlayerId]);

  // Shared timer derived from server startedAt — never resets on its own
  useEffect(() => {
    const tick = () => {
      const left = computeTimeLeft(game);
      setTimeLeft(left);

      if (
        game &&
        game.status === 'active' &&
        game.currentWord &&
        left <= 0 &&
        !hasAnsweredRef.current &&
        !timeoutSentRef.current &&
        !submittingRef.current &&
        lockedRoundRef.current === game.currentRound
      ) {
        submitMove({
          answer: 'timeout',
          selectedIndex: -1,
          round: game.currentRound,
        });
      }
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.currentRound, game?.currentWord?.startedAt, game?.status, gameId]);

  // Stats on finish
  useEffect(() => {
    if (!game || game.status !== 'finished' || statsUpdatedRef.current || !currentPlayerId) return;
    const playerState = game.playerStates?.[currentPlayerSymbol];
    if (!playerState) return;

    statsUpdatedRef.current = true;
    fetch('/api/games/update-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentPlayerId,
        gameName: 'word-clash',
        score: playerState.score || 0,
        won: game.winner === currentPlayerSymbol,
        correctAnswers: Math.floor((playerState.score || 0) / 10),
        totalQuestions: game.maxRounds || 5,
      }),
    }).catch(() => {});
  }, [game?.status, game?.winner, currentPlayerId, currentPlayerSymbol, game?.playerStates, game?.maxRounds]);

  useEffect(() => {
    return () => {
      if (emojiTimeoutRef.current) clearTimeout(emojiTimeoutRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  const showEmojiBurst = (emoji: string, fromMe: boolean) => {
    if (emojiTimeoutRef.current) clearTimeout(emojiTimeoutRef.current);
    setDisplayEmoji({ emoji, fromMe });
    emojiTimeoutRef.current = setTimeout(() => {
      setDisplayEmoji(null);
      emojiTimeoutRef.current = null;
    }, 3500);
  };

  const sendEmoji = async (emoji: string) => {
    if (emojiSending) return;
    const now = Date.now();
    if (now - emojiCooldownRef.current < 800) return;
    emojiCooldownRef.current = now;
    setShowEmojiPicker(false);
    showEmojiBurst(emoji, true);
    setEmojiSending(true);
    try {
      const response = await fetch('/api/games/word-clash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'emoji', gameId, playerId: currentPlayerId, emoji }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.game) {
          // Keep current question identity; only merge side channels
          setGame((prev) => {
            if (!prev || prev.currentRound !== data.game.currentRound) return data.game;
            return {
              ...prev,
              chatMessages: data.game.chatMessages,
              lastEmoji: data.game.lastEmoji,
              playerStates: data.game.playerStates,
            };
          });
          if (data.game.lastEmoji?.time) lastSeenEmojiTimeRef.current = data.game.lastEmoji.time;
        }
      }
    } catch {
      setError('שליחת האימוג׳י נכשלה');
    } finally {
      setEmojiSending(false);
    }
  };

  const handleAnswer = (type: 'definition' | 'sentence', index: number) => {
    if (!game || game.status !== 'active' || hasAnswered || submittingRef.current) return;
    if (timeLeft <= 0) return;
    setMySelectedIndex(index);
    submitMove({ answer: type, selectedIndex: index, round: game.currentRound });
  };

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        <div className="mt-4 text-lg">טוען משחק...</div>
      </div>
    );
  }

  const currentWord = game.currentWord;
  const playerState = game.playerStates?.[currentPlayerSymbol];
  const opponentState = game.playerStates?.[currentPlayerSymbol === 'player1' ? 'player2' : 'player1'];

  if (!playerState) {
    return (
      <div className="text-red-500 bg-red-100 p-4 rounded">שגיאה: מצב השחקן לא נמצא.</div>
    );
  }

  const waitingForOpponent =
    hasAnswered &&
    game.status === 'active' &&
    !(game.playerStates?.player1?.hasAnswered && game.playerStates?.player2?.hasAnswered);

  const questionType =
    currentWord?.questionType || ((game.currentRound || 0) % 2 === 0 ? 'definition' : 'sentence');
  const options =
    questionType === 'definition' ? currentWord?.definitions : currentWord?.sentences;
  const canAnswer = !hasAnswered && game.status === 'active' && timeLeft > 0 && !!options?.length;

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {error && <div className="text-red-500 bg-red-100 p-2 rounded">{error}</div>}

      <div className="flex justify-between w-full max-w-2xl" dir="rtl">
        <div className="text-center">
          <h3 className="font-bold text-blue-700">הניקוד שלך</h3>
          <p className="text-2xl font-extrabold">{playerState.score || 0}</p>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-gray-700">סיבוב</h3>
          <p className="text-2xl font-extrabold">
            {Math.min((game.currentRound || 0) + 1, game.maxRounds)}/{game.maxRounds}
          </p>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-red-700">ניקוד יריב</h3>
          <p className="text-2xl font-extrabold">{opponentState?.score || 0}</p>
        </div>
      </div>

      {game.status === 'waiting' && (
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-4">ממתינים לשחקן נוסף...</div>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-lg mb-2" dir="ltr">{gameId}</div>
          <div className="text-sm text-gray-500">המשחק יתחיל כשהיריב יצטרף — אז יתחיל טיימר של 20 שניות</div>
        </div>
      )}

      {game.status === 'active' && currentWord && options && (
        <div className="w-full max-w-2xl space-y-6" dir="rtl">
          <div className="text-center">
            <div className="text-sm text-green-700 font-semibold mb-2">
              שניכם עונים במקביל על אותה שאלה
            </div>
            <h2 className="text-4xl font-extrabold mb-2 tracking-wide">{currentWord.word}</h2>
            <p className="text-gray-700 mb-3 font-medium">
              {questionType === 'definition' ? 'מה ההגדרה הנכונה למילה?' : 'איזה משפט משתמש במילה נכון?'}
            </p>
            <div
              className={`text-3xl font-bold ${
                timeLeft <= 5 ? 'text-red-500 animate-pulse' : timeLeft <= 10 ? 'text-orange-500' : 'text-green-600'
              }`}
            >
              ⏰ {timeLeft}
            </div>
            {waitingForOpponent && (
              <div className="text-sm text-blue-700 mt-2 font-bold animate-pulse">ענית! מחכים ליריב...</div>
            )}
          </div>

          {feedbackMessage && (
            <div
              className={`p-4 rounded-xl border-2 text-center ${
                feedbackMessage.type === 'success'
                  ? 'bg-green-50 border-green-400 text-green-800'
                  : feedbackMessage.type === 'error'
                    ? 'bg-red-50 border-red-400 text-red-800'
                    : 'bg-blue-50 border-blue-400 text-blue-800'
              }`}
            >
              <div className="text-xl font-bold">{feedbackMessage.text}</div>
              {feedbackMessage.myScore !== undefined && (
                <div className="mt-2 text-sm">
                  את/ה: {feedbackMessage.myScore} | יריב: {feedbackMessage.opponentScore}
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            {options.map((option, index) => {
              const isMine = mySelectedIndex === index;
              return (
                <button
                  key={`${game.currentRound}-${questionType}-${index}`}
                  onClick={() => handleAnswer(questionType, index)}
                  disabled={!canAnswer}
                  className={`
                    w-full p-4 text-right rounded-xl transition-all duration-200 border-2 text-base sm:text-lg
                    ${!canAnswer ? 'cursor-not-allowed opacity-80' : 'hover:bg-blue-50 hover:border-blue-400 cursor-pointer'}
                    ${isMine ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
                  `}
                >
                  <span className="font-bold text-blue-600 ml-2">{index + 1}.</span>
                  {option}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center gap-3 flex-wrap">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2000);
                } catch {
                  setError('לא ניתן להעתיק — העתיקו ידנית מהכתובת');
                }
              }}
            >
              העתק קישור למשחק
            </button>
            <button
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              onClick={() => {
                window.location.href = '/games/word-clash';
              }}
            >
              יציאה
            </button>
          </div>
          {showToast && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
              הקישור הועתק!
            </div>
          )}
        </div>
      )}

      {game.status === 'finished' && (
        <div className="text-center bg-gradient-to-br from-purple-100 to-blue-100 p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            {game.winner === 'draw'
              ? 'תיקו! 🤝'
              : game.winner === currentPlayerSymbol
                ? 'ניצחת! 🎉'
                : 'הפסדת! 😔'}
          </h2>
          <div className="text-2xl mb-4">
            <p className="font-bold text-gray-800">ניקוד סופי:</p>
            <div className="flex justify-center gap-8 mt-2">
              <div>
                <span className="text-blue-600">אתה: </span>
                <span className="font-bold text-3xl">{playerState.score || 0}</span>
              </div>
              <div>
                <span className="text-red-600">יריב: </span>
                <span className="font-bold text-3xl">{opponentState?.score || 0}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              window.location.href = '/games/word-clash';
            }}
            className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600"
          >
            חזרה למשחקים
          </button>
        </div>
      )}

      {displayEmoji && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-white/90 rounded-2xl shadow-2xl px-8 py-6 text-center animate-fade-in border-2 border-purple-200">
            <div className="text-7xl animate-bounce">{displayEmoji.emoji}</div>
            <p className="text-sm text-gray-700 mt-2 font-bold">
              {displayEmoji.fromMe ? 'שלחת אימוג׳י!' : 'היריב שלח אימוג׳י!'}
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl mt-4 bg-white bg-opacity-90 rounded-lg shadow p-4" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">תגובות מהירות</h3>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={emojiSending}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-60"
          >
            😊 שליחת אימוג׳י
          </button>
        </div>
        {showEmojiPicker && (
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
            {EMOJI_REACTIONS.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => sendEmoji(reaction.emoji)}
                disabled={emojiSending}
                className={`p-2 rounded-lg ${reaction.color} hover:scale-110 disabled:opacity-50`}
                title={reaction.name}
              >
                <span className="text-2xl">{reaction.emoji}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl mt-2 bg-white bg-opacity-80 rounded-lg shadow p-4" dir="rtl">
        <div className="h-40 overflow-y-auto mb-2 border-b pb-2">
          {game.chatMessages?.length ? (
            game.chatMessages.map((msg: any, idx: number) => {
              const mine = msg.sender === currentPlayerId;
              if (msg.type === 'emoji') {
                return (
                  <div key={`${msg.timestamp}-${idx}`} className={`mb-1 text-2xl ${mine ? 'text-right' : 'text-left'}`}>
                    <span className="text-xs font-bold text-gray-500 ml-1">{mine ? 'את/ה' : 'יריב'}</span>
                    {msg.text}
                  </div>
                );
              }
              return (
                <div
                  key={`${msg.timestamp}-${idx}`}
                  className={`mb-1 text-sm ${mine ? 'text-blue-700 text-right' : 'text-gray-800 text-left'}`}
                >
                  <span className="font-bold">{mine ? 'את/ה' : 'יריב'}: </span>
                  {msg.text}
                </div>
              );
            })
          ) : (
            <div className="text-gray-400 text-center">אין הודעות עדיין</div>
          )}
        </div>
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!chatInput.trim()) return;
            const text = chatInput.trim();
            setChatInput('');
            try {
              const response = await fetch('/api/games/word-clash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'chat',
                  gameId,
                  playerId: currentPlayerId,
                  message: text,
                }),
              });
              if (response.ok) {
                const data = await response.json();
                setGame((prev) =>
                  prev
                    ? { ...prev, chatMessages: data.game.chatMessages }
                    : data.game
                );
              } else {
                setChatInput(text);
                setError('שליחת ההודעה נכשלה');
              }
            } catch {
              setChatInput(text);
              setError('שליחת ההודעה נכשלה');
            }
          }}
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded border border-gray-300"
            placeholder="כתוב הודעה..."
            maxLength={500}
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            שלח
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fade-in { animation: fade-in 0.4s; }
      `}</style>
    </div>
  );
}
