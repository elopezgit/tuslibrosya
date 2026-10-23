const fs = require('fs');
const file = '_research_1.json';
const arr = JSON.parse(fs.readFileSync(file, 'utf8'));
const extras = JSON.parse(fs.readFileSync('_research_1_extend.json', 'utf8'));
let bad = 0;
for (const r of arr) {
  const extra = extras[r.name];
  if (!extra) {
    console.log(`SIN EXTRA: ${r.name}`);
    continue;
  }
  if (!r.sinopsis.includes(extra)) {
    r.sinopsis = `${r.sinopsis.trim()} ${extra}`.replace(/\s+/g, ' ').trim();
  }
  const len = r.sinopsis.length;
  if (len < 300 || len > 500) {
    bad++;
    console.log(`FUERA ${r.name}: ${len}`);
  }
}
fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8');
console.log(`Total: ${arr.length}; fuera de rango: ${bad}`);
for (const r of arr) console.log(`${r.sinopsis.length}\t${r.name}`);
