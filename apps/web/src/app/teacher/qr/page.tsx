'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getMySchedule, startAttendanceSession, closeAttendanceSession } from '@campusos/api-client';
import { Card, CardContent, CardHeader, CardTitle, Button, EmptyState } from '@/components/ui';
import { QrCode, AlertCircle, CheckCircle } from 'lucide-react';

export default function TeacherQRPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function load() {
      try {
        const data = await getMySchedule();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Only today's classes
        const todaysClasses = (data || []).filter((c: any) => {
          const d = new Date(c.start_time);
          return d.setHours(0,0,0,0) === today.getTime();
        });
        
        setClasses(todaysClasses);
        if (todaysClasses.length > 0) setSelectedClassId(todaysClasses[0].id.toString());
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleGenerate = async () => {
    if (!selectedClassId) return;
    setError('');
    try {
      const response = await startAttendanceSession(parseInt(selectedClassId));
      setSessionData(response);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Failed to start attendance session.';
      setError(msg);
    }
  };

  const qrData = sessionData ? JSON.stringify({
    type: 'ATTENDANCE',
    session: parseInt(selectedClassId),
    token: sessionData.secret_token,
  }) : '';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance QR</h1>
        <p className="text-gray-500 mt-1">Generate dynamic QR codes for today's live classes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Select Today's Class</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Today's Schedule</label>
                {classes.length === 0 ? (
                  <EmptyState 
                    title="No Classes Today" 
                    description="You have no classes scheduled for today." 
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
                        {c.subject_name || 'Unknown Subject'} | Room {c.room} | {new Date(c.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}
              
              <Button 
                onClick={handleGenerate} 
                disabled={!selectedClassId || classes.length === 0} 
                className="w-full bg-[#09090B] text-white hover:bg-[#27272A]"
              >
                Generate QR Code
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full border-2 border-dashed border-gray-200 bg-gray-50/50">
            <CardContent className="flex flex-col items-center justify-center p-8 h-full min-h-[400px]">
              {sessionData ? (
                <div className="text-center space-y-6 animate-fade-in scale-in">
                  <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <QRCodeSVG 
                      value={qrData} 
                      size={240}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle size={20} />
                      Session Active
                    </div>
                    <p className="text-sm text-gray-500 max-w-[250px] mx-auto">
                      Ask students to scan this QR code using the CampusOS mobile app.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSessionData(null);
                      setSelectedClassId('');
                    }}
                  >
                    Close Session
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4 opacity-60">
                  <div className="w-20 h-20 bg-gray-200 rounded-2xl mx-auto flex items-center justify-center">
                    <QrCode size={32} className="text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">No Active Session</h3>
                    <p className="text-sm text-gray-500 max-w-[200px] mx-auto">
                      Select a class and generate a code to start taking attendance.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
