'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreSystem from '../../common/ScoreSystem';

interface Card {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const difficultyLevels = {
  easy: {
    pairs: 4,
    timeLimit: 120,
    scoreMultiplier: 1
  },
  medium: {
    pairs: 6,
    timeLimit: 90,
    scoreMultiplier: 2
  },
  hard: {
    pairs: 8,
    timeLimit: 60,
    scoreMultiplier: 3
  }
};

const allCards = [
  { id: 1, content: 'Hello', isFlipped: false, isMatched: false },
  { id: 2, content: 'שלום', isFlipped: false, isMatched: false },
  { id: 3, content: 'Goodbye', isFlipped: false, isMatched: false },
  { id: 4, content: 'להתראות', isFlipped: false, isMatched: false },
  { id: 5, content: 'Thank you', isFlipped: false, isMatched: false },
  { id: 6, content: 'תודה', isFlipped: false, isMatched: false },
  { id: 7, content: 'Please', isFlipped: false, isMatched: false },
  { id: 8, content: 'בבקשה', isFlipped: false, isMatched: false },
  { id: 9, content: 'Yes', isFlipped: false, isMatched: false },
  { id: 10, content: 'כן', isFlipped: false, isMatched: false },
  { id: 11, content: 'No', isFlipped: false, isMatched: false },
  { id: 12, content: 'לא', isFlipped: false, isMatched: false },
];

// אפקטים קוליים
const sounds = {
  flip: new Audio('/sounds/flip.mp3'),
  match: new Audio('/sounds/match.mp3'),
  win: new Audio('/sounds/win.mp3'),
  fail: new Audio('/sounds/fail.mp3'),
};

export default function MatchingPairsGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [showDifficultySelect, setShowDifficultySelect] = useState(true);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [showSolution, setShowSolution] = useState(false);

  const startGame = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(selectedDifficulty);
    const level = difficultyLevels[selectedDifficulty];
    const selectedCards = allCards.slice(0, level.pairs * 2);
    const shuffledCards = [...selectedCards]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, id: index + 1 }));
    setCards(shuffledCards);
    setIsPlaying(true);
    setShowDifficultySelect(false);
    setTime(0);
    setMoves(0);
    setGameComplete(false);
    setShowSolution(false);
  };

  useEffect(() => {
    // Load inventory from shop
    try {
      const inv = JSON.parse(localStorage.getItem('quiz-inventory') || '{}');
      setInventory(inv);
    } catch {}
  }, []);

  const useShopItem = (itemId: string) => {
    if (!inventory[itemId] || inventory[itemId] <= 0) return;
    setInventory(inv => {
      const newInv = { ...inv, [itemId]: inv[itemId] - 1 };
      localStorage.setItem('quiz-inventory', JSON.stringify(newInv));
      return newInv;
    });
    
    switch (itemId) {
      case 'show_solution':
        setShowSolution(true);
        // Hide solution after 5 seconds
        setTimeout(() => {
          setShowSolution(false);
        }, 5000);
        break;
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !gameComplete) {
      timer = setInterval(() => {
        setTime(prevTime => {
          if (prevTime >= difficultyLevels[difficulty].timeLimit) {
            setIsPlaying(false);
            setGameComplete(true);
            return prevTime;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, gameComplete, difficulty]);

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2 || cards.find(c => c.id === cardId)?.isFlipped) {
      return;
    }

    sounds.flip.play();
    const newCards = cards.map(card =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);
    setFlippedCards([...flippedCards, cardId]);
    setMoves(moves + 1);

    if (flippedCards.length === 1) {
      const firstCard = cards.find(c => c.id === flippedCards[0]);
      const secondCard = cards.find(c => c.id === cardId);

      if (!firstCard || !secondCard) {
        setFlippedCards([]);
        return;
      }

      if (firstCard.content === secondCard.content) {
        sounds.match.play();
        setTimeout(() => {
          setCards(cards.map(card =>
            card.id === firstCard.id || card.id === secondCard.id
              ? { ...card, isMatched: true }
              : card
          ));
          setFlippedCards([]);

          if (newCards.every(card => card.isMatched)) {
            sounds.win.play();
            setGameComplete(true);
            setIsPlaying(false);
          }
        }, 500);
      } else {
        sounds.fail.play();
        setTimeout(() => {
          setCards(cards.map(card =>
            card.id === firstCard.id || card.id === secondCard.id
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleScoreUpdate = (score: number) => {
    setFinalScore(score * difficultyLevels[difficulty].scoreMultiplier);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (showDifficultySelect) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6">בחר רמת קושי</h1>
          <div className="space-y-4">
            <button
              onClick={() => startGame('easy')}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 text-xl"
            >
              קל
            </button>
            <button
              onClick={() => startGame('medium')}
              className="w-full bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 text-xl"
            >
              בינוני
            </button>
            <button
              onClick={() => startGame('hard')}
              className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 text-xl"
            >
              קשה
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">אמת מילים - {difficulty === 'easy' ? 'קל' : difficulty === 'medium' ? 'בינוני' : 'קשה'}</h1>
          <div className="flex gap-4">
            <div className="bg-white rounded-lg px-6 py-3 shadow-lg">
              <span className="text-xl font-semibold">מהלכים: {moves}</span>
            </div>
            <div className="bg-white rounded-lg px-6 py-3 shadow-lg">
              <span className="text-xl font-semibold">זמן: {formatTime(time)}</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <ScoreSystem moves={moves} onScoreUpdate={handleScoreUpdate} />
        </div>

        {/* כפתור הצג פתרון */}
        {inventory['show_solution'] > 0 && !showSolution && (
          <div className="mb-4 text-center">
            <button
              onClick={() => useShopItem('show_solution')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              🎯 הצג פתרון ({inventory['show_solution']})
            </button>
          </div>
        )}

        {/* הצג פתרון */}
        {showSolution && (
          <div className="mb-4 bg-yellow-50 border-4 border-yellow-400 rounded-2xl px-6 py-4 text-lg font-bold text-yellow-900 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎯</span>
              <span>פתרון המשחק</span>
            </div>
            <div className="text-md">
              כל הקלפים מוצגים פתוחים למשך 5 שניות
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className={`aspect-square cursor-pointer ${
                card.isMatched ? 'opacity-50' : ''
              }`}
              onClick={() => !card.isMatched && handleCardClick(card.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="h-full w-full bg-white rounded-lg shadow-lg p-4 flex items-center justify-center text-2xl font-semibold"
                animate={{
                  rotateY: (card.isFlipped || showSolution) ? 180 : 0,
                }}
                transition={{ duration: 0.5 }}
              >
                <AnimatePresence>
                  {(card.isFlipped || showSolution) ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {card.content}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      ❓
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {gameComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-lg p-6 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">
              {time >= difficultyLevels[difficulty].timeLimit ? 'הזמן נגמר!' : 'כל הכבוד!'}
            </h2>
            <p className="text-xl mb-2">סיימת את המשחק ב-{moves} מהלכים</p>
            <p className="text-xl mb-2">זמן: {formatTime(time)}</p>
            <p className="text-xl mb-4">ניקוד סופי: {finalScore}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
              >
                שחק שוב
              </button>
              <button
                onClick={() => setShowDifficultySelect(true)}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
              >
                בחר רמת קושי חדשה
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 