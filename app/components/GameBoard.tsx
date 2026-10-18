'use client';

import { useEffect, useState, useRef } from 'react';
import { Game, Player } from '../../types/game';
// import { subscribeToGame, makeMove, sendChatMessage, useRevealLetter, useSkipWord } from '../../lib/game';

interface GameBoardProps {
  gameId: string;
  currentPlayerId: string;
  currentPlayerSymbol: Player;
}

export default function GameBoard({ gameId, currentPlayerId, currentPlayerSymbol: initialSymbol }: GameBoardProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info', text: string, showScore?: boolean, myScore?: number, opponentScore?: number } | null>(null);
  const lastQuestionKeyRef = useRef<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [mySelectedIndex, setMySelectedIndex] = useState<number | null>(null);
  const [currentPlayerSymbol, setCurrentPlayerSymbol] = useState<Player>(initialSymbol);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMoveTimeRef = useRef<number>(0);
  const isSubmittingAnswerRef = useRef<boolean>(false);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statsUpdatedRef = useRef<boolean>(false);
  const timeoutSentRef = useRef<boolean>(false);
  const hasAnsweredRef = useRef<boolean>(false);
  const questionTransitionRef = useRef<NodeJS.Timeout | null>(null);
  const transitioningRef = useRef<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pendingGameRef = useRef<Game | null>(null);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [displayEmoji, setDisplayEmoji] = useState<{ emoji: string; fromMe: boolean } | null>(null);
  const [emojiSending, setEmojiSending] = useState(false);
  const lastSeenEmojiTimeRef = useRef<number>(0);
  const emojiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiCooldownRef = useRef<number>(0);

  useEffect(() => {
    setCurrentPlayerSymbol(initialSymbol);
  }, [initialSymbol]);

  useEffect(() => {
    hasAnsweredRef.current = hasAnswered;
  }, [hasAnswered]);

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

  const showEmojiBurst = (emoji: string, fromMe: boolean) => {
    if (emojiTimeoutRef.current) {
      clearTimeout(emojiTimeoutRef.current);
      emojiTimeoutRef.current = null;
    }
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
        body: JSON.stringify({
          action: 'emoji',
          gameId,
          playerId: currentPlayerId,
          emoji,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.game) {
          setGame(data.game);
          if (data.game.lastEmoji?.time) {
            lastSeenEmojiTimeRef.current = data.game.lastEmoji.time;
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'שליחת האימוג׳י נכשלה' }));
        setError(errorData.error || 'שליחת האימוג׳י נכשלה');
      }
    } catch (err) {
      console.error('Error sending emoji:', err);
      setError('שליחת האימוג׳י נכשלה');
    } finally {
      setEmojiSending(false);
    }
  };

  useEffect(() => {
    return () => {
      if (emojiTimeoutRef.current) {
        clearTimeout(emojiTimeoutRef.current);
        emojiTimeoutRef.current = null;
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }
      if (questionTransitionRef.current) {
        clearTimeout(questionTransitionRef.current);
        questionTransitionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const showFeedback = (move: any, g: Game, symbol: Player) => {
      if (!move || move.player !== symbol || !move.time || move.time === lastMoveTimeRef.current) return;
      lastMoveTimeRef.current = move.time;
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
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedbackMessage(null);
        feedbackTimeoutRef.current = null;
      }, 4000);
    };

    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/games/word-clash?gameId=${gameId}`);
        if (!response.ok) {
          setError(`לא ניתן לטעון את המשחק (${response.status})`);
          return;
        }
        const data = await response.json();
        const g: Game = data.game;
        setError(null);

        // Always derive who I am from server state
        let symbol: Player = currentPlayerSymbol;
        if (g.players?.player1 === currentPlayerId) symbol = 'player1';
        else if (g.players?.player2 === currentPlayerId) symbol = 'player2';
        if (symbol !== currentPlayerSymbol) setCurrentPlayerSymbol(symbol);

        const word = g.currentWord?.word || '';
        const questionKey = `${g.currentRound || 0}_${word}_${g.currentWord?.questionType || 'definition'}`;
        const playerHasAnswered = g.playerStates?.[symbol]?.hasAnswered === true;

        const applyNewQuestion = (target: Game = g) => {
          const tw = target.currentWord?.word || '';
          const tKey = `${target.currentRound || 0}_${tw}_${target.currentWord?.questionType || 'definition'}`;
          const tAnswered = target.playerStates?.[symbol]?.hasAnswered === true;
          lastQuestionKeyRef.current = tKey;
          timeoutSentRef.current = false;
          transitioningRef.current = false;
          setIsTransitioning(false);
          pendingGameRef.current = null;
          setMySelectedIndex(null);
          setHasAnswered(tAnswered);
          hasAnsweredRef.current = tAnswered;
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          if (!tAnswered && target.status === 'active') {
            setTimeLeft(20);
            setIsTimerActive(true);
          } else {
            setIsTimerActive(false);
          }
        };

        const startQuestionTransition = (nextGame: Game) => {
          if (transitioningRef.current) {
            pendingGameRef.current = nextGame;
            return;
          }
          transitioningRef.current = true;
          setIsTransitioning(true);
          setIsTimerActive(false);
          pendingGameRef.current = nextGame;
          setGame((prev) =>
            prev
              ? {
                  ...prev,
                  playerStates: nextGame.playerStates,
                  lastMove: nextGame.lastMove,
                  // Keep 'active' during pause so the current question stays visible
                  status: prev.currentWord ? 'active' : nextGame.status,
                  winner: nextGame.winner,
                  chatMessages: nextGame.chatMessages,
                  lastEmoji: nextGame.lastEmoji,
                }
              : nextGame
          );
          if (questionTransitionRef.current) clearTimeout(questionTransitionRef.current);
          questionTransitionRef.current = setTimeout(() => {
            questionTransitionRef.current = null;
            const finalGame = pendingGameRef.current || nextGame;
            applyNewQuestion(finalGame);
            setGame(finalGame);
          }, 1600);
        };

        // Show opponent emoji reactions synced from server
        const incoming = g.lastEmoji;
        if (
          incoming?.emoji &&
          incoming.time &&
          incoming.time !== lastSeenEmojiTimeRef.current &&
          Date.now() - incoming.time < 8000
        ) {
          lastSeenEmojiTimeRef.current = incoming.time;
          if (incoming.sender !== currentPlayerId) {
            showEmojiBurst(incoming.emoji, false);
          }
        }

        const syncSideState = (prev: Game | null): Game =>
          prev
            ? {
                ...prev,
                playerStates: g.playerStates,
                lastMove: g.lastMove,
                // Don't flip to finished mid-transition while old question is still on screen
                status: transitioningRef.current && prev.currentWord ? 'active' : g.status,
                winner: g.winner,
                chatMessages: g.chatMessages,
                lastEmoji: g.lastEmoji,
              }
            : g;

        // During feedback pause: keep showing previous question, refresh scores/chat/emoji
        if (transitioningRef.current) {
          pendingGameRef.current = g;
          setGame(syncSideState);
          if (g.status === 'finished') {
            transitioningRef.current = false;
            setIsTransitioning(false);
            if (questionTransitionRef.current) {
              clearTimeout(questionTransitionRef.current);
              questionTransitionRef.current = null;
            }
            setGame(g);
          }
          return;
        }

        if (
          (g.status === 'active' && word && questionKey !== lastQuestionKeyRef.current) ||
          (g.status === 'finished' && lastQuestionKeyRef.current !== null && hasAnsweredRef.current)
        ) {
          if (g.lastMove) showFeedback(g.lastMove, g, symbol);
          const shouldPause = hasAnsweredRef.current && lastQuestionKeyRef.current !== null;
          if (shouldPause) {
            startQuestionTransition(g);
          } else {
            setGame(g);
            applyNewQuestion(g);
          }
        } else {
          setGame(g);
          if (g.status === 'active') {
            if (playerHasAnswered !== hasAnsweredRef.current) {
              setHasAnswered(playerHasAnswered);
              hasAnsweredRef.current = playerHasAnswered;
              if (playerHasAnswered) setIsTimerActive(false);
            }
          }
          if (g.lastMove) showFeedback(g.lastMove, g, symbol);
        }
      } catch (err) {
        console.error('Error fetching game:', err);
        setError('שגיאה בטעינת המשחק');
      }
    };

    if (!gameId) return;
    fetchGame();
    const interval = setInterval(fetchGame, 1500);
    return () => clearInterval(interval);
  }, [gameId, currentPlayerId, currentPlayerSymbol]);

  // Update stats when game finishes
  useEffect(() => {
    if (game && game.status === 'finished' && !statsUpdatedRef.current && currentPlayerId) {
      const playerState = game.playerStates?.[currentPlayerSymbol];
      const opponentState = game.playerStates?.[currentPlayerSymbol === 'player1' ? 'player2' : 'player1'];
      
      if (playerState) {
        const won = game.winner === currentPlayerSymbol;
        const totalRounds = game.maxRounds || 5;
        // Calculate correct answers: each correct answer gives 10 points, so score / 10
        const correctAnswers = Math.floor((playerState.score || 0) / 10);
        const totalQuestions = totalRounds; // one question per round (definition or sentence)
        
        // Update stats
        fetch('/api/games/update-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentPlayerId,
            gameName: 'word-clash', // Use lowercase with hyphen to match other games
            score: playerState.score || 0,
            won: won,
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions
          })
        })
        .then(response => {
          if (response.ok) {
            console.log('✅ Stats updated successfully for Word Clash game');
            statsUpdatedRef.current = true;
          } else {
            console.error('❌ Failed to update stats:', response.status);
          }
        })
        .catch(error => {
          console.error('❌ Error updating game stats:', error);
        });
      }
    }
  }, [game?.status, game?.winner, currentPlayerId, currentPlayerSymbol, game?.playerStates]);

  const applyMoveResponse = (nextGame: Game) => {
    const word = nextGame.currentWord?.word || '';
    const nextKey = `${nextGame.currentRound || 0}_${word}_${nextGame.currentWord?.questionType || 'definition'}`;
    const advanced =
      (lastQuestionKeyRef.current && nextKey !== lastQuestionKeyRef.current) ||
      nextGame.status === 'finished';

    if (nextGame.lastMove && nextGame.lastMove.player === currentPlayerSymbol && nextGame.lastMove.time !== lastMoveTimeRef.current) {
      lastMoveTimeRef.current = nextGame.lastMove.time;
      const myScore = nextGame.playerStates[currentPlayerSymbol]?.score || 0;
      const opp = nextGame.playerStates[currentPlayerSymbol === 'player1' ? 'player2' : 'player1']?.score || 0;
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      if (nextGame.lastMove.answer === 'timeout') {
        setFeedbackMessage({ type: 'info', text: 'נגמר הזמן ⏰', myScore, opponentScore: opp });
      } else {
        setFeedbackMessage({
          type: nextGame.lastMove.isCorrect ? 'success' : 'error',
          text: nextGame.lastMove.isCorrect ? 'נכון! +10 נקודות 🎉' : 'לא נכון 😔',
          myScore,
          opponentScore: opp,
        });
      }
      feedbackTimeoutRef.current = setTimeout(() => setFeedbackMessage(null), 4000);
    }

    if (advanced && lastQuestionKeyRef.current) {
      transitioningRef.current = true;
      setIsTransitioning(true);
      setIsTimerActive(false);
      pendingGameRef.current = nextGame;
      setGame((prev) =>
        prev
          ? {
              ...prev,
              playerStates: nextGame.playerStates,
              lastMove: nextGame.lastMove,
              status: prev.currentWord ? 'active' : nextGame.status,
              winner: nextGame.winner,
              chatMessages: nextGame.chatMessages,
              lastEmoji: nextGame.lastEmoji,
            }
          : nextGame
      );
      // Keep showing current question briefly; poll/timeout will flip to next
      if (questionTransitionRef.current) clearTimeout(questionTransitionRef.current);
      questionTransitionRef.current = setTimeout(() => {
        questionTransitionRef.current = null;
        const finalGame = pendingGameRef.current || nextGame;
        lastQuestionKeyRef.current = nextKey;
        timeoutSentRef.current = false;
        transitioningRef.current = false;
        setIsTransitioning(false);
        pendingGameRef.current = null;
        setMySelectedIndex(null);
        const answered = finalGame.playerStates?.[currentPlayerSymbol]?.hasAnswered === true;
        setHasAnswered(answered);
        hasAnsweredRef.current = answered;
        setGame(finalGame);
        if (!answered && finalGame.status === 'active') {
          setTimeLeft(20);
          setIsTimerActive(true);
        } else {
          setIsTimerActive(false);
        }
      }, 1600);
    } else {
      setGame(nextGame);
    }
  };

  const submitTimeout = async () => {
    if (timeoutSentRef.current || isSubmittingAnswerRef.current) return;
    timeoutSentRef.current = true;
    isSubmittingAnswerRef.current = true;
    setHasAnswered(true);
    hasAnsweredRef.current = true;
    setIsTimerActive(false);
    try {
      const response = await fetch('/api/games/word-clash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move',
          gameId,
          playerId: currentPlayerId,
          answer: 'timeout',
          selectedIndex: -1,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.game) applyMoveResponse(data.game);
      } else {
        // Allow retry if server rejected
        timeoutSentRef.current = false;
        setHasAnswered(false);
        hasAnsweredRef.current = false;
        if (timeLeft > 0) setIsTimerActive(true);
      }
    } catch (e) {
      console.error('Timeout submit failed', e);
      timeoutSentRef.current = false;
      setHasAnswered(false);
      hasAnsweredRef.current = false;
      if (timeLeft > 0) setIsTimerActive(true);
    } finally {
      isSubmittingAnswerRef.current = false;
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (isTimerActive && !hasAnswered) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            if (!hasAnsweredRef.current) submitTimeout();
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isTimerActive, hasAnswered, gameId, currentPlayerId]);

  const handleAnswer = async (type: 'definition' | 'sentence', index: number) => {
    if (isSubmittingAnswerRef.current || !game || hasAnswered || game.status !== 'active') return;
    if (!game.currentWord) {
      setError('שאלה לא זמינה');
      return;
    }

    isSubmittingAnswerRef.current = true;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerActive(false);
    setHasAnswered(true);
    hasAnsweredRef.current = true;
    setMySelectedIndex(index);

    try {
      const response = await fetch('/api/games/word-clash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move',
          gameId,
          playerId: currentPlayerId,
          answer: type,
          selectedIndex: index,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setError(null);
        if (data.game) applyMoveResponse(data.game);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'שגיאה' }));
        setError(errorData.error || 'שליחת התשובה נכשלה');
        if (timeLeft > 0) {
          setIsTimerActive(true);
          setHasAnswered(false);
          hasAnsweredRef.current = false;
          setMySelectedIndex(null);
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('שגיאה בשליחת התשובה');
      if (timeLeft > 0) {
        setIsTimerActive(true);
        setHasAnswered(false);
        hasAnsweredRef.current = false;
        setMySelectedIndex(null);
      }
    } finally {
      isSubmittingAnswerRef.current = false;
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
  const playerState = game.playerStates?.[currentPlayerSymbol];
  const opponentState = game.playerStates?.[currentPlayerSymbol === 'player1' ? 'player2' : 'player1'];
  
  // Validate player states exist
  if (!playerState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 bg-red-100 p-4 rounded">
          שגיאה: מצב השחקן לא נמצא. המשחק לא מוכן.
        </div>
      </div>
    );
  }

  // Check if both players answered (or we're briefly transitioning to the next question)
  const bothAnswered =
    isTransitioning ||
    (game.playerStates?.player1?.hasAnswered === true &&
      game.playerStates?.player2?.hasAnswered === true &&
      game.players?.player2 !== null &&
      game.players?.player2 !== undefined);
  
  // Validate currentWord structure
  if (game.status === 'active' && !currentWord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 bg-red-100 p-4 rounded">
          שגיאה: לא נמצאה שאלה. המשחק לא מוכן.
        </div>
      </div>
    );
  }
  
  if (game.status === 'active' && currentWord && (!currentWord.definitions || !currentWord.sentences)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 bg-red-100 p-4 rounded">
          שגיאה: מבנה השאלה לא תקין. אנא צור משחק חדש.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {error && (
        <div className="text-red-500 bg-red-100 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between w-full max-w-2xl" dir="rtl">
        <div className="text-center">
          <h3 className="font-bold text-blue-700">הניקוד שלך</h3>
          <p className="text-2xl font-extrabold">{playerState?.score || 0}</p>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-gray-700">סיבוב</h3>
          <p className="text-2xl font-extrabold">{Math.min((game.currentRound || 0) + 1, game.maxRounds)}/{game.maxRounds}</p>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-red-700">ניקוד יריב</h3>
          <p className="text-2xl font-extrabold">{opponentState?.score || 0}</p>
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

      {game.status === 'active' && currentWord && (() => {
        const questionType = currentWord.questionType || ((game.currentRound || 0) % 2 === 0 ? 'definition' : 'sentence');
        const options = questionType === 'definition' ? currentWord.definitions : currentWord.sentences;
        const canAnswer = !hasAnswered && game.status === 'active' && timeLeft > 0;
        return (
        <div className="w-full max-w-2xl space-y-6" dir="rtl">
          <div className="text-center">
            <div className="text-sm text-green-700 font-semibold mb-2">
              שניכם עונים במקביל — בחרו תשובה אחת
            </div>
            <h2 className="text-4xl font-extrabold mb-2 tracking-wide">{currentWord.word}</h2>
            <p className="text-gray-700 mb-3 font-medium">
              {questionType === 'definition' ? 'מה ההגדרה הנכונה למילה?' : 'איזה משפט משתמש במילה נכון?'}
            </p>
            <div className={`text-3xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : timeLeft <= 10 ? 'text-orange-500' : 'text-green-600'}`}>
              ⏰ {timeLeft}
            </div>
            {hasAnswered && !bothAnswered && !isTransitioning && (
              <div className="text-sm text-blue-700 mt-2 font-bold animate-pulse">ענית! מחכים ליריב...</div>
            )}
            {(bothAnswered || isTransitioning) && (
              <div className="text-sm text-green-700 mt-2 font-bold">
                {isTransitioning ? 'עוברים לשאלה הבאה...' : 'שניכם עניתם — עוברים הלאה...'}
              </div>
            )}
          </div>

          {feedbackMessage && (
            <div className={`p-4 rounded-xl border-2 text-center ${
              feedbackMessage.type === 'success'
                ? 'bg-green-50 border-green-400 text-green-800'
                : feedbackMessage.type === 'error'
                  ? 'bg-red-50 border-red-400 text-red-800'
                  : 'bg-blue-50 border-blue-400 text-blue-800'
            }`}>
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
                  key={`${questionType}-${index}`}
                  onClick={() => handleAnswer(questionType, index)}
                  disabled={!canAnswer}
                  className={`
                    w-full p-4 text-right rounded-xl transition-all duration-200 border-2 text-base sm:text-lg
                    ${!canAnswer ? 'cursor-not-allowed opacity-80' : 'hover:bg-blue-50 hover:border-blue-400 cursor-pointer'}
                    ${isMine
                      ? (game.lastMove?.isCorrect && game.lastMove?.player === currentPlayerSymbol
                          ? 'border-green-500 bg-green-50'
                          : 'border-blue-500 bg-blue-50')
                      : 'border-gray-200 bg-white'}
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
              onClick={() => (window.location.href = '/games/word-clash')}
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
        );
      })()}


      {game.status === 'finished' && (
        <div className="text-center bg-gradient-to-br from-purple-100 to-blue-100 p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            {game.winner === 'draw' ? "תיקו! 🤝" : 
             game.winner === currentPlayerSymbol ? 'ניצחת! 🎉' : 'הפסדת! 😔'}
          </h2>
          <div className="text-2xl mb-4">
            <p className="font-bold text-gray-800">ניקוד סופי:</p>
            <div className="flex justify-center gap-8 mt-2">
              <div>
                <span className="text-blue-600">אתה: </span>
                <span className="font-bold text-3xl">{playerState?.score || 0}</span>
              </div>
              <div>
                <span className="text-red-600">יריב: </span>
                <span className="font-bold text-3xl">{opponentState?.score || 0}</span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/games/word-clash'}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 transition"
            >
              חזרה למשחקים
            </button>
          </div>
        </div>
      )}

      {/* אימוג'י צף — שלך או של היריב */}
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

      {/* מערכת אימוג'ים */}
      {game && (
        <div className="w-full max-w-2xl mt-8 bg-white bg-opacity-90 rounded-lg shadow p-4" dir="rtl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">תגובות מהירות</h3>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={emojiSending}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-60"
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
                  className={`p-2 rounded-lg transition-all duration-200 ${reaction.color} hover:scale-110 disabled:opacity-50`}
                  title={reaction.name}
                >
                  <span className="text-2xl">{reaction.emoji}</span>
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 text-center">האימוג׳י נשלח ליריב בזמן אמת</p>
        </div>
      )}

      {/* קומפוננטת צ'אט */}
      {game && (
        <div className="w-full max-w-2xl mt-4 bg-white bg-opacity-80 rounded-lg shadow p-4" dir="rtl">
          <div className="h-40 overflow-y-auto mb-2 border-b pb-2">
            {game.chatMessages && Array.isArray(game.chatMessages) && game.chatMessages.length > 0 ? (
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
                  <div key={`${msg.timestamp}-${idx}`} className={`mb-1 text-sm ${mine ? 'text-blue-700 text-right' : 'text-gray-800 text-left'}`}>
                    <span className="font-bold">{mine ? 'את/ה' : 'יריב'}: </span>{msg.text}
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
                  setGame(data.game);
                } else {
                  const errorData = await response.json().catch(() => ({ error: 'שליחת ההודעה נכשלה' }));
                  setError(errorData.error || 'שליחת ההודעה נכשלה');
                  setChatInput(text);
                }
              } catch (err) {
                console.error('Error sending chat message:', err);
                setError('שליחת ההודעה נכשלה');
                setChatInput(text);
              }
            }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-400"
              placeholder="כתוב הודעה..."
              maxLength={500}
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