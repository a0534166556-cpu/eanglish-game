'use client';
import { useState, useEffect } from 'react';
import AdSense from './AdSense';

interface RewardedAdProps {
  onReward?: (reward: { type: string; amount: number }) => void;
  rewardType?: 'diamonds' | 'coins' | 'points';
  rewardAmount?: number;
  className?: string;
  testMode?: boolean;
}

export default function RewardedAd({
  onReward,
  rewardType = 'diamonds',
  rewardAmount = 300,
  className = '',
  testMode = false
}: RewardedAdProps) {
  const [showAd, setShowAd] = useState(false); // לא מתחיל אוטומטית - צריך לחיצה
  const [adWatched, setAdWatched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false); // מצב הצלחה זמני

  // בדיקה שהקומפוננטה נטענה
  useEffect(() => {
    console.log('RewardedAd component loaded', { rewardType, rewardAmount, onReward: !!onReward });
  }, []);

  // פונקציה שמתחילה את הפרסומת כשלוחצים על הכפתור
  const handleWatchAd = () => {
    setShowAd(true);
    setIsLoading(true);
    setAdProgress(0);
  };

  useEffect(() => {
    // התחל את הפרסומת רק אחרי שהמשתמש לחץ על הכפתור
    if (showAd && !adWatched && isLoading) {
      // Simulate ad watching (in real implementation, this would be handled by AdSense)
      // נדמה פרסומת של 5 שניות
      const duration = 5000; // 5 שניות
      const interval = 100; // עדכון כל 100ms
      let currentProgress = 0;
      
      const progressInterval = setInterval(() => {
        currentProgress += interval;
        const progressPercent = Math.min((currentProgress / duration) * 100, 100);
        setAdProgress(progressPercent);
        
        if (currentProgress >= duration) {
          clearInterval(progressInterval);
          setAdWatched(true);
          setShowAd(false);
          setIsLoading(false);
          setShowSuccess(true);
          
          // Give reward רק אחרי שהמשתמש באמת צפה בפרסומת
          const reward = {
            type: rewardType,
            amount: rewardAmount
          };
          
          if (onReward) {
            onReward(reward);
          }
          
          console.log(`Reward given: ${rewardAmount} ${rewardType}`);
          
          // אחרי 3 שניות, אפס הכל כדי לאפשר לחיצה נוספת
          setTimeout(() => {
            setShowSuccess(false);
            setAdWatched(false);
            setAdProgress(0);
            // הכפתור יהיה זמין שוב!
          }, 3000);
        }
      }, interval);
      
      return () => clearInterval(progressInterval);
    }
  }, [showAd, adWatched, isLoading, rewardType, rewardAmount, onReward]);

  if (showAd && !adWatched) {
    return (
      <div className={`rewarded-ad-container ${className}`}>
        <div className="ad-overlay bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="ad-content text-center">
            <h3 className="text-2xl font-bold mb-4">🎬 צפו בפרסומת</h3>
            <p className="text-lg mb-6">אנא המתן... הפרסומת נטענת</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-white bg-opacity-30 rounded-full h-4 mb-4">
              <div 
                className="bg-white h-4 rounded-full transition-all duration-100"
                style={{ width: `${adProgress}%` }}
              ></div>
            </div>
            <p className="text-sm mb-4">{Math.round(adProgress)}%</p>
            
            {/* AdSense or Simulated Ad */}
            <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-4 min-h-[300px] flex items-center justify-center">
              {testMode || !process.env.NEXT_PUBLIC_ADSENSE_REWARDED_VIDEO ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">📺</div>
                  <p className="text-lg">פרסומת דמו</p>
                  <p className="text-sm mt-2">בסביבת ייצור, כאן תוצג פרסומת אמיתית</p>
                </div>
              ) : (
                <AdSense
                  adSlot={process.env.NEXT_PUBLIC_ADSENSE_REWARDED_VIDEO || '5555666677'}
                  adFormat="fluid"
                  adStyle={{ display: 'block', width: '100%', height: '400px' }}
                  testMode={testMode}
                />
              )}
            </div>
            
            <p className="text-sm opacity-80">הפרסומת תסתיים אוטומטית בעוד כמה שניות...</p>
          </div>
        </div>
      </div>
    );
  }

  // הצג הודעת הצלחה זמנית (3 שניות) ואז חזור לכפתור
  if (showSuccess) {
    return (
      <div className={`reward-success ${className}`} style={{ 
        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
        borderRadius: '15px',
        padding: '25px',
        textAlign: 'center',
        color: 'white',
        margin: '20px 0',
        animation: 'bounceIn 0.6s ease'
      }}>
        <div className="success-content">
          <h3 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>🎉 כל הכבוד!</h3>
          <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
            קיבלת {rewardAmount} {rewardType === 'diamonds' ? 'יהלומים' : rewardType === 'coins' ? 'מטבעות' : 'נקודות'}!
          </p>
          <div className="reward-icon" style={{ fontSize: '4rem', marginBottom: '15px' }}>
            {rewardType === 'diamonds' ? '💎' : rewardType === 'coins' ? '🪙' : '⭐'}
          </div>
          <p style={{ fontSize: '1rem', opacity: 0.9 }}>הכפתור יהיה זמין שוב בעוד רגע...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rewarded-ad-trigger ${className}`} style={{ display: 'block', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div className="ad-prompt">
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px' }}>🎬 צפו במודעה וקבלו פרס!</h3>
        <p style={{ fontSize: '1.1rem', marginBottom: '25px' }}>קבלו {rewardAmount} {rewardType === 'diamonds' ? 'יהלומים' : rewardType === 'coins' ? 'מטבעות' : 'נקודות'} בחינם!</p>
        <button
          onClick={handleWatchAd}
          disabled={isLoading}
          className="watch-ad-button"
          style={{
            background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
            color: 'white',
            border: 'none',
            padding: '15px 40px',
            borderRadius: '30px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            opacity: isLoading ? 0.6 : 1,
            display: 'inline-block',
            minWidth: '200px'
          }}
        >
          {isLoading ? 'טוען...' : '🎥 צפו במודעה'}
        </button>
      </div>
    </div>
  );
}
