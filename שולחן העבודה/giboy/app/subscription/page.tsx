'use client';

import { useState, useEffect } from 'react';

interface Subscription {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
}

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Mock data - in production, fetch from API
  useEffect(() => {
    const mockSubscriptions: Subscription[] = [
      {
        id: 'sub_1234567890',
        plan: 'premium',
        amount: 29.90,
        currency: 'ILS',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-02-01'
      }
    ];
    
    setTimeout(() => {
      setSubscriptions(mockSubscriptions);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('האם אתה בטוח שברצונך לבטל את המנוי?')) {
      return;
    }

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          subscriptionId,
          userId: 'user_123', // In production, get from auth
          email: 'user@example.com', // In production, get from auth
          plan: 'premium'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('המנוי בוטל בהצלחה');
        // Update local state
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === subscriptionId 
              ? { ...sub, status: 'cancelled' }
              : sub
          )
        );
      } else {
        setMessage(data.error || 'שגיאה בביטול המנוי');
      }
    } catch (error) {
      setMessage('שגיאה בחיבור לשרת');
    }
  };

  const getPlanDisplayName = (plan: string) => {
    const planNames = {
      basic: 'Basic',
      premium: 'Premium',
      yearly: 'Yearly'
    };
    return planNames[plan as keyof typeof planNames] || plan;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
      expired: 'text-gray-600 bg-gray-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען מנויים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            📋 ניהול מנויים
          </h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('הצלחה') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                אין מנויים פעילים
              </h2>
              <p className="text-gray-600 mb-6">
                עדיין לא רכשת מנוי. בקר בחנות כדי לראות את התוכניות שלנו
              </p>
              <button
                onClick={() => window.location.href = '/shop'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                בקר בחנות
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {getPlanDisplayName(subscription.plan)}
                      </h3>
                      <p className="text-gray-600">
                        {subscription.amount} {subscription.currency}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                      {subscription.status === 'active' ? 'פעיל' : 
                       subscription.status === 'cancelled' ? 'מבוטל' : 'פג תוקפו'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">תאריך התחלה</p>
                      <p className="font-medium">
                        {new Date(subscription.startDate).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">תאריך סיום</p>
                      <p className="font-medium">
                        {new Date(subscription.endDate).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      ID: {subscription.id}
                    </div>
                    {subscription.status === 'active' && (
                      <button
                        onClick={() => handleCancelSubscription(subscription.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        בטל מנוי
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              💡 מידע חשוב
            </h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• מנויים פעילים מעניקים גישה לכל התכונות הפרימיום</li>
              <li>• ביטול מנוי ייכנס לתוקף בסוף התקופה הנוכחית</li>
              <li>• תוכל לחדש את המנוי בכל עת</li>
              <li>• לשאלות נוספות, צור איתנו קשר</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}