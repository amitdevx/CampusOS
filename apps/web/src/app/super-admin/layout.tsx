'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@campusos/api-client';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { LayoutDashboard, Users, Clock, Building2, BookOpen, CalendarDays, ScrollText, ShieldCheck } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'SUPER_ADMIN') {
      router.replace('/login');
    } else {
      setAuthToken(token);
      setIsReady(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    setAuthToken(null);
    router.replace('/login');
  };

  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading ResoSync...</div>;
  }

  const links = [
    { name: 'Dashboard', path: '/super-admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/super-admin/users', icon: <Users size={20} /> },
    { name: 'Timetable', path: '/super-admin/timetable', icon: <Clock size={20} /> },
    { name: 'Departments', path: '/super-admin/departments', icon: <Building2 size={20} /> },
    { name: 'Subjects', path: '/super-admin/subjects', icon: <BookOpen size={20} /> },
    { name: 'Events', path: '/super-admin/events', icon: <CalendarDays size={20} /> },
    { name: 'Audit Logs', path: '/super-admin/audit', icon: <ScrollText size={20} /> },
  ];

  return (
    <SidebarLayout
      title="ResoSync"
      subtitle="Super Admin"
      links={links}
      onLogout={handleLogout}
      theme="gray"
    >
      {children}
    </SidebarLayout>
  );
}
