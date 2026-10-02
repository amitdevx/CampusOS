'use client';

import { useEffect, useState } from 'react';
import { getUsers, getClasses, getResources, getEvents } from '@campusos/api-client';
import { Users, CalendarDays, MapPin, ShieldCheck, Building2 } from 'lucide-react';

interface Stat { label: string; value: number | string; icon: React.ReactNode; color: string }

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getUsers(), getClasses(), getResources(), getEvents()])
      .then(([users, classes, resources, events]) => {
        setStats([
          {
            label: 'Total Users',
            value: users.status === 'fulfilled' ? users.value.length : '—',
            icon: <Users size={20} />,
            color: 'text-[#6366F1]',
          },
          {
            label: 'Scheduled Sessions',
            value: classes.status === 'fulfilled' ? classes.value.length : '—',
            icon: <CalendarDays size={20} />,
            color: 'text-[#10B981]',
          },
          {
            label: 'Campus Resources',
            value: resources.status === 'fulfilled' ? resources.value.length : '—',
            icon: <MapPin size={20} />,
            color: 'text-[#F59E0B]',
          },
          {
            label: 'Events',
            value: events.status === 'fulfilled' ? events.value.length : '—',
            icon: <Building2 size={20} />,
            color: 'text-[#EF4444]',
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#E4E4E7] p-8 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#09090B] flex items-center justify-center">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#09090B] tracking-tight">Super Admin Dashboard</h2>
          <p className="text-sm text-[#71717A] font-medium mt-0.5">Institution-wide visibility and control. All actions are audited.</p>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="text-center p-12 text-[#A1A1AA] text-sm font-medium">Loading institution data...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E4E4E7] p-6 shadow-sm">
              <div className={`mb-3 ${stat.color}`}>{stat.icon}</div>
              <p className="text-3xl font-extrabold text-[#09090B]">{stat.value}</p>
              <p className="text-xs font-bold text-[#71717A] uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-[#E4E4E7] p-8 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#52525B] mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Manage Users', path: '/super-admin/users', desc: 'Create, edit, or deactivate any user across all roles.' },
            { label: 'View Timetable', path: '/super-admin/timetable', desc: 'View and manage all scheduled class sessions institution-wide.' },
            { label: 'Audit Logs', path: '/super-admin/audit', desc: 'Review all system actions and security events.' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.path}
              className="block p-5 border border-[#E4E4E7] rounded-xl hover:border-[#09090B] hover:shadow-sm transition-all group"
            >
              <p className="text-sm font-bold text-[#09090B] group-hover:underline">{item.label}</p>
              <p className="text-xs text-[#71717A] mt-1 font-medium leading-relaxed">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
