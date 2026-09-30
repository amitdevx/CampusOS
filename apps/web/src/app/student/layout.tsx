'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { setAuthToken } from '@campusos/api-client';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    
    if (!token) {
      router.replace('/login');
    } else if (role !== 'STUDENT') {
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
    return <div className="min-h-screen flex items-center justify-center text-black">Loading...</div>;
  }

  const links = [
    { name: 'Dashboard', path: '/student' },
    { name: 'My Classes', path: '/student/classes' },
    { name: 'Assignments', path: '/student/assignments' },
    { name: 'Events', path: '/student/events' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">CampusOS</h1>
          <p className="text-xs text-blue-200 uppercase tracking-wider mt-1">Student Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => (
            <Link 
              key={link.name} 
              href={link.path}
              className={`block px-4 py-2 rounded-md ${
                pathname === link.path 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-blue-200 hover:bg-blue-800 rounded-md"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 py-4 px-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {links.find((l) => l.path === pathname)?.name || 'Student Dashboard'}
          </h2>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-gray-50 text-black">
          {children}
        </main>
      </div>
    </div>
  );
}
