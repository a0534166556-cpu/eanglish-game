'use client';

import { useState, useEffect } from 'react';

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  paymentId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          // בדיקה אם המשתמש הוא מנהל
          const userData = localStorage.getItem('user');
          let isAdminUser = false;
          let currentUserId = null;
          
          if (userData) {
            const user = JSON.parse(userData);
            isAdminUser = user.email === 'a0534166556@gmail.com';
            currentUserId = user.id;
            setIsAdmin(isAdminUser);
          }
          
          // אם המשתמש הוא מנהל, הוא תמיד נחשב מנוי
          if (isAdminUser) {
            const adminSubscription: Subscription = {
              id: 'admin-sub',
              userId: 'admin',
              plan: 'premium',
              status: 'active',
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              paymentId: 'admin-premium',
              paymentMethod: 'admin',
              amount: 0,
              currency: 'ILS'
            };
            setSubscription(adminSubscription);
            return;
          }
          
          // למשתמשים רגילים - בדיקה במסד הנתונים
          if (currentUserId) {
            try {
              const response = await fetch(`/api/subscription/check?userId=${currentUserId}`);
              if (response.ok) {
                const data = await response.json();
                if (data.subscription && data.subscription.status === 'active') {
                  // בדיקה אם המנוי עדיין פעיל
                  const now = new Date();
                  const endDate = new Date(data.subscription.endDate);
                  
                  if (endDate > now) {
                    setSubscription(data.subscription);
                    // שמירה ב-localStorage לגיבוי
                    localStorage.setItem('subscription', JSON.stringify(data.subscription));
                  } else {
                    // המנוי פג תוקף
                    setSubscription(null);
                    localStorage.removeItem('subscription');
                  }
                } else {
                  setSubscription(null);
                  localStorage.removeItem('subscription');
                }
              } else {
                // אם יש בעיה עם השרת, נבדוק ב-localStorage
                const subData = localStorage.getItem('subscription');
                if (subData) {
                  const parsedSub = JSON.parse(subData);
                  const now = new Date();
                  const endDate = new Date(parsedSub.endDate);
                  
                  if (endDate > now) {
                    setSubscription(parsedSub);
                  } else {
                    localStorage.removeItem('subscription');
                    setSubscription(null);
                  }
                } else {
                  setSubscription(null);
                }
              }
            } catch (error) {
              console.error('Failed to fetch subscription from server:', error);
              // fallback ל-localStorage
              const subData = localStorage.getItem('subscription');
              if (subData) {
                const parsedSub = JSON.parse(subData);
                setSubscription(parsedSub);
              } else {
                setSubscription(null);
              }
            }
          } else {
            setSubscription(null);
          }
        }
      } catch (error) {
        console.error('Failed to load subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscription();

    // הוספת listener לשינויים ב-localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'subscription') {
        loadSubscription();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const isSubscribed = subscription?.status === 'active';
  const isPremium = subscription?.plan === 'premium' || subscription?.plan === 'yearly';
  const isBasic = subscription?.plan === 'basic';

  const subscribe = async (plan: string, paymentMethod: string = 'bank_transfer', paymentDetails?: any, bankTransfer?: any) => {
    try {
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : null;
      
      if (!userId) {
        return { success: false, error: 'User not logged in' };
      }

      const response = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          userId,
          paymentMethod,
          paymentDetails,
          bankTransfer
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('subscription', JSON.stringify(data.subscription));
        setSubscription(data.subscription);
        return { success: true, subscription: data.subscription, payment: data.payment };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to subscribe' };
      }
    } catch (error) {
      console.error('Subscription error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const cancelSubscription = () => {
    localStorage.removeItem('subscription');
    setSubscription(null);
  };

  return {
    subscription,
    isSubscribed,
    isPremium,
    isBasic,
    isLoading,
    isAdmin,
    subscribe,
    cancelSubscription
  };
}
