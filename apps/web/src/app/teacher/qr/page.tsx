'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getClasses, startAttendanceSession } from '@campusos/api-client';
import { Card, CardContent, CardHeader, CardTitle, Button, EmptyState } from '@/components/ui';
import { QrCode, AlertCircle } from 'lucide-react';

export default function TeacherQRPage() {
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
      alert('Failed to start attendance session. Are you authorized?');
    }
  };

  const qrData = sessionData ? JSON.stringify({
    type: 'ATTENDANCE',
    sessionId: sessionData.id,
    secret: sessionData.qr_code_secret,
  }) : '';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Attendance QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          {!sessionData ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Active Class</label>
                {classes.length === 0 ? (
                  <EmptyState 
                    title="No Classes Available" 
                    description="You have no active classes scheduled for right now." 
                    icon={<AlertCircle size={24} />} 
                  />
                ) : (
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="" disabled>Select a class...</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id.toString()}>
                        Subject #{c.subject_id} - Room {c.room}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={classes.length === 0 || !selectedClassId}
                className="w-full"
                icon={<QrCode size={18} />}
              >
                Start Attendance Session
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl">
              <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-gray-100">
                <QRCodeSVG 
                  value={qrData} 
                  size={280} 
                  level="H" 
                  includeMargin={true}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Session #{sessionData.id} Active</h3>
              <p className="text-center text-gray-500 mb-6">
                Have students scan this QR code with their CampusOS Mobile App<br/>
                to mark their attendance.
              </p>
              <Button variant="danger" onClick={() => setSessionData(null)}>
                End Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
