const fs = require('fs');
for (const file of ['_research_1.json', '_research_3.json', '_research_5.json']) {
  if (!fs.existsSync(file)) { console.log(file + ': no existe'); continue; }
  const arr = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`\n=== ${file}: ${arr.length} ===`);
  const bad = [];
  for (const r of arr) {
    const len = (r.sinopsis || '').length;
    const keys = Object.keys(r.ficha || {}).join(',');
    console.log(`${len}\t${r.confianza || '?'}\t${r.name}\t[${keys}]`);
    if (len < 300 || len > 500) bad.push(`${r.name} (${len})`);
  }
  console.log('Fuera de rango:', bad.length ? bad.join(' | ') : 'ninguno');
}
