'use client';

import { useState, useEffect } from 'react';
import { getUsers } from '@campusos/api-client';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'TEACHER' | 'STUDENT';
  is_active: boolean;
}

const TEACHER_ROLES: User['role'][] = ['TEACHER', 'FACULTY'];

function roleBadgeVariant(role: User['role']): 'blue' | 'indigo' {
  return role === 'TEACHER' ? 'blue' : 'indigo';
}

export default function FacultyTeachersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then((data: User[]) => setUsers((data || []).filter((u) => TEACHER_ROLES.includes(u.role))))
      .catch(() => setError('Failed to load teachers.'))
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
      <h1 className="text-2xl font-bold text-slate-900">Teachers</h1>

      {users.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-slate-500 py-8 text-center">No teachers found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Teachers and Faculty</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Full Name</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Email</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-800 font-medium">{user.full_name}</td>
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge>
                      </td>
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
