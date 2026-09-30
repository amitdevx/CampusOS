'use client';

import { useEffect, useState } from 'react';
import { getMe } from '@campusos/api-client';

export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getMe().then(setUser).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome back, {user?.full_name || 'Student'}!</h3>
        <p className="text-gray-600">Here's what's happening on campus today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm font-medium text-gray-500 truncate">Upcoming Classes</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">3</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm font-medium text-gray-500 truncate">Pending Assignments</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">1</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm font-medium text-gray-500 truncate">Attendance Rate</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">92%</p>
        </div>
      </div>
    </div>
  );
}
