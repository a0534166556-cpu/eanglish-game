'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  reward: number;
  difficulty: string;
  xpReward: number;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  progressPercentage: number;
}

interface User {
  id: string;
  name: string;
  diamonds: number;
  coins: number;
}

export default function AchievementsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const categories = [
    { id: 'all', name: 'הכל', icon: '🏆' },
    { id: 'games', name: 'משחקים', icon: '🎮' },
    { id: 'streak', name: 'רצף', icon: '🔥' },
    { id: 'level', name: 'רמה', icon: '⭐' },
    { id: 'special', name: 'מיוחד', icon: '💎' },
    { id: 'easy', name: 'קל', icon: '🟢' },
    { id: 'medium', name: 'בינוני', icon: '🟡' },
    { id: 'hard', name: 'קשה', icon: '🟠' },
    { id: 'extreme', name: 'אקסטרים', icon: '🔴' }
  ];

  const categoryColors = {
    games: 'bg-blue-100 text-blue-800',
    streak: 'bg-red-100 text-red-800',
    level: 'bg-yellow-100 text-yellow-800',
    special: 'bg-purple-100 text-purple-800'
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    hard: 'bg-orange-100 text-orange-800 border-orange-300',
    extreme: 'bg-red-100 text-red-800 border-red-300'
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        
        // Fetch fresh data from database
        try {
          let response;
          if (userData.id) {
            response = await fetch(`/api/user/${userData.id}`);
          } else if (userData.email) {
            response = await fetch(`/api/admin/find-user?email=${userData.email}`);
          }
          
          if (response && response.ok) {
            const data = await response.json();
            const freshUserData = data.user || data;
            
            const updatedUser = {
              id: freshUserData.id || userData.id,
              name: freshUserData.name || userData.name,
              diamonds: freshUserData.diamonds ?? userData.diamonds ?? 100,
              coins: freshUserData.coins ?? userData.coins ?? 500
            };
            
            console.log('Achievements - Loaded fresh user data from database:', updatedUser);
            setUser(updatedUser);
            
            // Update localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return;
          }
        } catch (error) {
          console.error('Failed to fetch user data from database:', error);
        }
        
        // Fallback to localStorage
        setUser(userData);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      router.push('/login');
    }
  };

  const loadAchievements = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // סנכרן הישגים לפני טעינתם - זה יוודא שההתקדמות מעודכנת
      try {
        await fetch(`/api/achievements?userId=${user.id}&sync=true`);
      } catch (syncError) {
        console.error('Error syncing achievements:', syncError);
      }
      
      const response = await fetch(`/api/achievements?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
      } else {
        console.error('Failed to load achievements:', response.status);
        setAchievements([]);
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
      setAchievements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : ['easy', 'medium', 'hard', 'extreme'].includes(selectedCategory)
    ? achievements.filter(achievement => achievement.difficulty === selectedCategory)
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const completedCount = achievements.filter(a => a.isCompleted).length;
  const totalCount = achievements.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <div className="text-xl">טוען הישגים...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <div className="text-xl mb-4">נדרש להתחבר</div>
          <button 
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            התחבר
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">🏆 הישגים</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                <span className="text-yellow-600 mr-1">💎</span>
                <span className="font-bold text-yellow-800">{user.diamonds}</span>
              </div>
              <div className="flex items-center bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-orange-600 mr-1">🪙</span>
                <span className="font-bold text-orange-800">{user.coins}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/house')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              הבית שלי
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              פרופיל
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{completedCount}</div>
              <div className="text-gray-600">הישגים הושלמו</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{totalCount}</div>
              <div className="text-gray-600">סה"כ הישגים</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round((completedCount / totalCount) * 100)}%
              </div>
              <div className="text-gray-600">אחוז השלמה</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-white rounded-lg shadow-lg p-6 transition-all hover:shadow-xl border-2 ${
                achievement.isCompleted 
                  ? 'ring-2 ring-green-500' 
                  : difficultyColors[achievement.difficulty as keyof typeof difficultyColors]?.split(' ').pop() || 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{achievement.icon}</div>
                <div className="flex flex-col gap-1">
                  <div className={`px-2 py-1 rounded text-xs ${
                    categoryColors[achievement.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {achievement.category}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    difficultyColors[achievement.difficulty as keyof typeof difficultyColors] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {achievement.difficulty === 'easy' && '🟢 קל'}
                    {achievement.difficulty === 'medium' && '🟡 בינוני'}
                    {achievement.difficulty === 'hard' && '🟠 קשה'}
                    {achievement.difficulty === 'extreme' && '🔴 אקסטרים'}
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2">{achievement.name}</h3>
              <p className="text-gray-600 mb-4">{achievement.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>התקדמות</span>
                  <span>{achievement.progress} / {achievement.requirement}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${achievement.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-yellow-600">
                    <span className="text-sm mr-1">💎</span>
                    <span className="font-bold">{achievement.reward}</span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <span className="text-sm mr-1">⭐</span>
                    <span className="font-bold">{achievement.xpReward} XP</span>
                  </div>
                </div>
                {achievement.isCompleted && (
                  <div className="flex items-center text-green-600">
                    <span className="text-sm">✅</span>
                    <span className="text-sm">הושלם!</span>
                  </div>
                )}
              </div>

              {/* Claim Button - אם ההישג מושלם אבל לא נאסף */}
              {achievement.progress >= achievement.requirement && !achievement.isCompleted && (
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/achievements', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user?.id, achievementId: achievement.id })
                      });
                      if (response.ok) {
                        loadAchievements();
                        // עדכן את המשתמש
                        const userStr = localStorage.getItem('user');
                        if (userStr) {
                          const userData = JSON.parse(userStr);
                          const updatedResponse = await fetch(`/api/user/${userData.id}`);
                          if (updatedResponse.ok) {
                            const updatedData = await updatedResponse.json();
                            const updatedUser = updatedData.user || updatedData;
                            setUser({
                              ...user,
                              diamonds: updatedUser.diamonds,
                              coins: updatedUser.coins,
                              points: updatedUser.points
                            });
                            localStorage.setItem('user', JSON.stringify({
                              ...user,
                              diamonds: updatedUser.diamonds,
                              coins: updatedUser.coins,
                              points: updatedUser.points
                            }));
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error claiming achievement:', error);
                    }
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                >
                  🎁 קבל פרס
                </button>
              )}

              {/* Completion Date */}
              {achievement.completedAt && (
                <div className="mt-2 text-xs text-gray-500">
                  הושלם ב: {new Date(achievement.completedAt).toLocaleDateString('he-IL')}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-xl text-gray-600">אין הישגים בקטגוריה זו</div>
          </div>
        )}
      </div>
    </div>
  );
}
