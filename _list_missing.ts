import * as fs from 'fs';

const report = JSON.parse(fs.readFileSync('_desc_v2_report.json', 'utf-8'));
const groups: Record<string, any[]> = {};
for (const r of report.results) {
  (groups[r.status] ||= []).push(r);
}
for (const status of ['sin_fuente', 'sin_sinopsis', 'sin_ficha', 'corta']) {
  const arr = groups[status] || [];
  console.log(`\n=== ${status} (${arr.length}) ===`);
  for (const r of arr) console.log(`${r.name}${r.autor ? `  [autor: ${r.autor}]` : ''}`);
}
