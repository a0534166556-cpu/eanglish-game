'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: Date;
  lastActive: Date;
  totalGames: number;
  averageScore: number;
  level: number;
  coins: number;
  diamonds: number;
  isActive: boolean;
  isPremium: boolean;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  premiumUsers: number;
  averageGamesPerUser: number;
  topUsers: User[];
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'premium' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'lastActive' | 'totalGames' | 'averageScore'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // סימולציה של נתוני משתמשים
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'יוסי כהן',
          email: 'yossi@example.com',
          joinDate: new Date('2024-01-15'),
          lastActive: new Date('2024-09-28'),
          totalGames: 150,
          averageScore: 450,
          level: 25,
          coins: 2500,
          diamonds: 150,
          isActive: true,
          isPremium: true
        },
        {
          id: '2',
          name: 'שרה לוי',
          email: 'sara@example.com',
          joinDate: new Date('2024-02-20'),
          lastActive: new Date('2024-09-27'),
          totalGames: 89,
          averageScore: 380,
          level: 18,
          coins: 1200,
          diamonds: 75,
          isActive: true,
          isPremium: false
        },
        {
          id: '3',
          name: 'דוד ישראלי',
          email: 'david@example.com',
          joinDate: new Date('2024-03-10'),
          lastActive: new Date('2024-09-25'),
          totalGames: 45,
          averageScore: 320,
          level: 12,
          coins: 800,
          diamonds: 40,
          isActive: false,
          isPremium: false
        },
        {
          id: '4',
          name: 'מיכל רוזן',
          email: 'michal@example.com',
          joinDate: new Date('2024-04-05'),
          lastActive: new Date('2024-09-28'),
          totalGames: 200,
          averageScore: 520,
          level: 35,
          coins: 5000,
          diamonds: 300,
          isActive: true,
          isPremium: true
        },
        {
          id: '5',
          name: 'אבי גולד',
          email: 'avi@example.com',
          joinDate: new Date('2024-05-12'),
          lastActive: new Date('2024-09-26'),
          totalGames: 75,
          averageScore: 410,
          level: 15,
          coins: 1800,
          diamonds: 90,
          isActive: true,
          isPremium: false
        }
      ];

      setUsers(mockUsers);

      // חישוב סטטיסטיקות
      const userStats: UserStats = {
        totalUsers: mockUsers.length,
        activeUsers: mockUsers.filter(u => u.isActive).length,
        newUsersToday: mockUsers.filter(u => 
          u.joinDate.toDateString() === new Date().toDateString()
        ).length,
        premiumUsers: mockUsers.filter(u => u.isPremium).length,
        averageGamesPerUser: Math.round(
          mockUsers.reduce((sum, u) => sum + u.totalGames, 0) / mockUsers.length
        ),
        topUsers: mockUsers
          .sort((a, b) => b.totalGames - a.totalGames)
          .slice(0, 5)
      };

      setStats(userStats);

    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (filterBy) {
      case 'active':
        matchesFilter = user.isActive;
        break;
      case 'premium':
        matchesFilter = user.isPremium;
        break;
      case 'inactive':
        matchesFilter = !user.isActive;
        break;
    }

    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'joinDate':
        aValue = a.joinDate.getTime();
        bValue = b.joinDate.getTime();
        break;
      case 'lastActive':
        aValue = a.lastActive.getTime();
        bValue = b.lastActive.getTime();
        break;
      case 'totalGames':
        aValue = a.totalGames;
        bValue = b.totalGames;
        break;
      case 'averageScore':
        aValue = a.averageScore;
        bValue = b.averageScore;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('he-IL');
  };

  const getLevelColor = (level: number) => {
    if (level >= 30) return 'text-purple-600 bg-purple-100';
    if (level >= 20) return 'text-blue-600 bg-blue-100';
    if (level >= 10) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתוני משתמשים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">👥 ניהול משתמשים</h1>
          <p className="text-gray-600 mt-2">ניהול וניטור משתמשי המערכת</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">סה"כ משתמשים</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">משתמשים פעילים</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">💎</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">משתמשים פרימיום</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.premiumUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">🎮</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">משחקים ממוצע</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageGamesPerUser}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">חיפוש</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חיפוש לפי שם או מייל..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סינון</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">כל המשתמשים</option>
                <option value="active">פעילים</option>
                <option value="premium">פרימיום</option>
                <option value="inactive">לא פעילים</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">מיון לפי</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">שם</option>
                <option value="joinDate">תאריך הצטרפות</option>
                <option value="lastActive">פעילות אחרונה</option>
                <option value="totalGames">סה"כ משחקים</option>
                <option value="averageScore">ציון ממוצע</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סדר</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">עולה</option>
                <option value="desc">יורד</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    משתמש
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    רמה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    משחקים
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ציון ממוצע
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מטבעות
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סטטוס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעילות אחרונה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(user.level)}`}>
                        רמה {user.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.totalGames}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.averageScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>🪙 {user.coins}</div>
                        <div>💎 {user.diamonds}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                        }`}>
                          {user.isActive ? 'פעיל' : 'לא פעיל'}
                        </span>
                        {user.isPremium && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-purple-800 bg-purple-100">
                            פרימיום
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.lastActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          ערוך
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          מחק
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Users */}
        {stats && stats.topUsers.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 המשתמשים המובילים</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.topUsers.map((user, index) => (
                <div key={user.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.totalGames} משחקים</p>
                    </div>
                    <div className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


