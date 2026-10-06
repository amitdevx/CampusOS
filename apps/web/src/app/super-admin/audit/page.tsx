'use client';

import { useState, useEffect } from 'react';
import { ScrollText, Clock, User, Activity } from 'lucide-react';
import { getAuditLogs } from '@campusos/api-client';

export default function SuperAdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await getAuditLogs();
        setLogs(data || []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
        setError('Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ScrollText size={24} className="text-amber-600" /> Audit Logs
        </h1>
        <p className="text-sm text-gray-500 mt-1">System-wide activity log. All critical actions are recorded.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Activity size={18} className="text-amber-600" />
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading audit logs...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No activity recorded yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map(log => (
              <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <ScrollText size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{log.action}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <User size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-500">User ID: {log.user_id || 'System'}</span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs font-medium text-gray-500">{log.resource}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                    SUCCESS
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
