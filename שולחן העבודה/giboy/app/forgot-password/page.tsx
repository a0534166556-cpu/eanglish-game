'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage('מייל איפוס סיסמה נשלח בהצלחה! בדוק את תיבת המייל שלך.');
      } else {
        setIsSuccess(false);
        setMessage(data.error || 'שגיאה בשליחת המייל');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('שגיאה בחיבור לשרת');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🔑 שכחת סיסמה?
            </h1>
            <p className="text-gray-600">
              אין בעיה! הזן את כתובת המייל שלך ונשלח לך קישור לאיפוס הסיסמה
            </p>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  כתובת מייל
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? 'שולח...' : 'שלח קישור איפוס'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-6xl">📧</div>
              <h2 className="text-xl font-semibold text-gray-800">
                מייל נשלח בהצלחה!
              </h2>
              <p className="text-gray-600">
                בדוק את תיבת המייל שלך ופעל לפי ההוראות
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all"
              >
                חזור להתחברות
              </button>
            </div>
          )}

          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              isSuccess 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← חזור להתחברות
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


