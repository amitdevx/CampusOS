'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@campusos/api-client';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { LayoutDashboard, BookOpen, FileText, Calendar } from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('userToken');
      const role = localStorage.getItem('userRole');
      
      if (!token || role !== 'STUDENT') {
        router.replace('/login');
      } else {
        setAuthToken(token);
        setIsReady(true);
      }
    };
    checkAuth();
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
    { name: 'Dashboard', path: '/student', icon: <LayoutDashboard size={20} /> },
    { name: 'My Classes', path: '/student/classes', icon: <BookOpen size={20} /> },
    { name: 'Assignments', path: '/student/assignments', icon: <FileText size={20} /> },
    { name: 'Events', path: '/student/events', icon: <Calendar size={20} /> },
  ];

  return (
    <SidebarLayout
      title="ResoSync"
      subtitle="Student Portal"
      links={links}
      onLogout={handleLogout}
      theme="blue"
    >
      {children}
    </SidebarLayout>
  );
}
