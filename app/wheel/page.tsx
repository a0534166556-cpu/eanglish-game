'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WheelPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<{ type: string; amount?: number; id?: string; label: string } | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // טען inventory מה-localStorage
    const savedInventory = localStorage.getItem('quiz-inventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }

    // טען user מה-localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const rewards = [
    { type: 'coins', amount: 150, label: '150 מטבעות', color: '#FFD700', angle: 0 },
    { type: 'coins', amount: 300, label: '300 מטבעות', color: '#FFA500', angle: 60 },
    { type: 'diamonds', amount: 30, label: '30 יהלומים', color: '#00BFFF', angle: 120 },
    { type: 'xp', amount: 250, label: '250 XP', color: '#9370DB', angle: 180 },
    { type: 'tag', id: 'lucky_star', label: 'תג מיוחד ⭐', color: '#FF1493', angle: 240 },
    { type: 'avatar', id: 'lucky_avatar', label: 'אווטאר מיוחד 🎭', color: '#32CD32', angle: 300 },
  ];

  const spinWheel = async () => {
    if (isSpinning) return;
    
    // בדוק אם יש כרטיס גלגל
    const wheelCount = inventory['lucky_wheel'] || 0;
    if (wheelCount <= 0) {
      alert('אין לך כרטיסי גלגל מזל! קנה כרטיס בחנות כדי לסובב.');
      router.push('/shop');
      return;
    }

    setIsSpinning(true);
    setReward(null);

    // בחר פרס אקראי
    const selectedReward = rewards[Math.floor(Math.random() * rewards.length)];
    
    // חשב את הסיבוב (5 סיבובים מלאים + מיקום הפרס)
    const spins = 5; // מספר סיבובים
    const baseRotation = spins * 360;
    const rewardAngle = selectedReward.angle;
    const finalRotation = baseRotation + (360 - rewardAngle);
    
    // עדכן את הסיבוב
    setWheelRotation(prev => prev + finalRotation);

    // הורד כרטיס מהמלאי
    setInventory(prev => {
      const newInv = { ...prev, lucky_wheel: Math.max(0, (prev['lucky_wheel'] || 0) - 1) };
      localStorage.setItem('quiz-inventory', JSON.stringify(newInv));
      return newInv;
    });

    // המתן לסיום הסיבוב
    setTimeout(async () => {
      setIsSpinning(false);
      setReward(selectedReward);

      // עדכן את המשתמש במסד הנתונים
      if (user?.id) {
        try {
          // עדכן מטבעות/יהלומים/נקודות דרך API rewards/ad
          if (selectedReward.type === 'coins') {
            const response = await fetch('/api/rewards/ad', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                type: 'coins',
                amount: selectedReward.amount || 0
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.user) {
                setUser(prev => prev ? { ...prev, coins: data.user.coins } : null);
                const userStr = localStorage.getItem('user');
                if (userStr) {
                  const userObj = JSON.parse(userStr);
                  userObj.coins = data.user.coins;
                  localStorage.setItem('user', JSON.stringify(userObj));
                }
              }
            }
          } else if (selectedReward.type === 'diamonds') {
            const response = await fetch('/api/rewards/ad', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                type: 'diamonds',
                amount: selectedReward.amount || 0
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.user) {
                setUser(prev => prev ? { ...prev, diamonds: data.user.diamonds } : null);
                const userStr = localStorage.getItem('user');
                if (userStr) {
                  const userObj = JSON.parse(userStr);
                  userObj.diamonds = data.user.diamonds;
                  localStorage.setItem('user', JSON.stringify(userObj));
                }
              }
            }
          } else if (selectedReward.type === 'xp' || selectedReward.type === 'points') {
            const response = await fetch('/api/rewards/ad', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                type: 'points',
                amount: selectedReward.amount || 0
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.user) {
                setUser(prev => prev ? { ...prev, points: data.user.points } : null);
                const userStr = localStorage.getItem('user');
                if (userStr) {
                  const userObj = JSON.parse(userStr);
                  userObj.points = data.user.points;
                  localStorage.setItem('user', JSON.stringify(userObj));
                }
              }
            }
          }

          // אם זה תג או אווטאר, הוסף אותם למשתמש
          if (selectedReward.type === 'tag' && selectedReward.id) {
            await fetch('/api/user/buy-tag', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                tagId: selectedReward.id,
                price: 0 // חינם כי זה פרס
              })
            });
          } else if (selectedReward.type === 'avatar' && selectedReward.id) {
            await fetch('/api/user/buy-avatar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                avatarId: selectedReward.id,
                price: 0 // חינם כי זה פרס
              })
            });
          }
        } catch (error) {
          console.error('Error updating reward:', error);
        }
      }
    }, 3000); // 3 שניות לסיבוב
  };

  const wheelCount = inventory['lucky_wheel'] || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🎰 גלגל המזל</h1>
        <p className="text-gray-600 mb-6">סובב את הגלגל וזכה בפרסים מדהימים!</p>

        {/* מציג את מספר הכרטיסים */}
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
          <p className="text-xl font-bold text-white">
            כרטיסים ברשותך: <span className="text-3xl">{wheelCount}</span>
          </p>
        </div>

        {/* הגלגל */}
        <div className="relative mb-8 mx-auto" style={{ width: '300px', height: '300px' }}>
          {/* מחט קבועה */}
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20"
            style={{
              width: 0,
              height: 0,
              borderLeft: '20px solid transparent',
              borderRight: '20px solid transparent',
              borderTop: '50px solid #FF0000',
              marginTop: '-10px'
            }}
          />
          
          {/* הגלגל המסתובב */}
          <div
            className="relative w-full h-full rounded-full border-8 border-gray-800 overflow-hidden"
            style={{
              transform: `rotate(${wheelRotation}deg)`,
              background: `conic-gradient(
                from 0deg,
                #FFD700 0deg 60deg,
                #FFA500 60deg 120deg,
                #00BFFF 120deg 180deg,
                #9370DB 180deg 240deg,
                #FF1493 240deg 300deg,
                #32CD32 300deg 360deg
              )`,
              transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
            }}
          >
            {/* תוויות על הגלגל */}
            {rewards.map((reward, index) => (
              <div
                key={index}
                className="absolute text-white font-bold text-sm"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0',
                  transform: `rotate(${reward.angle + 30}deg) translateY(-140px)`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap'
                }}
              >
                {reward.label.split(' ')[0]}
              </div>
            ))}
          </div>

          {/* מרכז הגלגל */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full border-4 border-gray-800 flex items-center justify-center z-10 shadow-lg">
            <span className="text-3xl">🎰</span>
          </div>
        </div>

        {/* כפתור סיבוב */}
        <button
          onClick={spinWheel}
          disabled={isSpinning || wheelCount <= 0}
          className={`w-full py-4 px-6 rounded-lg text-xl font-bold text-white transition-all duration-200 ${
            isSpinning || wheelCount <= 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
          }`}
        >
          {isSpinning ? 'מסובב...' : wheelCount <= 0 ? 'אין כרטיסים' : '🎯 סובב את הגלגל!'}
        </button>

        {/* הצגת הפרס */}
        {reward && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg animate-pulse">
            <h2 className="text-2xl font-bold text-white mb-2">🎉 מזל טוב!</h2>
            <p className="text-xl text-white">{reward.label}</p>
          </div>
        )}

        {/* כפתור חזרה לחנות */}
        {wheelCount <= 0 && (
          <button
            onClick={() => router.push('/shop')}
            className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            🛒 קנה כרטיסים בחנות
          </button>
        )}

        {/* כפתור חזרה */}
        <button
          onClick={() => router.push('/shop')}
          className="mt-4 w-full py-2 px-6 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all duration-200"
        >
          ← חזרה לחנות
        </button>
      </div>
    </div>
  );
}

