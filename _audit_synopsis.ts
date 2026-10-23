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

async function main() {
  const all: any[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id,name,description')
      .eq('empresa_id', EMPRESA_ID)
      .order('name')
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    all.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }

  const short: any[] = [];
  const long: any[] = [];
  const missing: string[] = [];
  const buckets = { sin: 0, '<200': 0, '200-299': 0, '300-500': 0, '>500': 0 };

  for (const p of all) {
    const d = p.description || '';
    if (!d) { missing.push(p.name); buckets.sin++; continue; }
    const marker = d.includes('Ficha de la colección:') ? '\n\nFicha de la colección:' : '\n\nFicha literaria:';
    const idx = d.indexOf(marker);
    let syn = idx >= 0 ? d.slice(0, idx) : d;
    syn = syn.replace(/^Sinopsis:\s*/i, '').trim();
    const len = syn.length;
    if (len < 200) buckets['<200']++;
    else if (len < 300) buckets['200-299']++;
    else if (len <= 500) buckets['300-500']++;
    else buckets['>500']++;
    if (len < 300) short.push({ name: p.name, len, syn });
    if (len > 500) long.push({ name: p.name, len, syn });
  }

  console.log('Buckets sinopsis:', buckets);
  console.log('\nSinopsis <300:', short.length);
  for (const s of short) console.log(`${s.len}\t${s.name}`);
  console.log('\nSinopsis >500:', long.length);
  for (const s of long.slice(0, 40)) console.log(`${s.len}\t${s.name}`);

  fs.writeFileSync('_synopsis_short.json', JSON.stringify(short, null, 2), 'utf8');
  fs.writeFileSync('_synopsis_long.json', JSON.stringify(long, null, 2), 'utf8');
}

main().catch(e => { console.error(e); process.exit(1); });
