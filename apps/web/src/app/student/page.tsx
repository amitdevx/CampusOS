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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Welcome back, {user?.full_name || 'Student'}!</h3>
        <p className="text-slate-500 text-lg">Here's what's happening on campus today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-slate-500 mb-1">Upcoming Classes Today</p>
            <div className="flex items-center gap-3">
              <p className="text-4xl font-bold text-blue-600">{schedule.length}</p>
              {schedule.length > 0 && <Badge variant="blue">Scheduled</Badge>}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-slate-500 mb-1">Pending Assignments</p>
            <div className="flex items-center gap-3">
              <p className="text-4xl font-bold text-slate-900">{assignmentsCount}</p>
              {assignmentsCount > 0 ? <Badge variant="yellow">Due Soon</Badge> : <Badge variant="green">All Clear</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm font-medium text-slate-500 mb-1">Upcoming Events</p>
            <div className="flex items-center gap-3">
              <p className="text-4xl font-bold text-indigo-600">{eventsCount}</p>
              {eventsCount > 0 && <Badge variant="indigo">Campus Wide</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      {schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {schedule.map((session, i) => (
                <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Subject #{session.subject_id}</h4>
                    <p className="text-slate-500 mt-1">Room {session.room}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-medium">
                      {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      to {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
