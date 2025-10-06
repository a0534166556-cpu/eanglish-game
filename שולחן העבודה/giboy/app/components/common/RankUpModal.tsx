'use client';

import { useEffect, useState } from 'react';
import { RankInfo } from '@/lib/rankSystem';

interface RankUpModalProps {
  show: boolean;
  newRank: RankInfo;
  onClose: () => void;
}

export default function RankUpModal({ show, newRank, onClose }: RankUpModalProps) {
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
        className={`bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* אנימציית זיקוקים */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            עלית דרגה!
          </h2>
          <div className="text-6xl mb-4">{newRank.icon}</div>
        </div>

        {/* פרטי הדרגה */}
        <div className={`bg-gradient-to-r ${newRank.color} rounded-2xl p-6 mb-6 text-white text-center`}>
          <h3 className="text-4xl font-bold mb-2">{newRank.name}</h3>
          <p className="text-lg opacity-90">{newRank.description}</p>
        </div>

        {/* כפתור סגירה */}
        <button
          onClick={handleClose}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 text-lg"
        >
          מעולה! 🚀
        </button>
      </div>
    </div>
  );
}



