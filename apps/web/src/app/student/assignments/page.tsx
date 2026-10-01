'use client';

import { useState, useEffect } from 'react';
import { getAssignments } from '@campusos/api-client';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAssignments();
        setAssignments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = (id: number) => {
    alert('Assignment marked as submitted!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            <div className="space-y-4">
              {assignments.length === 0 ? <p className="text-gray-500">You have no pending assignments!</p> : assignments.map(a => (
                <div key={a.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                    <div className="flex gap-4 mt-3 text-xs text-red-500 font-medium">
                      <span>Due: {new Date(a.due_date).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button variant="primary" onClick={() => handleSubmit(a.id)}>Submit Work</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
