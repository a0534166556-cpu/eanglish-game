'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionSuccessPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // קבלת פרטי המנוי מ-localStorage
    const subData = localStorage.getItem('subscription');
    if (subData) {
      setSubscription(JSON.parse(subData));
    }
  }, []);

  const handleContinue = () => {
    router.push('/games');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          {/* Success Icon */}
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

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ברוכים הבאים למנוי!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            המנוי שלך הופעל בהצלחה. עכשיו תוכל ליהנות מחוויה ללא פרסומות!
          </p>

          {/* Subscription Details */}
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

          {/* Benefits */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              מה כלול במנוי שלך:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">ללא פרסומות</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">גישה לכל המשחקים</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">סטטיסטיקות מפורטות</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">תמיכה מועדפת</span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            התחל לשחק עכשיו
          </button>

          {/* Additional Info */}
          <p className="text-sm text-gray-500 mt-6">
            תקבל אימייל עם פרטי המנוי שלך. אם יש לך שאלות, 
            <a href="mailto:support@learningenglish.com" className="text-blue-500 hover:underline">
              {' '}צור קשר
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
