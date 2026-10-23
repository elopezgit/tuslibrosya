const fs = require('fs');
const s = JSON.parse(fs.readFileSync('_saga_desc.json', 'utf8'));
for (const [k, v] of Object.entries(s)) {
  console.log('### ' + k + ' [' + v.length + ']');
  console.log(v);
  console.log();
}
