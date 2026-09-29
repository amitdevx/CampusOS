'use client';

import { useState, useEffect } from 'react';
import { getClasses } from '@campusos/api-client';

export default function TimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Timetable Management</h3>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md mt-4">
        {classes.length === 0 ? (
          <p className="p-6 text-gray-500">No classes scheduled.</p>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {classes.map((c) => (
              <li key={c.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      Subject #{c.subject_id}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Room {c.room}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {new Date(c.start_time).toLocaleString()} - {new Date(c.end_time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
