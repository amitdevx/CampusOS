'use client';

import { useEffect, useState } from 'react';
import { getUsers } from '@campusos/api-client';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, EmptyState } from '@/components/ui';
import { UserPlus, Users, AlertCircle } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    getUsers().then(data => setUsers(data || [])).catch(console.error);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'STUDENT': return <Badge variant="blue">Student</Badge>;
      case 'TEACHER': return <Badge variant="teal">Teacher</Badge>;
      case 'FACULTY': return <Badge variant="indigo">Faculty</Badge>;
      case 'ADMIN': return <Badge variant="red">Admin</Badge>;
      default: return <Badge variant="gray">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage students, teachers, and faculty accounts.</p>
        </div>
        <Button icon={<UserPlus size={18} />}>Add User</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No Users Found" description="No users exist in the database." icon={<AlertCircle />} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.full_name}</td>
                      <td className="px-6 py-4 text-gray-500">{user.email}</td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
