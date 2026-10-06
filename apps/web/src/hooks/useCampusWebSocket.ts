import { useEffect, useState, useRef } from 'react';
import { getMe } from '@campusos/api-client';

export function useCampusWebSocket() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchHistory = async () => {
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
    } catch (e) { console.error("WS hook error:", e); }
  };

  useEffect(() => {
    let reconnectTimeout: any;
    
    const connect = async () => {
      try {
        const user = await getMe();
        if (!user?.id) return;
        
        await fetchHistory();
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campusos-api-3r6a.onrender.com';
        const WS_URL = API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
        
        const ws = new WebSocket(`${WS_URL}/ws/${user.id}`);
        wsRef.current = ws;
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
              const notifData = data.payload || data.data;
              setNotifications(prev => {
                const exists = prev.find(p => p.id === notifData.id);
                if (exists) return prev;
                return [notifData, ...prev];
              });
            }
          } catch (e) { console.error("WS hook error:", e); }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (e) { console.error("WS hook error:", e); }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);


  useEffect(() => {
    const handleFocus = () => fetchHistory();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return { notifications };
}
