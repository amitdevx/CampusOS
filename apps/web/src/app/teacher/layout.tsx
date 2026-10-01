'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@campusos/api-client';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { LayoutDashboard, Clock, QrCode, FileText, CheckSquare } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || (role !== 'TEACHER')) {
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
    { name: 'Dashboard', path: '/teacher', icon: <LayoutDashboard size={20} /> },
    { name: 'My Timetable', path: '/teacher/timetable', icon: <Clock size={20} /> },
    { name: 'Attendance QR', path: '/teacher/qr', icon: <QrCode size={20} /> },
    { name: 'Assignments', path: '/teacher/assignments', icon: <FileText size={20} /> },
    { name: 'Marks', path: '/teacher/marks', icon: <CheckSquare size={20} /> },
  ];

  return (
    <SidebarLayout
      title="ResoSync"
      subtitle="Teacher Portal"
      links={links}
      onLogout={handleLogout}
      theme="teal"
    >
      {children}
    </SidebarLayout>
  );
}
