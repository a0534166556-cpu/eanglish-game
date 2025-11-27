'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthUser from '@/lib/useAuthUser';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  currency: 'coins' | 'diamonds' | 'money';
  coinAmount?: number;
  diamondAmount?: number;
}

export default function PaymentPage() {
  const { user, loading: authLoading } = useAuthUser();
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if there's an item to buy from the shop
    const itemToBuy = localStorage.getItem('item-to-buy');
    if (itemToBuy) {
      try {
        const item = JSON.parse(itemToBuy);
        setSelectedItem(item);
        // Clear the item from localStorage
        localStorage.removeItem('item-to-buy');
      } catch (error) {
        // console.error('Error parsing item to buy:', error);
      }
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handlePayment = async (amount: number, description: string, coins?: number, diamonds?: number) => {
    // Double check user from localStorage as fallback
    const userFromStorage = localStorage.getItem('user');
    if (!user && !userFromStorage) {
      alert('נא להתחבר תחילה');
      router.push('/login');
      return;
    }
    
    // Use user from hook or parse from localStorage
    const currentUser = user || (userFromStorage ? JSON.parse(userFromStorage) : null);
    if (!currentUser) {
      alert('נא להתחבר תחילה');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // Use PayPal for payment
      const response = await fetch('/api/payment/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'ILS',
          description: description,
          diamonds: diamonds || 0,
          coins: coins || 0,
        }),
      });

      const result = await response.json();

      if (result.success && result.approvalUrl) {
        // Redirect to PayPal for payment approval
        window.location.href = result.approvalUrl;
        return;
      }

      if (result.success) {
        // Add coins/diamonds to user account
        const newUser = { ...currentUser };
        
        if (selectedItem) {
          // Handle specific item from shop
          newUser.coins = (newUser.coins || 0) + (selectedItem.coinAmount || 0);
          newUser.diamonds = (newUser.diamonds || 0) + (selectedItem.diamondAmount || 0);
          
          // Add special items to inventory
          if (selectedItem.id === 'starter_pack') {
            const inventory = JSON.parse(localStorage.getItem('quiz-inventory') || '{}');
            inventory['hint'] = (inventory['hint'] || 0) + 5;
            inventory['extra_time'] = (inventory['extra_time'] || 0) + 3;
            localStorage.setItem('quiz-inventory', JSON.stringify(inventory));
          } else if (selectedItem.id === 'pro_pack') {
            const inventory = JSON.parse(localStorage.getItem('quiz-inventory') || '{}');
            inventory['hint'] = (inventory['hint'] || 0) + 10;
            inventory['extra_time'] = (inventory['extra_time'] || 0) + 5;
            inventory['skip'] = (inventory['skip'] || 0) + 3;
            inventory['score_boost'] = (inventory['score_boost'] || 0) + 2;
            localStorage.setItem('quiz-inventory', JSON.stringify(inventory));
          } else if (selectedItem.id === 'vip_pack') {
            const inventory = JSON.parse(localStorage.getItem('quiz-inventory') || '{}');
            inventory['hint'] = (inventory['hint'] || 0) + 20;
            inventory['extra_time'] = (inventory['extra_time'] || 0) + 10;
            inventory['skip'] = (inventory['skip'] || 0) + 5;
            inventory['score_boost'] = (inventory['score_boost'] || 0) + 5;
            inventory['show_solution'] = (inventory['show_solution'] || 0) + 3;
            inventory['opponent_freeze'] = (inventory['opponent_freeze'] || 0) + 2;
            localStorage.setItem('quiz-inventory', JSON.stringify(inventory));
          }
        } else {
          // Handle regular payment options
          if (description.includes('מטבעות')) {
            const coinAmount = amount === 18 ? 100 : amount === 72 ? 500 : amount === 126 ? 1000 : 0;
            newUser.coins = (newUser.coins || 0) + coinAmount;
          }
          if (description.includes('יהלומים')) {
            const diamondAmount = amount === 36 ? 50 : amount === 126 ? 200 : 0;
            newUser.diamonds = (newUser.diamonds || 0) + diamondAmount;
          }
          if (description.includes('פרימיום')) {
            newUser.premium = true;
          }
        }
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(newUser));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(newUser)
        }));
        
        alert('🎉 הרכישה הושלמה בהצלחה! המטבעות/יהלומים נוספו לחשבון שלכם!');
        setPaymentUrl('success');
      } else {
        alert('שגיאה ביצירת התשלום: ' + result.error);
      }
    } catch (error) {
      // console.error('Payment error:', error);
      alert('שגיאה ביצירת התשלום');
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    {
      id: 'coins-100',
      title: '100 מטבעות',
      description: 'מטבעות למשחקים',
      price: 18,
      currency: 'ILS',
      coins: 100,
      benefits: ['100 מטבעות זהב', '5 רמזים חינם', '10 שניות נוספות'],
      icon: '🪙',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      id: 'coins-500',
      title: '500 מטבעות',
      description: 'חבילת מטבעות גדולה',
      price: 72,
      currency: 'ILS',
      coins: 500,
      benefits: ['500 מטבעות זהב', '25 רמזים חינם', '50 שניות נוספות', '2x בונוס ניקוד'],
      icon: '💰',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'coins-1000',
      title: '1000 מטבעות',
      description: 'חבילת מטבעות ענקית',
      price: 126,
      currency: 'ILS',
      coins: 1000,
      benefits: ['1000 מטבעות זהב', '50 רמזים חינם', '100 שניות נוספות', '3x בונוס ניקוד', 'אווטאר מיוחד'],
      icon: '🏆',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'diamonds-50',
      title: '50 יהלומים',
      description: 'יהלומים נדירים',
      price: 36,
      currency: 'ILS',
      diamonds: 50,
      benefits: ['50 יהלומים כחולים', '10 דילוגים חינם', '5 הצגות פתרון', 'תג זהב'],
      icon: '💎',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'diamonds-200',
      title: '200 יהלומים',
      description: 'חבילת יהלומים גדולה',
      price: 126,
      currency: 'ILS',
      diamonds: 200,
      benefits: ['200 יהלומים כחולים', '50 דילוגים חינם', '25 הצגות פתרון', 'תג פלטינה', 'רקע מיוחד'],
      icon: '💠',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'premium',
      title: 'מנוי פרימיום',
      description: 'גישה לכל התכונות',
      price: 54,
      currency: 'ILS',
      premium: true,
      benefits: ['גישה לכל המשחקים', 'אין פרסומות', 'מטבעות בלתי מוגבלים', 'יהלומים יומיים', 'תמיכה עדיפות', 'תכונות אקסקלוסיביות'],
      icon: '👑',
      color: 'from-purple-500 to-pink-600'
    },
  ];

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-xl text-gray-600">מעבר לדף ההתחברות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🛒 חנות המשחק
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            רכשו מטבעות, יהלומים ומנוי פרימיום כדי לשפר את חוויית המשחק שלכם
          </p>
          
          {selectedItem && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg max-w-lg mx-auto mb-4">
              <p className="font-bold text-lg">🛒 פריט שנבחר:</p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-3xl">{selectedItem.icon}</span>
                <div>
                  <p className="font-bold">{selectedItem.name}</p>
                  <p className="text-sm">{selectedItem.description}</p>
                  <p className="text-lg font-bold">₪{selectedItem.price}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg max-w-md mx-auto">
            <p className="font-bold">🎮 חוויית משחק משופרת</p>
            <p className="text-sm">פתחו תכונות מיוחדות ופריטים אקסקלוסיביים!</p>
          </div>
        </div>

        {selectedItem && (
          <div className="mb-8 flex justify-center">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedItem.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedItem.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedItem.description}
                </p>
                
                <div className="text-3xl font-bold text-blue-600 mb-6">
                  ₪{selectedItem.price}
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">מה תקבלו:</h4>
                  <ul className="text-left space-y-2">
                    {selectedItem.coinAmount && (
                      <li className="flex items-center text-sm text-gray-600">
                        <span className="text-green-500 mr-2">✓</span>
                        {selectedItem.coinAmount} מטבעות זהב
                      </li>
                    )}
                    {selectedItem.diamondAmount && (
                      <li className="flex items-center text-sm text-gray-600">
                        <span className="text-green-500 mr-2">✓</span>
                        {selectedItem.diamondAmount} יהלומים כחולים
                      </li>
                    )}
                    {selectedItem.id === 'starter_pack' && (
                      <>
                        <li className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          5 רמזים חינם
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          3 תוספות זמן
                        </li>
                      </>
                    )}
                    {selectedItem.id === 'pro_pack' && (
                      <>
                        <li className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          10 רמזים חינם
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          5 תוספות זמן
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          3 דילוגים
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          2 בונוסי ניקוד
                        </li>
                      </>
                    )}
                    {selectedItem.id === 'vip_pack' && (
                      <>
                        <li className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          20 רמזים חינם
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          10 תוספות זמן
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          5 דילוגים
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          5 בונוסי ניקוד
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          3 הצגות פתרון
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                          <span className="text-green-500 mr-2">✓</span>
                          2 הקפות יריב
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => handlePayment(
                    selectedItem.price, 
                    selectedItem.description,
                    selectedItem.coinAmount,
                    selectedItem.diamondAmount
                  )}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                  {loading ? 'מעבד...' : '💳 שלם עם PayPal'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-blue-200"
            >
              <div className="text-center">
                <div className={`text-6xl mb-4 bg-gradient-to-r ${option.color} bg-clip-text text-transparent`}>
                  {option.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {option.description}
                </p>
                
                <div className="text-3xl font-bold text-blue-600 mb-6">
                  ₪{option.price}
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">מה תקבלו:</h4>
                  <ul className="text-left space-y-2">
                    {option.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <span className="text-green-500 mr-2">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handlePayment(
                    option.price, 
                    option.description,
                    option.coins,
                    option.diamonds
                  )}
                  disabled={loading}
                  className={`w-full bg-gradient-to-r ${option.color} text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105`}
                >
                  {loading ? 'מעבד...' : '💳 שלם עם PayPal'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🎮 למה לקנות במשחק?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                חוויית משחק משופרת
              </h3>
              <p className="text-gray-600">
                פתחו תכונות מיוחדות, רמזים, ופריטים אקסקלוסיביים שיעזרו לכם לנצח
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                יתרון תחרותי
              </h3>
              <p className="text-gray-600">
                קבלו בונוסים מיוחדים, זמן נוסף, וכלים שיעזרו לכם להגיע לראש הטבלה
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                פריטים אקסקלוסיביים
              </h3>
              <p className="text-gray-600">
                אווטארים מיוחדים, תגים, רקעים, ותכונות שרק אתם תוכלו לקבל
              </p>
            </div>
          </div>
        </div>

        {paymentUrl && (
          <div className="mt-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="text-center">
              🎉 הרכישה הושלמה בהצלחה! המטבעות/יהלומים נוספו לחשבון שלכם!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
