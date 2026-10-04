'use client';
import { useState, useEffect } from 'react';
import { getMe } from '@campusos/api-client';
import { User, Mail, Shield, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function StudentProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getMe().then(setUser).catch(console.error);
  }, []);

  if (!user) return <div className="p-12 text-center animate-pulse text-gray-500">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
        <p className="text-gray-500 mt-2">Manage your academic identity and digital pass.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Full Name</p>
                  <p className="font-semibold text-gray-900">{user.full_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email Address</p>
                  <p className="font-semibold text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Access Role</p>
                  <p className="font-semibold text-gray-900 uppercase tracking-wide">{user.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
