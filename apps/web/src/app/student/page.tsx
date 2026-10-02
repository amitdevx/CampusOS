'use client';

import { useEffect, useState } from 'react';
import { getMe, getMySchedule, getAssignments, getEvents } from '@campusos/api-client';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';

export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [assignmentsCount, setAssignmentsCount] = useState<number>(0);
  const [eventsCount, setEventsCount] = useState<number>(0);

  useEffect(() => {
    getMe().then(setUser).catch(console.error);
    getMySchedule().then((data) => setSchedule(data || [])).catch(console.error);
    getAssignments().then((data) => setAssignmentsCount((data || []).length)).catch(console.error);
    getEvents().then((data) => setEventsCount((data || []).length)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* IDENTITY BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-3 bg-[#09090B] rounded-xl p-8 flex flex-col justify-between relative overflow-hidden border border-[#27272A]">
          <div className="absolute top-0 right-0 p-32 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white/10 text-white/70 font-mono text-xs font-semibold mb-6 uppercase tracking-widest">
              Digital ID Active
            </div>
            <h3 className="text-3xl font-semibold text-white tracking-tight leading-tight">
              {user?.full_name || 'STUDENT'}
            </h3>
            <p className="text-[#A1A1AA] text-sm mt-1">{user?.email}</p>
          </div>
          <div className="mt-8 flex gap-4">
            <button onClick={() => window.location.href="/student/profile"} className="bg-white text-[#09090B] px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[#F4F4F5] transition-colors">
              Display QR Pass
            </button>
            <button onClick={() => window.location.href="/student/profile"} className="bg-[#27272A] text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[#3F3F46] transition-colors border border-[#3F3F46]">
              View Full Profile
            </button>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 border border-[#E4E4E7] flex-1 flex flex-col justify-center shadow-sm">
            <div className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-1">Pending Work</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tighter text-[#09090B]">{assignmentsCount}</span>
              <span className="text-sm font-medium text-[#71717A]">items</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-[#E4E4E7] flex-1 flex flex-col justify-center shadow-sm">
            <div className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-1">Campus Events</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tighter text-[#09090B]">{eventsCount}</span>
              <span className="text-sm font-medium text-[#71717A]">upcoming</span>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div>
        <h4 className="text-xs font-bold text-[#52525B] uppercase tracking-widest mb-4">Today's Timeline</h4>
        {schedule.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-[#D4D4D8] p-8 text-center">
            <p className="text-sm text-[#71717A] font-medium">No classes scheduled for today.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E4E4E7] shadow-sm overflow-hidden">
            <div className="divide-y divide-[#F4F4F5]">
              {schedule.map((session, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-[#FAFAFA] transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#F4F4F5] rounded-lg flex items-center justify-center border border-[#E4E4E7] text-[#09090B] font-mono text-xs font-bold group-hover:border-[#09090B] transition-colors">
                      {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(' ', '\n')}
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#09090B]">{session.subject_name || 'Unknown Subject'}</h4>
                      <p className="text-[#71717A] text-sm mt-0.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                        Room {session.room}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:text-right flex items-center sm:block gap-4">
                    <span className="text-xs font-mono text-[#A1A1AA] bg-[#F4F4F5] px-2 py-1 rounded">
                      {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
