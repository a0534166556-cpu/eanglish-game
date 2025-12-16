"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RewardedAd from '@/app/components/ads/RewardedAd';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  currency: 'coins' | 'diamonds' | 'money';
  diamondPrice?: number;
  moneyPrice?: number;
  coinAmount?: number;
  diamondAmount?: number;
  requireAd?: boolean;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'hint',
    name: 'רמז',
    description: 'קבל רמז לשאלה קשה',
    icon: '💡',
    price: 50,
    currency: 'coins'
  },
  {
    id: 'extra_time',
    name: 'תוספת זמן',
    description: 'הוסף 10 שניות לשעון',
    icon: '⏰',
    price: 70,
    currency: 'coins'
  },
  {
    id: 'skip',
    name: 'דילוג',
    description: 'דלג על שאלה אחת',
    icon: '⏭️',
    price: 100,
    currency: 'coins'
  },
  {
    id: 'score_boost',
    name: 'בונוס ניקוד',
    description: 'קבל 2x ניקוד בשאלה הבאה',
    icon: '🚀',
    price: 120,
    currency: 'coins'
  },
  // אווטארים מיוחדים
  {
    id: 'avatar_ninja',
    name: 'אווטאר נינג\'ה',
    description: 'דמות נינג\'ה מיוחדת 🥷',
    icon: '🥷',
    price: 500,
    currency: 'coins'
  },
  {
    id: 'avatar_superhero',
    name: 'אווטאר גיבור על',
    description: 'דמות גיבור על 🦸',
    icon: '🦸',
    price: 500,
    currency: 'coins'
  },
  {
    id: 'avatar_wizard',
    name: 'אווטאר קוסם',
    description: 'דמות קוסם מאגי 🧙',
    icon: '🧙',
    price: 500,
    currency: 'coins'
  },
  {
    id: 'avatar_detective',
    name: 'אווטאר בלש',
    description: 'דמות בלש 🕵️',
    icon: '🕵️',
    price: 500,
    currency: 'coins'
  },
  {
    id: 'avatar_scientist',
    name: 'אווטאר מדען',
    description: 'דמות מדען 🧑‍🔬',
    icon: '🧑‍🔬',
    price: 500,
    currency: 'coins'
  },
  {
    id: 'avatar_astronaut',
    name: 'אווטאר אסטרונאוט',
    description: 'דמות אסטרונאוט 🧑‍🚀',
    icon: '🧑‍🚀',
    price: 800,
    currency: 'coins',
    diamondPrice: 40
  },
  {
    id: 'avatar_pirate',
    name: 'אווטאר פיראט',
    description: 'דמות פיראט 🏴‍☠️',
    icon: '🏴‍☠️',
    price: 800,
    currency: 'coins',
    diamondPrice: 40
  },
  {
    id: 'avatar_prince',
    name: 'אווטאר נסיך',
    description: 'דמות נסיך 🤴',
    icon: '🤴',
    price: 1000,
    currency: 'coins',
    diamondPrice: 50
  },
  {
    id: 'avatar_princess',
    name: 'אווטאר נסיכה',
    description: 'דמות נסיכה 👸',
    icon: '👸',
    price: 1000,
    currency: 'coins',
    diamondPrice: 50
  },
  {
    id: 'avatar_robot',
    name: 'אווטאר רובוט',
    description: 'דמות רובוט 🤖',
    icon: '🤖',
    price: 1200,
    currency: 'coins',
    diamondPrice: 60
  },
  // תגים ייחודיים
  {
    id: 'tag_genius',
    name: 'תג גאון',
    description: 'תג "גאון" מיוחד לפרופיל 🧠',
    icon: '🧠',
    price: 300,
    currency: 'coins'
  },
  {
    id: 'tag_champion',
    name: 'תג אלוף',
    description: 'תג "אלוף" מיוחד לפרופיל 🏆',
    icon: '🏆',
    price: 300,
    currency: 'coins'
  },
  {
    id: 'tag_master',
    name: 'תג מאסטר',
    description: 'תג "מאסטר" מיוחד לפרופיל ⭐',
    icon: '⭐',
    price: 400,
    currency: 'coins'
  },
  {
    id: 'tag_legend',
    name: 'תג אגדה',
    description: 'תג "אגדה" מיוחד לפרופיל 👑',
    icon: '👑',
    price: 500,
    currency: 'coins'
  },
  {
    id: 'tag_explorer',
    name: 'תג חוקר',
    description: 'תג "חוקר" מיוחד לפרופיל 🗺️',
    icon: '🗺️',
    price: 350,
    currency: 'coins'
  },
  {
    id: 'tag_veteran',
    name: 'תג ותיק',
    description: 'תג "ותיק" מיוחד לפרופיל 🎖️',
    icon: '🎖️',
    price: 450,
    currency: 'coins'
  },
  
  // פריטים מיוחדים ומעניינים
  {
    id: 'lucky_wheel',
    name: 'גלגל המזל',
    description: 'סובב את גלגל המזל וזכה בפרס אקראי! 🎰',
    icon: '🎰',
    price: 300,
    currency: 'coins'
  },
  {
    id: 'mystery_box',
    name: 'תיבת אוצר מסתורית',
    description: 'פתח תיבה וקבל פריט אקראי מיוחד! 🎁',
    icon: '🎁',
    price: 500,
    currency: 'coins'
  },
  {
    id: 'special_star',
    name: 'כוכב מיוחד',
    description: 'כוכב נוצץ שמשנה צבע בפרופיל שלך ⭐',
    icon: '🌟',
    price: 250,
    currency: 'coins'
  },
  {
    id: 'background_music',
    name: 'מוזיקת רקע מיוחדת',
    description: 'נגן מוזיקה מרגיעה בזמן המשחקים 🎵',
    icon: '🎵',
    price: 400,
    currency: 'coins'
  },
  
  // כניסה חינמית למשחקים פרמיום - דרך פרסומת!
  {
    id: 'premium_access_ad',
    name: 'כניסה חינמית למשחק פרמיום',
    description: '🎬 צפה בפרסומת קצרה וקבל כניסה אחת למשחק וורד קלאש!',
    icon: '🎟️',
    price: 0,
    currency: 'coins',
    requireAd: true // דגל מיוחד שמציין שצריך לצפות בפרסומת
  },
  {
    id: 'show_solution',
    name: 'הצג פתרון',
    description: 'הצג את כל הקלפים פתוחים למשך 5 שניות',
    icon: '🎯',
    price: 150,
    currency: 'coins'
  },
  {
    id: 'opponent_freeze',
    name: 'הקפה יריב',
    description: 'עצור את היריב למשך 10 שניות',
    icon: '❄️',
    price: 500,
    currency: 'coins',
    diamondPrice: 25
  },
  
  // חבילות מטבעות בכסף - מעודכן!
  {
    id: 'coin_pack_small',
    name: 'חבילת מטבעות קטנה',
    description: '5,000 מטבעות + 500 יהלומים',
    icon: '🪙',
    price: 9.90,
    currency: 'money',
    coinAmount: 5000,
    diamondAmount: 500
  },
  {
    id: 'coin_pack_medium',
    name: 'חבילת מטבעות בינונית',
    description: '12,000 מטבעות + 1,200 יהלומים',
    icon: '💰',
    price: 19.90,
    currency: 'money',
    coinAmount: 12000,
    diamondAmount: 1200
  },
  {
    id: 'coin_pack_large',
    name: 'חבילת מטבעות גדולה',
    description: '25,000 מטבעות + 2,500 יהלומים',
    icon: '💎',
    price: 39.90,
    currency: 'money',
    coinAmount: 25000,
    diamondAmount: 2500
  },
  {
    id: 'coin_pack_mega',
    name: 'חבילת מטבעות ענקית',
    description: '50,000 מטבעות + 5,000 יהלומים',
    icon: '🏆',
    price: 69.90,
    currency: 'money',
    coinAmount: 50000,
    diamondAmount: 5000
  },
  {
    id: 'coin_pack_ultimate',
    name: 'חבילת מטבעות אולטימטיבית',
    description: '125,000 מטבעות + 12,500 יהלומים',
    icon: '👑',
    price: 149.90,
    currency: 'money',
    coinAmount: 125000,
    diamondAmount: 12500
  },
  {
    id: 'diamond_pack_small',
    name: 'חבילת יהלומים קטנה',
    description: '500 יהלומים',
    icon: '💎',
    price: 4.90,
    currency: 'money',
    diamondAmount: 500
  },
  {
    id: 'diamond_pack_medium',
    name: 'חבילת יהלומים בינונית',
    description: '1,250 יהלומים',
    icon: '💎💎',
    price: 9.90,
    currency: 'money',
    diamondAmount: 1250
  },
  {
    id: 'diamond_pack_large',
    name: 'חבילת יהלומים גדולה',
    description: '2,500 יהלומים',
    icon: '💎💎💎',
    price: 19.90,
    currency: 'money',
    diamondAmount: 2500
  },
  {
    id: 'diamond_pack_mega',
    name: 'חבילת יהלומים ענקית',
    description: '5,000 יהלומים',
    icon: '💎💎💎💎',
    price: 39.90,
    currency: 'money',
    diamondAmount: 5000
  },
  {
    id: 'starter_pack',
    name: 'חבילת התחלה',
    description: '500 מטבעות + 25 יהלומים + רמזים',
    icon: '🎁',
    price: 18,
    currency: 'money',
    coinAmount: 500,
    diamondAmount: 25
  },
  {
    id: 'pro_pack',
    name: 'חבילת מקצוען',
    description: '18,000 מטבעות + 1,200 יהלומים + פריטים מיוחדים',
    icon: '⭐',
    price: 108,
    currency: 'money',
    coinAmount: 18000,
    diamondAmount: 1200
  },
  {
    id: 'vip_pack',
    name: 'חבילת VIP',
    description: '45,000 מטבעות + 3,000 יהלומים + פריטים אקסקלוסיביים',
    icon: '👑',
    price: 216,
    currency: 'money',
    coinAmount: 45000,
    diamondAmount: 3000
  },
  {
    id: 'mega_bundle',
    name: 'חבילה מגה',
    description: '90,000 מטבעות + 6,000 יהלומים + כל הפריטים',
    icon: '🚀',
    price: 360,
    currency: 'money',
    coinAmount: 90000,
    diamondAmount: 6000
  },
  {
    id: 'ultimate_bundle',
    name: 'חבילה אולטימטיבית',
    description: '300,000 מטבעות + 18,000 יהלומים + כל הפריטים + בונוסים',
    icon: '🌟',
    price: 720,
    currency: 'money',
    coinAmount: 300000,
    diamondAmount: 18000
  }
];

export default function ShopPage() {
  const [coins, setCoins] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [selectedCurrency, setSelectedCurrency] = useState<'coins' | 'diamonds'>('coins');
  const [showAdReward, setShowAdReward] = useState(false);
  const [adRewardItem, setAdRewardItem] = useState<ShopItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load coins, diamonds and inventory from database
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
              
              setCoins(freshUserData.coins ?? 500);
              setDiamonds(freshUserData.diamonds ?? 100);
              
              // Update localStorage with fresh data
              const updatedUser = { ...userData, coins: freshUserData.coins, diamonds: freshUserData.diamonds };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
              console.log('Loaded fresh user data from database:', { coins: freshUserData.coins, diamonds: freshUserData.diamonds });
            } else {
              // Fallback to localStorage
              setCoins(userData.coins || 500);
              setDiamonds(userData.diamonds || 100);
            }
          } catch (error) {
            console.error('Failed to fetch user data:', error);
            // Fallback to localStorage
            setCoins(userData.coins || 500);
            setDiamonds(userData.diamonds || 100);
          }
        } else {
          setCoins(500);
          setDiamonds(100);
        }
        
        const savedInventory = localStorage.getItem('quiz-inventory');
        if (savedInventory) setInventory(JSON.parse(savedInventory));
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  useEffect(() => {
    localStorage.setItem('quiz-inventory', JSON.stringify(inventory));
    console.log('Saved inventory to localStorage:', inventory);
    console.log('Raw quiz-inventory from localStorage (after save):', localStorage.getItem('quiz-inventory'));
  }, [inventory]);

  useEffect(() => {
    // Listen for storage changes to update coins, diamonds and inventory
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        try {
          const user = JSON.parse(e.newValue);
          setCoins(user.coins || 500);
          setDiamonds(user.diamonds || 50);
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }
      if (e.key === 'quiz-inventory' && e.newValue) {
        try {
          const inv = JSON.parse(e.newValue);
          setInventory(inv);
        } catch (error) {
          console.error('Failed to parse inventory data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  async function buyItem(item: ShopItem) {
    // Handle ad-based rewards
    if ((item as any).requireAd) {
      setAdRewardItem(item);
      setShowAdReward(true);
      return;
    }
    
    // Handle money purchases - redirect to payment page
    if (item.currency === 'money') {
      // Store the item to buy in localStorage for the payment page
      localStorage.setItem('item-to-buy', JSON.stringify(item));
      // Redirect to payment page
      router.push('/payment');
      return;
    }
    
    // Handle avatar purchases
    if (item.id.startsWith('avatar_')) {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        
        const user = JSON.parse(userStr);
        const response = await fetch('/api/user/buy-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            avatarId: item.id.replace('avatar_', ''),
            price: item.price
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setCoins(data.coins);
          
          // עדכן את המשתמש ב-localStorage עם האווטארים החדשים
          user.coins = data.coins;
          
          // וודא שה-ownedAvatars הוא מערך
          if (Array.isArray(data.ownedAvatars)) {
            user.ownedAvatars = data.ownedAvatars;
          } else {
            user.ownedAvatars = data.ownedAvatars ? JSON.parse(data.ownedAvatars) : [];
          }
          
          localStorage.setItem('user', JSON.stringify(user));
          
          console.log('✅ Avatar purchased successfully:', data);
          console.log('✅ Updated user in localStorage:', user);
          
          alert(`🎉 קנית את האווטאר ${item.name}!\n\nהאווטאר נוסף לפרופיל שלך.\nלך לפרופיל כדי לבחור בו!`);
          
          // רענן את הדף כדי לעדכן את הרשימה
          setTimeout(() => {
            window.location.reload();
          }, 500);
          return;
        } else {
          const error = await response.json();
          alert(error.error || 'שגיאה בקניית האווטאר');
          return;
        }
      } catch (error) {
        console.error('Error buying avatar:', error);
        return;
      }
    }
    
    // Handle tag purchases
    if (item.id.startsWith('tag_')) {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        
        const user = JSON.parse(userStr);
        const response = await fetch('/api/user/buy-tag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            tagId: item.id.replace('tag_', ''),
            price: item.price
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setCoins(data.coins);
          
          // עדכן את המשתמש ב-localStorage עם התגים החדשים
          user.coins = data.coins;
          
          // וודא שה-ownedTags הוא מערך
          if (Array.isArray(data.ownedTags)) {
            user.ownedTags = data.ownedTags;
          } else {
            user.ownedTags = data.ownedTags ? JSON.parse(data.ownedTags) : [];
          }
          
          localStorage.setItem('user', JSON.stringify(user));
          
          console.log('✅ Tag purchased successfully:', data);
          console.log('✅ Updated user in localStorage:', user);
          
          alert(`🎉 קנית את התג ${item.name}!\n\nהתג נוסף לפרופיל שלך.\nלך לפרופיל כדי לבחור בו!`);
          
          // רענן את הדף כדי לעדכן את הרשימה
          setTimeout(() => {
            window.location.reload();
          }, 500);
          return;
        } else {
          const error = await response.json();
          alert(error.error || 'שגיאה בקניית התג');
          return;
        }
      } catch (error) {
        console.error('Error buying tag:', error);
        return;
      }
    }
    
    // Handle regular coin/diamond purchases
    const useDiamonds = selectedCurrency === 'diamonds' && item.diamondPrice;
    const price = useDiamonds ? item.diamondPrice! : item.price;
    const currentAmount = useDiamonds ? diamonds : coins;
    
    if (currentAmount < price) return;
    
    if (useDiamonds) {
      setDiamonds(prev => {
        const newDiamonds = prev - price;
        // Update user object in localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.diamonds = newDiamonds;
          localStorage.setItem('user', JSON.stringify(user));
          // Trigger storage event to update Navbar
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'user',
            newValue: JSON.stringify(user)
          }));
        }
        console.log('Saved diamonds to localStorage:', newDiamonds);
        return newDiamonds;
      });
    } else {
      setCoins(prev => {
        const newCoins = prev - price;
        // Update user object in localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.coins = newCoins;
          localStorage.setItem('user', JSON.stringify(user));
          // Trigger storage event to update Navbar
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'user',
            newValue: JSON.stringify(user)
          }));
        }
        console.log('Saved coins to localStorage:', newCoins);
        return newCoins;
      });
    }
    
    setInventory(prev => {
      const newInv = { ...prev, [item.id]: (prev[item.id] || 0) + 1 };
      localStorage.setItem('quiz-inventory', JSON.stringify(newInv));
      // Trigger storage event to update other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'quiz-inventory',
        newValue: JSON.stringify(newInv)
      }));
      console.log('Buy item, new inventory:', newInv);
      return newInv;
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">חנות הפריטים</h1>
          <p className="text-lg text-gray-600 mb-4">השתמשו במטבעות שצברתם כדי לקנות פריטים שיעזרו לכם במשחקים!</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-white rounded-full px-6 py-2 shadow text-xl font-bold text-yellow-600 border-2 border-yellow-300">
              <span className="text-2xl">🪙</span> מטבעות: {coins}
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-6 py-2 shadow text-xl font-bold text-blue-600 border-2 border-blue-300">
              <span className="text-2xl">💎</span> יהלומים: {diamonds}
            </div>
            <button
              onClick={() => router.push('/shop/currency')}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold shadow hover:from-orange-500 hover:to-yellow-400 transition-all duration-200"
            >
              💎 רכישת מטבעות
            </button>
            <button
              onClick={() => router.push('/payment')}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full font-bold shadow hover:from-green-600 hover:to-blue-700 transition-all duration-200"
            >
              🛒 חנות מטבעות
            </button>
          </div>
          
          {/* בחירת מטבע */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-lg font-semibold text-gray-700">בחר מטבע:</span>
            <button
              onClick={() => setSelectedCurrency('coins')}
              className={`px-4 py-2 rounded-full font-bold transition-all duration-200 ${
                selectedCurrency === 'coins'
                  ? 'bg-yellow-400 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              🪙 מטבעות
            </button>
            <button
              onClick={() => setSelectedCurrency('diamonds')}
              className={`px-4 py-2 rounded-full font-bold transition-all duration-200 ${
                selectedCurrency === 'diamonds'
                  ? 'bg-blue-400 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              💎 יהלומים
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {SHOP_ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-3">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex items-center justify-center gap-3 mb-2">
                {item.currency === 'money' ? (
                  <span className="text-lg font-bold text-green-600">₪{item.price}</span>
                ) : selectedCurrency === 'diamonds' && item.diamondPrice ? (
                  <span className="text-lg font-bold text-blue-600">{item.diamondPrice} 💎</span>
                ) : (
                  <span className="text-lg font-bold text-yellow-600">{item.price} 🪙</span>
                )}
                <button
                  onClick={() => buyItem(item)}
                  disabled={item.currency === 'money' ? false : (selectedCurrency === 'diamonds' && item.diamondPrice ? diamonds < item.diamondPrice! : coins < item.price)}
                  className={`px-6 py-2 rounded-full font-bold shadow transition-all duration-200 ${
                    item.currency === 'money' 
                      ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-blue-500 hover:to-green-400'
                      : (selectedCurrency === 'diamonds' && item.diamondPrice ? diamonds < item.diamondPrice! : coins < item.price)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-blue-500 hover:to-green-400'
                  }`}
                >
                  {item.currency === 'money' ? 'קנה בכסף' : 'קנה'}
                </button>
              </div>
              {item.diamondPrice && item.currency !== 'money' && (
                <div className="text-sm text-gray-500">
                  או {item.diamondPrice} 💎
                </div>
              )}
              {item.currency === 'money' && (
                <div className="text-sm text-green-600 font-bold">
                  💳 תשלום מאובטח
                </div>
              )}
              {inventory[item.id] && item.currency !== 'money' && (
                <div className="mt-2 text-sm text-green-700 font-bold">ברשותך: {inventory[item.id]}</div>
              )}
              {item.currency === 'money' && (item.coinAmount || item.diamondAmount) && (
                <div className="mt-2 text-sm text-blue-600 font-bold">
                  {item.coinAmount && `+${item.coinAmount} מטבעות`}
                  {item.coinAmount && item.diamondAmount && ' + '}
                  {item.diamondAmount && `+${item.diamondAmount} יהלומים`}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-pink-400 rounded-2xl p-6 text-white shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-2">המלאי שלך</h2>
          {Object.keys(inventory).length === 0 && <div className="text-lg">עדיין לא רכשת פריטים.</div>}
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            {Object.entries(inventory).map(([id, count]) => {
              const item = SHOP_ITEMS.find(i => i.id === id);
              if (!item) return null;
              return (
                <div key={id} className="flex items-center gap-2 bg-white bg-opacity-80 rounded-full px-4 py-2 text-lg font-bold text-gray-800 shadow">
                  <span className="text-2xl">{item.icon}</span> {item.name} <span className="text-blue-600">x{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rewarded Ad Modal */}
      {showAdReward && adRewardItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full mx-4">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎬</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                צפה בפרסומת
              </h2>
              <p className="text-gray-600">
                צפה בפרסומת קצרה וקבל {adRewardItem.name}!
              </p>
            </div>
            
            <div className="mb-6">
              <RewardedAd
                onReward={(reward: any) => {
                  // אחרי שצפה בפרסומת, תן לו כרטיס למשחק
                  const userStr = localStorage.getItem('user');
                  if (userStr) {
                    const user = JSON.parse(userStr);
                    // שמור את הכרטיס למשחק
                    const premiumPasses = JSON.parse(localStorage.getItem('premium-passes') || '{}');
                    premiumPasses['word-clash'] = (premiumPasses['word-clash'] || 0) + 1;
                    localStorage.setItem('premium-passes', JSON.stringify(premiumPasses));
                    
                    // עדכון מיידי של כל הטאבים והדפים
                    window.dispatchEvent(new StorageEvent('storage', {
                      key: 'premium-passes',
                      newValue: JSON.stringify(premiumPasses)
                    }));
                    
                    // שליחת event מותאם אישית
                    window.dispatchEvent(new CustomEvent('premiumPassUpdated', {
                      detail: { game: 'word-clash', passes: premiumPasses['word-clash'] }
                    }));
                    
                    // הודעה יפה יותר
                    setTimeout(() => {
                      alert(`🎉 מעולה! קיבלת כניסה אחת למשחק וורד קלאש!\n\nיש לך כעת ${premiumPasses['word-clash']} כרטיס${premiumPasses['word-clash'] > 1 ? 'ים' : ''} זמין${premiumPasses['word-clash'] > 1 ? 'ים' : ''}.\n\nעכשיו תוכל לשחק במשחק Word Clash!`);
                      setShowAdReward(false);
                      setAdRewardItem(null);
                    }, 500);
                  } else {
                    setShowAdReward(false);
                    setAdRewardItem(null);
                  }
                }}
                rewardType="coins"
                rewardAmount={0}
                testMode={false}
              />
            </div>
            
            <button
              onClick={() => {
                setShowAdReward(false);
                setAdRewardItem(null);
              }}
              className="w-full py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors duration-200 font-bold"
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </main>
  );
} 