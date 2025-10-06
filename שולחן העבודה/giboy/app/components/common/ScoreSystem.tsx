'use client';

import { useState, useEffect } from 'react';

interface ScoreSystemProps {
  moves: number;
  onScoreUpdate: (score: number) => void;
}

export default function ScoreSystem({ moves, onScoreUpdate }: ScoreSystemProps) {
  const [score, setScore] = useState(1000);
  const [multiplier, setMultiplier] = useState(1);

  useEffect(() => {
    // עדכן את הניקוד בהתאם למספר המהלכים
    const newScore = Math.max(0, 1000 - (moves * 10));
    setScore(newScore);
    onScoreUpdate(newScore);

    // עדכן את המכפיל בהתאם לביצועים
    if (moves <= 12) {
      setMultiplier(3);
    } else if (moves <= 16) {
      setMultiplier(2);
    } else {
      setMultiplier(1);
    }
  }, [moves, onScoreUpdate]);

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">ניקוד</h3>
          <p className="text-2xl font-bold text-blue-500">{score}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">מכפיל</h3>
          <p className="text-2xl font-bold text-green-500">x{multiplier}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">ניקוד סופי</h3>
          <p className="text-2xl font-bold text-purple-500">{score * multiplier}</p>
        </div>
      </div>
    </div>
  );
} 