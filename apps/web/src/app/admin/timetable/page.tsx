'use client';

import { useState, useEffect } from 'react';
import { getClasses, getSubjects, getUsers, getDivisions, createClass } from '@campusos/api-client';

export default function TimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);

  useEffect(() => {
    loadClasses();
    getSubjects().then(setSubjects).catch(console.error);
    getDivisions().then(setDivisions).catch(console.error);
    getUsers().then(users => {
      const t = users.filter((u: any) => u.role === 'TEACHER' || u.role === 'FACULTY');
      setTeachers(t);
    }).catch(console.error);
  }, []);

  const [showAdd, setShowAdd] = useState(false);
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');
  const [newDivisionId, setNewDivisionId] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadClasses = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await createClass({
        subject_id: parseInt(newSubjectId),
        division_id: parseInt(newDivisionId),
        room: newRoom,
        start_time: new Date(newStartTime).toISOString(),
        end_time: new Date(newEndTime).toISOString(),
        teacher_id: parseInt(newTeacherId),
      });
      setShowAdd(false);
      setNewSubjectId('');
      setNewTeacherId('');
      setNewDivisionId('');
      setNewRoom('');
      setNewStartTime('');
      setNewEndTime('');
      loadClasses();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to save class. Please check your inputs.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E4E4E7] p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[#09090B]">Master Timetable</h3>
          <p className="text-sm font-medium text-[#71717A] mt-1">Schedule and manage campus classes.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center px-4 py-2 text-sm font-bold tracking-wide uppercase rounded-md text-white bg-[#09090B] hover:bg-[#27272A] transition-colors"
        >
          {showAdd ? 'Close Panel' : 'Schedule Class'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#FAFAFA] rounded-xl p-6 mb-8 border border-[#E4E4E7]">
          <h4 className="text-xs font-bold text-[#52525B] uppercase tracking-widest mb-6">New Class Configuration</h4>
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-[#EF4444] text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAddClass} className="grid grid-cols-1 gap-6 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Subject</label>
              <select required value={newSubjectId} onChange={(e) => setNewSubjectId(e.target.value)} className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none">
                <option value="">Select Subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Teacher</label>
              <select required value={newTeacherId} onChange={(e) => setNewTeacherId(e.target.value)} className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none">
                <option value="">Select Teacher...</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Division</label>
              <select required value={newDivisionId} onChange={(e) => setNewDivisionId(e.target.value)} className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none">
                <option value="">Select Division...</option>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Room / Location</label>
              <input type="text" required value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="e.g. LAB-101" className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Start Time</label>
              <input type="datetime-local" required value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">End Time</label>
              <input type="datetime-local" required value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none" />
            </div>

            <div className="sm:col-span-6 flex justify-end mt-4 border-t border-[#E4E4E7] pt-6">
              <button type="button" onClick={() => setShowAdd(false)} className="bg-white py-2.5 px-6 border border-[#E4E4E7] rounded-md text-sm font-bold tracking-wide uppercase text-[#71717A] hover:bg-[#F4F4F5] mr-3 transition-colors">Cancel</button>
              <button type="submit" className="bg-[#09090B] py-2.5 px-6 rounded-md text-sm font-bold tracking-wide uppercase text-white hover:bg-[#27272A] transition-colors">Commit Schedule</button>
            </div>
          </form>
        </div>
      )}
      
      <div>
        {classes.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-[#D4D4D8] rounded-xl bg-[#FAFAFA]">
            <p className="text-sm font-medium text-[#A1A1AA]">No sessions exist in the active timetable.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E4E7] border border-[#E4E4E7] rounded-xl overflow-hidden bg-white">
            <div className="grid grid-cols-12 gap-4 p-4 bg-[#FAFAFA] border-b border-[#E4E4E7] text-xs font-bold text-[#71717A] uppercase tracking-wider">
              <div className="col-span-4">Session Details</div>
              <div className="col-span-2">Division</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-4 text-right">Time Window</div>
            </div>
            {classes.map((c) => (
              <div key={c.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#FAFAFA] transition-colors">
                <div className="col-span-4">
                  <p className="text-sm font-bold text-[#09090B]">Subject #{c.subject_id}</p>
                  <p className="text-xs text-[#71717A] mt-0.5 font-medium">Instructor #{c.teacher_id}</p>
                </div>
                <div className="col-span-2">
                  <span className="inline-flex px-2 py-1 bg-[#F4F4F5] text-[#09090B] font-mono text-xs rounded border border-[#E4E4E7]">
                    DIV-{c.division_id}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-[#52525B] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full"></span>
                    {c.room}
                  </p>
                </div>
                <div className="col-span-4 text-right">
                  <p className="text-sm font-semibold text-[#09090B]">
                    {new Date(c.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-[#71717A] mt-0.5 font-mono">
                    {new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(c.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
