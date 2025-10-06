'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Ad {
  id: string;
  title: string;
  type: string;
  position: string;
  imageUrl: string | null;
  videoUrl: string | null;
  linkUrl: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  ctr: number;
  earnings: number;
}

export default function MyAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'banner',
    position: 'top',
    imageUrl: '',
    linkUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true
  });
  const router = useRouter();

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/my-ads');
      if (response.ok) {
        const data = await response.json();
        setAds(data.ads || []);
      }
    } catch (error) {
      console.error('Failed to load ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/my-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('פרסומת נוצרה בהצלחה! ✨');
        setShowCreateForm(false);
        setFormData({
          title: '',
          type: 'banner',
          position: 'top',
          imageUrl: '',
          linkUrl: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isActive: true
        });
        loadAds();
      } else {
        const error = await response.json();
        alert(error.error || 'שגיאה ביצירת פרסומת');
      }
    } catch (error) {
      console.error('Failed to create ad:', error);
      alert('שגיאה ביצירת פרסומת');
    }
  };

  const deleteAd = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הפרסומת?')) return;
    
    try {
      const response = await fetch(`/api/admin/my-ads/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('פרסומת נמחקה בהצלחה!');
        loadAds();
      }
    } catch (error) {
      console.error('Failed to delete ad:', error);
      alert('שגיאה במחיקת פרסומת');
    }
  };

  const toggleAdStatus = async (id: string, currentStatus: boolean) => {
    try {
      const ad = ads.find(a => a.id === id);
      if (!ad) return;

      const response = await fetch(`/api/admin/my-ads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ad,
          isActive: !currentStatus
        })
      });

      if (response.ok) {
        loadAds();
      }
    } catch (error) {
      console.error('Failed to toggle ad status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">📢 ניהול הפרסומות שלי</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-bold shadow-lg"
            >
              ➕ פרסומת חדשה
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              חזרה לניהול
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">יצירת פרסומת חדשה</h2>
            <form onSubmit={createAd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">כותרת</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">סוג</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="banner">באנר</option>
                    <option value="video">וידאו</option>
                    <option value="text">טקסט</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">מיקום</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="top">למעלה</option>
                    <option value="bottom">למטה</option>
                    <option value="sidebar">צד</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">URL תמונה</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">קישור</label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">תאריך התחלה</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">תאריך סיום</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">פעיל</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  צור פרסומת
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ads List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📢</div>
            <div className="text-xl">טוען פרסומות...</div>
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">אין פרסומות עדיין</h2>
            <p className="text-gray-600 mb-4">צור את הפרסומת הראשונה שלך!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold"
            >
              ➕ צור פרסומת
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{ad.title}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {ad.type}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        {ad.position}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {ad.isActive ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAdStatus(ad.id, ad.isActive)}
                      className={`px-4 py-2 rounded-lg text-white ${ad.isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                      {ad.isActive ? 'השבת' : 'הפעל'}
                    </button>
                    <button
                      onClick={() => deleteAd(ad.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      🗑️ מחק
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">תאריכים:</div>
                    <div className="text-sm">
                      {new Date(ad.startDate).toLocaleDateString('he-IL')} - {new Date(ad.endDate).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">קישור:</div>
                    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      {ad.linkUrl}
                    </a>
                  </div>
                </div>

                {ad.imageUrl && (
                  <div className="mb-4">
                    <img src={ad.imageUrl} alt={ad.title} className="max-h-40 rounded-lg" />
                  </div>
                )}

                <div className="grid grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{ad.impressions.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">צפיות</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{ad.clicks.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">קליקים</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{ad.ctr.toFixed(2)}%</div>
                    <div className="text-xs text-gray-600">CTR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">${ad.earnings.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">הכנסות</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

