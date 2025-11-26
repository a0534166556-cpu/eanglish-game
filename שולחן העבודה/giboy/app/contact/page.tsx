'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Send email via API
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'pajaw13300@gmail.com',
          subject: `צור קשר: ${formData.subject}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>הודעה חדשה מטופס יצירת קשר</h2>
              <hr>
              <p><strong>שם:</strong> ${formData.name}</p>
              <p><strong>אימייל:</strong> ${formData.email}</p>
              <p><strong>נושא:</strong> ${formData.subject}</p>
              <hr>
              <h3>הודעה:</h3>
              <p style="white-space: pre-wrap;">${formData.message}</p>
            </div>
          `
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            צרו קשר
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            אנחנו כאן לעזור לכם! יש לכם שאלות, הצעות או צריכים תמיכה? 
            נשמח לשמוע מכם.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">שלחו לנו הודעה</h2>
            
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                ✅ ההודעה נשלחה בהצלחה! נחזור אליכם בהקדם.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                ❌ שגיאה בשליחת ההודעה. אנא נסו שוב או שלחו מייל ישירות ל-pajaw13300@gmail.com
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  שם מלא *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="הכניסו את השם המלא שלכם"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  כתובת אימייל *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  נושא *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">בחרו נושא</option>
                  <option value="technical">בעיה טכנית</option>
                  <option value="billing">שאלה על תשלום</option>
                  <option value="feature">הצעה לפיצ'ר חדש</option>
                  <option value="general">שאלה כללית</option>
                  <option value="other">אחר</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  הודעה *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ספרו לנו איך נוכל לעזור לכם..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isSubmitting ? 'שולח...' : 'שלח הודעה'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">פרטי יצירת קשר</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📧</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">אימייל</h3>
                    <p className="text-gray-600">pajaw13300@gmail.com</p>
                    <p className="text-sm text-blue-600 mt-1">ליצירת קשר ישירה</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">👨‍💻</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">יוצר הפלטפורמה</h3>
                    <p className="text-gray-600">יונתן סופר</p>
                    <p className="text-gray-600">מפתח עצמאי</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">🌐</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">פלטפורמה</h3>
                    <p className="text-gray-600">Learning English</p>
                    <p className="text-gray-600">פותח בישראל 🇮🇱</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">⏰</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">שעות פעילות</h3>
                    <p className="text-gray-600">ראשון - חמישי: 9:00 - 18:00</p>
                    <p className="text-gray-600">שישי: 9:00 - 14:00</p>
                    <p className="text-gray-600">שבת: סגור</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">תמיכה מהירה</h2>
              <p className="text-gray-600 mb-6">
                לשאלות נפוצות ותמיכה מהירה, בקרו במרכז העזרה שלנו:
              </p>
              <div className="space-y-3">
                <a 
                  href="/faq" 
                  className="block bg-white text-blue-600 px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  ❓ שאלות נפוצות
                </a>
                <a 
                  href="/help" 
                  className="block bg-white text-green-600 px-4 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  🆘 מדריך משתמש
                </a>
                <a 
                  href="/tutorials" 
                  className="block bg-white text-purple-600 px-4 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                >
                  📚 מדריכי וידאו
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-2xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">מוכנים להתחיל?</h2>
              <p className="mb-6 opacity-90">
                הצטרפו לאלפי תלמידים שכבר משפרים את האנגלית שלהם!
              </p>
              <a 
                href="/games" 
                className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                🚀 התחילו עכשיו
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


