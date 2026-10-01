'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut, Bell, Search, User, X } from 'lucide-react';
import { useCampusWebSocket } from '@/hooks/useCampusWebSocket';

interface SidebarLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  links: { name: string; path: string; icon?: React.ReactNode }[];
  onLogout: () => void;
  theme?: 'blue' | 'teal' | 'indigo' | 'gray';
}

export function SidebarLayout({
  children,
  title,
  subtitle,
  links,
  onLogout,
  theme = 'blue',
}: SidebarLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications } = useCampusWebSocket();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  
  // Toast state
  const [latestToast, setLatestToast] = useState<{message: string, id: number} | null>(null);

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

  // Show toast when new notification arrives
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      const toastId = Date.now();
      setLatestToast({ message: latest.message, id: toastId });
      
      const timer = setTimeout(() => {
        setLatestToast(current => current?.id === toastId ? null : current);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  return (
    <div className="flex h-screen bg-[#F4F4F5] font-sans selection:bg-[#0F172A] selection:text-white">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* LIVE TOAST NOTIFICATION */}
      {latestToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#09090B] text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-sm font-medium">{latestToast.message}</span>
          <button onClick={() => setLatestToast(null)} className="text-[#A1A1AA] hover:text-white ml-2">
            <X size={16} />
          </button>
        </div>
      )}

      {/* COMMAND CENTER SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col bg-[#09090B] text-[#FAFAFA] border-r border-[#27272A] ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-[#09090B] flex items-center justify-center font-bold text-lg rounded-sm">
            R
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight leading-none block">ResoSync</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#A1A1AA] block mt-1">{subtitle}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-semibold text-[#52525B] uppercase tracking-widest mb-4 px-2">Core Modules</div>
          {links.map((link) => {
            const isActive = pathname === link.path || pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#27272A] text-white font-medium shadow-sm'
                    : 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-white'
                }`}
              >
                {link.icon && <span className={`${isActive ? 'text-white' : 'text-[#71717A]'}`}>{link.icon}</span>}
                <span className="flex-1">{link.name}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#27272A]">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-[#F87171] hover:bg-[#451A1A] hover:text-[#FCA5A5] transition-colors"
          >
            <LogOut size={16} />
            End Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="bg-white border-b border-[#E4E4E7] z-10 sticky top-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button className="lg:hidden text-[#71717A] hover:text-[#09090B]" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={22} />
              </button>
              <h2 className="text-lg font-semibold text-[#09090B] tracking-tight hidden sm:block">
                {links.find((l) => l.path === pathname)?.name || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-4 relative">
              <div className="hidden md:flex relative text-[#A1A1AA] focus-within:text-[#09090B]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search network..."
                  className="bg-[#F4F4F5] text-sm border-none rounded-md pl-9 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-[#09090B] focus:bg-white transition-all text-[#09090B] placeholder-[#A1A1AA]"
                />
              </div>

              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] rounded-md transition-colors"
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E4E4E7] rounded-lg shadow-xl shadow-black/5 z-50 overflow-hidden">
                    <div className="p-4 text-xs font-bold text-[#09090B] uppercase tracking-wider border-b border-[#E4E4E7] bg-[#FAFAFA]">System Alerts</div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-sm text-[#A1A1AA] text-center py-8">No active alerts.</div>
                      ) : (
                        notifications.map((n: any, i: number) => (
                          <div key={i} className="p-4 text-sm border-b border-[#E4E4E7] hover:bg-[#FAFAFA] text-[#27272A]">{n.message}</div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="h-8 w-8 bg-[#09090B] text-white rounded-md flex items-center justify-center hover:bg-[#27272A] transition-colors"
                >
                  <User size={15} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E4E4E7] rounded-lg shadow-xl shadow-black/5 z-50 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-[#EF4444] hover:bg-[#FEF2F2] font-medium"
                      >
                        End Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-10 bg-[#F4F4F5]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
