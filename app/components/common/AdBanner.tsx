'use client';

import { useSubscription } from '@/lib/useSubscription';
import { useState } from 'react';

interface AdBannerProps {
  adId?: string;
  className?: string;
}

export default function AdBanner({ adId = 'default', className = '' }: AdBannerProps) {
  const { isSubscribed, isLoading } = useSubscription();
  const [isVisible, setIsVisible] = useState(true);

  // אם המשתמש מנוי, לא מציגים פרסומות
  if (isLoading) {
    return <div className={`h-20 bg-gray-100 animate-pulse rounded-lg ${className}`}></div>;
  }

  if (isSubscribed) {
    return null; // לא מציגים פרסומות למנויים
  }

  if (!isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleAdClick = () => {
    // כאן נוסיף לוגיקה לפרסומות אמיתיות
    console.log('Ad clicked:', adId);
    // לדוגמה: window.open('https://example.com', '_blank');
  };

  return (
    <div className={`relative bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 ${className}`}>
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-white/70 hover:text-white text-xl leading-none"
        aria-label="סגור פרסומת"
      >
        ×
      </button>

      {/* Ad Content */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">
            🚀 שדרג למנוי ללא פרסומות!
          </h3>
          <p className="text-sm text-white/90 mb-2">
            נמאס לך מהפרסומות? קבל גישה לכל המשחקים ללא הפרעות
          </p>
          <button
            onClick={() => window.location.href = '/subscription'}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            התחל מנוי עכשיו
          </button>
        </div>
        <div className="ml-4">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🎮</span>
          </div>
        </div>
      </div>

      {/* Ad Label */}
      <div className="absolute bottom-1 right-1 text-xs text-white/60">
        פרסומת
      </div>
    </div>
  );
}
