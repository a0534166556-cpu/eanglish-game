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
  const [showAd, setShowAd] = useState(true); // התחל ישר עם הפרסומת
  const [adWatched, setAdWatched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adProgress, setAdProgress] = useState(0);

  useEffect(() => {
    // התחל את הפרסומת אוטומטית
    if (showAd && !adWatched) {
      setIsLoading(true);
      
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
          
          // Give reward
          const reward = {
            type: rewardType,
            amount: rewardAmount
          };
          
          console.log('🎬 Ad watched completely, giving reward:', reward);
          
          if (onReward) {
            try {
              onReward(reward);
              console.log('✅ Reward callback executed successfully');
            } catch (error) {
              console.error('❌ Error in reward callback:', error);
            }
          } else {
            console.warn('⚠️ No reward callback provided');
          }
          
          console.log(`✅ Reward given: ${rewardAmount} ${rewardType}`);
        }
      }, interval);
      
      return () => clearInterval(progressInterval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAd, adWatched]);

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
            
            {/* AdSense Ad */}
            {process.env.NEXT_PUBLIC_ADSENSE_REWARDED_VIDEO ? (
              <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-4 min-h-[300px] flex items-center justify-center">
                <AdSense
                  adSlot={process.env.NEXT_PUBLIC_ADSENSE_REWARDED_VIDEO}
                  adFormat="fluid"
                  adStyle={{ display: 'block', width: '100%', height: '400px' }}
                  testMode={testMode}
                />
              </div>
            ) : (
              <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-4 min-h-[300px] flex items-center justify-center">
                <p className="text-white/80">טוען פרסומת...</p>
              </div>
            )}
            
            <p className="text-sm opacity-80">הפרסומת תסתיים אוטומטית בעוד כמה שניות...</p>
          </div>
        </div>
      </div>
    );
  }

  if (adWatched) {
    return (
      <div className={`reward-success ${className}`}>
        <div className="success-content">
          <h3>🎉 כל הכבוד!</h3>
          <p>קיבלת {rewardAmount} {rewardType === 'diamonds' ? 'יהלומים' : rewardType === 'coins' ? 'מטבעות' : 'נקודות'}!</p>
          <div className="reward-icon">
            {rewardType === 'diamonds' ? '💎' : rewardType === 'coins' ? '🪙' : '⭐'}
          </div>
        </div>
      </div>
    );
  }

  // אם הפרסומת כבר נצפתה, לא צריך להציג כלום
  return null;
}
