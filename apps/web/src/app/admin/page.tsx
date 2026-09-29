'use client';

import { useEffect, useState } from 'react';
import { getAnalytics } from '@campusos/api-client';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    active_assignments: 0,
    upcoming_events: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAnalytics();
        setStats(data);
      } catch (err) {
        console.error("Failed to load analytics", err);
        setError("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div>Loading dashboard statistics...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Students</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.total_students}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Faculty</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.total_teachers}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-yellow-500">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Assignments</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.active_assignments}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Upcoming Events</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.upcoming_events}</div>
        </div>

      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
            + Create User
          </button>
          <button className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
            + Schedule Class
          </button>
          <button className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
            + Post Notice
          </button>
          <button className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
            + Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
