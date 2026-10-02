'use client';

import { useState, useEffect } from 'react';
import { getAssignments, createAssignment, getSubjects, getDivisions } from '@campusos/api-client';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [divisionId, setDivisionId] = useState('');

  const [subjects, setSubjects] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);

  useEffect(() => {
    load();
    getSubjects().then(setSubjects).catch(console.error);
    getDivisions().then(setDivisions).catch(console.error);
  }, []);

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createAssignment({
        title,
        description: desc,
        deadline: new Date(dueDate).toISOString(),
        subject_id: parseInt(subjectId),
        division_id: divisionId ? parseInt(divisionId) : null,
      });
      setTitle('');
      setDesc('');
      setDueDate('');
      setSubjectId('');
      setDivisionId('');
      load();
    } catch (e) {
      console.error(e);
      alert('Failed to create assignment');
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea required value={desc} onChange={e => setDesc(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md text-gray-900" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input type="datetime-local" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md text-gray-900" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <select required value={subjectId} onChange={e => setSubjectId(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md text-gray-900 bg-white">
                    <option value="">Select...</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Division (Optional)</label>
                  <select value={divisionId} onChange={e => setDivisionId(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md text-gray-900 bg-white">
                    <option value="">All Divisions</option>
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>{d.name} (Batch {d.batch_id})</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full">Create Assignment</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Loading...</p> : (
              <div className="space-y-4">
                {assignments.length === 0 ? <p className="text-gray-500">No assignments created yet.</p> : assignments.map(a => (
                  <div key={a.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{a.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                      <div className="flex gap-4 mt-3 text-xs text-gray-500">
                        <span>Subject: {subjects.find(s => s.id === a.subject_id)?.name || a.subject_id}</span>
                        <span>Division: {a.division_id ? (divisions.find(d => d.id === a.division_id)?.name || a.division_id) : 'All Divisions'}</span>
                        <span>Due: {new Date(a.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
