'use client';

import { useState, useEffect } from 'react';
import { getSubjects } from '@campusos/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export default function FacultySubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSubjects()
      .then((data) => setSubjects(data || []))
      .catch(() => setError('Failed to load subjects.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>

      {subjects.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-slate-500 py-8 text-center">No subjects found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Subjects</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Subject Name</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Subject Code</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-800 font-medium">{subject.name}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {subject.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{subject.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
