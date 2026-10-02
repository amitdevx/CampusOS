'use client';

import { useState, useEffect } from 'react';
import { getEvents } from '@campusos/api-client';
import { CalendarDays, MapPin, Users } from 'lucide-react';

export default function SuperAdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents().then(setEvents).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.start_date || e.date || e.created_at) >= now);
  const past = events.filter(e => new Date(e.start_date || e.date || e.created_at) < now);

  function EventCard({ event }: { event: any }) {
    const isPast = new Date(event.start_date || event.date || event.created_at) < now;
    return (
      <div className="px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-gray-100' : 'bg-purple-100'}`}>
            <CalendarDays size={20} className={isPast ? 'text-gray-400' : 'text-purple-600'} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{event.title || event.name}</p>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{event.description}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              {event.location && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} /> {event.location}
                </span>
              )}
              {event.capacity && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Users size={12} /> Capacity: {event.capacity}
                </span>
              )}
            </div>
          </div>
        </div>
        <span className={`flex-shrink-0 ml-4 px-2 py-0.5 text-xs font-bold rounded-full ${isPast ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
          {isPast ? 'Ended' : 'Upcoming'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays size={24} className="text-purple-600" /> Campus Events
        </h1>
        <p className="text-sm text-gray-500 mt-1">Institution-wide events — past and upcoming.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 animate-pulse">Loading events...</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
              <span className="text-sm text-gray-400">{upcoming.length} events</span>
            </div>
            {upcoming.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No upcoming events.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {upcoming.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 text-gray-500">Past Events</h2>
                <span className="text-sm text-gray-400">{past.length} events</span>
              </div>
              <div className="divide-y divide-gray-50">
                {past.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
