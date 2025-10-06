'use client';

import { useState, useEffect } from 'react';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  method: 'card' | 'payoneer' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  plan: string;
  transactionId: string;
  createdAt: Date;
  completedAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
}

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  refundedTransactions: number;
  averageTransactionValue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  topPaymentMethod: string;
  conversionRate: number;
}

export default function PaymentsManagementPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterBy, setFilterBy] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'amount' | 'status' | 'method'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      // סימולציה של נתוני תשלומים
      const mockPayments: Payment[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'יוסי כהן',
          userEmail: 'yossi@example.com',
          amount: 19.90,
          currency: 'ILS',
          method: 'card',
          status: 'completed',
          plan: 'premium',
          transactionId: 'txn_123456789',
          createdAt: new Date('2024-09-28'),
          completedAt: new Date('2024-09-28')
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'שרה לוי',
          userEmail: 'sara@example.com',
          amount: 9.90,
          currency: 'ILS',
          method: 'payoneer',
          status: 'completed',
          plan: 'basic',
          transactionId: 'payoneer_987654321',
          createdAt: new Date('2024-09-27'),
          completedAt: new Date('2024-09-27')
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'דוד ישראלי',
          userEmail: 'david@example.com',
          amount: 49.90,
          currency: 'ILS',
          method: 'bank_transfer',
          status: 'pending',
          plan: 'yearly',
          transactionId: 'bank_456789123',
          createdAt: new Date('2024-09-26')
        },
        {
          id: '4',
          userId: 'user4',
          userName: 'מיכל רוזן',
          userEmail: 'michal@example.com',
          amount: 19.90,
          currency: 'ILS',
          method: 'card',
          status: 'failed',
          plan: 'premium',
          transactionId: 'txn_failed_789123456',
          createdAt: new Date('2024-09-25')
        },
        {
          id: '5',
          userId: 'user5',
          userName: 'אבי גולד',
          userEmail: 'avi@example.com',
          amount: 9.90,
          currency: 'ILS',
          method: 'card',
          status: 'refunded',
          plan: 'basic',
          transactionId: 'txn_refunded_321654987',
          createdAt: new Date('2024-09-24'),
          completedAt: new Date('2024-09-24'),
          refundedAt: new Date('2024-09-25'),
          refundAmount: 9.90
        }
      ];

      setPayments(mockPayments);

      // חישוב סטטיסטיקות
      const paymentStats: PaymentStats = {
        totalRevenue: mockPayments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
        totalTransactions: mockPayments.length,
        completedTransactions: mockPayments.filter(p => p.status === 'completed').length,
        failedTransactions: mockPayments.filter(p => p.status === 'failed').length,
        pendingTransactions: mockPayments.filter(p => p.status === 'pending').length,
        refundedTransactions: mockPayments.filter(p => p.status === 'refunded').length,
        averageTransactionValue: Math.round(
          mockPayments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0) / 
          mockPayments.filter(p => p.status === 'completed').length
        ),
        monthlyRevenue: mockPayments
          .filter(p => p.status === 'completed' && p.createdAt > new Date('2024-09-01'))
          .reduce((sum, p) => sum + p.amount, 0),
        weeklyRevenue: mockPayments
          .filter(p => p.status === 'completed' && p.createdAt > new Date('2024-09-21'))
          .reduce((sum, p) => sum + p.amount, 0),
        dailyRevenue: mockPayments
          .filter(p => p.status === 'completed' && p.createdAt > new Date('2024-09-27'))
          .reduce((sum, p) => sum + p.amount, 0),
        topPaymentMethod: 'card',
        conversionRate: Math.round(
          (mockPayments.filter(p => p.status === 'completed').length / mockPayments.length) * 100
        )
      };

      setStats(paymentStats);

    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterBy !== 'all') {
      matchesFilter = payment.status === filterBy;
    }

    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'createdAt':
        aValue = a.createdAt.getTime();
        bValue = b.createdAt.getTime();
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'method':
        aValue = a.method;
        bValue = b.method;
        break;
      default:
        aValue = a.createdAt.getTime();
        bValue = b.createdAt.getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-800 bg-green-100';
      case 'pending': return 'text-yellow-800 bg-yellow-100';
      case 'failed': return 'text-red-800 bg-red-100';
      case 'refunded': return 'text-purple-800 bg-purple-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'הושלם';
      case 'pending': return 'ממתין';
      case 'failed': return 'נכשל';
      case 'refunded': return 'הוחזר';
      default: return 'לא ידוע';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return '💳';
      case 'payoneer': return '💎';
      case 'bank_transfer': return '🏦';
      default: return '💰';
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'card': return 'כרטיס אשראי';
      case 'payoneer': return 'Payoneer';
      case 'bank_transfer': return 'העברה בנקאית';
      default: return 'לא ידוע';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('he-IL');
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('he-IL');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתוני תשלומים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">💰 ניהול תשלומים</h1>
          <p className="text-gray-600 mt-2">ניהול וניטור תשלומי המערכת</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">סה"כ הכנסות</p>
                  <p className="text-2xl font-bold text-gray-900">₪{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">סה"כ תשלומים</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">תשלומים מושלמים</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedTransactions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">אחוז הצלחה</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Breakdown */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📅 הכנסות לפי תקופה</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">היום:</span>
                  <span className="font-medium text-green-600">₪{stats.dailyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">השבוע:</span>
                  <span className="font-medium text-blue-600">₪{stats.weeklyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">החודש:</span>
                  <span className="font-medium text-purple-600">₪{stats.monthlyRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📊 סטטוס תשלומים</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">הושלמו:</span>
                  <span className="font-medium text-green-600">{stats.completedTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ממתינים:</span>
                  <span className="font-medium text-yellow-600">{stats.pendingTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">נכשלו:</span>
                  <span className="font-medium text-red-600">{stats.failedTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">הוחזרו:</span>
                  <span className="font-medium text-purple-600">{stats.refundedTransactions}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💳 אמצעי תשלום</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">כרטיס אשראי:</span>
                  <span className="font-medium text-blue-600">60%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payoneer:</span>
                  <span className="font-medium text-purple-600">25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">העברה בנקאית:</span>
                  <span className="font-medium text-green-600">15%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">חיפוש</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חיפוש לפי שם, מייל או ID..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סינון לפי סטטוס</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">כל התשלומים</option>
                <option value="completed">הושלמו</option>
                <option value="pending">ממתינים</option>
                <option value="failed">נכשלו</option>
                <option value="refunded">הוחזרו</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מיון לפי</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt">תאריך יצירה</option>
                <option value="amount">סכום</option>
                <option value="status">סטטוס</option>
                <option value="method">אמצעי תשלום</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סדר</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">יורד</option>
                <option value="asc">עולה</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    משתמש
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סכום
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    אמצעי תשלום
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סטטוס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    תוכנית
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    תאריך
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.userName}</div>
                        <div className="text-sm text-gray-500">{payment.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₪{payment.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">{payment.currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getMethodIcon(payment.method)}</span>
                        <span className="text-sm text-gray-900">{getMethodText(payment.method)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.plan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          צפה
                        </button>
                        {payment.status === 'pending' && (
                          <button className="text-green-600 hover:text-green-900">
                            אישור
                          </button>
                        )}
                        {payment.status === 'completed' && (
                          <button className="text-red-600 hover:text-red-900">
                            החזר
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ פעולות מהירות</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-blue-900">דוח מפורט</p>
            </button>
            <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="text-2xl mb-2">💰</div>
              <p className="font-medium text-green-900">הכנסות</p>
            </button>
            <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <div className="text-2xl mb-2">🔧</div>
              <p className="font-medium text-yellow-900">הגדרות תשלום</p>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="text-2xl mb-2">📈</div>
              <p className="font-medium text-purple-900">אנליטיק</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


