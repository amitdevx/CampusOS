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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (role: typeof ROLES[0]) => {
    setActiveTab(role);
    setEmail(''); // Clear on switch so user can use placeholder or type
    setPassword('');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Fallback to placeholder email if left blank (for quick testing)
    const targetEmail = email.trim() || activeTab.email;

    try {
      const data = await login(targetEmail.toLowerCase(), password);
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
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#09090B] selection:text-white font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[#09090B] text-white flex items-center justify-center font-bold text-2xl rounded-md shadow-sm">
            R
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-[#09090B] tracking-tight">
          System Login
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-[#71717A] uppercase tracking-widest">
          {activeTab.label} Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-black/5 sm:rounded-xl sm:px-10 border border-[#E4E4E7]">
          
          <div className="flex justify-between bg-[#F4F4F5] p-1 rounded-lg mb-8 border border-[#E4E4E7]">
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => handleTabChange(role)}
                className={`flex-1 text-xs font-bold uppercase tracking-wider py-2.5 rounded-md transition-all duration-200 ${
                  activeTab.id === role.id 
                    ? 'bg-white text-[#09090B] shadow-sm border border-[#E4E4E7]' 
                    : 'text-[#A1A1AA] hover:text-[#09090B]'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="text-[#EF4444] text-sm bg-[#FEF2F2] p-3 rounded-md text-center border border-[#FECACA] font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  value={email}
                  placeholder={activeTab.email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-[#E4E4E7] rounded-md shadow-sm placeholder-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#09090B] focus:border-[#09090B] sm:text-sm text-[#09090B] bg-[#FAFAFA] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-[#E4E4E7] rounded-md shadow-sm placeholder-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#09090B] focus:border-[#09090B] sm:text-sm text-[#09090B] bg-[#FAFAFA] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold tracking-wide uppercase text-white bg-[#09090B] hover:bg-[#27272A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#09090B] disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Authenticating...' : 'Authenticate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
