const fs = require('fs');

function patchHook(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add missing import for fetch if not using axios (wait, they use api-client)
    if (!content.includes('getNotifications')) {
        // Just use fetch for simplicity since we have token
        content = content.replace(
            "import { getMe } from '@campusos/api-client';",
            "import { getMe } from '@campusos/api-client';\nimport axios from 'axios';"
        );
        
        const fetchCode = `
    const fetchHistory = async (userId: number) => {
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
    
        content = content.replace("useEffect(() => {", fetchCode + "\n\n  useEffect(() => {");
        content = content.replace("getMe().then((user) => {", "getMe().then((user) => {\n      fetchHistory(user.id);");
        
        fs.writeFileSync(file, content);
    }
}

patchHook('apps/web/src/hooks/useCampusWebSocket.ts');
patchHook('apps/mobile/src/hooks/useCampusWebSocket.ts');
