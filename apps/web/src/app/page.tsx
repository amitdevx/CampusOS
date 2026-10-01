'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Clock, Database, Calendar, FileText, Bell } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#09090B] font-sans selection:bg-[#09090B] selection:text-white">
      {/* COMMAND CENTER NAVBAR */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#FAFAFA]/90 border-b border-[#E4E4E7]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#09090B] text-white flex items-center justify-center font-bold text-lg rounded-sm shadow-sm">
              R
            </div>
            <span className="text-xl font-bold tracking-tight leading-none">ResoSync</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-[#71717A]">
            <Link href="#features" className="hover:text-[#09090B] transition-colors">Features</Link>
            <Link href="/login" className="px-5 py-2 rounded-md bg-[#09090B] text-white hover:bg-[#27272A] transition-colors font-semibold shadow-sm">
              System Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="w-full max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-[#09090B] mb-6 leading-[1.05]">
              The Academic<br/>Command Center.
            </h1>
            
            <p className="text-lg text-[#71717A] max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              A high-density operations utility for managing classes, attendance, resources, and events across your entire campus.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="h-12 px-8 rounded-md bg-[#09090B] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#27272A] transition-colors text-base shadow-sm">
                Access Terminal <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* BENTO FEATURES GRID */}
        <section id="features" className="w-full border-t border-[#E4E4E7] bg-white py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-[#09090B] tracking-tight mb-3">Core Modules</h2>
              <p className="text-[#71717A] font-medium">Integrated systems for operational clarity.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <CheckCircle className="text-[#09090B]" size={24} />, title: "Digital ID & Attendance", desc: "Scan-and-go QR attendance tied to native digital passes." },
                { icon: <Clock className="text-[#09090B]" size={24} />, title: "Live Timetables", desc: "Dynamic schedules for students and faculty. Automated room allocations." },
                { icon: <Database className="text-[#09090B]" size={24} />, title: "Resource Booking", desc: "Reserve labs, seminar halls, and equipment directly from the dashboard." },
                { icon: <Calendar className="text-[#09090B]" size={24} />, title: "Event Coordination", desc: "Centralized noticeboard and event registration system." },
                { icon: <FileText className="text-[#09090B]" size={24} />, title: "Assignment Tracking", desc: "Digital submissions and grading workflows for academic courses." },
                { icon: <Bell className="text-[#09090B]" size={24} />, title: "System Alerts", desc: "Push notifications for class changes and important announcements." },
              ].map((f, i) => (
                <div 
                  key={i}
                  className="p-8 bg-[#FAFAFA] rounded-xl border border-[#E4E4E7] hover:border-[#09090B] transition-colors"
                >
                  <div className="w-12 h-12 bg-white border border-[#E4E4E7] rounded-lg flex items-center justify-center mb-6 shadow-sm">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#09090B] mb-2">{f.title}</h3>
                  <p className="text-[#71717A] text-sm leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-[#09090B] py-12 px-6 text-center border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-6 h-6 bg-white text-[#09090B] flex items-center justify-center font-bold text-sm rounded-sm">
              R
            </div>
            <span className="text-lg font-bold text-white tracking-tight">ResoSync</span>
          </div>
          <div className="text-[#A1A1AA] text-xs font-medium tracking-wide uppercase">
            &copy; {new Date().getFullYear()} ResoSync Operations.
          </div>
        </div>
      </footer>
    </div>
  );
}
