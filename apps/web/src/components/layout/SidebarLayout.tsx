'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, LogOut, Menu, User, ChevronRight } from 'lucide-react';
import { useCampusWebSocket } from '@/hooks/useCampusWebSocket';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications } = useCampusWebSocket();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Unified light sidebar — one ResoSync identity for all roles
  const roleAccentClass: Record<string, string> = {
    blue: 'text-emerald-600',
    teal: 'text-teal-600',
    indigo: 'text-emerald-700',
    gray: 'text-slate-700',
  };

  const roleActiveBg: Record<string, string> = {
    blue: 'bg-emerald-50 text-emerald-700',
    teal: 'bg-teal-50 text-teal-700',
    indigo: 'bg-emerald-50 text-emerald-800',
    gray: 'bg-slate-100 text-slate-900',
  };

  const accent = roleAccentClass[theme] || roleAccentClass.blue;
  const activeBg = roleActiveBg[theme] || roleActiveBg.blue;

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col bg-white border-r border-slate-200 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-base leading-none">R</span>
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 tracking-tight leading-none">ResoSync</span>
            <p className={`text-[10px] font-bold mt-0.5 uppercase tracking-widest ${accent}`}>{subtitle}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.path || pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? `${activeBg} font-semibold`
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.icon && <span className="flex-shrink-0">{link.icon}</span>}
                <span className="flex-1">{link.name}</span>
                {isActive && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="bg-white border-b border-slate-200 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
            <div className="flex items-center gap-4">
              <button className="lg:hidden text-slate-500 hover:text-slate-700" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={22} />
              </button>
              <h2 className="text-base font-semibold text-slate-800 hidden sm:block">
                {links.find((l) => l.path === pathname)?.name || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 relative">
              <div className="hidden md:flex relative text-slate-400 focus-within:text-emerald-500">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-slate-50 text-sm border border-slate-200 rounded-full pl-9 pr-4 py-2 w-52 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                />
              </div>

              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 z-50 overflow-hidden">
                    <div className="p-4 text-sm font-semibold text-slate-900 border-b border-slate-100">Notifications</div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-sm text-slate-400 text-center py-8">No new notifications</div>
                      ) : (
                        notifications.map((n: any, i: number) => (
                          <div key={i} className="p-4 text-sm border-b border-slate-100 hover:bg-slate-50 text-slate-700">{n.message}</div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <User size={15} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
