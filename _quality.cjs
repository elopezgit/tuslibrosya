const fs = require('fs');
const r = JSON.parse(fs.readFileSync('_desc_v2_report.json', 'utf8')).results;
const v3 = fs.readFileSync('_desc_v3_retry.json', 'utf8') ? JSON.parse(fs.readFileSync('_desc_v3_retry.json', 'utf8')) : [];
const m = new Map(r.map(x => [x.id, x]));
for (const x of v3) if (x.id) m.set(x.id, x);
const bad = [];
for (const x of m.values()) {
  if (!x.description) continue;
  const d = x.description;
  const flags = [];
  if (/[¨®£]/.test(d)) flags.push('simbolos');
  if (/\u00a0/.test(d)) flags.push('nbsp');
  if (/\d[a-zA-ZÁÉÍÓÚÑáéíóúñ]/.test(d)) flags.push('num_pegado');
  if (/[a-záéíóúñ][A-ZÁÉÍÓÚÑ]/.test(d)) flags.push('mayus_pegada');
  if (flags.length) bad.push({ name: x.name, status: x.status, flags, sample: d.slice(0, 160) });
}
console.log('Afectados:', bad.length);
for (const b of bad) console.log(`${b.name} [${b.flags.join(',')}] :: ${b.sample.replace(/\n/g, ' ')}`);
