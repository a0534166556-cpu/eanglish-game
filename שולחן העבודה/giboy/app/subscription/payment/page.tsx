'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Stripe imports removed - using simple form instead

// Stripe removed - using simple form instead

import PayoneerPaymentForm from '../../components/PayoneerPaymentForm';

function PaymentPageContent() {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank_transfer' | 'payoneer'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [bankTransfer, setBankTransfer] = useState({
    transactionId: '',
    amount: '',
    date: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams?.get('plan') || 'basic';

  const plans = {
    basic: { name: 'Basic', price: '₪10.00', period: 'לחודש' },
    premium: { name: 'Premium', price: '₪29.90', period: 'לחודש' },
    yearly: { name: 'Yearly', price: '₪299.90', period: 'לשנה' }
  };

  const selectedPlan = plans[plan as keyof typeof plans] || plans.basic;

  // מחירי התוכניות
  const planPrices = {
    basic: 10.00,
    premium: 29.90,
    yearly: 299.90
  };

  const planAmount = planPrices[plan as keyof typeof planPrices] || 9.90;

  const handleCardInput = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      // הוספת רווחים כל 4 ספרות
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    } else if (field === 'expiry') {
      // הוספת / אחרי 2 ספרות
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    } else if (field === 'cvv') {
      // רק 3 ספרות
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }
    
    setCardDetails(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleBankTransferInput = (field: string, value: string) => {
    if (field === 'amount') {
      // רק מספרים ונקודה עשרונית
      const formattedValue = value.replace(/[^0-9.]/g, '');
      setBankTransfer(prev => ({ ...prev, [field]: formattedValue }));
    } else {
      setBankTransfer(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : null;
      
      if (!userId) {
        alert('נא להתחבר תחילה');
        setIsProcessing(false);
        return;
      }

      // בדיקות ולידציה
      if (paymentMethod === 'bank_transfer') {
        if (!bankTransfer.transactionId || !bankTransfer.amount || !bankTransfer.date) {
          alert('אנא מלא את כל פרטי ההעברה הבנקאית');
          setIsProcessing(false);
          return;
        }
        
        if (parseFloat(bankTransfer.amount) !== planAmount) {
          alert(`סכום התשלום חייב להיות בדיוק ₪${planAmount}`);
          setIsProcessing(false);
          return;
        }
      }

      // אם זה PayPal, שליחה לדף PayPal קודם
      if (paymentMethod === 'paypal') {
        const paypalResponse = await fetch('/api/payment/paypal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: planAmount,
            currency: 'ILS',
            description: `מנוי ${selectedPlan.name} - ${selectedPlan.period}`,
            plan: plan,
            userId: userId
          }),
        });

        const paypalData = await paypalResponse.json();

        if (paypalData.success && paypalData.approvalUrl) {
          // שמירת פרטי המנוי ב-localStorage כדי שנוכל להשלים את התהליך אחרי התשלום
          localStorage.setItem('pending-subscription', JSON.stringify({
            plan: plan,
            userId: userId,
            paymentMethod: 'paypal',
            orderId: paypalData.orderId
          }));
          
          // מעבר לדף PayPal
          window.location.href = paypalData.approvalUrl;
          return;
        } else {
          alert(`שגיאה ביצירת תשלום PayPal: ${paypalData.error || 'שגיאה לא ידועה'}`);
          setIsProcessing(false);
          return;
        }
      }
      
      // עבור שיטות תשלום אחרות (כרטיס, העברה בנקאית, Payoneer)
      // יצירת מנוי
      const response = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan,
          userId: userId,
          paymentMethod: paymentMethod,
          paymentDetails: paymentMethod === 'card' ? cardDetails : null,
          bankTransfer: paymentMethod === 'bank_transfer' ? {
            transactionId: bankTransfer.transactionId,
            amount: parseFloat(bankTransfer.amount),
            date: bankTransfer.date
          } : null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // שמירת המנוי ב-localStorage
        localStorage.setItem('subscription', JSON.stringify(data.subscription));
        
        // עדכון מיידי של כל הטאבים
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'subscription',
          newValue: JSON.stringify(data.subscription)
        }));
        
        // מעבר לדף הצלחה
        router.push('/subscription/success');
      } else {
        const errorData = await response.json();
        alert(`שגיאה בתשלום: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('שגיאה בתשלום. נסה שוב.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isCardValid = () => {
    return cardDetails.number.replace(/\s/g, '').length === 16 &&
           cardDetails.expiry.length === 5 &&
           cardDetails.cvv.length === 3 &&
           cardDetails.name.length > 0;
  };

  const isBankTransferValid = () => {
    return bankTransfer.transactionId.length > 0 &&
           bankTransfer.amount.length > 0 &&
           bankTransfer.date.length > 0 &&
           parseFloat(bankTransfer.amount) === planAmount;
  };

  const isPaymentValid = () => {
    if (paymentMethod === 'card') return isCardValid();
    if (paymentMethod === 'bank_transfer') return isBankTransferValid();
    return true; // PayPal
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            השלם עבור המנוי שלך
          </h1>
          <div className="bg-white rounded-lg shadow-lg p-6 inline-block">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">
              {selectedPlan.name}
            </h2>
            <div className="text-3xl font-bold text-gray-900">
              {selectedPlan.price}
            </div>
            <div className="text-gray-600">
              {selectedPlan.period}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              פרטי תשלום
            </h3>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                בחר אמצעי תשלום
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💳</div>
                    <div className="font-medium text-sm">כרטיס אשראי</div>
                    <div className="text-xs text-green-600 mt-1">⚡ מיידי</div>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🅿️</div>
                    <div className="font-medium text-sm">PayPal</div>
                    <div className="text-xs text-blue-600 mt-1">⚡ מיידי</div>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏦</div>
                    <div className="font-medium text-sm">העברה בנקאית</div>
                    <div className="text-xs text-orange-600 mt-1">⏱️ עד 24 שעות</div>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('payoneer')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'payoneer'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💎</div>
                    <div className="font-medium text-sm">Payoneer</div>
                    <div className="text-xs text-purple-600 mt-1">⚡ מיידי</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Card Details - Simple Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מספר כרטיס
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      תאריך תפוגה
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם על הכרטיס
                  </label>
                  <input
                    type="text"
                    placeholder="שם מלא"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Bank Transfer Details */}
            {paymentMethod === 'bank_transfer' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-green-800 mb-2">🏦 פרטי העברה בנקאית:</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>חשבון:</strong> 047312</p>
                    <p><strong>בנק:</strong> פאגי</p>
                    <p><strong>סניף:</strong> 173</p>
                    <p><strong>סכום:</strong> ₪{planAmount}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מספר העברה/הזהה
                  </label>
                  <input
                    type="text"
                    placeholder="מספר העברה מהבנק"
                    value={bankTransfer.transactionId}
                    onChange={(e) => handleBankTransferInput('transactionId', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    סכום שהועבר
                  </label>
                  <input
                    type="text"
                    placeholder={`₪${planAmount}`}
                    value={bankTransfer.amount}
                    onChange={(e) => handleBankTransferInput('amount', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תאריך העברה
                  </label>
                  <input
                    type="date"
                    value={bankTransfer.date}
                    onChange={(e) => handleBankTransferInput('date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ העברה בנקאית:</strong> המנוי יופעל לאחר אימות ההעברה (עד 24 שעות)
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    💡 מומלץ להשתמש בכרטיס אשראי להפעלה מיידית
                  </p>
                </div>
              </div>
            )}

            {/* PayPal Info */}
            {paymentMethod === 'paypal' && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🅿️</div>
                <p className="text-gray-600 mb-4">
                  תועבר לדף התשלום של PayPal
                </p>
                <p className="text-sm text-gray-500">
                  תשלום מאובטח ומהיר
                </p>
              </div>
            )}

            {/* Payoneer Payment Form */}
            {paymentMethod === 'payoneer' && (
              <PayoneerPaymentForm
                plan={plan}
                amount={planAmount}
                currency="ILS"
                userId={localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : 'guest'}
                userEmail={localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : 'user@example.com'}
              />
            )}

            {/* Payment Button - Only show for non-Payoneer methods */}
            {paymentMethod !== 'payoneer' && (
              <button
                onClick={handlePayment}
                disabled={isProcessing || !isPaymentValid()}
                className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all ${
                  isProcessing || !isPaymentValid()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : paymentMethod === 'bank_transfer'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {paymentMethod === 'bank_transfer' ? 'מעבד העברה...' : 'מעבד תשלום...'}
                  </div>
                ) : paymentMethod === 'bank_transfer' ? (
                  `אישור העברה ₪${planAmount}`
                ) : (
                  `שלם ${selectedPlan.price}`
                )}
              </button>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              סיכום הזמנה
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">תוכנית:</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">תקופה:</span>
                <span className="font-medium">{selectedPlan.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">אמצעי תשלום:</span>
                <span className="font-medium">
                  {paymentMethod === 'card' ? 'כרטיס אשראי' : 
                   paymentMethod === 'bank_transfer' ? 'העברה בנקאית' : 
                   paymentMethod === 'payoneer' ? 'Payoneer' : 'PayPal'}
                </span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-xl font-bold">
                <span>סה"כ:</span>
                <span className="text-blue-600">{selectedPlan.price}</span>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-3">מה תקבל:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  גישה ל-Word Clash בלעדי
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  הסרת כל הפרסומות
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  סטטיסטיקות מפורטות
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  תמיכה במייל
                </li>
                {plan === 'premium' && (
                  <>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      תכונות מתקדמות
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      עדיפות בתמיכה
                    </li>
                  </>
                )}
                {plan === 'yearly' && (
                  <>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      חיסכון של 17%
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      גישה מוקדמת לתכונות חדשות
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Security Info */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <div className="flex items-center justify-center mb-2">
                <span className="mr-2">🔒</span>
                <span>תשלום מאובטח</span>
              </div>
              <p>הפרטים שלך מוגנים ומוצפנים</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
