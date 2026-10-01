'use client';

import { useState, useEffect } from 'react';
import { getMySchedule } from '@campusos/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

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

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

function groupByDay(sessions: ClassSession[]): Record<string, ClassSession[]> {
  return sessions.reduce<Record<string, ClassSession[]>>((acc, s) => {
    const day = new Date(s.start_time).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(s);
    return acc;
  }, {});
}

export default function TeacherTimetablePage() {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMySchedule()
      .then((data) => setSessions(data || []))
      .catch(() => setError('Failed to load timetable.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const grouped = groupByDay(sessions);
  const days = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-900">My Timetable</h1>

      {sessions.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-slate-500 py-8 text-center">No classes assigned to your schedule yet.</p>
          </CardContent>
        </Card>
      ) : (
        days.map((day) => (
          <Card key={day}>
            <CardHeader>
              <CardTitle>{formatDate(grouped[day][0].start_time)}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-6 py-3 font-medium text-slate-600">Subject ID</th>
                      <th className="text-left px-6 py-3 font-medium text-slate-600">Room</th>
                      <th className="text-left px-6 py-3 font-medium text-slate-600">Start Time</th>
                      <th className="text-left px-6 py-3 font-medium text-slate-600">End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[day]
                      .slice()
                      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                      .map((s) => (
                        <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-slate-800 font-medium">{s.subject_id}</td>
                          <td className="px-6 py-4 text-slate-700">{s.room}</td>
                          <td className="px-6 py-4 text-slate-700">{formatTime(s.start_time)}</td>
                          <td className="px-6 py-4 text-slate-700">{formatTime(s.end_time)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
