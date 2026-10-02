'use client';

import { useState, useEffect } from 'react';
import { getUsers, createUser } from '@campusos/api-client';
import { UserPlus } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('STUDENT');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await createUser({
        email: email.toLowerCase(),
        password,
        full_name: fullName,
        role,
      });
      setShowAdd(false);
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('STUDENT');
      load();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to create user');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E4E4E7] p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[#09090B]">Identity Management</h3>
          <p className="text-sm font-medium text-[#71717A] mt-1">Manage system access and roles.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center px-4 py-2 text-sm font-bold tracking-wide uppercase rounded-md text-white bg-[#09090B] hover:bg-[#27272A] transition-colors"
        >
          {showAdd ? 'Close Panel' : 'Provision User'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#FAFAFA] rounded-xl p-6 mb-8 border border-[#E4E4E7]">
          <h4 className="text-xs font-bold text-[#52525B] uppercase tracking-widest mb-6">New User Configuration</h4>
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-[#EF4444] text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAddUser} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Full Legal Name</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">Temporary Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-2">System Role</label>
              <select required value={role} onChange={(e) => setRole(e.target.value)} className="block w-full text-sm border-[#E4E4E7] rounded-md p-2.5 text-[#09090B] bg-white border focus:ring-1 focus:ring-[#09090B] focus:outline-none">
                <option value="STUDENT">STUDENT</option>
                <option value="TEACHER">TEACHER</option>
                <option value="FACULTY">FACULTY</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex justify-end mt-4 border-t border-[#E4E4E7] pt-6">
              <button type="button" onClick={() => setShowAdd(false)} className="bg-white py-2.5 px-6 border border-[#E4E4E7] rounded-md text-sm font-bold tracking-wide uppercase text-[#71717A] hover:bg-[#F4F4F5] mr-3 transition-colors">Cancel</button>
              <button type="submit" className="bg-[#09090B] py-2.5 px-6 rounded-md text-sm font-bold tracking-wide uppercase text-white hover:bg-[#27272A] transition-colors">Provision Identity</button>
            </div>
          </form>
        </div>
      )}

      <div>
        {loading ? (
          <div className="text-center p-12 border border-dashed border-[#D4D4D8] rounded-xl bg-[#FAFAFA]">
            <p className="text-sm font-medium text-[#A1A1AA]">Retrieving identities...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-[#D4D4D8] rounded-xl bg-[#FAFAFA]">
            <p className="text-sm font-medium text-[#A1A1AA]">No users found in directory.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E4E7] border border-[#E4E4E7] rounded-xl overflow-hidden bg-white">
            <div className="grid grid-cols-12 gap-4 p-4 bg-[#FAFAFA] border-b border-[#E4E4E7] text-xs font-bold text-[#71717A] uppercase tracking-wider">
              <div className="col-span-4">Identity</div>
              <div className="col-span-4">Contact</div>
              <div className="col-span-4 text-right">Clearance Level</div>
            </div>
            {users.map(u => (
              <div key={u.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#FAFAFA] transition-colors">
                <div className="col-span-4">
                  <p className="text-sm font-bold text-[#09090B]">{u.full_name}</p>
                </div>
                <div className="col-span-4">
                  <p className="text-sm font-medium text-[#52525B]">{u.email}</p>
                </div>
                <div className="col-span-4 text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-bold tracking-widest uppercase rounded border ${
                    u.role === 'ADMIN' ? 'bg-[#09090B] text-white' :
                    u.role === 'TEACHER' ? 'bg-[#F4F4F5] text-[#09090B] border-[#E4E4E7]' :
                    'bg-white text-[#71717A] border-[#E4E4E7]'
                  }`}>
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
