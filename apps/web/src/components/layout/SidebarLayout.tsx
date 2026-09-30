'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, LogOut, Menu, User } from 'lucide-react';

interface SidebarLink {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

interface SidebarLayoutProps {
  title: string;
  subtitle: string;
  links: SidebarLink[];
  onLogout: () => void;
  children: React.ReactNode;
  theme?: 'blue' | 'teal' | 'indigo' | 'gray';
}

export function SidebarLayout({
  title,
  subtitle,
  links,
  onLogout,
  children,
  theme = 'blue'
}: SidebarLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const themeClasses = {
    blue: {
      sidebar: 'bg-blue-900',
      text: 'text-blue-100',
      activeBg: 'bg-blue-800',
      hoverBg: 'hover:bg-blue-800',
      accent: 'text-blue-400',
    },
    teal: {
      sidebar: 'bg-teal-900',
      text: 'text-teal-100',
      activeBg: 'bg-teal-800',
      hoverBg: 'hover:bg-teal-800',
      accent: 'text-teal-400',
    },
    indigo: {
      sidebar: 'bg-indigo-900',
      text: 'text-indigo-100',
      activeBg: 'bg-indigo-800',
      hoverBg: 'hover:bg-indigo-800',
      accent: 'text-indigo-400',
    },
    gray: {
      sidebar: 'bg-gray-900',
      text: 'text-gray-300',
      activeBg: 'bg-gray-800',
      hoverBg: 'hover:bg-gray-800',
      accent: 'text-blue-400',
    }
  };

  const currentTheme = themeClasses[theme];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0 flex flex-col ${currentTheme.sidebar} text-white
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${currentTheme.accent}`}>{title}</h1>
            <p className={`text-xs uppercase tracking-wider mt-1 ${currentTheme.text}`}>{subtitle}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.path || pathname.startsWith(link.path + '/');
            return (
              <Link 
                key={link.name} 
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? `${currentTheme.activeBg} text-white font-medium` 
                    : `${currentTheme.text} ${currentTheme.hoverBg} hover:text-white`
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors text-red-400 ${currentTheme.hoverBg} hover:text-red-300`}
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden text-gray-500 hover:text-gray-700"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
                {links.find((l) => l.path === pathname)?.name || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden md:flex relative text-gray-400 focus-within:text-blue-500">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search CampusOS..." 
                  className="bg-gray-100 text-sm border-none rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800"
                />
              </div>
              <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm border border-blue-200 cursor-pointer">
                <User size={16} />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
