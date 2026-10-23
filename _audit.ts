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

  const buckets = { sin: 0, '<200': 0, '200-299': 0, '300-500': 0, '>500': 0 };
  const flags: any[] = [];
  for (const p of all) {
    const d = p.description || '';
    if (!d) { buckets.sin++; continue; }
    if (d.length < 200) buckets['<200']++;
    else if (d.length < 300) buckets['200-299']++;
    else if (d.length <= 500) buckets['300-500']++;
    else buckets['>500']++;

    const f: string[] = [];
    if (!d.startsWith('Sinopsis:')) f.push('sin_prefijo');
    if (!d.includes('Ficha literaria:') && !d.includes('Ficha de la colección:')) f.push('sin_ficha');
    if (/[¨®£¢¯]/.test(d)) f.push('simbolos');
    if (/\u00a0/.test(d)) f.push('nbsp');
    if (/\d[a-zA-ZÁÉÍÓÚÑáéíóúñ]/.test(d)) f.push('num_pegado');
    if (/\s{2,}/.test(d)) f.push('espacios_dobles');
    if (f.length) flags.push({ name: p.name, len: d.length, flags: f });
  }

  console.log('Total:', all.length, 'Buckets:', buckets);
  console.log('\nCon banderas:', flags.length);
  for (const f of flags.slice(0, 80)) console.log(`${f.name} [${f.len}] ${f.flags.join(',')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
