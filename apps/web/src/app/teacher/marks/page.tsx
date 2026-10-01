'use client';

import { useState, useEffect } from 'react';
import { getExams } from '@campusos/api-client';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

export default function TeacherMarksPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getExams();
        setExams(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleEnterMarks = (id: number) => {
    alert('Navigating to marks entry for exam ' + id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Exam Marks</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            <div className="space-y-4">
              {exams.length === 0 ? <p className="text-gray-500">No exams have been created.</p> : exams.map(e => (
                <div key={e.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{e.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">Total Marks: {e.total_marks}</p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      <span>Subject: {e.subject_id}</span>
                      <span>Date: {new Date(e.exam_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => handleEnterMarks(e.id)}>Enter Marks</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
