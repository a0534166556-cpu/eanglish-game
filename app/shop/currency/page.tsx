'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  diamonds: number;
  coins: number;
}

interface CurrencyPackage {
  id: string;
  name: string;
  description: string;
  diamonds: number;
  coins: number;
  price: number;
  currency: string;
  popular?: boolean;
  bonus?: number;
}

export default function CurrencyShop() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CurrencyPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const currencyPackages: CurrencyPackage[] = [
    {
      id: 'starter',
      name: 'חבילת התחלה',
      description: 'מושלם למתחילים',
      diamonds: 500,
      coins: 5000,
      price: 4.99,
      currency: 'USD'
    },
    {
      id: 'popular',
      name: 'חבילה פופולרית',
      description: 'הכי פופולרית!',
      diamonds: 2000,
      coins: 20000,
      price: 19.99,
      currency: 'USD',
      popular: true,
      bonus: 300
    },
    {
      id: 'premium',
      name: 'חבילה פרימיום',
      description: 'ערך מעולה',
      diamonds: 5000,
      coins: 50000,
      price: 39.99,
      currency: 'USD',
      bonus: 1000
    },
    {
      id: 'ultimate',
      name: 'חבילה אולטימטיבית',
      description: 'הכי הרבה ערך',
      diamonds: 15000,
      coins: 150000,
      price: 79.99,
      currency: 'USD',
      bonus: 5000
    }
  ];

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        router.push('/login');
      }
    };

    loadUserData();
  }, [router]);

  const validateCard = (cardNumber: string) => {
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const validateExpiry = (expiry: string) => {
    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expYear > currentYear) return true;
    if (expYear === currentYear && expMonth >= currentMonth) return true;
    return false;
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !user) return;

    setError('');
    setIsProcessing(true);

    try {
      // Validate payment details
      if (paymentMethod === 'card') {
        if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
          setError('אנא מלא את כל פרטי הכרטיס');
          setIsProcessing(false);
          return;
        }

        if (!validateCard(cardDetails.number.replace(/\s/g, ''))) {
          setError('מספר כרטיס לא תקין');
          setIsProcessing(false);
          return;
        }

        if (!validateExpiry(cardDetails.expiry)) {
          setError('תאריך תפוגה לא תקין');
          setIsProcessing(false);
          return;
        }
      }

      // Process payment
      const response = await fetch('/api/shop/currency/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          packageId: selectedPackage.id,
          paymentMethod,
          cardDetails: paymentMethod === 'card' ? cardDetails : null,
          amount: selectedPackage.price,
          currency: selectedPackage.currency
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update user data
        const updatedUser = {
          ...user,
          diamonds: user.diamonds + selectedPackage.diamonds + (selectedPackage.bonus || 0),
          coins: user.coins + selectedPackage.coins
        };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Trigger update event
        window.dispatchEvent(new CustomEvent('userUpdated', { 
          detail: updatedUser 
        }));
        
        alert('הרכישה הושלמה בהצלחה!');
        router.push('/shop');
      } else {
        setError(data.error || 'שגיאה בעיבוד התשלום');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError('שגיאה בעיבוד התשלום');
    } finally {
      setIsProcessing(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">💎 רכישת מטבעות</h1>
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
              onClick={() => router.push('/shop')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              חזור לחנות
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Currency Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {currencyPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-lg shadow-lg p-6 relative cursor-pointer transition-all hover:shadow-xl ${
                selectedPackage?.id === pkg.id ? 'ring-2 ring-blue-500' : ''
              } ${pkg.popular ? 'ring-2 ring-yellow-400' : ''}`}
              onClick={() => setSelectedPackage(pkg)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                    הכי פופולרי
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-yellow-600">💎</span>
                    <span className="text-2xl font-bold">{pkg.diamonds}</span>
                    {pkg.bonus && (
                      <span className="text-green-600 text-sm">+{pkg.bonus} בונוס</span>
                    )}
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-orange-600">🪙</span>
                    <span className="text-2xl font-bold">{pkg.coins}</span>
                  </div>
                </div>
                
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${pkg.price}
                </div>
                
                <button
                  className={`w-full py-2 px-4 rounded-lg font-bold transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {selectedPackage?.id === pkg.id ? 'נבחר' : 'בחר'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Section */}
        {selectedPackage && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">עיבוד תשלום</h2>
            
            {/* Package Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold mb-2">סיכום הרכישה</h3>
              <div className="flex justify-between items-center">
                <span>{selectedPackage.name}</span>
                <span className="font-bold">${selectedPackage.price}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>💎 {selectedPackage.diamonds} יהלומים</span>
                <span>🪙 {selectedPackage.coins} מטבעות</span>
              </div>
              {selectedPackage.bonus && (
                <div className="flex justify-between items-center mt-2 text-green-600">
                  <span>🎁 בונוס: {selectedPackage.bonus} יהלומים</span>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">אמצעי תשלום</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  💳 כרטיס אשראי
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    paymentMethod === 'paypal'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🅿️ PayPal
                </button>
              </div>
            </div>

            {/* Card Details */}
            {paymentMethod === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מספר כרטיס
                  </label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם על הכרטיס
                  </label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                    placeholder="שם מלא"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תאריך תפוגה
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'מעבד תשלום...' : `קנה עכשיו - $${selectedPackage.price}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
