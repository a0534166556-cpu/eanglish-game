'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const sendTestEmail = async (type: string) => {
    if (!email) {
      alert('אנא הזן כתובת מייל');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/email/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          email,
          name: name || 'משתמש בדיקה',
          resetToken: type === 'password_reset' ? 'test-token-123' : undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ ${data.message}`);
      } else {
        setResult(`❌ ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ שגיאה: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            🧪 בדיקת מייל פשוטה
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                כתובת מייל
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@gmail.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם (אופציונלי)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="שם המשתמש"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => sendTestEmail('welcome')}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'שולח...' : '📧 שלח מייל ברוכים הבאים'}
              </button>

              <button
                onClick={() => sendTestEmail('password_reset')}
                disabled={isLoading}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'שולח...' : '🔑 שלח מייל איפוס סיסמה'}
              </button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg ${
                result.includes('✅') 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {result}
              </div>
            )}
          </div>

          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-800 mb-4">
              ⚠️ הגדרה נדרשת
            </h2>
            <div className="text-sm text-yellow-700 space-y-2">
              <p><strong>1. צור App Password ב-Gmail:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>לך ל-Google Account Settings</li>
                <li>Security → 2-Step Verification → App passwords</li>
                <li>צור App Password חדש</li>
                <li>העתק את הסיסמה (16 תווים)</li>
              </ul>
              <p><strong>2. עדכן את .env.local:</strong></p>
              <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-xs mt-2">
                <div>SMTP_USER="your-email@gmail.com"</div>
                <div>SMTP_PASS="your-16-character-app-password"</div>
                <div>NEXT_PUBLIC_APP_URL="http://localhost:3000"</div>
              </div>
              <p><strong>3. הפעל מחדש את השרת</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


