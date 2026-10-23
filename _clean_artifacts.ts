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

const replacements: Array<[RegExp, string]> = [
  [/&iexcl;\s*/g, '¡'],
  [/&iquest;\s*/g, '¿'],
  [/&gt;/g, '>'],
  [/&lt;/g, '<'],
  [/&amp;/g, '&'],
  [/\*REIMPRESIó N\*\.\.\.\s*'/gi, ''],
  [/REIMPRESIó N/gi, ''],
  [/\bhaban\b/g, 'habían'],
  [/\bEDICIó N\b/g, 'EDICIÓN'],
  [/\bGUí A\b/g, 'GUÍA'],
  [/\bé XITO\b/g, 'ÉXITO'],
];

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id,name,description')
    .eq('empresa_id', EMPRESA_ID)
    .not('description', 'is', null);
  if (error) throw new Error(error.message);

  let changed = 0;
  for (const p of products || []) {
    let d = p.description as string;
    const before = d;
    for (const [re, to] of replacements) d = d.replace(re, to);
    d = d.replace(/\s{2,}/g, ' ').replace(/ \n/g, '\n').trim();
    if (d === before) continue;

    const { error: upErr } = await supabase
      .from('products')
      .update({ description: d })
      .eq('id', p.id)
      .eq('empresa_id', EMPRESA_ID);
    if (upErr) { console.log(`ERROR ${p.name}: ${upErr.message}`); continue; }
    console.log(`OK ${p.name}`);
    changed++;
  }
  console.log(`Corregidas: ${changed}`);
}

main().catch(e => { console.error(e); process.exit(1); });
