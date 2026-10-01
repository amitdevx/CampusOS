'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, setAuthToken, getMe } from '@campusos/api-client';

const ROLES = [
  { id: 'STUDENT', label: 'Student', email: 'student@gmail.com' },
  { id: 'TEACHER', label: 'Teacher', email: 'teacher@campusos.com' },
  { id: 'FACULTY', label: 'Faculty', email: 'faculty@campusos.com' },
  { id: 'ADMIN', label: 'Admin', email: 'superadmin@campusos.com' },
];

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(ROLES[0]);
  const [email, setEmail] = useState(ROLES[0].email);
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (role: typeof ROLES[0]) => {
    setActiveTab(role);
    setEmail(role.email);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(email.toLowerCase(), password);
      localStorage.setItem('userToken', data.access_token);
      setAuthToken(data.access_token);
      
      const user = await getMe();
      localStorage.setItem('userRole', user.role);
      
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else if (user.role === 'FACULTY') {
        router.push('/faculty');
      } else if (user.role === 'TEACHER') {
        router.push('/teacher');
      } else if (user.role === 'STUDENT') {
        router.push('/student');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-2xl leading-none">R</span>
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          ResoSync {activeTab.label}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Sign in to your campus account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          
          <div className="flex justify-between bg-slate-100 p-1 rounded-xl mb-8">
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => handleTabChange(role)}
                className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all duration-200 ${
                  activeTab.id === role.id 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg text-center border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-emerald-500/20 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Signing in...' : 'Sign in to ResoSync'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
