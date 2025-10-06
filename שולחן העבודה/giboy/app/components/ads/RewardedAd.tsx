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
  const [showAd, setShowAd] = useState(false);
  const [adWatched, setAdWatched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleWatchAd = async () => {
    setIsLoading(true);
    setShowAd(true);
    
    // Simulate ad watching (in real implementation, this would be handled by AdSense)
    setTimeout(() => {
      setAdWatched(true);
      setShowAd(false);
      setIsLoading(false);
      
      // Give reward
      const reward = {
        type: rewardType,
        amount: rewardAmount
      };
      
      if (onReward) {
        onReward(reward);
      }
      
      // Update user's currency (this would be an API call in real implementation)
      console.log(`Reward given: ${rewardAmount} ${rewardType}`);
      
      // Reset after 30 seconds
      setTimeout(() => {
        setAdWatched(false);
      }, 30000);
    }, 3000);
  };

  if (showAd) {
    return (
      <div className={`rewarded-ad-container ${className}`}>
        <div className="ad-overlay">
          <div className="ad-content">
            <h3>צפו במודעה וקבלו 300 יהלומים!</h3>
            <p>אנא המתן... המודעה נטענת</p>
            <div className="loading-spinner"></div>
            <AdSense
              adSlot={testMode ? '5555666677' : (process.env.NEXT_PUBLIC_ADSENSE_REWARDED_VIDEO || '5555666677')}
              adFormat="fluid"
              adStyle={{ display: 'block', width: '100%', height: '400px' }}
              testMode={testMode}
            />
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

  return (
    <div className={`rewarded-ad-trigger ${className}`}>
      <div className="ad-prompt">
        <h3>🎬 צפו במודעה וקבלו פרס!</h3>
        <p>קבלו {rewardAmount} {rewardType === 'diamonds' ? 'יהלומים' : rewardType === 'coins' ? 'מטבעות' : 'נקודות'} בחינם!</p>
        <button
          onClick={handleWatchAd}
          disabled={isLoading}
          className="watch-ad-button"
        >
          {isLoading ? 'טוען...' : '🎥 צפו במודעה'}
        </button>
      </div>
    </div>
  );
}
