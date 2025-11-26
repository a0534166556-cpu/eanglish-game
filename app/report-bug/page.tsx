'use client';

import { useState } from 'react';
import AdManager from '@/app/components/ads/AdManager';

export default function ReportBug() {
  const [formData, setFormData] = useState({
    bugType: '',
    severity: '',
    description: '',
    steps: '',
    expectedBehavior: '',
    actualBehavior: '',
    device: '',
    browser: '',
    email: '',
    screenshots: null as FileList | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const bugTypes = [
    { value: 'game', label: 'בעיה במשחק', icon: '🎮' },
    { value: 'ui', label: 'בעיה בממשק המשתמש', icon: '🖥️' },
    { value: 'performance', label: 'בעיית ביצועים', icon: '⚡' },
    { value: 'audio', label: 'בעיה בקול', icon: '🔊' },
    { value: 'login', label: 'בעיה בהתחברות', icon: '🔐' },
    { value: 'payment', label: 'בעיה בתשלום', icon: '💳' },
    { value: 'other', label: 'אחר', icon: '❓' }
  ];

  const severityLevels = [
    { value: 'low', label: 'נמוכה', color: 'green', description: 'בעיה קלה שלא מפריעה לשימוש' },
    { value: 'medium', label: 'בינונית', color: 'yellow', description: 'בעיה שמפריעה לחוויה' },
    { value: 'high', label: 'גבוהה', color: 'orange', description: 'בעיה חמורה שמקשה על השימוש' },
    { value: 'critical', label: 'קריטית', color: 'red', description: 'בעיה שמונעת שימוש בפלטפורמה' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      screenshots: e.target.files
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // אסוף את כל הנתונים
      const fullDescription = `
סוג הבעיה: ${formData.bugType}
חומרה: ${formData.severity}

תיאור הבעיה:
${formData.description}

שלבים לשחזור:
${formData.steps}

התנהגות צפויה:
${formData.expectedBehavior}

התנהגות בפועל:
${formData.actualBehavior}

מידע על המכשיר:
${formData.device} | ${formData.browser}
      `.trim();

      // העלה תמונות אם יש
      let screenshots: string[] = [];
      if (formData.screenshots && formData.screenshots.length > 0) {
        // כאן תוכל להוסיף העלאה של תמונות לשרת
        // כרגע נשמור רק את השמות
        screenshots = Array.from(formData.screenshots).map(file => file.name);
      }

      // שלח למנהל
      const response = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email || undefined,
          description: fullDescription,
          screenshots: screenshots.length > 0 ? screenshots : undefined,
          deviceInfo: `${formData.device} | ${formData.browser}`
        })
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({
          bugType: '',
          severity: '',
          description: '',
          steps: '',
          expectedBehavior: '',
          actualBehavior: '',
          device: '',
          browser: '',
          email: '',
          screenshots: null
        });
      } else {
        throw new Error(result.error || 'שגיאה בשליחת הדיווח');
      }
    } catch (error) {
      console.error('Error submitting bug report:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const level = severityLevels.find(s => s.value === severity);
    return level ? level.color : 'gray';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <AdManager />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🐛 דיווח על באג
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            עזרו לנו לשפר את הפלטפורמה על ידי דיווח על בעיות שנתקלתם בהן
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Bug Type */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                סוג הבעיה
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {bugTypes.map((type) => (
                  <label key={type.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="bugType"
                      value={type.value}
                      checked={formData.bugType === type.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                      formData.bugType === type.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-semibold text-sm">{type.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                חומרת הבעיה
              </label>
              <div className="space-y-3">
                {severityLevels.map((level) => (
                  <label key={level.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      value={level.value}
                      checked={formData.severity === level.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      formData.severity === level.value
                        ? `border-${level.color}-500 bg-${level.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800">{level.label}</div>
                          <div className="text-sm text-gray-600">{level.description}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full bg-${level.color}-500`}></div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                תיאור הבעיה *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="תארו את הבעיה בקצרה..."
              />
            </div>

            {/* Steps to Reproduce */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                שלבים לשחזור הבעיה
              </label>
              <textarea
                name="steps"
                value={formData.steps}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="1. פתחו את המשחק...&#10;2. לחצו על...&#10;3. הבעיה קורית כאשר..."
              />
            </div>

            {/* Expected vs Actual Behavior */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  התנהגות צפויה
                </label>
                <textarea
                  name="expectedBehavior"
                  value={formData.expectedBehavior}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="מה אמור לקרות?"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  התנהגות בפועל
                </label>
                <textarea
                  name="actualBehavior"
                  value={formData.actualBehavior}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="מה קורה בפועל?"
                />
              </div>
            </div>

            {/* Technical Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  מכשיר
                </label>
                <select
                  name="device"
                  value={formData.device}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">בחרו מכשיר</option>
                  <option value="desktop">מחשב שולחני</option>
                  <option value="laptop">מחשב נייד</option>
                  <option value="tablet">טאבלט</option>
                  <option value="mobile">נייד</option>
                </select>
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  דפדפן
                </label>
                <select
                  name="browser"
                  value={formData.browser}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">בחרו דפדפן</option>
                  <option value="chrome">Chrome</option>
                  <option value="firefox">Firefox</option>
                  <option value="safari">Safari</option>
                  <option value="edge">Edge</option>
                  <option value="other">אחר</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                כתובת אימייל (אופציונלי)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your@email.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                נשמח לעדכן אתכם על פתרון הבעיה
              </p>
            </div>

            {/* Screenshots */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                צילומי מסך (אופציונלי)
              </label>
              <input
                type="file"
                name="screenshots"
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                צילומי מסך יכולים לעזור לנו להבין את הבעיה טוב יותר
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !formData.bugType || !formData.severity || !formData.description}
                className="w-full bg-purple-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                    שולח דיווח...
                  </span>
                ) : (
                  'שלח דיווח'
                )}
              </button>
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                ✅ הדיווח נשלח בהצלחה! נחזור אליכם בקרוב.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                ❌ שגיאה בשליחת הדיווח. אנא נסו שוב.
              </div>
            )}
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            💡 טיפים לדיווח יעיל
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">כתבו בצורה ברורה</h4>
              <p className="text-gray-600 text-sm">
                השתמשו בשפה פשוטה ותארו את הבעיה בצורה מדויקת
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">הוסיפו צילומי מסך</h4>
              <p className="text-gray-600 text-sm">
                תמונה שווה אלף מילים - צילומי מסך עוזרים לנו להבין את הבעיה
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">כתבו שלבים מדויקים</h4>
              <p className="text-gray-600 text-sm">
                ככל שהשלבים יהיו מדויקים יותר, כך נוכל לשחזר את הבעיה מהר יותר
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">ציינו את החומרה</h4>
              <p className="text-gray-600 text-sm">
                מידע על המכשיר והדפדפן עוזר לנו לזהות בעיות ספציפיות
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            צריכים עזרה נוספת?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              📧 צרו קשר
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200">
              💬 צ'אט עם התמיכה
            </button>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200">
              📚 שאלות נפוצות
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
