'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const COLORS = [
  { name: 'אדום', english: 'red', color: '#EF4444', emoji: '🔴' },
  { name: 'כחול', english: 'blue', color: '#3B82F6', emoji: '🔵' },
  { name: 'ירוק', english: 'green', color: '#10B981', emoji: '🟢' },
  { name: 'צהוב', english: 'yellow', color: '#FBBF24', emoji: '🟡' },
  { name: 'כתום', english: 'orange', color: '#F97316', emoji: '🟠' },
  { name: 'סגול', english: 'purple', color: '#A855F7', emoji: '🟣' },
  { name: 'ורוד', english: 'pink', color: '#EC4899', emoji: '💗' },
  { name: 'חום', english: 'brown', color: '#92400E', emoji: '🟤' },
];

interface Balloon {
  id: number;
  color: typeof COLORS[0];
  x: number;
  y: number;
  speed: number;
}

export default function ColorsBalloonsGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [targetColor, setTargetColor] = useState<typeof COLORS[0] | null>(null);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<typeof COLORS[0][]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [balloonIdCounter, setBalloonIdCounter] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const createBalloonRef = useRef<() => void>(() => {});
  const lastFeedbackRef = useRef<string | null>(null); // Track last feedback to prevent duplicates

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setMissed([]);
    setTimeLeft(60);
    setBalloons([]);
    setBalloonIdCounter(0);
    lastFeedbackRef.current = null; // Reset feedback tracking
    selectNewTargetColor();
  };

  // Select random target color (different from current)
  const selectNewTargetColor = () => {
    let randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    // Make sure we don't select the same color twice in a row
    while (randomColor.english === targetColor?.english && COLORS.length > 1) {
      randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    setTargetColor(randomColor);
    
    // Speak the color
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(randomColor.english);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Create new balloon function
  useEffect(() => {
    createBalloonRef.current = () => {
      if (!gameAreaRef.current || !gameStarted || gameOver) return;
      
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const gameWidth = gameAreaRef.current.clientWidth;
      const maxX = Math.max(0, gameWidth - 80);
      
      setBalloonIdCounter(prev => {
        const newId = prev;
        const newBalloon: Balloon = {
          id: newId,
          color: randomColor,
          x: Math.random() * maxX,
          y: -100,
          speed: 1.5 + Math.random() * 1.5,
        };
        setBalloons(balloons => [...balloons, newBalloon]);
        return prev + 1;
      });
    };
  }, [gameStarted, gameOver]);

  // Pop balloon
  const popBalloon = (balloonId: number) => {
    setBalloons(prev => {
      const balloon = prev.find(b => b.id === balloonId);
      if (!balloon) return prev;
      
      const isCorrect = balloon.color.english === targetColor?.english;
      const feedbackKey = isCorrect ? 'correct' : 'wrong';
      
      // Only play feedback if it's different from last feedback
      if (lastFeedbackRef.current !== feedbackKey) {
        lastFeedbackRef.current = feedbackKey;
        
        if (isCorrect) {
          // Correct color!
          setScore(prev => prev + 10);
          
          // Play success sound (only once)
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance('Great job!');
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.3;
            window.speechSynthesis.speak(utterance);
          }
          
          // Select new target color
          setTimeout(() => {
            selectNewTargetColor();
            lastFeedbackRef.current = null; // Reset after new color is selected
          }, 500);
        } else {
          // Wrong color - no points but still pop
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance('Try again!');
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
          }
        }
      } else if (isCorrect) {
        // Same feedback but correct - just add score without speaking
        setScore(prev => prev + 10);
      }
      
      // Remove balloon immediately instead of marking as popped
      return prev.filter(b => b.id !== balloonId);
    });
  };

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Create balloons periodically
    const balloonInterval = setInterval(() => {
      if (gameStarted && !gameOver) {
        createBalloonRef.current();
      }
    }, 1500);

    // Timer countdown
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          setGameStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Animation loop
    const animate = () => {
      if (!gameAreaRef.current || !gameStarted || gameOver) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }
      
      setBalloons(prev => {
        if (prev.length === 0) return prev;
        
        const gameHeight = gameAreaRef.current?.clientHeight || 600;
        
        // Update positions and filter out balloons that reached the ground
        const updatedBalloons = prev
          .map(balloon => {
            const newY = balloon.y + balloon.speed;
            
            // Check if balloon reached the ground
            if (newY > gameHeight - 100) {
              // Balloon reached ground - missed!
              if (balloon.color.english === targetColor?.english) {
                setMissed(prevMissed => {
                  // Only add if not already in the list
                  if (!prevMissed.find(c => c.english === balloon.color.english)) {
                    return [...prevMissed, balloon.color];
                  }
                  return prevMissed;
                });
              }
              return null; // Mark for removal
            }
            
            // Update position
            return { ...balloon, y: newY };
          })
          .filter((balloon): balloon is Balloon => balloon !== null);
        
        return updatedBalloons;
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(balloonInterval);
      clearInterval(timerInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [gameStarted, gameOver, targetColor]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-300 to-purple-400 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            🎈 בלונים וצבעים 🎈
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold">
            פוצץ את הבלון עם הצבע הנכון!
          </p>
        </div>

        {!gameStarted && !gameOver && (
          <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="text-8xl mb-6 animate-bounce">🎈</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              משחק בלונים וצבעים
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              פוצץ את הבלונים עם הצבע שהמשחק מבקש!
              <br />
              יש לך 60 שניות - כמה בלונים תוכל לפוצץ? 🎯
            </p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-12 py-6 rounded-full text-2xl md:text-3xl font-bold shadow-2xl hover:scale-105 transition-all duration-200 animate-pulse"
            >
              התחל משחק! 🚀
            </button>
          </div>
        )}

        {gameStarted && !gameOver && (
          <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-6 md:p-8">
            {/* Game Info */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full text-2xl font-bold shadow-lg">
                  ⭐ {score}
                </div>
                <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
                  ⏰ {timeLeft} שניות
                </div>
              </div>
              
              {/* Target Color - Only English text, no visual color */}
              {targetColor && (
                <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-2xl border-4 border-purple-300">
                  <div className="text-4xl">🎯</div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-800 mb-1">
                      Find the color:
                    </div>
                    <div className="text-4xl font-extrabold text-purple-700">
                      {targetColor.english}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Game Area */}
            <div
              ref={gameAreaRef}
              className="relative w-full h-[500px] md:h-[600px] bg-gradient-to-b from-sky-200 via-blue-100 to-green-100 rounded-2xl overflow-hidden border-4 border-blue-300 shadow-inner"
              style={{ position: 'relative' }}
            >
              {/* Ground */}
              <div className="absolute bottom-0 w-full h-20 bg-gradient-to-b from-green-400 to-green-600 border-t-4 border-green-700">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-xl font-bold">ריצפה</div>
                </div>
              </div>

              {/* Balloons */}
              {balloons.map(balloon => (
                <div
                  key={balloon.id}
                  onClick={() => popBalloon(balloon.id)}
                  className="absolute cursor-pointer hover:scale-110 transition-transform duration-200"
                  style={{
                    left: `${balloon.x}px`,
                    top: `${balloon.y}px`,
                  }}
                >
                  <div className="relative">
                    {/* Balloon */}
                    <div
                      className="w-16 h-20 rounded-full shadow-lg border-2 border-white animate-bounce-slow"
                      style={{
                        backgroundColor: balloon.color.color,
                        clipPath: 'ellipse(50% 60% at 50% 50%)',
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">
                        {balloon.color.emoji}
                      </div>
                    </div>
                    {/* String */}
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-400"
                      style={{ marginTop: '-2px' }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Instructions */}
              <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
                <div className="text-sm font-bold text-gray-700">
                  לחץ על הבלון עם הצבע הנכון!
                </div>
              </div>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              המשחק נגמר!
            </h2>
            
            {/* Final Score */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-6 rounded-2xl mb-8 inline-block shadow-2xl">
              <div className="text-4xl font-bold">ניקוד סופי: {score}</div>
            </div>

            {/* Missed Colors */}
            {missed.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  צבעים שלא הצלחת לפוצץ:
                </h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {missed.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gradient-to-r from-red-100 to-pink-100 p-4 rounded-xl border-2 border-red-300"
                    >
                      <div className="text-3xl">{color.emoji}</div>
                      <div>
                        <div className="text-lg font-bold text-gray-800">
                          {color.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {color.english}
                        </div>
                      </div>
                      <div
                        className="w-12 h-12 rounded-full shadow-md border-2 border-white"
                        style={{ backgroundColor: color.color }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message */}
            {missed.length === 0 && (
              <div className="mb-8">
                <div className="text-6xl mb-4">🌟</div>
                <div className="text-2xl font-bold text-green-600">
                  כל הכבוד! פוצצת את כל הבלונים! 🎊
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:scale-105 transition-all duration-200"
              >
                שחק שוב! 🔄
              </button>
              <Link href="/games/kids">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:scale-105 transition-all duration-200">
                  חזרה למשחקים ←
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.05);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
      `}</style>
    </main>
  );
}

