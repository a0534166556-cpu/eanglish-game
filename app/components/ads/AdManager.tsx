'use client';
import { useState, useEffect } from 'react';
import BannerAd from './BannerAd';
import RewardedAd from './RewardedAd';

interface AdStats {
  impressions: number;
  clicks: number;
  earnings: number;
}

interface AdManagerProps {
  showBanner?: boolean;
  showRewarded?: boolean;
  bannerPosition?: 'top' | 'bottom' | 'sidebar';
  testMode?: boolean;
}

export default function AdManager({
  showBanner = true,
  showRewarded = false,
  bannerPosition = 'top',
  testMode = false
}: AdManagerProps) {
  const [adStats, setAdStats] = useState<AdStats>({
    impressions: 0,
    clicks: 0,
    earnings: 0
  });

  const [userRewards, setUserRewards] = useState({
    diamonds: 0,
    coins: 0,
    points: 0
  });

  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Load ad stats from localStorage
      const savedStats = localStorage.getItem('adStats');
      if (savedStats) {
        setAdStats(JSON.parse(savedStats));
      }

      // Load user rewards from localStorage
      const savedRewards = localStorage.getItem('userRewards');
      if (savedRewards) {
        setUserRewards(JSON.parse(savedRewards));
      }
    } catch (error) {
      console.error('Error loading ad data from localStorage:', error);
    }
  }, []);

  const handleReward = async (reward: { type: string; amount: number }) => {
    // Get user ID from localStorage
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!userStr) {
      console.error('User not found in localStorage');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const userId = user.id;

      if (!userId) {
        console.error('User ID not found');
        return;
      }

      // Update database through API
      const response = await fetch('/api/rewards/ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type: reward.type,
          amount: reward.amount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update reward:', errorData);
        return;
      }

      const data = await response.json();
      
      // Update local state only if API call succeeded
      setUserRewards(prev => {
        const updated = {
          ...prev,
          [reward.type]: prev[reward.type as keyof typeof prev] + reward.amount
        };
        
        // Save to localStorage with updated values
        localStorage.setItem('userRewards', JSON.stringify(updated));
        
        return updated;
      });

      // Update user in localStorage with new values from database
      if (data.user) {
        const updatedUser = {
          ...user,
          diamonds: data.user.diamonds,
          coins: data.user.coins,
          points: data.user.points
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Trigger user update event for other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
        }
      }

      // Update ad stats
      setAdStats(prev => ({
        ...prev,
        impressions: prev.impressions + 1
      }));

      localStorage.setItem('adStats', JSON.stringify({
        ...adStats,
        impressions: adStats.impressions + 1
      }));

      console.log('✅ Reward updated successfully:', data);
    } catch (error) {
      console.error('Error updating reward:', error);
    }
  };

  return (
    <div className="ad-manager">
      {/* Banner Ad */}
      {showBanner && (
        <BannerAd 
          position={bannerPosition}
          testMode={testMode}
        />
      )}

      {/* Rewarded Ad */}
      {showRewarded && (
        <RewardedAd
          onReward={handleReward}
          testMode={testMode}
        />
      )}

      {/* Ad Stats (only in test mode) */}
      {testMode && (
        <div className="ad-stats">
          <h4>📊 סטטיסטיקות מודעות (מצב בדיקה)</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">צפיות:</span>
              <span className="stat-value">{adStats.impressions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">לחיצות:</span>
              <span className="stat-value">{adStats.clicks}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">הכנסות:</span>
              <span className="stat-value">${adStats.earnings.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* User Rewards */}
      {userRewards.diamonds > 0 || userRewards.coins > 0 || userRewards.points > 0 ? (
        <div className="user-rewards">
          <h4>🎁 הפרסים שלכם</h4>
          <div className="rewards-grid">
            {userRewards.diamonds > 0 && (
              <div className="reward-item">
                <span className="reward-icon">💎</span>
                <span className="reward-value">{userRewards.diamonds}</span>
              </div>
            )}
            {userRewards.coins > 0 && (
              <div className="reward-item">
                <span className="reward-icon">🪙</span>
                <span className="reward-value">{userRewards.coins}</span>
              </div>
            )}
            {userRewards.points > 0 && (
              <div className="reward-item">
                <span className="reward-icon">⭐</span>
                <span className="reward-value">{userRewards.points}</span>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
