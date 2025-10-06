'use client';

import { useRouter } from 'next/navigation';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-yellow-600 mb-4">
          התשלום בוטל
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          ביטלת את התשלום. לא ניגבה ממך כלום.
        </p>
        
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold">ℹ️ התשלום בוטל</p>
          <p>אתה יכול לחזור לחנות בכל עת</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/payment')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            💳 נסה שוב
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

