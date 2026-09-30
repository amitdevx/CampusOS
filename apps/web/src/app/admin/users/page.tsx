'use client';

import { useEffect, useState } from 'react';
import { getUsers } from '@campusos/api-client';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, EmptyState } from '@/components/ui';
import { UserPlus, Users, AlertCircle } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('STUDENT');

  const loadUsers = () => {
    getUsers().then(data => setUsers(data || [])).catch(console.error);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { createUser } = await import('@campusos/api-client');
      await createUser({
        email: newEmail,
        password: newPassword,
        full_name: newFullName,
        role: newRole
      });
      setShowAdd(false);
      setNewEmail('');
      setNewPassword('');
      setNewFullName('');
      setNewRole('STUDENT');
      loadUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to save user');
    }
  };

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
        <Button icon={<UserPlus size={18} />} onClick={() => setShowAdd(!showAdd)}>Add User</Button>
      </div>

      {showAdd && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Create New User</h4>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1">
                <input type="text" required value={newFullName} onChange={(e) => setNewFullName(e.target.value)} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2 text-black" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1">
                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2 text-black" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2 text-black" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <div className="mt-1">
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2 text-black">
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="sm:col-span-6 flex justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">Cancel</button>
              <button type="submit" className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">Save User</button>
            </div>
          </form>
        </div>
      )}

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
