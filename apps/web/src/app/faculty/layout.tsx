'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@campusos/api-client';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { LayoutDashboard, Building2, Users, BookOpen, BellRing } from 'lucide-react';

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || (role !== 'FACULTY')) {
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
    { name: 'Dashboard', path: '/faculty', icon: <LayoutDashboard size={20} /> },
    { name: 'My Department', path: '/faculty/department', icon: <Building2 size={20} /> },
    { name: 'Teachers', path: '/faculty/teachers', icon: <Users size={20} /> },
    { name: 'Subjects', path: '/faculty/subjects', icon: <BookOpen size={20} /> },
    { name: 'Notices', path: '/faculty/notices', icon: <BellRing size={20} /> },
  ];

  return (
    <SidebarLayout
      title="ResoSync"
      subtitle="Faculty Portal"
      links={links}
      onLogout={handleLogout}
      theme="indigo"
    >
      {children}
    </SidebarLayout>
  );
}
