'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthUser from '@/lib/useAuthUser';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  gamesPlayed: number;
  gamesWon: number;
  diamonds: number;
  coins: number;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  winRate: number;
  totalAchievements: number;
  lastActivity: string;
  gameStat: Array<{
    gameName: string;
    gamesPlayed: number;
    gamesWon: number;
    averageScore: number;
  }>;
}

interface UsersData {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalUsers: number;
    totalPages: number;
  };
}

export default function AdminUsers() {
  const { user, loading: authLoading } = useAuthUser();
  const router = useRouter();
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('points');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    loadUsers();
  }, [user, authLoading, router, page, search, sortBy, sortOrder]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: user?.id || '',
        page: page.toString(),
        search,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load users');
      }

      setData(result);
    } catch (error) {
      console.error('Error loading users:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action: string, targetUserId: string, data?: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          targetUserId,
          action,
          data
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to perform action');
      }

      // רענן את רשימת המשתמשים
      await loadUsers();
      
      if (action === 'delete') {
        alert('המשתמש נמחק בהצלחה');
      } else if (action === 'toggleAdmin') {
        alert('סטטוס המנהל עודכן בהצלחה');
      } else if (action === 'resetStats') {
        alert('סטטיסטיקות המשתמש אופסו בהצלחה');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('שגיאה בביצוע הפעולה: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    await handleUserAction('update', editingUser.id, {
      name: editingUser.name,
      email: editingUser.email,
      level: editingUser.level,
      points: editingUser.points,
      diamonds: editingUser.diamonds,
      coins: editingUser.coins,
      isAdmin: editingUser.isAdmin
    });

    setShowEditModal(false);
    setEditingUser(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">טוען משתמשים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">שגיאה בטעינת המשתמשים</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadUsers}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👥</div>
          <h1 className="text-2xl font-bold text-gray-600">אין משתמשים להצגה</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">👥 ניהול משתמשים</h1>
          <p className="text-lg text-gray-600">נהל את כל המשתמשים במערכת</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">סה"כ משתמשים</p>
                <p className="text-3xl font-bold text-blue-600">{data.stats.totalUsers}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">מנהלים</p>
                <p className="text-3xl font-bold text-green-600">
                  {data.users.filter(u => u.isAdmin).length}
                </p>
              </div>
              <div className="text-4xl">👑</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">משתמשים פעילים</p>
                <p className="text-3xl font-bold text-purple-600">
                  {data.users.filter(u => u.gamesPlayed > 0).length}
                </p>
              </div>
              <div className="text-4xl">🎮</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">חיפוש</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="שם או אימייל..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מיון לפי</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="points">נקודות</option>
                <option value="level">רמה</option>
                <option value="gamesPlayed">משחקים שוחקו</option>
                <option value="gamesWon">משחקים שניצחו</option>
                <option value="createdAt">תאריך הצטרפות</option>
                <option value="name">שם</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סדר</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">יורד</option>
                <option value="asc">עולה</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={loadUsers}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                🔍 חפש
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">משתמש</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סטטיסטיקות</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">משאבים</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סטטוס</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                          </div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {user.name}
                            {user.isAdmin && (
                              <span className="px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-full">
                                👑 מנהל
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">
                            הצטרף: {new Date(user.createdAt).toLocaleDateString('he-IL')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>רמה {user.level}</div>
                        <div className="text-gray-500">{user.points} נקודות</div>
                        <div className="text-gray-500">{user.gamesWon}/{user.gamesPlayed} ניצחונות</div>
                        <div className="text-gray-500">{user.winRate}% הצלחה</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <span>💎</span>
                          <span>{user.diamonds}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🪙</span>
                          <span>{user.coins}</span>
                        </div>
                        <div className="text-gray-500">{user.totalAchievements} הישגים</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          user.gamesPlayed > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.gamesPlayed > 0 ? 'פעיל' : 'לא פעיל'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          ✏️ ערוך
                        </button>
                        <button
                          onClick={() => handleUserAction('toggleAdmin', user.id)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          {user.isAdmin ? '👤 הסר מנהל' : '👑 הפוך למנהל'}
                        </button>
                        <button
                          onClick={() => handleUserAction('resetStats', user.id)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          🔄 אפס סטטיסטיקות
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('האם אתה בטוח שברצונך למחוק את המשתמש?')) {
                              handleUserAction('delete', user.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ מחק
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {data.pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                הקודם
              </button>
              <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                {page} / {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === data.pagination.totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                הבא
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">עריכת משתמש</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">רמה</label>
                  <input
                    type="number"
                    value={editingUser.level}
                    onChange={(e) => setEditingUser({...editingUser, level: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">נקודות</label>
                  <input
                    type="number"
                    value={editingUser.points}
                    onChange={(e) => setEditingUser({...editingUser, points: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">יהלומים</label>
                  <input
                    type="number"
                    value={editingUser.diamonds}
                    onChange={(e) => setEditingUser({...editingUser, diamonds: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מטבעות</label>
                  <input
                    type="number"
                    value={editingUser.coins}
                    onChange={(e) => setEditingUser({...editingUser, coins: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingUser.isAdmin}
                    onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">מנהל</label>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  שמור
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={loadUsers}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 רענן נתונים
          </button>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            📊 לוח בקרה
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            👤 חזרה לפרופיל
          </button>
        </div>
      </div>
    </div>
  );
}