'use client';

import { useState, useEffect } from 'react';
import { getResources } from '@campusos/api-client';

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('ROOM');

  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { getAllBookings } = await import('@campusos/api-client');
      const [data, bookingsData] = await Promise.all([
        getResources(),
        getAllBookings()
      ]);
      setResources(data || []);
      setBookings(bookingsData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateBooking = async (id: number, status: string) => {
    try {
      const { updateBookingStatus } = await import('@campusos/api-client');
      await updateBookingStatus(id, status);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const { createResource } = await import('@campusos/api-client');
      await createResource({
        name: newName,
        type: newType,
      });
      setShowAdd(false);
      setNewName('');
      setNewType('ROOM');
      load();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to save resource');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E4E4E7] p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[#09090B]">Resource Allocation</h3>
          <p className="text-sm font-medium text-[#71717A] mt-1">Manage physical campus assets and spaces.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center px-4 py-2 text-sm font-bold tracking-wide uppercase rounded-md text-white bg-[#09090B] hover:bg-[#27272A] transition-colors"
        >
          {showAdd ? 'Close Panel' : 'Allocate Asset'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#FAFAFA] rounded-xl p-6 mb-8 border border-[#E4E4E7]">
          <h4 className="text-xs font-bold text-[#52525B] uppercase tracking-widest mb-6">Asset Registration</h4>
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-[#EF4444] text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAddResource} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Asset Identifier</label>
              <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Projector A" className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Asset Class</label>
              <select required value={newType} onChange={(e) => setNewType(e.target.value)} className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none">
                <option value="ROOM">Space / Room</option>
                <option value="EQUIPMENT">Hardware / Equipment</option>
                <option value="VEHICLE">Vehicle</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex justify-end mt-4 border-t border-[#E4E4E7] pt-6">
              <button type="button" onClick={() => setShowAdd(false)} className="bg-white py-2.5 px-6 border border-[#E4E4E7] rounded-md text-sm font-bold tracking-wide uppercase text-[#71717A] hover:bg-[#F4F4F5] mr-3 transition-colors">Cancel</button>
              <button type="submit" className="bg-[#09090B] py-2.5 px-6 rounded-md text-sm font-bold tracking-wide uppercase text-white hover:bg-[#27272A] transition-colors">Register Asset</button>
            </div>
          </form>
        </div>
      )}

      <div>
        {loading ? (
          <div className="text-center p-12 border border-dashed border-[#D4D4D8] rounded-xl bg-[#FAFAFA]">
            <p className="text-sm font-medium text-[#A1A1AA]">Auditing assets...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-[#D4D4D8] rounded-xl bg-[#FAFAFA]">
            <p className="text-sm font-medium text-[#A1A1AA]">No assets registered in system.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E4E7] border border-[#E4E4E7] rounded-xl overflow-hidden bg-white">
            <div className="grid grid-cols-12 gap-4 p-4 bg-[#FAFAFA] border-b border-[#E4E4E7] text-xs font-bold text-[#71717A] uppercase tracking-wider">
              <div className="col-span-8">Identifier</div>
              <div className="col-span-4 text-right">Class</div>
            </div>
            {resources.map(r => (
              <div key={r.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#FAFAFA] transition-colors">
                <div className="col-span-8">
                  <p className="text-sm font-bold text-[#09090B]">{r.name}</p>
                </div>
                <div className="col-span-4 text-right">
                  <span className="inline-flex px-2 py-1 text-xs font-bold tracking-widest uppercase rounded border bg-[#F4F4F5] text-[#09090B] border-[#E4E4E7]">
                    {r.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-bold tracking-tight text-[#09090B] mb-4">Pending Requests</h3>
        {loading ? (
          <div className="text-center p-8 border border-dashed border-[#D4D4D8] rounded-xl bg-[#FAFAFA]">
            <p className="text-sm font-medium text-[#A1A1AA]">Retrieving requests...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-[#D4D4D8] rounded-xl bg-[#FAFAFA]">
            <p className="text-sm font-medium text-[#A1A1AA]">No pending requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E4E7] border border-[#E4E4E7] rounded-xl overflow-hidden bg-white">
            {bookings.map(b => (
              <div key={b.id} className="p-4 hover:bg-[#FAFAFA] transition-colors flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-[#09090B]">{b.resource?.name || 'Resource'}</p>
                  <p className="text-xs text-[#71717A] mt-1">
                    {new Date(b.start_time).toLocaleString()} - {new Date(b.end_time).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-[#52525B] font-medium mt-1">Requested by: {b.user?.full_name || 'User'}</p>
                </div>
                {b.status === 'PENDING' ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateBooking(b.id, 'APPROVED')} className="px-3 py-1 bg-[#10B981] text-white text-xs font-bold uppercase rounded hover:bg-[#059669]">Approve</button>
                    <button onClick={() => handleUpdateBooking(b.id, 'REJECTED')} className="px-3 py-1 bg-[#EF4444] text-white text-xs font-bold uppercase rounded hover:bg-[#DC2626]">Reject</button>
                  </div>
                ) : (
                  <span className={`inline-flex px-2 py-1 text-xs font-bold uppercase rounded border ${b.status === 'APPROVED' ? 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]' : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'}`}>
                    {b.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
