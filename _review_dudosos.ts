import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);
const EMPRESA_ID = '39d1961a-2bfb-49b6-82b6-cfb193a0a9ae';

const STOP = new Set([
  'de','la','el','los','las','un','una','unos','unas','y','que','para','con','por','en','del','al','se','su','sus',
  'mi','mis','tu','tus','lo','a','e','o','u','the','of','and','to','in','on','vol','volumen','tomo','libro',
  'coleccion','saga','serie','edicion','especial','nueva','nuevo'
]);
const norm = (s: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim();
const stem = (t: string) => {
  if (/^\d+$/.test(t)) return String(parseInt(t, 10));
  if (t.length > 5 && t.endsWith('es')) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith('s')) return t.slice(0, -1);
  return t;
};
const tokens = (s: string) => norm(s).split(' ').filter(t => t && !STOP.has(t) && (t.length > 1 || /^\d+$/.test(t))).map(stem);

const WHITELIST = new Set([
  'tapa','flexible','dura','blanda','edicion','especial','audiolibro','audio','libro','spanish','edition',
  'empiro','empire','saga','bolsillo','ilustrado','aniversario','conmemorativa','volumen','vol','novela',
  'graphic','novel','coleccion','serie','pack','estuche','premium','limitada','nueva','nuevo','actualizada',
  'ampliada','revisada','rustica','cartone','pasta','duro','blando','portada','pelicula','serie','tv'
]);

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id,name,image_url')
    .eq('empresa_id', EMPRESA_ID);
  if (error) throw new Error(error.message);
  const byId = new Map(products!.map(p => [p.id, p]));
  const byName = new Map(products!.map(p => [p.name, p]));

  const report = JSON.parse(fs.readFileSync('_desc_v2_report.json', 'utf-8'));
  const out: any[] = [];

  for (const r of report.results) {
    if (r.status !== 'dudoso') continue;
    const q = new Set(tokens(r.name));
    const a = tokens(r.matched || '');
    const extras = a.filter(t => !q.has(t));
    const onlyEdition = extras.every(t => WHITELIST.has(t) || /^\d+$/.test(t));
    out.push({
      id: r.id, name: r.name, matched: r.matched, extras,
      decision: onlyEdition ? 'aceptar_extra' : 'revisar',
      url: r.url,
      image_url: byName.get(r.name)?.image_url || null,
    });
  }

  fs.writeFileSync('_dudosos_review.json', JSON.stringify(out, null, 2), 'utf-8');
  const accept = out.filter(x => x.decision === 'aceptar_extra');
  const review = out.filter(x => x.decision === 'revisar');
  console.log(`Dudosos: ${out.length}. Aceptar por extra de edición: ${accept.length}. Revisar: ${review.length}\n`);
  console.log('--- REVISAR ---');
  for (const x of review) console.log(`${x.name}  <~  "${x.matched}"   [extra: ${x.extras.join(', ')}]`);
}

main();
