'use client';

import { useState, useEffect } from 'react';
import { getMySchedule, startAttendanceSession, getAttendanceRecords, getUsers } from '@campusos/api-client';
import QRCode from 'react-qr-code';
import { Users, CheckCircle } from 'lucide-react';

interface ClassSession {
  id: number;
  subject_id: number;
  division_id: number;
  room: string;
  start_time: string;
  end_time: string;
  teacher_id: number;
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function isSessionActive(start_time: string, end_time: string) {
  const now = new Date().getTime();
  const start = new Date(start_time).getTime() - 30 * 60 * 1000; // 30 mins before
  const end = new Date(end_time).getTime() + 90 * 60 * 1000;     // 90 mins after
  return now >= start && now <= end;
}

export default function TeacherTimetablePage() {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // QR Modal State
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [qrSecret, setQrSecret] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [attendees, setAttendees] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([getMySchedule(), getUsers()])
      .then(([scheduleData, usersData]) => {
        setSessions(scheduleData || []);
        setAllUsers(usersData || []);
      })
      .catch(() => setError('Failed to load timetable or user data.'))
      .finally(() => setLoading(false));
  }, []);

  // Poll for attendance records when modal is open
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSessionId && qrSecret) {
      const fetchAttendees = () => {
        getAttendanceRecords(activeSessionId)
          .then((records) => setAttendees(records || []))
          .catch(console.error);
      };
      fetchAttendees(); // initial fetch
      interval = setInterval(fetchAttendees, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [activeSessionId, qrSecret]);

  const handleStartAttendance = async (sessionId: number) => {
    setGenerating(true);
    setAttendees([]);
    try {
      const data = await startAttendanceSession(sessionId);
      setQrSecret(data.qr_code_secret);
      setActiveSessionId(data.id); // Set the ATTENDANCE session ID, not class ID
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to start attendance session');
    } finally {
      setGenerating(false);
    }
  };

  const getStudentName = (id: number) => {
    const user = allUsers.find(u => u.id === id);
    return user ? user.full_name : `Student #${id}`;
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64 border border-[#E4E4E7] rounded-xl bg-white">
        <p className="text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">Initializing Terminal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
        <p className="text-sm font-medium text-[#EF4444]">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E4E4E7] p-8 shadow-sm relative">
      
      {/* QR MODAL (Rendered at top level when active) */}
      {qrSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B]/90 backdrop-blur-sm p-4 md:p-12">
          <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row w-full max-w-5xl h-[85vh] overflow-hidden border border-[#27272A]">
            
            {/* Left Side: QR Code Display */}
            <div className="flex-1 flex flex-col items-center justify-center p-10 bg-[#FAFAFA] border-r border-[#E4E4E7]">
              <h2 className="text-3xl font-bold tracking-tight text-[#09090B] mb-2">Live Access Portal</h2>
              <p className="text-sm font-medium text-[#71717A] mb-12 uppercase tracking-widest">Scan using CampusOS Mobile</p>
              
              <div className="p-8 bg-white border-4 border-[#09090B] rounded-[2rem] shadow-xl mb-12">
                <QRCode value={JSON.stringify({ type: "ATTENDANCE", sessionId: activeSessionId, secret: qrSecret })} size={320} level="H" />
              </div>

              <button 
                onClick={() => { setQrSecret(null); setActiveSessionId(null); }}
                className="w-64 py-4 bg-[#09090B] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#27272A] transition-colors"
              >
                End Session
              </button>
            </div>

            {/* Right Side: Live Attendees Feed */}
            <div className="w-full md:w-96 flex flex-col bg-white h-full">
              <div className="p-6 border-b border-[#E4E4E7] bg-[#FAFAFA] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-[#09090B]" />
                  <h3 className="font-bold text-[#09090B] uppercase tracking-widest text-sm">Live Feed</h3>
                </div>
                <div className="bg-[#10B981]/10 text-[#10B981] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-[#10B981]/20">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  {attendees.length} Present
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {attendees.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-[#A1A1AA]">
                    <div className="w-12 h-12 mb-4 rounded-full border-2 border-dashed border-[#D4D4D8] flex items-center justify-center animate-spin-slow" />
                    <p className="text-xs font-bold uppercase tracking-widest">Awaiting Scans...</p>
                  </div>
                ) : (
                  attendees.slice().reverse().map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl animate-in slide-in-from-right-4 fade-in">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/20">
                          <CheckCircle size={16} className="text-[#10B981]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#09090B]">{getStudentName(record.student_id)}</p>
                          <p className="text-xs text-[#71717A] font-mono mt-0.5">ID: {record.student_id}</p>
                        </div>
                      </div>
                      <span className="text-xs text-[#A1A1AA] font-mono">
                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-8 pb-4 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[#09090B]">Master Instructor Schedule</h3>
          <p className="text-sm font-medium text-[#71717A] mt-1">Manage classes and project attendance codes.</p>
        </div>
      </div>

      <div>
        {sessions.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-[#D4D4D8] rounded-xl bg-[#FAFAFA]">
            <p className="text-sm font-medium text-[#A1A1AA]">No active classes assigned to your terminal.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E4E7] border border-[#E4E4E7] rounded-xl overflow-hidden bg-white">
            <div className="grid grid-cols-12 gap-4 p-4 bg-[#FAFAFA] border-b border-[#E4E4E7] text-xs font-bold text-[#71717A] uppercase tracking-wider hidden md:grid">
              <div className="col-span-3">Session</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-3">Time Window</div>
              <div className="col-span-4 text-right">Operations</div>
            </div>
            
            {sessions.slice().sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()).map((c) => {
              const active = isSessionActive(c.start_time, c.end_time);
              return (
                <div key={c.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:items-center hover:bg-[#FAFAFA] transition-colors">
                  
                  <div className="col-span-1 md:col-span-3">
                    <p className="text-sm font-bold text-[#09090B]">Subject #{c.subject_id}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#F4F4F5] text-[#09090B] font-mono text-[10px] uppercase rounded border border-[#E4E4E7]">
                      DIV-{c.division_id}
                    </span>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-sm font-medium text-[#52525B] flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${active ? 'bg-[#10B981]' : 'bg-[#D4D4D8]'}`}></span>
                      {c.room}
                    </p>
                  </div>
                  
                  <div className="col-span-1 md:col-span-3">
                    <p className="text-sm font-semibold text-[#09090B]">
                      {new Date(c.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-[#71717A] mt-0.5 font-mono">
                      {formatTime(c.start_time)} - {formatTime(c.end_time)}
                    </p>
                  </div>
                  
                  <div className="col-span-1 md:col-span-4 md:text-right flex items-center md:justify-end">
                    {active ? (
                      <button 
                        onClick={() => handleStartAttendance(c.id)}
                        disabled={generating}
                        className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-md text-white bg-[#09090B] hover:bg-[#27272A] border border-[#09090B] transition-colors shadow-sm disabled:opacity-50"
                      >
                        {generating ? 'GENERATING...' : 'PROJECT QR PASS'}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase">
                        Outside Action Window
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
