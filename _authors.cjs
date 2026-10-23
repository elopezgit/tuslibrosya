const XLSX = require('xlsx');
const fs = require('fs');
const wb = XLSX.readFile('InfoBase/Catalogo221026/Tus_Libros_Ya_Catalogo_Final.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
console.log('Hoja:', wb.SheetNames[0], 'Filas:', rows.length);
console.log('Columnas:', Object.keys(rows[0]));
console.log(JSON.stringify(rows.slice(0, 3), null, 2));

const missing = JSON.parse(fs.readFileSync('_apply_report.json', 'utf8')).missing;
const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const byTitle = new Map();
for (const r of rows) {
  const title = r['Título'] || r['Titulo'] || r['Title'] || '';
  if (title) byTitle.set(norm(title), r);
}
const out = [];
for (const name of missing) {
  const r = byTitle.get(norm(name));
  out.push({ name, autor: r ? (r['Autor'] || r['Autor/a'] || '') : '', saga: r ? (r['Saga o colección'] || r['Saga o coleccion'] || '') : '', found: !!r });
}
fs.writeFileSync('_missing_authors.json', JSON.stringify(out, null, 2), 'utf8');
console.log('\nFaltantes con autor:');
for (const x of out) console.log(`${x.found ? 'OK ' : '?? '}${x.name}  ::  ${x.autor}`);
