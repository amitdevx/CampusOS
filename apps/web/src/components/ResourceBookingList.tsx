'use client';
import { useState, useEffect } from 'react';
import { getResources, bookResource, getMyBookings } from '@campusos/api-client';

export default function ResourceBookingList() {
  const [resources, setResources] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [selectedResource, setSelectedResource] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [bookingStatus, setBookingStatus] = useState<{loading: boolean, error: string, success: boolean}>({loading: false, error: '', success: false});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [r, b] = await Promise.all([getResources(), getMyBookings()]);
      setResources(r || []);
      setMyBookings(b || []);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.detail || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }

  async function handleBook() {
    if (!selectedResource || !bookingDate || !startTime || !endTime) {
      setBookingStatus({loading: false, error: 'Please fill all fields', success: false});
      return;
    }
    
    setBookingStatus({loading: true, error: '', success: false});
    try {
      const startIso = new Date(`${bookingDate}T${startTime}`).toISOString();
      const endIso = new Date(`${bookingDate}T${endTime}`).toISOString();
      
      await bookResource(selectedResource, startIso, endIso);
      setBookingStatus({loading: false, error: '', success: true});
      setSelectedResource(null);
      loadData();
    } catch (e: any) {
      setBookingStatus({loading: false, error: e.response?.data?.detail || 'Failed to book resource', success: false});
    }
  }

  if (loading) return <div className="p-8">Loading resources...</div>;

  return (
    <div className="space-y-8">
      {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-md">{errorMsg}</div>}
      
      {/* Booking Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Request a Resource</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select 
            className="border p-2 rounded" 
            value={selectedResource || ''} 
            onChange={(e) => setSelectedResource(Number(e.target.value))}
          >
            <option value="">Select Resource...</option>
            {resources.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.type}) - {r.status}</option>
            ))}
          </select>
          <input type="date" className="border p-2 rounded" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
          <input type="time" className="border p-2 rounded" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <input type="time" className="border p-2 rounded" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        
        {bookingStatus.error && <p className="text-red-600 text-sm mb-2">{bookingStatus.error}</p>}
        {bookingStatus.success && <p className="text-green-600 text-sm mb-2">Booking request submitted successfully!</p>}
        
        <button 
          onClick={handleBook}
          disabled={bookingStatus.loading}
          className="bg-black text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
        >
          {bookingStatus.loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>

      {/* My Bookings */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Booking Requests</h2>
        {myBookings.length === 0 ? (
          <p className="text-gray-500">You have no booking requests.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600">Resource ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Time</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {myBookings.map(b => (
                  <tr key={b.id}>
                    <td className="px-4 py-3">#{b.resource_id}</td>
                    <td className="px-4 py-3">
                      {new Date(b.start_time).toLocaleString()} to {new Date(b.end_time).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        b.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        b.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
