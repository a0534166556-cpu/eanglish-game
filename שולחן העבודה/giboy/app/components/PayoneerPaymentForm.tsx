'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PayoneerPaymentFormProps {
  plan: string;
  amount: number;
  currency: string;
  userId: string;
  userEmail: string;
}

export default function PayoneerPaymentForm({ 
  plan, 
  amount, 
  currency, 
  userId, 
  userEmail 
}: PayoneerPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/payoneer/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          userId,
          plan,
          userEmail
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'שגיאה ביצירת תשלום');
      }

      // הפניה לדף תשלום Payoneer
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        // אם אין URL, נבדוק סטטוס
        await checkPaymentStatus(data.paymentId);
      }

    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'שגיאה לא ידועה');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const response = await fetch('/api/payments/payoneer/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      });

      const data = await response.json();

      if (data.success && data.status === 'completed') {
        router.push('/subscription/success');
      } else {
        setError('התשלום עדיין לא אושר. אנא נסה שוב בעוד כמה דקות.');
      }
    } catch (error) {
      console.error('Status check error:', error);
      setError('שגיאה בבדיקת סטטוס התשלום');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          תשלום באמצעות Payoneer
        </h3>
        <p className="text-gray-600">
          {plan} - {amount} {currency}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">פרטי התשלום:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• תשלום מאובטח דרך Payoneer</li>
            <li>• הפעלה מיידית של המנוי</li>
            <li>• קבלת אישור במייל</li>
            <li>• תמיכה 24/7</li>
          </ul>
        </div>

        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
        >
          {isLoading ? 'יוצר תשלום...' : 'המשך לתשלום Payoneer'}
        </button>

        <div className="text-center text-sm text-gray-500">
          <p>לחיצה על הכפתור תעביר אותך לדף התשלום המאובטח של Payoneer</p>
        </div>
      </div>
    </div>
  );
}


