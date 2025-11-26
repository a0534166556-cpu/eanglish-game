'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthUser from '@/lib/useAuthUser';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthUser();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token'); // PayPal order ID
    const status = urlParams.get('status');

    if (token) {
      // Capture PayPal payment
      capturePayPalPayment(token);
    } else if (status === 'success') {
      setPaymentStatus('success');
      setLoading(false);
    } else {
      setPaymentStatus('error');
      setLoading(false);
    }
  }, []);

  const capturePayPalPayment = async (orderId: string) => {
    try {
      const response = await fetch('/api/payment/paypal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const result = await response.json();

      if (result.success && result.status === 'COMPLETED') {
        setPaymentStatus('success');
        // Add coins/diamonds to user account
        if (user) {
          const newUser = { ...user };
          // This would be handled by your backend
          updateUser(newUser);
        }
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      // console.error('Payment capture error:', error);
      setPaymentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">בודק את התשלום...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            התשלום הושלם בהצלחה!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            תודה על הרכישה! המטבעות והיהלומים שלך נוספו לחשבון.
          </p>
          
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold">✅ התשלום אושר</p>
            <p>המטבעות והיהלומים שלך זמינים עכשיו!</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/shop')}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300"
            >
              🛒 לך לחנות
            </button>
            
            <button
              onClick={() => router.push('/games')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
            >
              🎮 התחל לשחק
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="text-6xl mb-6">❌</div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          שגיאה בתשלום
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          אירעה שגיאה בעיבוד התשלום. אנא נסה שוב.
        </p>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold">⚠️ התשלום נכשל</p>
          <p>אנא בדוק את פרטי התשלום ונסה שוב</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/payment')}
            className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:from-red-600 hover:to-orange-700 transition-all duration-300"
          >
            🔄 נסה שוב
          </button>
          
          <button
            onClick={() => router.push('/shop')}
            className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
          >
            🏠 חזור לחנות
          </button>
        </div>
      </div>
    </div>
  );
}
