'use client';

import { useState, useEffect } from 'react';
import { getResources } from '@campusos/api-client';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('ROOM');

  async function load() {
    setLoading(true);
    try {
      const data = await getResources();
      setResources(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { createResource } = await import('@campusos/api-client');
      await createResource({
        name: newName,
        type: newType,
        capacity: 30
      });
      setShowAdd(false);
      setNewName('');
      setNewType('ROOM');
      load();
    } catch (err) {
      console.error(err);
      alert('Failed to save resource');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
        <Button onClick={() => setShowAdd(!showAdd)}>Add Resource</Button>
      </div>

      {showAdd && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Create New Resource</h4>
          <form onSubmit={handleAddResource} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <div className="mt-1">
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2 text-black" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <div className="mt-1">
                <input type="text" required value={newType} onChange={(e) => setNewType(e.target.value)} className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2 text-black" />
              </div>
            </div>
            <div className="sm:col-span-6 flex justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">Cancel</button>
              <button type="submit" className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">Save Resource</button>
            </div>
          </form>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Campus Resources</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            <div className="space-y-4">
              {resources.length === 0 ? <p className="text-gray-500">No resources defined.</p> : resources.map(r => (
                <div key={r.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{r.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Type: {r.type}</p>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
