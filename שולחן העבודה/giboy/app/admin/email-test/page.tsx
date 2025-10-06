'use client';

import { useState, useEffect } from 'react';

interface EmailTemplate {
  subject: string;
  html: string;
}

export default function EmailTestPage() {
  const [emailType, setEmailType] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [templates, setTemplates] = useState<Record<string, EmailTemplate>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const emailTypes = [
    { value: 'verification', label: 'אימות חשבון', icon: '🔐' },
    { value: 'payment_success', label: 'תשלום אושר', icon: '✅' },
    { value: 'payment_failure', label: 'תשלום נכשל', icon: '❌' },
    { value: 'password_reset', label: 'איפוס סיסמה', icon: '🔑' },
    { value: 'subscription_expiry', label: 'מנוי פג תוקפו', icon: '⏰' }
  ];

  // Load templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/email/templates');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    };
    loadTemplates();
  }, []);

  // Update selected template when email type changes
  useEffect(() => {
    if (emailType && templates[emailType]) {
      setSelectedTemplate(templates[emailType]);
    } else {
      setSelectedTemplate(null);
    }
  }, [emailType, templates]);

  const sendTestEmail = async () => {
    if (!emailType || !recipientEmail) {
      alert('אנא מלא את כל השדות');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: emailType,
          email: recipientEmail,
          name: 'משתמש בדיקה',
          plan: 'premium',
          amount: 29.90,
          currency: 'ILS',
          transactionId: 'TXN-' + Date.now(),
          errorCode: 'CARD_DECLINED',
          resetToken: 'reset-' + Date.now(),
          daysLeft: 7
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            🧪 מערכת מייל מקצועית - בדיקות
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Email Test Form */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📧 שליחת מייל בדיקה
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סוג המייל
                </label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">בחר סוג מייל</option>
                  {emailTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  כתובת מייל
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={sendTestEmail}
                disabled={isLoading || !emailType || !recipientEmail}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'שולח...' : 'שלח מייל בדיקה'}
              </button>

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

            {/* Template Preview */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                👁️ תצוגה מקדימה של התבנית
              </h2>

              {selectedTemplate ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b">
                    <strong>נושא:</strong> {selectedTemplate.subject}
                  </div>
                  <div 
                    className="p-4 max-h-96 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: selectedTemplate.html }}
                  />
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-8 text-center text-gray-500">
                  בחר סוג מייל כדי לראות תצוגה מקדימה
                </div>
              )}
            </div>
          </div>

          {/* Professional Setup Instructions */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🚀 הגדרה מקצועית לפרסום
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">1. SendGrid Setup</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• צור חשבון SendGrid</p>
                  <p>• הגדר Domain Authentication</p>
                  <p>• צור API Key</p>
                  <p>• הגדר Templates</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">2. DNS Records</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• SPF Record</p>
                  <p>• DKIM Record</p>
                  <p>• DMARC Policy</p>
                  <p>• CNAME Records</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-800 text-green-400 rounded font-mono text-xs">
              <div># Environment Variables</div>
              <div>SENDGRID_API_KEY=your_sendgrid_api_key</div>
              <div>SENDGRID_FROM_EMAIL=noreply@wordclash.com</div>
              <div>SENDGRID_FROM_NAME=Word Clash</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}