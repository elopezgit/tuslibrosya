const fs = require('fs');
const all = JSON.parse(fs.readFileSync('_missing_authors.json', 'utf8'));
const applied = new Set(JSON.parse(fs.readFileSync('_decisions2.json', 'utf8')).accept);
const skip = new Set([
  ...applied,
  // sagas ya resueltas
  'Alas de estrella (cada tomo)', 'Ali Hazelwood (saga / títulos disponibles)', 'Alice Oseman (títulos disponibles)',
  'Ana Huang (títulos disponibles)', 'Asesino de brujas (saga)', 'Blue Lock (tomos disponibles)', 'Caraval (saga)',
  'Carlos Ruiz Zafón (títulos disponibles)', 'Chloe Walsh (saga / títulos disponibles)', 'Colleen Hoover (títulos disponibles)',
  'Crepúsculo (saga)', 'El perfume del rey (saga)', 'El señor de los anillos (saga)', 'Elise Kova (saga / títulos disponibles)',
  'Elle Kennedy (títulos disponibles)', 'Harry Potter (saga)', 'Holly Jackson (títulos disponibles)', 'Inquebrantable (saga)',
  'Isabel Allende - todos los disponibles', 'Isabella Miller (títulos disponibles)', 'Joana Marcús - trilogía Fuego',
  'Juego de tronos (saga)', 'Las crónicas de Narnia (saga)', 'Los gatos guerreros (saga)',
  'Los gatos guerreros: Los cuatro clanes (colección)', 'Los juegos del hambre (saga)', 'Los villanos de Disney (saga)',
  'Pilar Sordo - todos los disponibles', 'Powerless tomos 1 y 2', 'Stephanie Garber (títulos disponibles)', 'Zodiac Academy'
]);
const items = all.filter(x => !skip.has(x.name));
const batches = [[], [], [], [], []];
items.forEach((x, i) => batches[i % 5].push(x));
for (let i = 0; i < batches.length; i++) {
  fs.writeFileSync(`_batch_${i + 1}.json`, JSON.stringify(batches[i], null, 2), 'utf8');
  console.log(`Lote ${i + 1}: ${batches[i].length}`);
}
console.log('Total:', items.length);
