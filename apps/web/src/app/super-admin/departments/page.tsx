'use client';

import { useState, useEffect } from 'react';
import { getDepartments, createDepartment } from '@campusos/api-client';
import { Building2, Plus, Search } from 'lucide-react';

export default function SuperAdminDepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch {
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createDepartment({ name, code });
      setShowAdd(false);
      setName(''); setCode('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to create department.');
    } finally {
      setSaving(false);
    }
  }

  const filtered = departments.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={24} className="text-blue-600" /> Departments
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage all academic departments in the institution.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#09090B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#27272A] transition"
        >
          <Plus size={16} /> Add Department
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search departments..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B]"
        />
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Add Department</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Department Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B]" placeholder="e.g. Computer Science" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Code</label>
              <input required value={code} onChange={e => setCode(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B]" placeholder="e.g. CS" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowAdd(false); setError(''); }} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-[#09090B] text-white rounded-xl text-sm font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Departments</h2>
          <span className="text-sm text-gray-400">{filtered.length} total</span>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No departments found.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((dept: any) => (
              <div key={dept.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{dept.name}</p>
                    <p className="text-sm text-gray-500">Code: {dept.code}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
