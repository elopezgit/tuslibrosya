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

const accept = new Set<string>(JSON.parse(fs.readFileSync('_decisions2.json', 'utf-8')).accept);
const results = JSON.parse(fs.readFileSync('_desc_v3_retry2.json', 'utf-8'));

async function main() {
  let ok = 0;
  for (const r of results) {
    if (!accept.has(r.name) || !r.description) continue;
    const { error } = await supabase
      .from('products')
      .update({ description: r.description })
      .eq('id', r.id)
      .eq('empresa_id', EMPRESA_ID);
    if (error) { console.log(`ERROR ${r.name}: ${error.message}`); continue; }
    console.log(`OK ${r.name} (${r.description.length})`);
    ok++;
  }
  console.log(`Aplicados: ${ok}`);
}

main();
