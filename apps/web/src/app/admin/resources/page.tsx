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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
        <Button>Add Resource</Button>
      </div>

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
