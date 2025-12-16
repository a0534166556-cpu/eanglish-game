'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getRankByPoints, calculateTotalScore, calculateProgress, RANKS, RankInfo, calculateLevelProgress, canLevelUp } from '@/lib/rankSystem';
import RankUpModal from '@/app/components/common/RankUpModal';

interface UserData {
  id: string;
  name: string;
  email: string;
  gamesPlayed: number;
  gamesWon: number;
  level: number;
  points: number;
  isAdmin?: boolean;
  gameStat: Array<{
    id: string;
    gameName: string;
    gamesPlayed: number;
    gamesWon: number;
    averageScore: number;
  }>;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [ownedAvatars, setOwnedAvatars] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [ownedTags, setOwnedTags] = useState<string[]>([]);
  const [achievementsXP, setAchievementsXP] = useState<number>(0);
  const [completedAchievementsCount, setCompletedAchievementsCount] = useState<number>(0);
  
  // Debug state changes
  useEffect(() => {
    console.log('🔄 State changed - selectedAvatar:', selectedAvatar);
    console.log('🔄 State changed - ownedAvatars:', ownedAvatars);
    console.log('🔄 State changed - selectedTag:', selectedTag);
    console.log('🔄 State changed - ownedTags:', ownedTags);
  }, [selectedAvatar, ownedAvatars, selectedTag, ownedTags]);

  // Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, refreshing data...');
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const parsedUser = JSON.parse(userStr);
          fetchUserData(parsedUser.id);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  const [currentRank, setCurrentRank] = useState<RankInfo | null>(null);
  const [rankProgress, setRankProgress] = useState<number>(0);
  const [showRankUpModal, setShowRankUpModal] = useState(false);
  const [newRankInfo, setNewRankInfo] = useState<RankInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const AVATARS = [
    { id: 'default', icon: '👤', name: 'ברירת מחדל', free: true },
    { id: 'ninja', icon: '🥷', name: 'נינג\'ה' },
    { id: 'superhero', icon: '🦸', name: 'גיבור על' },
    { id: 'wizard', icon: '🧙', name: 'קוסם' },
    { id: 'detective', icon: '🕵️', name: 'בלש' },
    { id: 'scientist', icon: '🧑‍🔬', name: 'מדען' },
    { id: 'astronaut', icon: '🧑‍🚀', name: 'אסטרונאוט' },
    { id: 'pirate', icon: '🏴‍☠️', name: 'פיראט' },
    { id: 'prince', icon: '🤴', name: 'נסיך' },
    { id: 'princess', icon: '👸', name: 'נסיכה' },
    { id: 'robot', icon: '🤖', name: 'רובוט' },
  ];

  const TAGS = [
    { id: 'genius', icon: '🧠', name: 'גאון', color: 'bg-purple-500' },
    { id: 'champion', icon: '🏆', name: 'אלוף', color: 'bg-yellow-500' },
    { id: 'master', icon: '⭐', name: 'מאסטר', color: 'bg-blue-500' },
    { id: 'legend', icon: '👑', name: 'אגדה', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
    { id: 'explorer', icon: '🗺️', name: 'חוקר', color: 'bg-green-500' },
    { id: 'veteran', icon: '🎖️', name: 'ותיק', color: 'bg-red-500' },
  ];

  useEffect(() => {
    const loadUser = () => {
      console.log('🔄 Profile page loading - useEffect triggered');
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
            fetchUserData(parsedUser.id);
            
            // Load profile image from database
            fetch(`/api/user/${parsedUser.id}`)
              .then(response => response.json())
              .then(dbUser => {
                console.log('📊 Data from DB:', dbUser);
                
                if (dbUser.profileImage) {
                  setProfileImage(dbUser.profileImage);
                  localStorage.setItem('profile-img', dbUser.profileImage);
                }
                
                // טען אווטארים
                console.log('🎭 Loading avatars - avatarId:', dbUser.avatarId);
                console.log('🎭 Loading avatars - ownedAvatars:', dbUser.ownedAvatars);
                
                if (dbUser.avatarId) {
                  console.log('✅ Setting avatarId:', dbUser.avatarId);
                  setSelectedAvatar(dbUser.avatarId);
                }
                if (dbUser.ownedAvatars) {
                  try {
                    const avatars = JSON.parse(dbUser.ownedAvatars);
                    console.log('✅ Setting ownedAvatars:', avatars);
                    setOwnedAvatars(avatars);
                  } catch (e) {
                    console.error('❌ Error parsing ownedAvatars:', e);
                    setOwnedAvatars([]);
                  }
                } else {
                  console.log('⚠️ No ownedAvatars in DB, setting empty array');
                  setOwnedAvatars([]);
                }
                
                // טען תגים
                console.log('🏷️ Loading tags - selectedTag:', dbUser.selectedTag);
                console.log('🏷️ Loading tags - ownedTags:', dbUser.ownedTags);
                
                if (dbUser.selectedTag) {
                  console.log('✅ Setting selectedTag:', dbUser.selectedTag);
                  setSelectedTag(dbUser.selectedTag);
                }
                if (dbUser.ownedTags) {
                  try {
                    const tags = JSON.parse(dbUser.ownedTags);
                    console.log('✅ Setting ownedTags:', tags);
                    setOwnedTags(tags);
                  } catch (e) {
                    console.error('❌ Error parsing ownedTags:', e);
                    setOwnedTags([]);
                  }
                } else {
                  console.log('⚠️ No ownedTags in DB, setting empty array');
                  setOwnedTags([]);
                }
              })
              .catch(error => {
                console.error('Failed to load from database:', error);
                // Fallback to localStorage
                const savedImage = localStorage.getItem('profile-img');
                if (savedImage) {
                  setProfileImage(savedImage);
                }
              });
          } else {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error("Failed to load user from localStorage", error);
        router.push('/login');
      }
    };

    const timer = setTimeout(loadUser, 100);
    return () => clearTimeout(timer);
  }, [router]);

  const fetchUserData = async (userId: string) => {
    setIsProfileLoading(true);
    try {
      const response = await fetch(`/api/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        
        // עדכן אווטארים ותגים מה-DB
        if (data.avatarId) {
          console.log('✅ Setting avatarId from fetchUserData:', data.avatarId);
          setSelectedAvatar(data.avatarId);
        }
        if (data.ownedAvatars) {
          try {
            const avatars = typeof data.ownedAvatars === 'string' 
              ? JSON.parse(data.ownedAvatars) 
              : data.ownedAvatars;
            console.log('✅ Setting ownedAvatars from fetchUserData:', avatars);
            setOwnedAvatars(Array.isArray(avatars) ? avatars : []);
          } catch (e) {
            console.error('❌ Error parsing ownedAvatars in fetchUserData:', e);
            setOwnedAvatars([]);
          }
        } else {
          console.log('⚠️ No ownedAvatars in fetchUserData, keeping current state');
        }
        if (data.selectedTag) {
          console.log('✅ Setting selectedTag from fetchUserData:', data.selectedTag);
          setSelectedTag(data.selectedTag);
        }
        if (data.ownedTags) {
          try {
            const tags = typeof data.ownedTags === 'string' 
              ? JSON.parse(data.ownedTags) 
              : data.ownedTags;
            console.log('✅ Setting ownedTags from fetchUserData:', tags);
            setOwnedTags(Array.isArray(tags) ? tags : []);
          } catch (e) {
            console.error('❌ Error parsing ownedTags in fetchUserData:', e);
            setOwnedTags([]);
          }
        } else {
          console.log('⚠️ No ownedTags in fetchUserData, keeping current state');
        }
        
        // חשב דרגה נוכחית - רק לפי נקודות בסיסיות, לא כולל בונוסים
        // זה מבטיח שהדרגה תהיה הגיונית לפי הפעילות האמיתית
        const basePoints = data.points || 0;
        const rank = getRankByPoints(basePoints);
        const progress = calculateProgress(basePoints);
        
        setCurrentRank(rank);
        setRankProgress(progress);
        
        // טען הישגים כדי לחשב achievementsXP ומספר הישגים שהושלמו
        try {
          const achievementsResponse = await fetch(`/api/achievements?userId=${userId}`);
          if (achievementsResponse.ok) {
            const achievementsData = await achievementsResponse.json();
            const completedAchievements = achievementsData.achievements?.filter((a: any) => a.isCompleted) || [];
            const totalXP = completedAchievements.reduce((sum: number, a: any) => sum + (a.xpReward || 0), 0);
            setAchievementsXP(totalXP);
            setCompletedAchievementsCount(completedAchievements.length);
          }
        } catch (error) {
          console.error('Error loading achievements:', error);
        }
        
        // Update user state and localStorage with fresh data
        if (user) {
          const updatedUser = {
            ...user,
            diamonds: data.diamonds ?? user.diamonds,
            coins: data.coins ?? user.coins,
            points: data.points ?? user.points,
            level: data.level ?? user.level,
            rank: rank.id
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('Profile - Updated user data from database:', updatedUser);
          
          // עדכן רמה אוטומטית אם המשתמש עומד בדרישות
          try {
            await fetch('/api/user/update-rank', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id })
            });
            // רענן את הנתונים אחרי עדכון הרמה
            const refreshResponse = await fetch(`/api/user/${user.id}`);
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              setUserData(refreshData);
              if (refreshData.level !== data.level) {
                // אם הרמה השתנתה, רענן את הדף
                window.location.reload();
              }
            }
          } catch (error) {
            console.error('Error updating rank:', error);
          }
        }
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsProfileLoading(false);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('user');
      localStorage.removeItem('profile-img');
    }
    router.push('/');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('התמונה גדולה מדי. אנא בחרו תמונה קטנה מ-5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('אנא בחרו קובץ תמונה בלבד');
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        
        // שמור במסד נתונים MySQL
        try {
          const response = await fetch('/api/user/update-profile-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.id,
              profileImage: result
            })
          });
          
          if (response.ok) {
            // עדכן localStorage רק אחרי שמירה מוצלחת
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('profile-img', result);
            }
          }
        } catch (error) {
          console.error('Failed to save profile image:', error);
        }
        
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = async () => {
    setProfileImage(null);
    
    // מחק מהמסד נתונים
    try {
      await fetch('/api/user/update-profile-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          profileImage: null
        })
      });
    } catch (error) {
      console.error('Failed to remove profile image:', error);
    }
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('profile-img');
    }
  };

  const selectAvatar = async (avatarId: string) => {
    try {
      const response = await fetch('/api/user/select-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          avatarId: avatarId
        })
      });
      
      if (response.ok) {
        setSelectedAvatar(avatarId);
        // מחק תמונת פרופיל כשבוחרים אווטאר
        setProfileImage(null);
        localStorage.removeItem('profile-img');
      }
    } catch (error) {
      console.error('Failed to select avatar:', error);
    }
  };

  const selectTag = async (tagId: string | null) => {
    try {
      const response = await fetch('/api/user/select-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          tagId: tagId
        })
      });
      
      if (response.ok) {
        setSelectedTag(tagId);
      }
    } catch (error) {
      console.error('Failed to select tag:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div 
                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white font-bold cursor-pointer hover:opacity-80 transition-opacity duration-200 overflow-hidden"
                    onClick={handleImageClick}
                  >
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : selectedAvatar ? (
                      AVATARS.find(a => a.id === selectedAvatar)?.icon || '👤'
                    ) : (
                      user.name?.charAt(0) || '👤'
                    )}
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  {profileImage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                    {userData?.isAdmin && (
                      <span className="px-3 py-1 rounded-full text-white text-sm font-bold bg-gradient-to-r from-red-500 to-pink-600 flex items-center gap-1">
                        👑 מנהל
                      </span>
                    )}
                    {selectedTag && (
                      <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${TAGS.find(t => t.id === selectedTag)?.color || 'bg-gray-500'}`}>
                        {TAGS.find(t => t.id === selectedTag)?.icon} {TAGS.find(t => t.id === selectedTag)?.name}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500 mt-1">לחץ על התמונה כדי לשנות</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                התנתק
              </button>
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Rank Card - דרגת המשתמש */}
          {currentRank && (
            <div className={`bg-gradient-to-r ${currentRank.color} rounded-3xl shadow-2xl p-8 mb-8 text-white`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-7xl">{currentRank.icon}</div>
                  <div>
                    <h2 className="text-4xl font-bold mb-1">{currentRank.name}</h2>
                    <p className="text-lg opacity-90">{currentRank.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">התקדמות לדרגה הבאה</span>
                  <span className="text-sm font-bold">{rankProgress}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-white h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${rankProgress}%` }}
                  ></div>
                </div>
                {rankProgress < 100 && (
                  <p className="text-sm mt-2 opacity-75">
                    המשך לשחק ולזכות כדי להגיע לדרגה הבאה!
                  </p>
                )}
                {/* הסרת ההודעה "דרגה מקסימלית" - היא לא רלוונטית כי הדרגה והרמה הם שני דברים שונים */}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {userData?.gamesPlayed || 0}
              </div>
              <div className="text-gray-600">משחקים ששוחקו</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {userData?.gamesWon || 0}
              </div>
              <div className="text-gray-600">משחקים שניצחו</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {userData?.level || 1}
              </div>
              <div className="text-gray-600">רמה</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {userData?.points || 0}
              </div>
              <div className="text-gray-600">נקודות</div>
            </div>
          </div>

          {/* Level Requirements Section */}
          {userData && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                🎯 דרישות לרמה הבאה
              </h2>
              
              {(() => {
                const levelProgress = calculateLevelProgress({
                  points: userData.points,
                  gamesWon: userData.gamesWon,
                  gamesPlayed: userData.gamesPlayed,
                  level: userData.level,
                  achievementsXP: achievementsXP,
                  completedAchievementsCount: completedAchievementsCount
                });
                
                const canLevel = canLevelUp({
                  points: userData.points,
                  gamesWon: userData.gamesWon,
                  gamesPlayed: userData.gamesPlayed,
                  level: userData.level,
                  achievementsXP: achievementsXP,
                  completedAchievementsCount: completedAchievementsCount
                });

                return (
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-semibold">התקדמות לרמה {userData.level + 1}</span>
                        <span className="text-lg font-bold text-purple-600">{levelProgress.progress}%</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-6 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-6 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${levelProgress.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Requirements Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Points */}
                      <div className="bg-white rounded-xl p-4 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">נקודות</span>
                          <span className="text-sm font-bold text-blue-600">
                            {levelProgress.requirements.pointsNeeded} / {levelProgress.current.points}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (levelProgress.current.points / levelProgress.requirements.pointsNeeded) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Games Played */}
                      <div className="bg-white rounded-xl p-4 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">משחקים שוחקו</span>
                          <span className="text-sm font-bold text-green-600">
                            {levelProgress.requirements.gamesNeeded} / {levelProgress.current.games}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (levelProgress.current.games / levelProgress.requirements.gamesNeeded) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Games Won */}
                      <div className="bg-white rounded-xl p-4 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">משחקים שניצחו</span>
                          <span className="text-sm font-bold text-orange-600">
                            {levelProgress.requirements.winsNeeded} / {levelProgress.current.wins}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (levelProgress.current.wins / levelProgress.requirements.winsNeeded) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Achievements */}
                      <div className="bg-white rounded-xl p-4 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">הישגים</span>
                          <span className="text-sm font-bold text-purple-600">
                            {levelProgress.requirements.achievementsNeeded} / {levelProgress.current.achievements}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (levelProgress.current.achievements / levelProgress.requirements.achievementsNeeded) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Level Up Message */}
                    {canLevel && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border-2 border-green-300">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🎉</span>
                          <span className="text-lg font-bold text-green-800">
                            אתה יכול לעלות לרמה {userData.level + 1}!
                          </span>
                        </div>
                        <p className="text-green-700 mb-3">
                          כל הדרישות מולאו! לחץ על הכפתור כדי לעלות רמה.
                        </p>
                        <button
                          onClick={async () => {
                            try {
                              console.log('🔄 [profile] Level up button clicked');
                              const response = await fetch('/api/user/update-rank', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: user?.id })
                              });
                              
                              if (response.ok) {
                                const data = await response.json();
                                console.log('📊 [profile] Update rank response:', data);
                                
                                if (data.levelUp) {
                                  // רענן את הנתונים
                                  if (user?.id) {
                                    await fetchUserData(user.id);
                                  }
                                  // הצג הודעה
                                  alert(`🎉 עלית לרמה ${data.level}!`);
                                  // רענן את הדף
                                  window.location.reload();
                                } else {
                                  console.warn('⚠️ [profile] Level up returned false:', data);
                                  alert(`לא ניתן לעלות רמה. בדוק את הקונסול (F12) לפרטים נוספים.`);
                                }
                              } else {
                                const errorText = await response.text();
                                console.error('❌ [profile] Update rank failed:', errorText);
                                alert(`שגיאה בעליית רמה: ${errorText}`);
                              }
                            } catch (error) {
                              console.error('❌ [profile] Error leveling up:', error);
                              alert('שגיאה בעליית רמה. נסה שוב.');
                            }
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
                        >
                          ⬆️ עלה לרמה {userData.level + 1}
                        </button>
                      </div>
                    )}

                    {/* Difficulty Info */}
                    <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">⚠️</span>
                        <span className="font-semibold text-yellow-800">מידע חשוב</span>
                      </div>
                      <p className="text-yellow-700 text-sm">
                        ככל שהרמה גבוהה יותר, הדרישות גדלות באופן אקספוננציאלי. 
                        רמה {userData.level + 1} דורשת {Math.floor(100 * Math.pow(1.5, userData.level))} נקודות, 
                        {Math.floor(5 * Math.pow(1.5, userData.level))} משחקים, 
                        {Math.floor(3 * Math.pow(1.5, userData.level))} ניצחונות ו-
                        {Math.floor(2 * Math.pow(1.5, userData.level))} הישגים.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Avatars Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              🎭 בחר אווטאר
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
              {AVATARS.map((avatar) => {
                const isOwned = avatar.free || ownedAvatars.includes(avatar.id);
                const isSelected = selectedAvatar === avatar.id;
                
                // Debug logging
                console.log(`🎭 Avatar ${avatar.id}:`, {
                  isOwned,
                  isSelected,
                  ownedAvatars,
                  selectedAvatar
                });
                
                return (
                  <button
                    key={avatar.id}
                    onClick={() => isOwned && selectAvatar(avatar.id)}
                    disabled={!isOwned}
                    className={`p-4 rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-br from-green-400 to-green-600 ring-4 ring-green-300 scale-110'
                        : isOwned
                        ? 'bg-gradient-to-br from-blue-400 to-purple-500 hover:scale-110'
                        : 'bg-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-5xl mb-2">{avatar.icon}</div>
                    <div className="text-xs text-white font-bold">{avatar.name}</div>
                    {!isOwned && (
                      <div className="text-xs text-gray-600 mt-1">🔒</div>
                    )}
                    {isSelected && (
                      <div className="text-xs text-white mt-1">✅</div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              💡 קנה אווטארים נוספים בחנות!
            </p>
          </div>

          {/* Tags Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              🏷️ בחר תג ייחודי
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* כפתור ללא תג */}
              <button
                onClick={() => selectTag(null)}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  !selectedTag
                    ? 'bg-gradient-to-br from-green-400 to-green-600 ring-4 ring-green-300 scale-105'
                    : 'bg-gradient-to-br from-gray-300 to-gray-400 hover:scale-105'
                }`}
              >
                <div className="text-3xl mb-2">🚫</div>
                <div className="text-sm text-white font-bold">ללא תג</div>
                {!selectedTag && (
                  <div className="text-xs text-white mt-1">✅</div>
                )}
              </button>
              
              {TAGS.map((tag) => {
                const isOwned = ownedTags.includes(tag.id);
                const isSelected = selectedTag === tag.id;
                
                // Debug logging
                console.log(`🏷️ Tag ${tag.id}:`, {
                  isOwned,
                  isSelected,
                  ownedTags,
                  selectedTag
                });
                
                return (
                  <button
                    key={tag.id}
                    onClick={() => isOwned && selectTag(tag.id)}
                    disabled={!isOwned}
                    className={`p-4 rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'ring-4 ring-green-300 scale-105 ' + tag.color
                        : isOwned
                        ? tag.color + ' hover:scale-105'
                        : 'bg-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-3xl mb-2">{tag.icon}</div>
                    <div className="text-sm text-white font-bold">{tag.name}</div>
                    {!isOwned && (
                      <div className="text-xs text-gray-600 mt-1">🔒 300 מטבעות</div>
                    )}
                    {isSelected && (
                      <div className="text-xs text-white mt-1">✅</div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              💡 קנה תגים נוספים בחנות! התג יופיע ליד השם שלך.
            </p>
          </div>

          {/* Game Stats */}
          {isProfileLoading ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">טוען סטטיסטיקות...</p>
            </div>
          ) : userData && userData.gameStat && userData.gameStat.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">סטטיסטיקות משחקים</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userData.gameStat.map((stat) => (
                  <div key={stat.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                      {stat.gameName.replace('-', ' ')}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">משחקים:</span>
                        <span className="font-semibold">{stat.gamesPlayed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ניצחונות:</span>
                        <span className="font-semibold">{stat.gamesWon}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ממוצע נקודות:</span>
                        <span className="font-semibold">{Math.round(stat.averageScore)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">עדיין אין סטטיסטיקות</h2>
              <p className="text-gray-600 mb-6">שחקו משחק כדי לראות את הביצועים שלכם!</p>
              <Link
                href="/games"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
              >
                התחילו לשחק
              </Link>
            </div>
          )}

          {/* Refresh Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                const userStr = localStorage.getItem('user');
                if (userStr) {
                  const parsedUser = JSON.parse(userStr);
                  fetchUserData(parsedUser.id);
                }
              }}
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-bold"
            >
              🔄 רענן נתונים
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/games"
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">משחקים</h3>
              <p className="text-gray-600">התחילו לשחק עכשיו</p>
            </Link>
            <Link
              href="/level-select"
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">רמות</h3>
              <p className="text-gray-600">בחרו רמה מתאימה</p>
            </Link>
            <Link
              href="/learned-words"
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">מילים נלמדות</h3>
              <p className="text-gray-600">צפו בכל המילים שלמדתם</p>
            </Link>
            <Link
              href="/shop"
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">חנות</h3>
              <p className="text-gray-600">קנו פריטים מיוחדים</p>
            </Link>
          </div>

          {/* Admin Actions - רק למנהלים */}
          {userData?.isAdmin && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                👑 פעולות מנהל
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                  href="/admin/bug-reports"
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="text-4xl mb-4">🐛</div>
                  <h3 className="text-lg font-semibold mb-2">דיווחי באגים</h3>
                  <p className="text-red-100">נהל דיווחי בעיות מהמשתמשים</p>
                </Link>
                <Link
                  href="/admin/dashboard"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold mb-2">לוח בקרה</h3>
                  <p className="text-blue-100">סטטיסטיקות ונתונים כלליים</p>
                </Link>
                <Link
                  href="/admin/users"
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold mb-2">ניהול משתמשים</h3>
                  <p className="text-green-100">צפה וטפל במשתמשים</p>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rank Up Modal */}
      {newRankInfo && (
        <RankUpModal
          show={showRankUpModal}
          newRank={newRankInfo}
          onClose={() => setShowRankUpModal(false)}
        />
      )}
    </div>
  );
} 