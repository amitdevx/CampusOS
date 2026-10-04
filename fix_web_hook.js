const fs = require('fs');
const path = 'apps/web/src/hooks/useCampusWebSocket.ts';
let content = fs.readFileSync(path, 'utf8');

// Remove axios import
content = content.replace("import axios from 'axios';\n", "");

// Rewrite fetchHistory function to use standard fetch and only localStorage
const target = `    const fetchHistory = async (userId: number) => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : require('expo-secure-store').getItemAsync('userToken');
        const _token = await Promise.resolve(token);
        const API_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : 'https://campusos-api-3r6a.onrender.com';
        
        const res = await axios.get(API_URL + '/api/v1/notifications/', {
           headers: { Authorization: 'Bearer ' + _token }
        });
        setNotifications(res.data);
      } catch (e) {}
    };`;

const replacement = `    const fetchHistory = async (userId: number) => {
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
    };`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
