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
    d = d.replace(/ Ficha literaria:/g, '\n\nFicha literaria:');
    d = d.replace(/ Ficha de la colección:/g, '\n\nFicha de la colección:');
    d = d.replace(/\n{3,}/g, '\n\n');
    if (d === before) continue;

    const { error: upErr } = await supabase
      .from('products')
      .update({ description: d })
      .eq('id', p.id)
      .eq('empresa_id', EMPRESA_ID);
    if (upErr) { console.log(`ERROR ${p.name}: ${upErr.message}`); continue; }
    changed++;
  }
  console.log(`Reparadas: ${changed}`);
}

main().catch(e => { console.error(e); process.exit(1); });
