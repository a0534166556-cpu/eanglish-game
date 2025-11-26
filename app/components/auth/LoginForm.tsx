'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login/Register response:', data);

      if (!response.ok) {
        console.error('Login/Register error:', data.error);
        throw new Error(data.error || 'שגיאה בהתחברות');
      }

      if (isLogin) {
        // שמירת פרטי המשתמש ב-localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('user', JSON.stringify(data));
        }
        router.push('/level-select');
      } else {
        // הרשמה מוצלחת - מבצע התחברות אוטומטית
        const loginResponse = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
          throw new Error(loginData.error || 'שגיאה בהתחברות לאחר הרשמה');
        }
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('user', JSON.stringify(loginData));
        }
        router.push('/level-select');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? 'התחברות' : 'הרשמה'}
        </h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              אימייל
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              סיסמה
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLogin ? 'התחבר' : 'הירשם'}
          </button>
          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-blue-500 hover:text-blue-600 focus:outline-none"
            >
              {isLogin ? 'אין לך חשבון? הירשם' : 'יש לך חשבון? התחבר'}
            </button>
            {isLogin && (
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="w-full text-gray-500 hover:text-gray-600 focus:outline-none text-sm"
              >
                שכחת סיסמה?
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 