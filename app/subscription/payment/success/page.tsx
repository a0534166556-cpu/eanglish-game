'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SubscriptionPaymentSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handlePayPalReturn = async () => {
      try {
        // קבלת פרמטרים מ-PayPal
        const token = searchParams?.get('token'); // PayPal order ID
        const plan = searchParams?.get('plan') || 'basic';

        if (!token) {
          setError('לא נמצא פרמטר תשלום');
          setLoading(false);
          return;
        }

        // Capture PayPal payment
        const captureResponse = await fetch('/api/payment/paypal', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId: token }),
        });

        const captureData = await captureResponse.json();

        if (!captureData.success || captureData.status !== 'COMPLETED') {
          setError('התשלום לא הושלם בהצלחה');
          setLoading(false);
          return;
        }

        // קבלת פרטי המנוי הממתין
        const pendingSub = localStorage.getItem('pending-subscription');
        if (!pendingSub) {
          setError('לא נמצאו פרטי מנוי ממתין');
          setLoading(false);
          return;
        }

        const pendingData = JSON.parse(pendingSub);
        const userId = pendingData.userId;

        // יצירת המנוי
        const subscribeResponse = await fetch('/api/subscription/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan: pendingData.plan,
            userId: userId,
            paymentMethod: 'paypal',
            paymentDetails: {
              orderId: token,
              captureId: captureData.captureId
            }
          }),
        });

        if (subscribeResponse.ok) {
          const subData = await subscribeResponse.json();
          
          // שמירת המנוי ב-localStorage
          localStorage.setItem('subscription', JSON.stringify(subData.subscription));
          localStorage.removeItem('pending-subscription');
          
          // עדכון מיידי של כל הטאבים
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'subscription',
            newValue: JSON.stringify(subData.subscription)
          }));
          
          setSubscription(subData.subscription);
        } else {
          const errorData = await subscribeResponse.json();
          setError(errorData.error || 'שגיאה ביצירת המנוי');
        }
      } catch (error) {
        console.error('Payment success error:', error);
        setError('שגיאה בעיבוד התשלום');
      } finally {
        setLoading(false);
      }
    };

    handlePayPalReturn();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl">מעבד את התשלום...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl shadow-2xl p-12">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">שגיאה בתשלום</h1>
          <p className="text-xl text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.push('/subscription/purchase')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg"
          >
            חזור לדף המנויים
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl shadow-2xl p-12">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          תשלום הושלם בהצלחה! 🎉
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          המנוי שלך הופעל בהצלחה. עכשיו תוכל ליהנות מכל התכונות!
        </p>

        {subscription && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              פרטי המנוי שלך:
            </h2>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">תוכנית:</span>
                <span className="font-semibold text-gray-900">
                  {subscription.plan === 'basic' ? 'Basic' : 
                   subscription.plan === 'premium' ? 'Premium' : 'Yearly'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">תאריך התחלה:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(subscription.startDate).toLocaleDateString('he-IL')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">תאריך סיום:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(subscription.endDate).toLocaleDateString('he-IL')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">סטטוס:</span>
                <span className="font-semibold text-green-600">
                  פעיל
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push('/subscription/success')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          המשך לדף המנוי
        </button>
      </div>
    </div>
  );
}

export default function SubscriptionPaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">טוען...</div>}>
      <SubscriptionPaymentSuccessPageContent />
    </Suspense>
  );
}




