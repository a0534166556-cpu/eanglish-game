'use client';

import { useState, useEffect } from 'react';

interface LevelUpModalProps {
  show: boolean;
  newLevel: number;
  oldLevel: number;
  onClose: () => void;
}

export default function LevelUpModal({ show, newLevel, oldLevel, onClose }: LevelUpModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // סגור אוטומטית אחרי 5 שניות
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // המתן לאנימציה להסתיים
  };

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300 ${
        isVisible ? 'bg-opacity-70' : 'bg-opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-gradient-to-br from-purple-100 via-blue-50 to-purple-100 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-purple-400 transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          {/* אנימציה של כוכבים */}
          <div className="text-8xl mb-4 animate-bounce">
            ⭐
          </div>
          
          {/* כותרת */}
          <h2 className="text-4xl font-bold text-gray-800 mb-2 animate-pulse">
            כל הכבוד!
          </h2>
          
          {/* הודעה */}
          <p className="text-2xl text-gray-700 mb-6">
            עברת שלב לרמה {newLevel}!
          </p>
          
          {/* רמה קודמת וחדשה */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300">
              <div className="text-sm text-gray-600 mb-1">רמה קודמת</div>
              <div className="text-3xl font-bold text-gray-700">{oldLevel}</div>
            </div>
            <div className="text-4xl text-purple-600 animate-pulse">→</div>
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-4 shadow-lg border-2 border-purple-400">
              <div className="text-sm text-white mb-1 opacity-90">רמה חדשה</div>
              <div className="text-3xl font-bold text-white">{newLevel}</div>
            </div>
          </div>
          
          {/* כפתור סגירה */}
          <button
            onClick={handleClose}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 px-8 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg transform hover:scale-105"
          >
            המשך
          </button>
        </div>
      </div>
    </div>
  );
}




