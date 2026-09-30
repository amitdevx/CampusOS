'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@campusos/api-client';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { LayoutDashboard, Calendar, Clock, QrCode, Users } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading CampusOS...</div>;
  }

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Timetable', path: '/admin/timetable', icon: <Clock size={20} /> },
    { name: 'Resources', path: '/admin/resources', icon: <Calendar size={20} /> },
    { name: 'Events', path: '/admin/events', icon: <Calendar size={20} /> },
    { name: 'Audit Logs', path: '/admin/audit', icon: <Clock size={20} /> },
  ];

  return (
    <SidebarLayout
      title="CampusOS"
      subtitle="Admin Portal"
      links={links}
      onLogout={handleLogout}
      theme="gray"
    >
      {children}
    </SidebarLayout>
  );
}
