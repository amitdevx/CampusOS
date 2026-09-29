'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { setAuthToken } from '@campusos/api-client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace('/login');
    } else {
      setAuthToken(token);
      setIsReady(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAuthToken(null);
    router.replace('/login');
  };

  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center text-black">Loading...</div>;
  }

  const links = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Events', path: '/admin/events' },
    { name: 'Timetable', path: '/admin/timetable' },
    { name: 'Attendance QR', path: '/admin/qr' },
    { name: 'Users', path: '/admin/users' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400">CampusOS</h1>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Admin Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => (
            <Link 
              key={link.name} 
              href={link.path}
              className={`block px-4 py-2 rounded-md ${
                pathname === link.path 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 rounded-md"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 py-4 px-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {links.find((l) => l.path === pathname)?.name || 'Admin Dashboard'}
          </h2>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-gray-50 text-black">
          {children}
        </main>
      </div>
    </div>
  );
}
