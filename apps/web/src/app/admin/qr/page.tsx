'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getClasses, startAttendanceSession } from '@campusos/api-client';

export default function QRPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [sessionData, setSessionData] = useState<any>(null);
  
  useEffect(() => {
    async function load() {
      try {
        const data = await getClasses();
        setClasses(data);
        if (data.length > 0) setSelectedClassId(data[0].id.toString());
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleGenerate = async () => {
    if (!selectedClassId) return;
    try {
      const response = await startAttendanceSession(parseInt(selectedClassId));
      setSessionData(response);
    } catch (e) {
      console.error(e);
      alert('Failed to start attendance session');
    }
  };

  const qrData = sessionData ? JSON.stringify({
    type: 'ATTENDANCE',
    sessionId: sessionData.id,
    secret: sessionData.qr_code_secret,
  }) : '';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Generate Attendance QR Code</h3>
      
      <div className="mb-6 max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Active Class</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
        >
          <option value="" disabled>Select a class</option>
          {classes.map(c => (
            <option key={c.id} value={c.id.toString()}>
              {c.subject_id} - Room {c.room}
            </option>
          ))}
        </select>
        
        <button 
          onClick={handleGenerate}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Start Attendance
        </button>
      </div>

      {sessionData && (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
            <QRCodeSVG 
              value={qrData} 
              size={256} 
              level="H" 
              includeMargin={true}
            />
          </div>
          <p className="text-sm font-medium text-gray-700 text-center">
            Have students scan this QR code with the CampusOS Mobile App<br/>
            to mark their attendance for Session #{sessionData.id}
          </p>
        </div>
      )}
    </div>
  );
}
