import { useEffect, useState } from 'react';
import { getMe } from '@campusos/api-client';

export function useCampusWebSocket() {
  const [notifications, setNotifications] = useState<any[]>([]);

  
    const fetchHistory = async (userId: number) => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
        if (!token) return;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campusos-api-3r6a.onrender.com';
        
        const res = await fetch(API_URL + '/api/v1/notifications/', {
           headers: { Authorization: 'Bearer ' + token }
        });
        if (res.ok) {
           const data = await res.json();
           setNotifications(data);
        }
      } catch (e) {}
    };

  useEffect(() => {
    let ws: WebSocket;
    
    getMe().then((user) => {
      fetchHistory(user.id);
      if (!user?.id) return;
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const WS_URL = API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
      
      ws = new WebSocket(`${WS_URL}/ws/${user.id}`);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification' || data.type === 'echo') {
            setNotifications(prev => [data.payload || data.data, ...prev]);
          }
        } catch (e) {
          console.error('WS parse error', e);
        }
      };
    }).catch(console.error);

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return { notifications };
}
