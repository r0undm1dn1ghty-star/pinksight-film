const fs = require('fs');
const html = fs.readFileSync('фильм.html', 'utf8');
const m = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
fs.writeFileSync('_c.js', m.map(x => x[1]).join('\n;\n'));
console.log('скриптов:', m.length);
