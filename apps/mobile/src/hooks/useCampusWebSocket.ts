import { useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import { getMe } from '@campusos/api-client';
import * as SecureStore from 'expo-secure-store';

export function useCampusWebSocket() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchHistory = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) return;
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://campusos-api-3r6a.onrender.com';
      
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
        
        // Ponytail: Use the production environment variable, not a missing extra object
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://campusos-api-3r6a.onrender.com';
        const WS_URL = API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
        
        const ws = new WebSocket(`${WS_URL}/ws/${user.id}`);
        wsRef.current = ws;
        
        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
              const notifData = data.payload || data.data;
              
              // Ponytail: merge by ID to prevent duplicates
              setNotifications(prev => {
                const exists = prev.find(p => p.id === notifData.id);
                if (exists) return prev;
                return [notifData, ...prev];
              });
              
              const Notifications = await import('expo-notifications');
              await Notifications.scheduleNotificationAsync({
                // Let Expo auto-generate identifier so they stack
                // identifier: `notif-${notifData.id}`,
                content: {
                  title: notifData.title || 'ResoSync',
                  body: notifData.message,
                  sound: true,
                  priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null,
              });
            }
          } catch (e) { console.error("WS hook error:", e); }
        };

        // Ponytail: basic exponential reconnect
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
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        fetchHistory();
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  return { notifications };
}
