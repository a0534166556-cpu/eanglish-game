'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PurchaseSubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 10.00,
      currency: 'ILS',
      period: 'חודש',
      features: [
        'ביטול פרסומות במשחקים'
      ],
      color: 'from-blue-400 to-blue-600',
      icon: '🌟',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 29.90,
      currency: 'ILS',
      period: 'חודש',
      features: [
        'כל התכונות של Basic',
        'גישה למשחק Word Clash',
        'תכונות מתקדמות בבית הוירטואלי',
        '50% הנחה על כל הפריטים בבית הוירטואלי ובחנות',
        'עדיפות בתמיכה'
      ],
      color: 'from-purple-400 to-purple-600',
      icon: '⭐',
      popular: true
    },
    {
      id: 'yearly',
      name: 'Yearly Premium',
      price: 299.90,
      currency: 'ILS',
      period: 'שנה',
      features: [
        'כל התכונות של Premium',
        'חיסכון של 16% לעומת תשלום חודשי',
        '50% הנחה על כל הפריטים בבית הוירטואלי ובחנות',
        'גישה מוקדמת לתכונות חדשות',
        'תמיכה עדיפות 24/7',
        'הטבות בלעדיות'
      ],
      color: 'from-yellow-400 to-orange-600',
      icon: '👑',
      popular: false
    }
  ];

  const handlePurchase = async () => {
    if (!selectedPlan) {
      alert('אנא בחר תוכנית מנוי');
      return;
    }
    
    // מעבר לדף התשלום עם פרמטר התוכנית שנבחרה
    router.push(`/subscription/payment?plan=${selectedPlan}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            🚀 שדרג את החוויה שלך
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            פתח את הפוטנציאל המלא של האפליקציה עם מנוי פרימיום
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 cursor-pointer ${
                selectedPlan === plan.id
                  ? 'ring-4 ring-purple-500 scale-105'
                  : 'hover:scale-105 hover:shadow-2xl'
              } ${plan.popular ? 'border-4 border-yellow-400' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    🔥 הכי פופולרי
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-6xl mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-800">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.currency}</span>
                  <div className="text-gray-500 text-sm">לכל {plan.period}</div>
                </div>
                
                <ul className="text-left space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 ${
                    selectedPlan === plan.id
                      ? `bg-gradient-to-r ${plan.color} shadow-lg`
                      : `bg-gradient-to-r ${plan.color} hover:shadow-lg`
                  }`}
                >
                  {selectedPlan === plan.id ? '✓ נבחר' : 'בחר תוכנית'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Purchase Button */}
        <div className="text-center">
          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className={`bg-gradient-to-r from-green-500 to-green-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                מעבד...
              </div>
            ) : (
              '🛒 רכוש עכשיו'
            )}
          </button>
          
          <div className="mt-6 text-gray-600">
            <p>💳 תשלום מאובטח • ביטול בכל עת • תמיכה 24/7</p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🎯 למה לבחור במנוי שלנו?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">משחקים אקסקלוסיביים</h3>
              <p className="text-gray-600">גישה למשחקים מתקדמים כמו Word Clash</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">🚫</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">ללא פרסומות</h3>
              <p className="text-gray-600">חווית משחק נקייה ללא הפרעות</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">בית וירטואלי מתקדם</h3>
              <p className="text-gray-600">פריטים וקישוטים אקסקלוסיביים</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">מעקב מתקדם</h3>
              <p className="text-gray-600">ניתוח מפורט של ההתקדמות שלך</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            ❓ שאלות נפוצות
          </h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">האם אוכל לבטל את המנוי בכל עת?</h3>
              <p className="text-gray-600">כן! אתה יכול לבטל את המנוי בכל עת ללא עמלות נוספות.</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">מה קורה אם המנוי שלי פג?</h3>
              <p className="text-gray-600">תוכל להמשיך להשתמש בתכונות הבסיסיות, אך תכונות הפרימיום יהיו זמינות רק לאחר חידוש המנוי.</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">איך מתבצע התשלום?</h3>
              <p className="text-gray-600">התשלום מתבצע באופן מאובטח דרך כרטיס אשראי או PayPal.</p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">האם יש החזר כספי?</h3>
              <p className="text-gray-600">כן, אנו מציעים החזר כספי מלא תוך 30 יום מרכישת המנוי.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
