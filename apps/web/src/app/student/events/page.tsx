'use client';

import { useState, useEffect } from 'react';
import { getEvents, registerForEvent, getMyEventRegistrations } from '@campusos/api-client';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { Calendar, MapPin, CheckCircle } from 'lucide-react';

export default function StudentEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [eventsData, regsData] = await Promise.all([
        getEvents(),
        getMyEventRegistrations()
      ]);
      setEvents((eventsData || []).filter((e:any) => new Date(e.event_date).getTime() > Date.now()));
      setRegistrations(regsData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleRegister = async (eventId: number) => {
    setRegistering(eventId);
    try {
      await registerForEvent(eventId);
      // Refresh registrations
      const regsData = await getMyEventRegistrations();
      setRegistrations(regsData || []);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to register for event');
    } finally {
      setRegistering(null);
    }
  };

  const isRegistered = (eventId: number) => {
    return registrations.some(r => r.event_id === eventId);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#09090B] tracking-tight">Campus Events</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
           <div className="p-8 col-span-2 flex justify-center items-center border border-[#E4E4E7] rounded-xl bg-white h-32">
             <p className="text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">Loading Events...</p>
           </div>
        ) : (
          events.length === 0 ? <p className="text-[#71717A]">No upcoming events!</p> : events.map(e => {
            const registered = isRegistered(e.id);
            return (
              <Card key={e.id} className="border-[#E4E4E7] shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-[#09090B] mb-2">{e.title}</h3>
                  <p className="text-[#52525B] mb-4 text-sm">{e.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-[#71717A] font-medium">
                      <Calendar size={16} />
                      <span>{new Date(e.event_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    {e.location && (
                      <div className="flex items-center gap-2 text-sm text-[#71717A] font-medium">
                        <MapPin size={16} />
                        <span>{e.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {registered ? (
                    <div className="w-full py-2.5 px-4 bg-[#F4F4F5] text-[#10B981] font-bold text-sm tracking-wide uppercase rounded-md border border-[#E4E4E7] flex items-center justify-center gap-2">
                      <CheckCircle size={16} />
                      Registered
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-[#09090B] hover:bg-[#27272A] text-white font-bold tracking-wide uppercase text-sm" 
                      onClick={() => handleRegister(e.id)}
                      disabled={registering === e.id}
                    >
                      {registering === e.id ? 'Registering...' : 'Register for Event'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
