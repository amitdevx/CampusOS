'use client';

/**
 * Faculty Timetable Page
 * Faculty can view all sessions and schedule/cancel classes for their department.
 * Backend enforces that only FACULTY/ADMIN/SUPER_ADMIN can POST or DELETE.
 */

import { useState, useEffect } from 'react';
import { getClasses, getSubjects, getUsers, getDivisions, createClass, deleteClass } from '@campusos/api-client';
import { Trash2 } from 'lucide-react';

interface Session {
  id: number;
  subject_id: number;
  teacher_id: number;
  division_id: number;
  room: string;
  start_time: string;
  end_time: string;
  subject_name?: string;
  subject_code?: string;
  teacher_name?: string;
  division_name?: string;
}

interface ConflictInfo {
  subject?: string;
  teacher?: string;
  division?: string;
  room?: string;
  start?: string;
  end?: string;
}

function formatDT(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function groupSessions(sessions: Session[]) {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
  const past: Session[] = [], today: Session[] = [], upcoming: Session[] = [];
  sessions.forEach((s) => {
    const start = new Date(s.start_time);
    if (start < todayStart) past.push(s);
    else if (start <= todayEnd) today.push(s);
    else upcoming.push(s);
  });
  return { today, upcoming, past };
}

export default function FacultyTimetablePage() {
  const [classes, setClasses] = useState<Session[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');
  const [newDivisionId, setNewDivisionId] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadClasses();
    getSubjects().then(setSubjects).catch(console.error);
    getDivisions().then(setDivisions).catch(console.error);
    getUsers().then(users => {
      setTeachers(users.filter((u: any) => u.role === 'TEACHER' || u.role === 'FACULTY'));
    }).catch(console.error);
  }, []);

  const loadClasses = async () => {
    try { setClasses(await getClasses()); } catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setNewSubjectId(''); setNewTeacherId(''); setNewDivisionId('');
    setNewRoom(''); setNewStartTime(''); setNewEndTime('');
    setErrorMsg(''); setConflictInfo(null);
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(''); setConflictInfo(null);
    const start = new Date(newStartTime), end = new Date(newEndTime);
    if (end <= start) { setErrorMsg('End time must be after start time.'); return; }
    if (start < new Date()) { setErrorMsg('Cannot schedule a class in the past.'); return; }
    try {
      await createClass({
        subject_id: parseInt(newSubjectId), division_id: parseInt(newDivisionId),
        room: newRoom, start_time: start.toISOString(), end_time: end.toISOString(),
        teacher_id: parseInt(newTeacherId),
      });
      setShowAdd(false); resetForm(); loadClasses();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 409 && detail?.conflict) {
        setErrorMsg(detail.message || 'Scheduling conflict detected.');
        setConflictInfo(detail.conflict);
      } else {
        setErrorMsg(typeof detail === 'string' ? detail : detail?.message || 'Failed to save class.');
      }
    }
  };

  const handleDelete = async (sessionId: number) => {
    if (!confirm('Cancel this class session?')) return;
    setDeleting(sessionId);
    try { await deleteClass(sessionId); setClasses(prev => prev.filter(c => c.id !== sessionId)); }
    catch { alert('Failed to cancel session.'); }
    finally { setDeleting(null); }
  };

  const { today, upcoming, past } = groupSessions(classes);

  const SessionRow = ({ c }: { c: Session }) => (
    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#FAFAFA] transition-colors">
      <div className="col-span-4">
        <p className="text-sm font-bold text-[#09090B]">
          {c.subject_name || `Subject #${c.subject_id}`}
          {c.subject_code && <span className="ml-2 text-[10px] text-[#71717A] font-mono">({c.subject_code})</span>}
        </p>
        <p className="text-xs text-[#71717A] mt-0.5 font-medium">{c.teacher_name || `Instructor #${c.teacher_id}`}</p>
      </div>
      <div className="col-span-2">
        <span className="inline-flex px-2 py-1 bg-[#F4F4F5] text-[#09090B] font-mono text-xs rounded border border-[#E4E4E7]">
          {c.division_name || `DIV-${c.division_id}`}
        </span>
      </div>
      <div className="col-span-2">
        <p className="text-sm font-medium text-[#52525B] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />{c.room}
        </p>
      </div>
      <div className="col-span-3 text-right">
        <p className="text-sm font-semibold text-[#09090B]">
          {new Date(c.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </p>
        <p className="text-xs text-[#71717A] mt-0.5 font-mono">
          {new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {' – '}
          {new Date(c.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="col-span-1 flex justify-end">
        <button
          onClick={() => handleDelete(c.id)}
          disabled={deleting === c.id}
          title="Cancel session"
          className="p-1.5 text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-md transition-colors disabled:opacity-40"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );

  const SessionGroup = ({ label, items, labelColor }: { label: string; items: Session[]; labelColor: string }) =>
    items.length > 0 ? (
      <div className="mb-8">
        <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${labelColor}`}>{label} ({items.length})</h4>
        <div className="divide-y divide-[#E4E4E7] border border-[#E4E4E7] rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-12 gap-4 p-4 bg-[#FAFAFA] border-b border-[#E4E4E7] text-xs font-bold text-[#71717A] uppercase tracking-wider">
            <div className="col-span-4">Session Details</div>
            <div className="col-span-2">Division</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-3 text-right">Time Window</div>
            <div className="col-span-1" />
          </div>
          {items.map(c => <SessionRow key={c.id} c={c} />)}
        </div>
      </div>
    ) : null;

  return (
    <div className="bg-white rounded-xl border border-[#E4E4E7] p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[#09090B]">Department Timetable</h3>
          <p className="text-sm font-medium text-[#71717A] mt-1">Schedule and cancel classes for your department.</p>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); if (showAdd) resetForm(); }}
          className="inline-flex items-center px-4 py-2 text-sm font-bold tracking-wide uppercase rounded-md text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-colors"
        >
          {showAdd ? 'Close Panel' : 'Schedule Class'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#FAFAFA] rounded-xl p-6 mb-8 border border-[#E4E4E7]">
          <h4 className="text-xs font-bold text-[#52525B] uppercase tracking-widest mb-6">New Class Configuration</h4>
          {errorMsg && (
            <div className="mb-4 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-[#EF4444] text-sm font-medium">
              {errorMsg}
              {conflictInfo && (
                <div className="mt-3 p-3 bg-white border border-[#FECACA] rounded text-xs text-[#71717A] space-y-1">
                  <p className="font-bold text-[#EF4444] mb-1">Conflicting Class:</p>
                  {conflictInfo.subject && <p><span className="font-semibold">Subject:</span> {conflictInfo.subject}</p>}
                  {conflictInfo.teacher && <p><span className="font-semibold">Teacher:</span> {conflictInfo.teacher}</p>}
                  {conflictInfo.division && <p><span className="font-semibold">Division:</span> {conflictInfo.division}</p>}
                  {conflictInfo.room && <p><span className="font-semibold">Room:</span> {conflictInfo.room}</p>}
                  {conflictInfo.start && conflictInfo.end && (
                    <p><span className="font-semibold">Time:</span> {formatDT(conflictInfo.start)} → {formatDT(conflictInfo.end)}</p>
                  )}
                </div>
              )}
            </div>
          )}
          <form onSubmit={handleAddClass} className="grid grid-cols-1 gap-6 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Subject</label>
              <select required value={newSubjectId} onChange={e => setNewSubjectId(e.target.value)} className="block w-full text-sm border border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none">
                <option value="">Select Subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Teacher</label>
              <select required value={newTeacherId} onChange={e => setNewTeacherId(e.target.value)} className="block w-full text-sm border border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none">
                <option value="">Select Teacher...</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Division</label>
              <select required value={newDivisionId} onChange={e => setNewDivisionId(e.target.value)} className="block w-full text-sm border border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none">
                <option value="">Select Division...</option>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Room / Location</label>
              <input type="text" required value={newRoom} onChange={e => setNewRoom(e.target.value)} placeholder="e.g. LAB-101" className="block w-full text-sm border border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Start Time</label>
              <input type="datetime-local" required value={newStartTime} min={new Date().toISOString().slice(0, 16)} onChange={e => setNewStartTime(e.target.value)} className="block w-full text-sm border border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">End Time</label>
              <input type="datetime-local" required value={newEndTime} min={newStartTime || new Date().toISOString().slice(0, 16)} onChange={e => setNewEndTime(e.target.value)} className="block w-full text-sm border border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none" />
            </div>
            <div className="sm:col-span-6 flex justify-end mt-4 border-t border-[#E4E4E7] pt-6">
              <button type="button" onClick={() => { setShowAdd(false); resetForm(); }} className="bg-white py-2.5 px-6 border border-[#E4E4E7] rounded-md text-sm font-bold uppercase text-[#71717A] hover:bg-[#F4F4F5] mr-3 transition-colors">Cancel</button>
              <button type="submit" className="bg-[#4F46E5] py-2.5 px-6 rounded-md text-sm font-bold uppercase text-white hover:bg-[#4338CA] transition-colors">Commit Schedule</button>
            </div>
          </form>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-[#D4D4D8] rounded-xl bg-[#FAFAFA]">
          <p className="text-sm font-medium text-[#A1A1AA]">No sessions scheduled yet.</p>
        </div>
      ) : (
        <div>
          <SessionGroup label="Today" items={today} labelColor="text-[#10B981]" />
          <SessionGroup label="Upcoming" items={upcoming} labelColor="text-[#4F46E5]" />
          <SessionGroup label="Past" items={past} labelColor="text-[#A1A1AA]" />
        </div>
      )}
    </div>
  );
}
