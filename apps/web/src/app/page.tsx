'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Clock, Database, Calendar, FileText, Bell } from 'lucide-react';

const Particles = () => {
  const [particles, setParticles] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const newParticles = [...Array(20)].map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      scale: Math.random() * 0.5 + 0.5,
      animY: Math.random() * -500,
      animX: Math.random() * 200 - 100,
      duration: Math.random() * 10 + 10,
      width: Math.random() * 100 + 50 + 'px',
      height: Math.random() * 100 + 50 + 'px',
    }));
    setParticles(newParticles);
  }, []);

  if (!mounted || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute bg-emerald-500/10 rounded-full"
          initial={{
            x: p.x,
            y: p.y,
            scale: p.scale,
          }}
          animate={{
            y: [null, p.animY],
            x: [null, p.animX],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            width: p.width,
            height: p.height,
            filter: 'blur(40px)',
          }}
        />
      ))}
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">
      <Particles />
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-emerald-100/50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-xl leading-none">R</span>
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-emerald-600">ResoSync</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <Link href="#features" className="hover:text-emerald-600 transition-colors">Features</Link>
            <Link href="#roles" className="hover:text-emerald-600 transition-colors">Roles</Link>
            <Link href="/login" className="px-6 py-2.5 rounded-full bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 font-semibold">Sign in</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center relative z-10">
        {/* Hero */}
        <section className="w-full max-w-6xl mx-auto px-6 pt-32 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-medium text-sm mb-8 border border-emerald-100/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Connected Campus Operations
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Your entire campus,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">synchronized.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              Manage classes, attendance, resources, events, and academic operations in one unified platform designed for speed and clarity.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="h-14 px-8 rounded-full bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 text-lg w-full sm:w-auto">
                Explore Platform <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full bg-slate-50/50 border-y border-slate-200/50 py-24 relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Everything your campus needs.</h2>
              <p className="text-lg text-slate-500">Connected modules that talk to each other effortlessly.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <CheckCircle className="text-emerald-600" size={28} />, title: "Smart Attendance", desc: "Scan-and-go QR attendance. Secure, location-aware, and instantly synced with the central timetable." },
                { icon: <Clock className="text-teal-600" size={28} />, title: "Live Timetables", desc: "Dynamic schedules for students and faculty. Automated room allocations and instant updates." },
                { icon: <Database className="text-green-600" size={28} />, title: "Campus Resources", desc: "Book labs, seminar halls, and equipment. Manage campus inventory and utilization effectively." },
                { icon: <Calendar className="text-emerald-600" size={28} />, title: "Events & Notices", desc: "Centralized noticeboard and event registration. Keep the entire campus informed and engaged." },
                { icon: <FileText className="text-teal-600" size={28} />, title: "Assignments", desc: "Digital submissions, automated tracking, and grading workflows for all your academic courses." },
                { icon: <Bell className="text-green-600" size={28} />, title: "Real-time Alerts", desc: "Push notifications for class changes, upcoming deadlines, and important campus announcements." },
              ].map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-100 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section id="roles" className="w-full py-24 bg-white relative z-10">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-12">Built for every role</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['Students', 'Teachers', 'Faculty', 'Administrators'].map((r, i) => (
                <span key={i} className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-semibold shadow-sm hover:border-emerald-300 hover:text-emerald-700 transition-colors cursor-default">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-slate-50 py-16 px-6 text-center border-t border-slate-200 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">R</span>
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">ResoSync</span>
          </div>
          <p className="text-slate-500 text-base max-w-md mx-auto mb-10">
            One platform. One connected campus.
          </p>
          <div className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} ResoSync Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
