import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="w-full py-4 px-6 md:px-12 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg leading-none">R</span>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">ResoSync</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
          <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
          <Link href="#roles" className="hover:text-blue-600 transition-colors">For Campus</Link>
          <Link href="/login" className="hover:text-blue-600 transition-colors">Sign in</Link>
        </nav>
        <Link href="/login" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md">
          Platform Login
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-6xl mx-auto px-6 py-24 md:py-32 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Campus Operations Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
            Your campus, <br className="hidden md:block" />
            <span className="text-blue-600">connected.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Manage classes, attendance, resources, events and campus operations in one unified platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-center">
              Sign in to Workspace
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 text-base font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm text-center">
              Explore Platform
            </Link>
          </div>
        </section>

        {/* Product Preview Section */}
        <section className="w-full max-w-6xl mx-auto px-6 mb-32">
          <div className="w-full aspect-video bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col relative">
             <div className="w-full h-12 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <div className="ml-4 h-6 w-48 bg-white border border-slate-200 rounded text-[10px] text-slate-400 flex items-center px-2 font-mono">resosync.campus.edu</div>
             </div>
             <div className="flex-1 bg-slate-100 flex">
                <div className="w-64 border-r border-slate-200 bg-white p-4 hidden md:block">
                  <div className="h-4 w-24 bg-slate-200 rounded mb-8"></div>
                  <div className="space-y-4">
                    <div className="h-8 w-full bg-blue-50 rounded border border-blue-100"></div>
                    <div className="h-8 w-full bg-slate-50 rounded"></div>
                    <div className="h-8 w-full bg-slate-50 rounded"></div>
                    <div className="h-8 w-full bg-slate-50 rounded"></div>
                  </div>
                </div>
                <div className="flex-1 p-8 flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-48 bg-slate-200 rounded"></div>
                    <div className="h-10 w-32 bg-blue-600 rounded"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="h-32 bg-white rounded-xl border border-slate-200 shadow-sm"></div>
                    <div className="h-32 bg-white rounded-xl border border-slate-200 shadow-sm"></div>
                    <div className="h-32 bg-white rounded-xl border border-slate-200 shadow-sm"></div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm mt-2"></div>
                </div>
             </div>
          </div>
        </section>
        
        {/* Features Grid */}
        <section id="features" className="w-full bg-white border-y border-slate-200 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Everything your campus needs.</h2>
              <p className="text-lg text-slate-500">Connected modules that talk to each other.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:shadow-md hover:border-slate-200">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold">✓</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Attendance</h3>
                <p className="text-slate-600 leading-relaxed">Scan-and-go QR attendance. Secure, location-aware, and instantly synced with the central timetable.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:shadow-md hover:border-slate-200">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold">◷</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Live Timetables</h3>
                <p className="text-slate-600 leading-relaxed">Dynamic schedules for students and faculty. Automated room allocations and instant updates.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:shadow-md hover:border-slate-200">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold">▦</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Campus Resources</h3>
                <p className="text-slate-600 leading-relaxed">Book labs, seminar halls, and equipment. Manage campus inventory and utilization effectively.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:shadow-md hover:border-slate-200">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold">★</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Events & Notices</h3>
                <p className="text-slate-600 leading-relaxed">Centralized noticeboard and event registration. Keep the entire campus informed and engaged.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:shadow-md hover:border-slate-200">
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold">✎</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Assignments</h3>
                <p className="text-slate-600 leading-relaxed">Digital submissions, automated tracking, and grading workflows for all your academic courses.</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:shadow-md hover:border-slate-200">
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold">🔔</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Alerts</h3>
                <p className="text-slate-600 leading-relaxed">Push notifications for class changes, upcoming deadlines, and important campus announcements.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section id="roles" className="w-full py-24 bg-slate-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-12">Built for every role</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-semibold shadow-sm">Students</span>
              <span className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-semibold shadow-sm">Teachers</span>
              <span className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-semibold shadow-sm">Faculty</span>
              <span className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-semibold shadow-sm">Administrators</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-slate-900 py-16 px-6 text-center border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">R</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">ResoSync</span>
          </div>
          <p className="text-slate-400 text-base max-w-md mx-auto mb-10">
            One platform. One connected campus.
          </p>
          <div className="text-slate-600 text-sm">
            &copy; {new Date().getFullYear()} ResoSync Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
