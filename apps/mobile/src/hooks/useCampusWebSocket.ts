import { useEffect, useState } from 'react';
import { getMe } from '@campusos/api-client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export function useCampusWebSocket() {
  const [notifications, setNotifications] = useState<any[]>([]);

  
    const fetchHistory = async (userId: number) => {
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
      } catch (e) {}
    };

  useEffect(() => {
    let ws: WebSocket;
    
    getMe().then((user) => {
      fetchHistory(user.id);
      if (!user?.id) return;
      
      const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:8000';
      const WS_URL = API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
      
      ws = new WebSocket(`${WS_URL}/ws/${user.id}`);
      
      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification' || data.type === 'echo') {
            const notifData = data.payload || data.data;
            setNotifications(prev => [notifData, ...prev]);
            
            // Trigger native Android/iOS notification
            const Notifications = await import('expo-notifications');
            await Notifications.scheduleNotificationAsync({
              content: {
                title: notifData.title || 'ResoSync Alert',
                body: notifData.message || 'You have a new campus notification.',
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
              },
              trigger: null, // Fire immediately
            });
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
