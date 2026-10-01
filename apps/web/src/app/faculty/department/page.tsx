'use client';

import { useState, useEffect } from 'react';
import { getDepartments, getCourses } from '@campusos/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface Department {
  id: number;
  name: string;
  description?: string;
}

interface Course {
  id: number;
  department_id: number;
  name: string;
}

export default function FacultyDepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDepartments(), getCourses()])
      .then(([depts, crses]) => {
        setDepartments(depts || []);
        setCourses(crses || []);
      })
      .catch(() => setError('Failed to load departments.'))
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

  function courseCount(deptId: number) {
    return courses.filter((c) => c.department_id === deptId).length;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-900">Departments</h1>

      {departments.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-slate-500 py-8 text-center">No departments found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.id}>
              <CardHeader>
                <CardTitle>{dept.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  {dept.description || 'No description available.'}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Courses:</span>
                  <span className="text-sm font-semibold text-blue-600">{courseCount(dept.id)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
