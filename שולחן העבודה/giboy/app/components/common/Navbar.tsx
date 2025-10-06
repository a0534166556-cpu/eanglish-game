'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSubscription } from '@/lib/useSubscription';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [diamonds, setDiamonds] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const { isSubscribed, isAdmin } = useSubscription();

  const AVATARS: {[key: string]: string} = {
    'default': '👤',
    'ninja': '🥷',
    'superhero': '🦸',
    'wizard': '🧙',
    'detective': '🕵️',
    'scientist': '🧑‍🔬',
    'astronaut': '🧑‍🚀',
    'pirate': '🏴‍☠️',
    'prince': '🤴',
    'princess': '👸',
    'robot': '🤖',
  };

  const TAGS: {[key: string]: {icon: string, name: string, color: string}} = {
    'genius': { icon: '🧠', name: 'גאון', color: 'bg-purple-500' },
    'champion': { icon: '🏆', name: 'אלוף', color: 'bg-yellow-500' },
    'master': { icon: '⭐', name: 'מאסטר', color: 'bg-blue-500' },
    'legend': { icon: '👑', name: 'אגדה', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
    'explorer': { icon: '🗺️', name: 'חוקר', color: 'bg-green-500' },
    'veteran': { icon: '🎖️', name: 'ותיק', color: 'bg-red-500' },
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const parsedUser = JSON.parse(userStr);
            
            // Check if this is the admin user and fetch fresh data
            if (parsedUser.email === 'a0534166556@gmail.com') {
              try {
                const response = await fetch(`/api/admin/find-user?email=${parsedUser.email}`);
                if (response.ok) {
                  const data = await response.json();
                  if (data.user) {
                    const updatedUser = { ...parsedUser, ...data.user };
                    setUser(updatedUser);
                    setDiamonds(updatedUser.diamonds || 100);
                    setCoins(updatedUser.coins || 500);
                    setAvatarId(updatedUser.avatarId || null);
                    setSelectedTag(updatedUser.selectedTag || null);
                    // Update localStorage with fresh data
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    console.log('Navbar admin user updated:', updatedUser);
                    return;
                  }
                }
              } catch (error) {
                console.error('Failed to fetch admin user data:', error);
              }
            }
            
            setUser(parsedUser);
            setDiamonds(parsedUser.diamonds || 100);
            setCoins(parsedUser.coins || 500);
            setAvatarId(parsedUser.avatarId || null);
            setSelectedTag(parsedUser.selectedTag || null);
            console.log('Navbar user:', parsedUser);
          }
          const img = localStorage.getItem('profile-img');
          if (img) {
            setProfileImg(img);
            console.log('Navbar profileImg:', img);
          }
        }
      } catch (error) {
        console.error("Failed to load user data from localStorage", error);
      }
    };

    // Add a small delay to ensure window is available
    const timer = setTimeout(loadUserData, 100);
    
        // Listen for storage changes to update profile image and subscription
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === 'profile-img') {
            setProfileImg(e.newValue);
          }
          if (e.key === 'subscription') {
            // Refresh the page to update subscription status
            window.location.reload();
          }
          if (e.key === 'user') {
            // Update user data including diamonds and coins
            if (e.newValue) {
              try {
                const parsedUser = JSON.parse(e.newValue);
                setUser(parsedUser);
                setDiamonds(parsedUser.diamonds || 100);
                setCoins(parsedUser.coins || 500);
              } catch (error) {
                console.error('Failed to parse user data:', error);
              }
            }
          }
        };

        // Listen for custom user update events
        const handleUserUpdate = (e: CustomEvent) => {
          const updatedUser = e.detail;
          setUser(updatedUser);
          setDiamonds(updatedUser.diamonds || 100);
          setCoins(updatedUser.coins || 500);
        };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleUserUpdate as EventListener);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate as EventListener);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('user');
    }
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                if (menu) {
                  menu.classList.toggle('hidden');
                }
              }}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              בית
            </Link>
            {user && (
              <>
            <Link
              href="/level-select"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/level-select' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              רמות
            </Link>
            <Link
              href="/games"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/games' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              משחקים
            </Link>
            <Link
              href="/games/kids"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/games/kids' ? 'bg-pink-500 text-white' : 'text-gray-700 hover:bg-pink-50'
              }`}
            >
              🎈 משחקי ילדים
            </Link>
            <Link
              href="/shop"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/shop' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              חנות
            </Link>
                      <Link
                        href="/subscription"
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          pathname === '/subscription' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        מנוי
                      </Link>
                      <Link
                        href="/house"
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          pathname === '/house' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        🏠 הבית שלי
                      </Link>
                      <Link
                        href="/achievements"
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          pathname === '/achievements' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        🏆 הישגים
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin/analytics"
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            pathname === '/admin/analytics' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Analytics
                        </Link>
                      )}
              </>
            )}
          </div>
          
          {/* Mobile navigation menu */}
          <div id="mobile-menu" className="hidden md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-50">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                בית
              </Link>
              {user && (
                <>
                  <Link
                    href="/level-select"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === '/level-select' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    רמות
                  </Link>
                  <Link
                    href="/games"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === '/games' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    משחקים
                  </Link>
                  <Link
                    href="/games/kids"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === '/games/kids' ? 'bg-pink-500 text-white' : 'text-gray-700 hover:bg-pink-50'
                    }`}
                  >
                    🎈 משחקי ילדים
                  </Link>
                  <Link
                    href="/shop"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === '/shop' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    חנות
                  </Link>
                  <Link
                    href="/subscription"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === '/subscription' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    מנוי
                  </Link>
                  <Link
                    href="/house"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === '/house' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    🏠 הבית שלי
                  </Link>
                  <Link
                    href="/achievements"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === '/achievements' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    🏆 הישגים
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/analytics"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        pathname === '/admin/analytics' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Analytics
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <>
                {/* Currency Display - Hidden on mobile */}
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                    <span className="text-yellow-600 mr-1">💎</span>
                    <span className="font-bold text-yellow-800">{diamonds}</span>
                  </div>
                  <div className="flex items-center bg-orange-100 px-3 py-1 rounded-full">
                    <span className="text-orange-600 mr-1">🪙</span>
                    <span className="font-bold text-orange-800">{coins}</span>
                  </div>
                </div>
                
                {/* Mobile currency display */}
                <div className="sm:hidden flex items-center space-x-1">
                  <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                    <span className="text-yellow-600 text-xs">💎</span>
                    <span className="font-bold text-yellow-800 text-xs">{diamonds}</span>
                  </div>
                  <div className="flex items-center bg-orange-100 px-2 py-1 rounded-full">
                    <span className="text-orange-600 text-xs">🪙</span>
                    <span className="font-bold text-orange-800 text-xs">{coins}</span>
                  </div>
                </div>
                
                {!isSubscribed && (
                  <Link
                    href="/subscription"
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    ⭐ שדרג למנוי
                  </Link>
                )}
                {isAdmin && (
                  <div className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg">
                    👑 מנהל
                  </div>
                )}
                {isSubscribed && !isAdmin && (
                  <div className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg">
                    ✅ מנוי פעיל
                  </div>
                )}
                <Link href="/profile" className="group">
              {profileImg ? (
                    <img src={profileImg} alt="avatar" className="w-9 h-9 rounded-full border-2 border-blue-400 group-hover:border-blue-600 bg-blue-50 object-cover shadow transition-all" />
              ) : avatarId && AVATARS[avatarId] ? (
                <span className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-blue-400 group-hover:border-blue-600 bg-blue-50 text-2xl shadow transition-all">{AVATARS[avatarId]}</span>
              ) : (
                <span className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-blue-400 group-hover:border-blue-600 bg-blue-50 text-2xl shadow transition-all">👤</span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
            >
              התנתק
            </button>
              </>
            ) : (
              <>
                <Link
                  href="/subscription"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  ⭐ מנוי
                </Link>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  התחבר
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 