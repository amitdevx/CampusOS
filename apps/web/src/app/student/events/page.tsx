'use client';

import { useState, useEffect } from 'react';
import { getEvents } from '@campusos/api-client';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { Calendar, MapPin } from 'lucide-react';

export default function StudentEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRegister = async (eventId: number) => {
    alert('Registered successfully!');
    // In a real app we would call: await apiClient.post(`/api/v1/campus/events/${eventId}/register`)
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Campus Events</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? <p>Loading...</p> : (
          events.length === 0 ? <p className="text-gray-500">No upcoming events!</p> : events.map(e => (
            <Card key={e.id}>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{e.title}</h3>
                <p className="text-gray-600 mb-4">{e.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span>{new Date(e.event_date).toLocaleString()}</span>
                  </div>
                  {e.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={16} />
                      <span>{e.location}</span>
                    </div>
                  )}
                </div>
                
                <Button className="w-full" onClick={() => handleRegister(e.id)}>Register for Event</Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
