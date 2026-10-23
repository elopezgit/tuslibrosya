const fs = require('fs');
const v = JSON.parse(fs.readFileSync('_desc_v3_retry2.json', 'utf8'));
const names = ['Invisible', 'Segunda oportunidad', 'Diario para estoicos', 'Vive ligeros', 'Antes de ella', 'Después de él', 'Boulevard', 'Cara a cara', 'La teoría de Kim, tomo I', 'Las leyes del éxito', 'Maestría', 'Michael Jackson', 'Rayuela', 'The Secret', 'En llamas', 'Eres única', 'Eres único'];
for (const n of names) {
  const x = v.find(y => y.name === n);
  console.log('=== ' + n + ' [' + (x?.status || '?') + '] <~ ' + (x?.matched || ''));
  console.log((x?.description || '(sin texto)').slice(0, 700));
  console.log();
}
