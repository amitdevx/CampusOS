'use client';

import { useState, useEffect } from 'react';
import { getClasses, getSubjects, getUsers } from '@campusos/api-client';

export default function TimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    loadClasses();
    getSubjects().then(setSubjects).catch(console.error);
    getUsers().then(users => {
      const t = users.filter((u: any) => u.role === 'TEACHER' || u.role === 'FACULTY');
      setTeachers(t);
    }).catch(console.error);
  }, []);

  const [showAdd, setShowAdd] = useState(false);
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

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
    try {
      const { createClass } = await import('@campusos/api-client');
      await createClass({
        subject_id: parseInt(newSubjectId),
        room: newRoom,
        start_time: new Date(newStartTime).toISOString(),
        end_time: new Date(newEndTime).toISOString(),
        teacher_id: parseInt(newTeacherId),
      });
      setShowAdd(false);
      setNewSubjectId('');
      setNewTeacherId('');
      setNewRoom('');
      setNewStartTime('');
      setNewEndTime('');
      loadClasses();
    } catch (err) {
      console.error(err);
      alert('Failed to save class');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Timetable Management</h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Class
        </button>
      </div>

      {showAdd && (
        <div className="bg-white shadow rounded-lg p-6 mb-6 border">
          <h4 className="text-md font-medium text-gray-900 mb-4">Schedule New Class</h4>
          <form onSubmit={handleAddClass} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <div className="mt-1">
                <select required value={newSubjectId} onChange={(e) => setNewSubjectId(e.target.value)} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2 text-black bg-white">
                  <option value="">Select Subject...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Teacher</label>
              <div className="mt-1">
                <select required value={newTeacherId} onChange={(e) => setNewTeacherId(e.target.value)} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2 text-black bg-white">
                  <option value="">Select Teacher...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Room</label>
              <div className="mt-1">
                <input type="text" required value={newRoom} onChange={(e) => setNewRoom(e.target.value)} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2 text-black" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <div className="mt-1">
                <input type="datetime-local" required value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2 text-black" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <div className="mt-1">
                <input type="datetime-local" required value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2 text-black" />
              </div>
            </div>
            <div className="sm:col-span-6 flex justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">Cancel</button>
              <button type="submit" className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">Save Class</button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md mt-4">
        {classes.length === 0 ? (
          <p className="p-6 text-gray-500">No classes scheduled.</p>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {classes.map((c) => (
              <li key={c.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      Subject #{c.subject_id}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Room {c.room}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {new Date(c.start_time).toLocaleString()} - {new Date(c.end_time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
