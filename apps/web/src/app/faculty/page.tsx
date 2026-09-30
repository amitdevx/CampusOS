'use client';

import { useEffect, useState } from 'react';
import { getMe } from '@campusos/api-client';

export default function FacultyDashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getMe().then(setUser).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome back, {user?.full_name || 'Faculty Member'}!</h3>
        <p className="text-gray-600">Manage your department and academic settings here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm font-medium text-gray-500 truncate">Total Teachers</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">12</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm font-medium text-gray-500 truncate">Active Classes</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">8</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm font-medium text-gray-500 truncate">Avg Attendance</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">88%</p>
        </div>
      </div>
    </div>
  );
}
