'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [email, setEmail] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || null;

  // Verify token on component mount
  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`/api/auth/forgot-password?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setIsValidToken(true);
        setEmail(data.email);
      } else {
        setIsValidToken(false);
        setMessage(data.error || 'קישור לא תקין או פג תוקפו');
      }
    } catch (error) {
      setIsValidToken(false);
      setMessage('שגיאה בבדיקת הקישור');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage('הסיסמאות לא תואמות');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setMessage('הסיסמה חייבת להכיל לפחות 8 תווים');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage('הסיסמה שונתה בהצלחה! עכשיו תוכל להתחבר עם הסיסמה החדשה.');
      } else {
        setMessage(data.error || 'שגיאה בשינוי הסיסמה');
      }
    } catch (error) {
      setMessage('שגיאה בחיבור לשרת');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              קישור לא תקין
            </h1>
            <p className="text-gray-600 mb-6">
              הקישור לאיפוס הסיסמה לא תקין או חסר
            </p>
            <button
              onClick={() => router.push('/forgot-password')}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              קישור פג תוקפו
            </h1>
            <p className="text-gray-600 mb-6">
              {message || 'הקישור לאיפוס הסיסמה פג תוקפו. אנא בקש קישור חדש.'}
            </p>
            <button
              onClick={() => router.push('/forgot-password')}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              בקש קישור חדש
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🔑 איפוס סיסמה
            </h1>
            <p className="text-gray-600">
              הזן סיסמה חדשה עבור {email}
            </p>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סיסמה חדשה
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="הזן סיסמה חדשה"
                  required
                  minLength={8}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  לפחות 8 תווים
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  אישור סיסמה
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="הזן שוב את הסיסמה"
                  required
                  minLength={8}
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
                {isLoading ? 'מעדכן...' : 'עדכן סיסמה'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h2 className="text-xl font-semibold text-gray-800">
                הסיסמה שונתה בהצלחה!
              </h2>
              <p className="text-gray-600">
                עכשיו תוכל להתחבר עם הסיסמה החדשה
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all"
              >
                התחבר עכשיו
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
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
