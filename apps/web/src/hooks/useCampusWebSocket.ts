import { useEffect, useState } from 'react';
import { getMe } from '@campusos/api-client';

export function useCampusWebSocket() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    let ws: WebSocket;
    
    getMe().then((user) => {
      if (!user?.id) return;
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const WS_URL = API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
      
      ws = new WebSocket(`${WS_URL}/api/v1/ws/${user.id}`);
      
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
