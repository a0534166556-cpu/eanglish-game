'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BugReport {
  id: string;
  email?: string;
  description: string;
  screenshots?: string[];
  deviceInfo?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export default function BugReportsAdmin() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadReports();
  }, [filterStatus, filterPriority]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPriority !== 'all') params.append('priority', filterPriority);
      
      const response = await fetch(`/api/bug-reports?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (reportId: string, updates: Partial<BugReport>) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/bug-reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const data = await response.json();
      if (data.success) {
        await loadReports();
        setSelectedReport(null);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error updating report:', error);
    } finally {
      setUpdating(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק דיווח זה?')) return;
    
    try {
      const response = await fetch(`/api/bug-reports/${reportId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        await loadReports();
      }
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'ממתין';
      case 'in_progress': return 'בטיפול';
      case 'resolved': return 'נפתר';
      case 'closed': return 'סגור';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'נמוכה';
      case 'medium': return 'בינונית';
      case 'high': return 'גבוהה';
      case 'critical': return 'קריטית';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">טוען דיווחים...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול דיווחי באגים</h1>
          <p className="text-gray-600">צפה וטפל בדיווחי הבעיות מהמשתמשים</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סטטוס</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">הכל</option>
                <option value="pending">ממתין</option>
                <option value="in_progress">בטיפול</option>
                <option value="resolved">נפתר</option>
                <option value="closed">סגור</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">עדיפות</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">הכל</option>
                <option value="low">נמוכה</option>
                <option value="medium">בינונית</option>
                <option value="high">גבוהה</option>
                <option value="critical">קריטית</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={loadReports}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                רענן
              </button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">אין דיווחים להצגה</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תיאור
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      אימייל
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      עדיפות
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
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {report.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {report.email || 'לא צוין'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                          {getPriorityText(report.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('he-IL')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          צפה
                        </button>
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          מחק
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Report Details Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">פרטי הדיווח</h2>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">תיאור הבעיה</label>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      {selectedReport.description}
                    </div>
                  </div>

                  {selectedReport.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                      <div className="bg-gray-50 p-3 rounded-md text-sm">
                        {selectedReport.email}
                      </div>
                    </div>
                  )}

                  {selectedReport.deviceInfo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">מידע על המכשיר</label>
                      <div className="bg-gray-50 p-3 rounded-md text-sm">
                        {selectedReport.deviceInfo}
                      </div>
                    </div>
                  )}

                  {selectedReport.screenshots && selectedReport.screenshots.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">צילומי מסך</label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedReport.screenshots.map((screenshot, index) => (
                          <img
                            key={index}
                            src={screenshot}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
                      <select
                        value={selectedReport.status}
                        onChange={(e) => setSelectedReport({...selectedReport, status: e.target.value as any})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="pending">ממתין</option>
                        <option value="in_progress">בטיפול</option>
                        <option value="resolved">נפתר</option>
                        <option value="closed">סגור</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">עדיפות</label>
                      <select
                        value={selectedReport.priority}
                        onChange={(e) => setSelectedReport({...selectedReport, priority: e.target.value as any})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="low">נמוכה</option>
                        <option value="medium">בינונית</option>
                        <option value="high">גבוהה</option>
                        <option value="critical">קריטית</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">הערות מנהל</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="הוסף הערות..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={() => updateReport(selectedReport.id, {
                      status: selectedReport.status,
                      priority: selectedReport.priority,
                      adminNotes: adminNotes
                    })}
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updating ? 'שומר...' : 'שמור שינויים'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


