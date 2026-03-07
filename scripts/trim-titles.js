const fs = require('fs');
const path = require('path');

const filePath = 'd:/web/src/data/missions.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Match title: 'Something ' or title: "Something " and remove trailing spaces
content = content.replace(/title:\s*(['"])(.*?)\s+(['"])/g, (match, q1, val, q2) => {
    const trimmed = val.trim();
    console.log(`Trimming: "${val}" -> "${trimmed}"`);
    return `title: ${q1}${trimmed}${q2}`;
});

fs.writeFileSync(filePath, content);
console.log('Finished trimming titles.');
