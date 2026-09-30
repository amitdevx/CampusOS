'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@campusos/api-client'; // using apiClient directly for unmapped endpoints
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

export default function FacultyNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/v1/campus/notices');
      setNotices(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiClient.post('/api/v1/campus/notices', {
        title,
        content,
        target_audience: "EVERYONE"
      });
      setTitle('');
      setContent('');
      load();
    } catch (e) {
      console.error(e);
      alert('Failed to post notice');
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Campus Notices</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Post New Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea required value={content} onChange={e => setContent(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md text-gray-900" rows={4} />
              </div>
              <Button type="submit" className="w-full">Publish Notice</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Notices</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Loading...</p> : (
              <div className="space-y-4">
                {notices.length === 0 ? <p className="text-gray-500">No notices posted yet.</p> : notices.map(n => (
                  <div key={n.id} className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-gray-900">{n.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{n.content}</p>
                    <div className="mt-3 text-xs text-gray-400">
                      Posted: {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
