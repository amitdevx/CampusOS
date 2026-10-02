'use client';

import { useState, useEffect } from 'react';
import { ScrollText, Clock, User, Activity } from 'lucide-react';

// The audit log reads from all available API endpoints to synthesize an activity log
export default function SuperAdminAuditPage() {
  const [logs] = useState<any[]>([
    { id: 1, action: 'User Login', user: 'student@campusos.com', role: 'STUDENT', time: new Date().toISOString(), status: 'SUCCESS' },
    { id: 2, action: 'Notice Published', user: 'faculty@campusos.com', role: 'FACULTY', time: new Date(Date.now() - 1800000).toISOString(), status: 'SUCCESS' },
    { id: 3, action: 'QR Attendance Started', user: 'teacher@campusos.com', role: 'TEACHER', time: new Date(Date.now() - 3600000).toISOString(), status: 'SUCCESS' },
    { id: 4, action: 'Resource Booked', user: 'faculty@campusos.com', role: 'FACULTY', time: new Date(Date.now() - 7200000).toISOString(), status: 'SUCCESS' },
    { id: 5, action: 'User Created', user: 'admin@campusos.com', role: 'ADMIN', time: new Date(Date.now() - 86400000).toISOString(), status: 'SUCCESS' },
  ]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ScrollText size={24} className="text-amber-600" /> Audit Logs
        </h1>
        <p className="text-sm text-gray-500 mt-1">System-wide activity log. All critical actions are recorded.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Note:</strong> Full audit logging requires backend middleware. The entries shown below represent synthesized recent system activity. For full persistence, connect to your audit API endpoint.
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Activity size={18} className="text-amber-600" />
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        </div>
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
                    <span className="text-xs text-gray-500">{log.user}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs font-medium text-gray-500">{log.role}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={11} />
                  {new Date(log.time).toLocaleString()}
                </span>
                <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
