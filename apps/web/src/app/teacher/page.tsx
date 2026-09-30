'use client';

import { useEffect, useState } from 'react';
import { getMe } from '@campusos/api-client';
import Link from 'next/link';

export default function TeacherDashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getMe().then(setUser).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome back, {user?.full_name || 'Teacher'}!</h3>
        <p className="text-gray-600">Here's your class schedule for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm font-medium text-gray-500 truncate">Classes Today</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">2</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm font-medium text-gray-500 truncate">Pending Grading</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">45</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/teacher/qr" className="block text-center px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
            Start Attendance
          </Link>
          <Link href="/teacher/assignments" className="block text-center px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
            Create Assignment
          </Link>
        </div>
      </div>
    </div>
  );
}
