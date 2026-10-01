'use client';

import { useState, useEffect } from 'react';
import { getEvents, createEvent } from '@campusos/api-client';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (newTitle && newDate && newLocation) {
      try {
        await createEvent({
          title: newTitle,
          description: '',
          event_date: new Date(newDate).toISOString(),
          location: newLocation
        });
        setShowAdd(false);
        setNewTitle('');
        setNewDate('');
        setNewLocation('');
        loadEvents();
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.response?.data?.detail || 'Failed to save event');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E4E4E7] p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[#09090B]">Event Logistics</h3>
          <p className="text-sm font-medium text-[#71717A] mt-1">Coordinate campus-wide events and notices.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center px-4 py-2 text-sm font-bold tracking-wide uppercase rounded-md text-white bg-[#09090B] hover:bg-[#27272A] transition-colors"
        >
          {showAdd ? 'Close Panel' : 'Draft Event'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#FAFAFA] rounded-xl p-6 mb-8 border border-[#E4E4E7]">
          <h4 className="text-xs font-bold text-[#52525B] uppercase tracking-widest mb-6">New Event Configuration</h4>
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-[#EF4444] text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAddEvent} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Event Title</label>
              <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Date & Time</label>
              <input type="datetime-local" required value={newDate} onChange={(e) => setNewDate(e.target.value)} className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Location</label>
              <input type="text" required value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none" />
            </div>

            <div className="sm:col-span-2 flex justify-end mt-4 border-t border-[#E4E4E7] pt-6">
              <button type="button" onClick={() => setShowAdd(false)} className="bg-white py-2.5 px-6 border border-[#E4E4E7] rounded-md text-sm font-bold tracking-wide uppercase text-[#71717A] hover:bg-[#F4F4F5] mr-3 transition-colors">Cancel</button>
              <button type="submit" className="bg-[#09090B] py-2.5 px-6 rounded-md text-sm font-bold tracking-wide uppercase text-white hover:bg-[#27272A] transition-colors">Broadcast Event</button>
            </div>
          </form>
        </div>
      )}

      <div>
        {loading ? (
          <div className="text-center p-12 border border-dashed border-[#D4D4D8] rounded-xl bg-[#FAFAFA]">
            <p className="text-sm font-medium text-[#A1A1AA]">Retrieving events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-[#D4D4D8] rounded-xl bg-[#FAFAFA]">
            <p className="text-sm font-medium text-[#A1A1AA]">No upcoming events scheduled.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E4E7] border border-[#E4E4E7] rounded-xl overflow-hidden bg-white">
            <div className="grid grid-cols-12 gap-4 p-4 bg-[#FAFAFA] border-b border-[#E4E4E7] text-xs font-bold text-[#71717A] uppercase tracking-wider">
              <div className="col-span-5">Subject</div>
              <div className="col-span-3">Location</div>
              <div className="col-span-4 text-right">Timestamp</div>
            </div>
            {events.map(event => (
              <div key={event.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#FAFAFA] transition-colors">
                <div className="col-span-5">
                  <p className="text-sm font-bold text-[#09090B]">{event.title}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-medium text-[#52525B]">{event.location}</p>
                </div>
                <div className="col-span-4 text-right">
                  <p className="text-sm font-semibold text-[#09090B]">
                    {new Date(event.event_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-[#71717A] mt-0.5 font-mono">
                    {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
