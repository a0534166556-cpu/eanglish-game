'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  icon: string;
  rarity: string;
}

interface HouseItem {
  id: string;
  positionX: number;
  positionY: number;
  rotation: number;
  scale: number;
  isPlaced: boolean;
  shopItem: ShopItem;
}

interface User {
  id: string;
  name: string;
  diamonds: number;
  coins: number;
}

export default function VirtualHouse() {
  const [user, setUser] = useState<User | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [houseItems, setHouseItems] = useState<HouseItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<HouseItem | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<HouseItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const categories = [
    { id: 'all', name: 'הכל', icon: '🏠' },
    { id: 'furniture', name: 'רהיטים', icon: '🪑' },
    { id: 'decoration', name: 'קישוטים', icon: '🎨' },
    { id: 'floor', name: 'רצפה', icon: '🟫' },
    { id: 'wall', name: 'קירות', icon: '🧱' },
    { id: 'lighting', name: 'תאורה', icon: '💡' }
  ];

  const rarityColors = {
    common: 'bg-gray-100 text-gray-800',
    rare: 'bg-blue-100 text-blue-800',
    epic: 'bg-purple-100 text-purple-800',
    legendary: 'bg-yellow-100 text-yellow-800'
  };

  useEffect(() => {
    loadUserData();
    loadShopItems();
  }, []);

  useEffect(() => {
    if (user) {
      loadHouseItems();
    }
  }, [user]);

  // Reload user data when shop opens to get fresh data
  useEffect(() => {
    if (isShopOpen) {
      loadUserData();
    }
  }, [isShopOpen]);

  const loadUserData = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        
        // Always fetch fresh data from database for all users
        try {
          let response;
          
          // Try to get user by ID if available
          if (userData.id) {
            response = await fetch(`/api/user/${userData.id}`);
          } 
          // Otherwise try by email
          else if (userData.email) {
            response = await fetch(`/api/admin/find-user?email=${userData.email}`);
          }
          
          if (response && response.ok) {
            const data = await response.json();
            
            // Extract user data based on response structure
            const freshUserData = data.user || data;
            
            const updatedUser = {
              id: freshUserData.id || userData.id,
              email: freshUserData.email || userData.email,
              name: freshUserData.name || userData.name,
              diamonds: freshUserData.diamonds ?? userData.diamonds ?? 100,
              coins: freshUserData.coins ?? userData.coins ?? 500
            };
            
            console.log('Loaded fresh user data from database:', updatedUser);
            
            setUser(updatedUser);
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(updatedUser));
            // Trigger update event
            window.dispatchEvent(new CustomEvent('userUpdated', { 
              detail: updatedUser 
            }));
            return;
          }
        } catch (error) {
          console.error('Failed to fetch user data from database:', error);
        }
        
        // Fallback to localStorage data if API call fails
        console.log('Using localStorage data as fallback:', userData);
        setUser(userData);
      } else {
        console.log('No user in localStorage, redirecting to login');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      router.push('/login');
    }
  };

  const loadShopItems = async () => {
    try {
      const response = await fetch(`/api/house/shop?category=${selectedCategory === 'all' ? '' : selectedCategory}`);
      if (response.ok) {
        const data = await response.json();
        setShopItems(data.items);
      }
    } catch (error) {
      console.error('Failed to load shop items:', error);
    }
  };

  const loadHouseItems = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/house/items?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setHouseItems(data.houseItems || []);
      } else {
        console.error('Failed to load house items:', response.status);
        setHouseItems([]);
      }
    } catch (error) {
      console.error('Failed to load house items:', error);
      setHouseItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const buyItem = async (item: ShopItem) => {
    if (!user) {
      alert('משתמש לא מחובר!');
      return;
    }

    console.log('Buying item:', item);
    console.log('User:', user);
    console.log('User diamonds:', user.diamonds);
    console.log('Item price:', item.price);
    console.log('Has enough diamonds:', user.diamonds >= item.price);

    if (!user.diamonds && user.diamonds !== 0) {
      alert('שגיאה: לא נמצאו נתוני יהלומים. אנא רענן את הדף.');
      return;
    }

    if (user.diamonds < item.price) {
      alert(`אין לך מספיק יהלומים! יש לך ${user.diamonds} 💎 ואתה צריך ${item.price} 💎`);
      return;
    }

    try {
      const response = await fetch('/api/house/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          itemId: item.id
        }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        
        // Reload user data from database to get fresh diamonds/coins
        await loadUserData();
        
        // Load house items to show new purchase
        await loadHouseItems();
        
        alert('הפריט נרכש בהצלחה! ✨');
      } else {
        const error = JSON.parse(responseText);
        alert(error.error || 'שגיאה ברכישת הפריט');
      }
    } catch (error) {
      console.error('Failed to buy item:', error);
      alert('שגיאה ברכישת הפריט');
    }
  };

  const updateItemPosition = async (itemId: string, positionX: number, positionY: number) => {
    try {
      await fetch('/api/house/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          positionX,
          positionY,
          isPlaced: true
        }),
      });
    } catch (error) {
      console.error('Failed to update item position:', error);
    }
  };

  const removeItemFromHouse = async (itemId: string) => {
    try {
      await fetch('/api/house/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          isPlaced: false
        }),
      });
      
      // Update local state
      setHouseItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, isPlaced: false }
          : item
      ));
      
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to remove item from house:', error);
    }
  };

  const sellItem = async (itemId: string) => {
    if (!user) return;
    
    const item = houseItems.find(i => i.id === itemId);
    if (!item) return;
    
    const sellPrice = Math.floor(item.shopItem.price * 0.7); // 70% of original price
    
    try {
      const response = await fetch('/api/house/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          itemId: itemId
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Reload user data from database to get fresh diamonds/coins
        await loadUserData();
        
        // Remove item from house items
        setHouseItems(prev => prev.filter(i => i.id !== itemId));
        setSelectedItem(null);
        
        alert(`הפריט נמכר בהצלחה תמורת ${sellPrice} יהלומים! 💰`);
      } else {
        const error = await response.json();
        alert(error.error || 'שגיאה במכירת הפריט');
      }
    } catch (error) {
      console.error('Failed to sell item:', error);
      alert('שגיאה במכירת הפריט');
    }
  };

  const handleItemClick = (item: HouseItem) => {
    setSelectedItem(item);
  };

  const handleItemDragStart = (e: React.DragEvent, item: HouseItem) => {
    setDraggedItem(item);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragEnd = () => {
    setDraggedItem(null);
    setIsDragging(false);
  };

  const handleHouseDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleHouseDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

    const rect = e.currentTarget.getBoundingClientRect();
    // חישוב מיקום מדויק יותר
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Update the item position in the state immediately
    setHouseItems(prev => prev.map(item => 
      item.id === draggedItem.id 
        ? { ...item, positionX: x, positionY: y, isPlaced: true }
        : item
    ));
    
    updateItemPosition(draggedItem.id, x, y);
    setDraggedItem(null);
    setIsDragging(false);
  };

  const handleHouseClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedItem) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Update the item position in the state immediately
      setHouseItems(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, positionX: x, positionY: y, isPlaced: true }
          : item
      ));
      
      updateItemPosition(selectedItem.id, x, y);
      setSelectedItem(null);
    }
  };

  const filteredShopItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <div className="text-xl">טוען את הבית שלך...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">🏠 הבית הוירטואלי שלי</h1>
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
              onClick={() => setIsShopOpen(!isShopOpen)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {isShopOpen ? 'סגור חנות' : 'פתח חנות'}
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

      <div className="flex h-screen">
        {/* House Area */}
        <div className="flex-1 p-4">
          <div 
            className="w-full h-full rounded-lg relative overflow-hidden cursor-pointer"
            onClick={handleHouseClick}
            onDragOver={handleHouseDragOver}
            onDrop={handleHouseDrop}
            style={{
              background: '#F5F5DC',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              perspective: '1200px',
              perspectiveOrigin: '50% 50%'
            }}
          >
            {/* Back Wall - 3D effect */}
            <div className="absolute top-0 left-0 right-0 h-3/5" style={{
              background: `
                linear-gradient(135deg, 
                  #FFF8DC 0%, 
                  #F5F5DC 25%,
                  #EEE8CD 50%,
                  #F5F5DC 75%,
                  #FFF8DC 100%
                )
              `,
              boxShadow: 'inset 0 -20px 40px rgba(0,0,0,0.15), inset 0 10px 20px rgba(255,255,255,0.3)',
              transform: 'translateZ(-50px)',
              borderBottom: '4px solid #D2B48C'
            }}>
              {/* Wall Molding - התחתון */}
              <div className="absolute bottom-0 left-0 right-0 h-6" style={{
                background: 'linear-gradient(180deg, #C19A6B 0%, #A67C52 50%, #8B5A3C 100%)',
                boxShadow: '0 3px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.2)'
              }}></div>
              
              {/* Wall Molding - העליון */}
              <div className="absolute top-0 left-0 right-0 h-4" style={{
                background: 'linear-gradient(180deg, #D2B48C 0%, #C19A6B 100%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}></div>
            </div>
            
            {/* Left Window - תלת מימד */}
            <div className="absolute top-12 left-12" style={{ zIndex: 10 }}>
              {/* מסגרת חיצונית */}
              <div className="w-36 h-44 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg p-1" style={{
                boxShadow: '0 6px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)'
              }}>
                {/* זכוכית */}
                <div className="w-full h-full bg-gradient-to-br from-sky-300 via-sky-200 to-blue-300 rounded" style={{
                  boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), inset 0 0 10px rgba(135,206,250,0.8)',
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 50%),
                    linear-gradient(135deg, #87CEEB 0%, #B0E0E6 50%, #ADD8E6 100%)
                  `
                }}>
                  {/* משבצות */}
                  <div className="absolute inset-2 grid grid-cols-2 grid-rows-2 gap-1">
                    <div className="border-2 border-white border-opacity-40 rounded-sm"></div>
                    <div className="border-2 border-white border-opacity-40 rounded-sm"></div>
                    <div className="border-2 border-white border-opacity-40 rounded-sm"></div>
                    <div className="border-2 border-white border-opacity-40 rounded-sm"></div>
                  </div>
                  {/* השתקפות */}
                  <div className="absolute top-2 left-2 w-8 h-8 bg-white opacity-30 rounded-full blur-sm"></div>
                </div>
              </div>
            </div>
            
            {/* Right Window - תלת מימד */}
            <div className="absolute top-12 right-12" style={{ zIndex: 10 }}>
              {/* מסגרת חיצונית */}
              <div className="w-36 h-44 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg p-1" style={{
                boxShadow: '0 6px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)'
              }}>
                {/* זכוכית */}
                <div className="w-full h-full bg-gradient-to-br from-sky-300 via-sky-200 to-blue-300 rounded" style={{
                  boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), inset 0 0 10px rgba(135,206,250,0.8)',
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 50%),
                    linear-gradient(135deg, #87CEEB 0%, #B0E0E6 50%, #ADD8E6 100%)
                  `
                }}>
                  {/* משבצות */}
                  <div className="absolute inset-2 grid grid-cols-2 grid-rows-2 gap-1">
                    <div className="border-2 border-white border-opacity-40 rounded-sm"></div>
                    <div className="border-2 border-white border-opacity-40 rounded-sm"></div>
                    <div className="border-2 border-white border-opacity-40 rounded-sm"></div>
                    <div className="border-2 border-white border-opacity-40 rounded-sm"></div>
                  </div>
                  {/* השתקפות */}
                  <div className="absolute top-2 left-2 w-8 h-8 bg-white opacity-30 rounded-full blur-sm"></div>
                </div>
              </div>
            </div>
            
            {/* 3D Wall Effect - Left Wall */}
            <div className="absolute inset-0" style={{
              background: `
                linear-gradient(90deg, 
                  rgba(255,255,255,0.6) 0%, 
                  rgba(255,255,255,0.3) 30%, 
                  rgba(255,255,255,0.1) 60%, 
                  rgba(0,0,0,0.05) 100%
                )
              `,
              clipPath: 'polygon(0% 0%, 25% 0%, 15% 100%, 0% 100%)'
            }} />
            
            {/* 3D Wall Effect - Right Wall */}
            <div className="absolute inset-0" style={{
              background: `
                linear-gradient(90deg, 
                  rgba(0,0,0,0.05) 0%, 
                  rgba(255,255,255,0.1) 40%, 
                  rgba(255,255,255,0.3) 70%, 
                  rgba(255,255,255,0.6) 100%
                )
              `,
              clipPath: 'polygon(75% 0%, 100% 0%, 100% 100%, 85% 100%)'
            }} />
            
            {/* Ceiling */}
            <div className="absolute top-0 left-0 right-0 h-1/4" style={{
              background: `
                linear-gradient(180deg, 
                  rgba(255,255,255,0.8) 0%, 
                  rgba(240,240,240,0.6) 50%, 
                  rgba(220,220,220,0.4) 100%
                )
              `,
              clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)'
            }} />
            
            {/* Wooden Floor - 3D perspective */}
            <div className="absolute bottom-0 left-0 right-0 h-2/5" style={{
              background: `
                repeating-linear-gradient(
                  90deg,
                  #8B4513 0px,
                  #8B4513 40px,
                  #A0522D 40px,
                  #A0522D 80px,
                  #9B6B3D 80px,
                  #9B6B3D 120px
                ),
                linear-gradient(180deg, 
                  rgba(139,69,19,0.9) 0%, 
                  rgba(160,82,45,1) 100%
                )
              `,
              boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.2)',
              transform: 'perspective(1000px) rotateX(60deg)',
              transformOrigin: 'top center',
              borderTop: '3px solid #C19A6B'
            }} />
            
            {/* Floor highlight */}
            <div className="absolute bottom-0 left-0 right-0 h-2/5 pointer-events-none" style={{
              background: `
                linear-gradient(180deg, 
                  rgba(255,255,255,0.1) 0%, 
                  rgba(0,0,0,0) 30%,
                  rgba(0,0,0,0.05) 100%
                )
              `,
              transform: 'perspective(1000px) rotateX(60deg)',
              transformOrigin: 'top center'
            }} />
            
            {/* House Items */}
            {houseItems.filter(item => item.isPlaced).map((item) => {
              // קביעת z-index לפי סוג הפריט
              const getZIndex = () => {
                if (item.shopItem.name.includes('שטיח') || item.shopItem.name.includes('רצפה')) return 1;
                if (item.shopItem.name.includes('שולחן')) return 2;
                if (item.shopItem.name.includes('כיסא') || item.shopItem.name.includes('ספה') || item.shopItem.name.includes('מיטה')) return 3;
                if (item.shopItem.name.includes('ארון') || item.shopItem.name.includes('שידה')) return 4;
                if (item.shopItem.name.includes('מנורה') || item.shopItem.name.includes('נברשת')) return 5;
                if (item.shopItem.name.includes('צמח') || item.shopItem.name.includes('קישוט')) return 6;
                return 3; // ברירת מחדל
              };
              
              return (
              <div
                key={item.id}
                className="absolute cursor-move hover:scale-110 transition-all duration-200 hover:drop-shadow-xl select-none"
                style={{
                  left: `${item.positionX}%`,
                  top: `${item.positionY}%`,
                  transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
                  transformOrigin: 'center center',
                  zIndex: getZIndex(),
                }}
                draggable
                onDragStart={(e) => handleItemDragStart(e, item)}
                onDragEnd={handleItemDragEnd}
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(item);
                }}
              >
                <div className="relative">
                  {/* Real furniture with CSS styling - LARGER SIZE */}
                  {item.shopItem.name.includes('ספה') ? (
                    <div className="relative" style={{ width: '800px', height: '450px' }}>
                      <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-2xl shadow-2xl" style={{
                        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))'
                      }}>
                        <div className="absolute top-4 left-4 right-4 h-16 bg-gradient-to-b from-blue-300 to-blue-500 rounded-xl"></div>
                        <div className="absolute bottom-4 left-8 right-8 h-10 bg-gradient-to-b from-blue-600 to-blue-800 rounded-lg"></div>
                      </div>
                    </div>
                  ) : item.shopItem.name.includes('מיטה') ? (
                    <div className="relative" style={{ width: '500px', height: '360px' }}>
                      <div className="w-full h-full bg-gradient-to-b from-purple-400 to-purple-600 rounded-2xl shadow-2xl" style={{
                        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))'
                      }}>
                        <div className="absolute top-6 left-6 right-6 h-20 bg-gradient-to-b from-white to-purple-200 rounded-xl"></div>
                        <div className="absolute top-0 left-6 right-6 h-8 bg-gradient-to-b from-purple-600 to-purple-800 rounded-t-xl"></div>
                      </div>
                    </div>
                  ) : item.shopItem.name.includes('כיסא') || item.shopItem.name.includes('כורסא') ? (
                    <div className="relative" style={{ width: '200px', height: '240px' }}>
                      <div className="w-full h-full bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg shadow-2xl" style={{
                        clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
                        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))'
                      }}>
                        <div className="absolute top-6 left-6 right-6 h-18 bg-gradient-to-b from-amber-400 to-amber-600 rounded"></div>
                        <div className="absolute bottom-6 left-6 right-6 h-10 bg-gradient-to-b from-amber-700 to-amber-900 rounded"></div>
                      </div>
                    </div>
                  ) : item.shopItem.name.includes('שולחן') ? (
                    <div className="relative" style={{ width: '480px', height: '300px' }}>
                      <div className="w-full h-full bg-gradient-to-b from-amber-700 to-amber-900 rounded-lg shadow-2xl" style={{
                        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))'
                      }}>
                        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-500 to-amber-700 rounded-t-lg"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-800 to-amber-900 rounded-b-lg"></div>
                      </div>
                    </div>
                  ) : item.shopItem.name.includes('ארון') || item.shopItem.name.includes('מזנון') || item.shopItem.name.includes('שידה') ? (
                    <div className="relative" style={{ width: '280px', height: '320px' }}>
                      <div className="w-full h-full bg-gradient-to-b from-amber-700 to-amber-900 rounded-lg shadow-2xl" style={{
                        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))'
                      }}>
                        <div className="absolute top-6 left-6 right-6 h-10 bg-gradient-to-b from-amber-500 to-amber-700 rounded"></div>
                        <div className="absolute top-24 left-6 right-6 h-10 bg-gradient-to-b from-amber-500 to-amber-700 rounded"></div>
                        <div className="absolute top-42 left-6 right-6 h-10 bg-gradient-to-b from-amber-500 to-amber-700 rounded"></div>
                      </div>
                    </div>
                  ) : item.shopItem.name.includes('נורה') || item.shopItem.name.includes('מנורה') ? (
                    <div className="relative" style={{ width: '160px', height: '220px' }}>
                      <div className="w-full h-full bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full shadow-2xl" style={{
                        filter: 'drop-shadow(0 6px 12px rgba(255,215,0,0.6)) brightness(1.2)'
                      }}>
                        <div className="absolute top-6 left-6 right-6 h-16 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-full"></div>
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-6 h-12 bg-gradient-to-b from-gray-600 to-gray-800 rounded"></div>
                      </div>
                    </div>
                  ) : item.shopItem.name.includes('נברשת') ? (
                    <div className="relative" style={{ width: '240px', height: '240px' }}>
                      <div className="w-full h-full bg-gradient-to-b from-yellow-200 to-yellow-400 shadow-2xl" style={{
                        clipPath: 'polygon(50% 0%, 0% 40%, 20% 100%, 80% 100%, 100% 40%)',
                        filter: 'drop-shadow(0 8px 16px rgba(255,215,0,0.7)) brightness(1.3)'
                      }}></div>
                    </div>
                  ) : item.shopItem.name.includes('צמח') || item.shopItem.name.includes('עץ') ? (
                    <div className="relative" style={{ width: '180px', height: '280px' }}>
                      <div className="w-full h-full" style={{
                        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))'
                      }}>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-b from-green-400 to-green-600 rounded-full" style={{
                          background: 'radial-gradient(circle at 30% 30%, #90EE90, #228B22)',
                        }}></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg" style={{
                          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                        }}></div>
                      </div>
                    </div>
                  ) : item.shopItem.name.includes('שטיח') ? (
                    <div className="relative" style={{ width: '520px', height: '340px' }}>
                      <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 rounded-lg shadow-2xl" style={{
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                      }}>
                        <div className="absolute inset-4 bg-gradient-to-br from-red-400 to-red-600 rounded"></div>
                      </div>
                    </div>
                  ) : item.shopItem.name.includes('קיר') || item.shopItem.name.includes('טפט') ? (
                    <div className="relative" style={{ width: '450px', height: '350px' }}>
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 rounded-lg shadow-2xl" style={{
                        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))'
                      }}>
                        <div className="absolute inset-4 bg-gradient-to-br from-white to-gray-200 rounded opacity-60"></div>
                        <div className="absolute top-8 left-8 right-8 h-3 bg-gradient-to-r from-gray-300 to-gray-500 rounded"></div>
                        <div className="absolute top-16 left-8 right-8 h-3 bg-gradient-to-r from-gray-300 to-gray-500 rounded"></div>
                        <div className="absolute top-24 left-8 right-8 h-3 bg-gradient-to-r from-gray-300 to-gray-500 rounded"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-6xl drop-shadow-lg filter hover:brightness-110">
                      {item.shopItem.icon}
                    </div>
                  )}
                  
                  {/* Ground shadow - elliptical contact shadow */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black opacity-20 rounded-full blur-sm" style={{
                    transform: 'translateX(-50%) scaleX(1.5) scaleY(0.3)'
                  }}></div>
                </div>
              </div>
              );
            })}

            {/* Instructions */}
            {houseItems.filter(item => item.isPlaced).length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center" style={{
                transform: 'perspective(1000px) rotateX(5deg)',
                transformOrigin: 'center'
              }}>
                <div className="text-center text-gray-700 bg-white bg-opacity-90 rounded-lg p-8 shadow-2xl border border-gray-200" style={{
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)'
                }}>
                  <div className="text-6xl mb-4" style={{
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
                  }}>🏠</div>
                  <div className="text-xl font-bold mb-2 text-gray-800">הבית שלך ריק</div>
                  <div className="text-sm mb-4 text-gray-600">פתח את החנות וקנה פריטים!</div>
                  <div className="text-xs text-gray-500 space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <span>🛒</span>
                      <span>לאחר הקנייה, לחץ על הפריט ולאחר מכן לחץ על מקום בבית להצבתו</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span>🖱️</span>
                      <span>או גרור את הפריטים ישירות למקום הרצוי</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shop Panel */}
        {isShopOpen && (
          <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">🛍️ חנות</h2>
            
            {/* Purchased Items Section */}
            {houseItems.filter(item => !item.isPlaced).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-green-600">📦 פריטים שנרכשו</h3>
                <div className="space-y-3">
                  {houseItems.filter(item => !item.isPlaced).map((item) => (
                    <div key={item.id} className="border-2 border-green-200 rounded-xl p-3 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-200 hover:border-green-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl drop-shadow-lg" style={{
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
                          }}>
                            {/* Custom furniture rendering for purchased items */}
                            {item.shopItem.name.includes('כיסא') ? (
                              <div className="w-8 h-10 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg shadow-lg" style={{
                                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
                              }}>
                                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-amber-500 to-amber-700 rounded-t-lg"></div>
                                <div className="absolute top-4 left-1 right-1 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded"></div>
                              </div>
                            ) : item.shopItem.name.includes('שולחן') ? (
                              <div className="w-10 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg shadow-lg" style={{
                                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
                              }}>
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-t-lg"></div>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-lg"></div>
                              </div>
                            ) : item.shopItem.name.includes('נורה') ? (
                              <div className="w-6 h-8 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-full shadow-lg" style={{
                                background: 'radial-gradient(circle at 30% 30%, #FFD700, #FFA500)',
                                boxShadow: '0 0 15px rgba(255, 215, 0, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
                              }}>
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-gradient-to-b from-gray-400 to-gray-600 rounded-t-full"></div>
                                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-gray-600 rounded-full"></div>
                              </div>
                            ) : item.shopItem.name.includes('צמח') ? (
                              <div className="w-8 h-12 relative">
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg" style={{
                                  background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                                }}></div>
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-b from-green-400 to-green-600 rounded-full" style={{
                                  background: 'radial-gradient(circle at 30% 30%, #90EE90, #228B22)',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}></div>
                                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-b from-green-300 to-green-500 rounded-full" style={{
                                  background: 'radial-gradient(circle at 30% 30%, #98FB98, #32CD32)'
                                }}></div>
                              </div>
                            ) : item.shopItem.name.includes('קיר') ? (
                              <div className="w-12 h-10 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg shadow-lg" style={{
                                background: `
                                  linear-gradient(135deg, #F8F8F8 0%, #E8E8E8 25%, #F0F0F0 50%, #E8E8E8 75%, #F8F8F8 100%),
                                  repeating-linear-gradient(
                                    0deg,
                                    transparent,
                                    transparent 6px,
                                    rgba(0,0,0,0.05) 6px,
                                    rgba(0,0,0,0.05) 7px
                                  ),
                                  repeating-linear-gradient(
                                    90deg,
                                    transparent,
                                    transparent 6px,
                                    rgba(0,0,0,0.05) 6px,
                                    rgba(0,0,0,0.05) 7px
                                  )
                                `,
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.2)'
                              }}>
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-t-lg"></div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-b-lg"></div>
                                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-gray-300 to-gray-400 rounded-l-lg"></div>
                                <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-gray-300 to-gray-400 rounded-r-lg"></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-5 bg-gradient-to-b from-gray-200 to-gray-300 rounded opacity-60"></div>
                              </div>
                            ) : (
                              <div className="text-3xl drop-shadow-lg">
                                {item.shopItem.icon}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-gray-800">{item.shopItem.name}</div>
                            <div className="text-xs text-gray-600">לחץ עליי ואז על מקום בבית</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs font-bold hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                          ✨ בחר
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>

            {/* Shop Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3 text-blue-600">🛒 פריטים חדשים</h3>
              {filteredShopItems.map((item) => (
                <div key={item.id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 hover:border-blue-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-5xl drop-shadow-lg filter hover:brightness-110 transition-all duration-200" style={{
                      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
                    }}>
                      {/* Custom furniture rendering for shop items - LARGER */}
                      {item.name.includes('כיסא') || item.name.includes('כורסא') ? (
                        <div className="w-14 h-16 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg shadow-lg" style={{
                          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
                        }}>
                          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-amber-500 to-amber-700 rounded-t-lg"></div>
                          <div className="absolute top-4 left-1 right-1 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded"></div>
                        </div>
                      ) : item.name.includes('שולחן') ? (
                        <div className="w-16 h-14 bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg shadow-lg" style={{
                          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
                        }}>
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-t-lg"></div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-lg"></div>
                        </div>
                      ) : item.name.includes('נורה') || item.name.includes('מנורה') ? (
                        <div className="w-10 h-14 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded-full shadow-lg" style={{
                          background: 'radial-gradient(circle at 30% 30%, #FFD700, #FFA500)',
                          boxShadow: '0 0 15px rgba(255, 215, 0, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
                        }}>
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-gradient-to-b from-gray-400 to-gray-600 rounded-t-full"></div>
                          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-gray-600 rounded-full"></div>
                        </div>
                      ) : item.name.includes('ספה') ? (
                        <div className="w-20 h-14 bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl shadow-lg" style={{
                          background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
                        }}>
                          <div className="absolute top-2 left-2 right-2 h-6 bg-gradient-to-b from-blue-300 to-blue-500 rounded-lg"></div>
                        </div>
                      ) : item.name.includes('מיטה') ? (
                        <div className="w-18 h-14 bg-gradient-to-b from-purple-400 to-purple-600 rounded-xl shadow-lg" style={{
                          background: 'linear-gradient(135deg, #C084FC 0%, #A855F7 50%, #9333EA 100%)',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
                        }}>
                          <div className="absolute top-2 left-2 right-2 h-8 bg-gradient-to-b from-white to-purple-200 rounded-lg"></div>
                        </div>
                      ) : item.name.includes('ארון') || item.name.includes('מזנון') || item.name.includes('שידה') ? (
                        <div className="w-14 h-18 bg-gradient-to-b from-amber-700 to-amber-900 rounded-lg shadow-lg" style={{
                          background: 'linear-gradient(135deg, #B45309 0%, #92400E 50%, #78350F 100%)',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
                        }}>
                          <div className="absolute top-2 left-2 right-2 h-3 bg-gradient-to-b from-amber-500 to-amber-700 rounded"></div>
                          <div className="absolute top-7 left-2 right-2 h-3 bg-gradient-to-b from-amber-500 to-amber-700 rounded"></div>
                          <div className="absolute top-12 left-2 right-2 h-3 bg-gradient-to-b from-amber-500 to-amber-700 rounded"></div>
                        </div>
                      ) : item.name.includes('צמח') || item.name.includes('עץ') ? (
                        <div className="w-12 h-16 relative">
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg" style={{
                            background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                          }}></div>
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-b from-green-400 to-green-600 rounded-full" style={{
                            background: 'radial-gradient(circle at 30% 30%, #90EE90, #228B22)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}></div>
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-b from-green-300 to-green-500 rounded-full" style={{
                            background: 'radial-gradient(circle at 30% 30%, #98FB98, #32CD32)'
                          }}></div>
                        </div>
                      ) : item.name.includes('שטיח') ? (
                        <div className="w-20 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-lg shadow-lg" style={{
                          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
                        }}>
                          <div className="absolute inset-2 bg-gradient-to-br from-red-400 to-red-600 rounded"></div>
                        </div>
                      ) : item.name.includes('נברשת') ? (
                        <div className="w-16 h-16 bg-gradient-to-b from-yellow-200 to-yellow-400 shadow-lg" style={{
                          clipPath: 'polygon(50% 0%, 0% 40%, 20% 100%, 80% 100%, 100% 40%)',
                          filter: 'drop-shadow(0 4px 8px rgba(255,215,0,0.7)) brightness(1.3)'
                        }}></div>
                      ) : item.name.includes('קיר') || item.name.includes('טפט') ? (
                        <div className="w-16 h-14 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg shadow-lg" style={{
                          background: `
                            linear-gradient(135deg, #F8F8F8 0%, #E8E8E8 25%, #F0F0F0 50%, #E8E8E8 75%, #F8F8F8 100%),
                            repeating-linear-gradient(
                              0deg,
                              transparent,
                              transparent 6px,
                              rgba(0,0,0,0.05) 6px,
                              rgba(0,0,0,0.05) 7px
                            ),
                            repeating-linear-gradient(
                              90deg,
                              transparent,
                              transparent 6px,
                              rgba(0,0,0,0.05) 6px,
                              rgba(0,0,0,0.05) 7px
                            )
                          `,
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.2)'
                        }}>
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-t-lg"></div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-b-lg"></div>
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-gray-300 to-gray-400 rounded-l-lg"></div>
                          <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-gray-300 to-gray-400 rounded-r-lg"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-5 bg-gradient-to-b from-gray-200 to-gray-300 rounded opacity-60"></div>
                        </div>
                      ) : (
                        <div className="text-4xl drop-shadow-lg">
                          {item.icon}
                        </div>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${rarityColors[item.rarity as keyof typeof rarityColors]} shadow-sm`}>
                      {item.rarity}
                    </div>
                  </div>
                  <h3 className="font-bold text-base mb-2 text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                      <span className="text-lg mr-1">💎</span>
                      <span className="font-bold text-lg">{item.price}</span>
                    </div>
                    <button
                      onClick={() => buyItem(item)}
                      disabled={user.diamonds < item.price}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                        user.diamonds >= item.price
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {user.diamonds >= item.price ? '🛒 קנה' : '❌ חסר כסף'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Item Info */}
      {selectedItem && (
        <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm border-2 border-blue-400">
          <div className="flex items-center space-x-2 mb-2">
            <div className="text-2xl">{selectedItem.shopItem.icon}</div>
            <h3 className="font-bold">{selectedItem.shopItem.name}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">{selectedItem.shopItem.description}</p>
          
          {selectedItem.isPlaced ? (
            <div className="space-y-3">
              <div className="text-xs text-blue-600 mb-3">
                🏠 הפריט ממוקם בבית - לחץ על מקום אחר להעברה
              </div>
              
              {/* Scale Controls */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm font-semibold mb-2">📏 גודל הפריט:</div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={async () => {
                      const newScale = Math.max(0.5, selectedItem.scale - 0.2);
                      setHouseItems(prev => prev.map(item => 
                        item.id === selectedItem.id ? { ...item, scale: newScale } : item
                      ));
                      setSelectedItem({ ...selectedItem, scale: newScale });
                      await fetch('/api/house/items', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ itemId: selectedItem.id, scale: newScale })
                      });
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded text-lg hover:bg-red-600 font-bold"
                  >
                    ➖ קטן
                  </button>
                  <div className="text-center flex-1">
                    <div className="text-lg font-bold text-blue-600">{(selectedItem.scale * 100).toFixed(0)}%</div>
                    <div className="text-xs text-gray-500">גודל נוכחי</div>
                  </div>
                  <button
                    onClick={async () => {
                      const newScale = Math.min(5, selectedItem.scale + 0.2);
                      setHouseItems(prev => prev.map(item => 
                        item.id === selectedItem.id ? { ...item, scale: newScale } : item
                      ));
                      setSelectedItem({ ...selectedItem, scale: newScale });
                      await fetch('/api/house/items', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ itemId: selectedItem.id, scale: newScale })
                      });
                    }}
                    className="px-3 py-2 bg-green-500 text-white rounded text-lg hover:bg-green-600 font-bold"
                  >
                    ➕ גדל
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  ביטול
                </button>
                <button
                  onClick={() => removeItemFromHouse(selectedItem.id)}
                  className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                >
                  🗑️ הסר מהבית
                </button>
                <button
                  onClick={() => sellItem(selectedItem.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  💰 מכור ({Math.floor(selectedItem.shopItem.price * 0.7)} 💎)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-blue-600 mb-3">
                💡 לחץ על מקום בבית להצבת הפריט או גרור ישירות
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  ביטול
                </button>
                <button
                  onClick={() => {
                    // Update the item position in the state immediately
                    setHouseItems(prev => prev.map(item => 
                      item.id === selectedItem.id 
                        ? { ...item, positionX: 50, positionY: 50, isPlaced: true }
                        : item
                    ));
                    updateItemPosition(selectedItem.id, 50, 50);
                    setSelectedItem(null);
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  הצב במרכז
                </button>
                <button
                  onClick={() => sellItem(selectedItem.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  💰 מכור ({Math.floor(selectedItem.shopItem.price * 0.7)} 💎)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

