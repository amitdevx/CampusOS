const fs = require('fs');
const file = 'apps/mobile/src/screens/GenerateQRScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the load data block
content = content.replace(
  /const data = await getMySchedule\(\);\n\s*setClasses\(data \|\| \[\]\);/g,
  `const data = await getMySchedule();\n        const now = new Date();\n        const active = (data || []).filter(c => new Date(c.end_time) > now);\n        setClasses(active);`
);

fs.writeFileSync(file, content);
