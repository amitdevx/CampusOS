'use client';

import { useState, useEffect } from 'react';
import { getSubjects, getCourses } from '@campusos/api-client';
import { BookOpen, Search } from 'lucide-react';

export default function SuperAdminSubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');

  useEffect(() => {
    Promise.all([getSubjects(), getCourses()])
      .then(([s, c]) => { setSubjects(s); setCourses(c); })
      .finally(() => setLoading(false));
  }, []);

  const getCourseById = (id: number) => courses.find(c => c.id === id);

  const filtered = subjects.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.code?.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === 'ALL' || s.course_id?.toString() === courseFilter;
    return matchSearch && matchCourse;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen size={24} className="text-green-600" /> Subjects
        </h1>
        <p className="text-sm text-gray-500 mt-1">View all subjects across all departments and courses.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B]"
          />
        </div>
        <select
          value={courseFilter}
          onChange={e => setCourseFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B]"
        >
          <option value="ALL">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Subjects</h2>
          <span className="text-sm text-gray-400">{filtered.length} subjects</span>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading subjects...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No subjects found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Subject Name', 'Code', 'Course', 'Type'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((subj: any) => {
                  const course = getCourseById(subj.course_id);
                  const isLab = subj.name?.toLowerCase().includes('practical') || subj.name?.toLowerCase().includes('lab');
                  return (
                    <tr key={subj.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{subj.name}</td>
                      <td className="px-6 py-4 font-mono text-gray-500 text-xs">{subj.code}</td>
                      <td className="px-6 py-4 text-gray-600">{course?.name || `Course #${subj.course_id}`}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full ${isLab ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {isLab ? 'Practical' : 'Theory'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
