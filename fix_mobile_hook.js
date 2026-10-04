const fs = require('fs');
const path = 'apps/mobile/src/hooks/useCampusWebSocket.ts';
let content = fs.readFileSync(path, 'utf8');

// Remove axios import
content = content.replace("import axios from 'axios';\n", "");

// Ensure * as SecureStore is imported if needed, but actually we can just import it dynamically or at the top.
if (!content.includes("import * as SecureStore from 'expo-secure-store';")) {
    content = content.replace("import { getMe } from '@campusos/api-client';", "import { getMe } from '@campusos/api-client';\nimport * as SecureStore from 'expo-secure-store';");
}

// Rewrite fetchHistory
const targetRegex = /const fetchHistory = async \(userId: number\) => \{[\s\S]*?catch \(e\) \{\}\n    \};/m;

const replacement = `const fetchHistory = async (userId: number) => {
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
    };`;

content = content.replace(targetRegex, replacement);
fs.writeFileSync(path, content);
