const fs = require('fs');
const base = JSON.parse(fs.readFileSync('_saga_desc.json', 'utf8'));
const extra = JSON.parse(fs.readFileSync('_saga_extend.json', 'utf8'));
const out = {};
let bad = 0;
for (const [k, v] of Object.entries(base)) {
  const e = extra[k] || '';
  const text = (v + (e ? ' ' + e : '')).replace(/\s+/g, ' ').trim();
  out[k] = text;
  if (text.length < 300 || text.length > 500) {
    bad++;
    console.log(`FUERA ${k}: ${text.length}`);
  }
}
fs.writeFileSync('_saga_desc_v2.json', JSON.stringify(out, null, 2), 'utf8');
console.log('Total:', Object.keys(out).length, 'Fuera de rango:', bad);
for (const [k, v] of Object.entries(out)) console.log(`${v.length}\t${k}`);
