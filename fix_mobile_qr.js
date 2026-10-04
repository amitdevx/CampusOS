const fs = require('fs');
const path = 'apps/mobile/src/screens/GenerateQRScreen.tsx';
let data = fs.readFileSync(path, 'utf8');

// Replace the fetch block to only show today's classes
const target = `getMySchedule()
      .then((data) => {
        const now = new Date();
        const active = (data || []).filter((c: any) => new Date(c.end_time) > now);
        setClasses(active);
        if (active.length > 0) setSelectedClass(active[0]);
      })`;

const replacement = `getMySchedule()
      .then((data) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const active = (data || []).filter((c: any) => {
           const d = new Date(c.start_time);
           return d.setHours(0,0,0,0) === today.getTime();
        });
        setClasses(active);
        if (active.length > 0) setSelectedClass(active[0]);
      })`;

data = data.replace(target, replacement);
fs.writeFileSync(path, data);
