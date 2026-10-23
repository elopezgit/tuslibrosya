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
  const files = ['_research_1.json', '_research_3.json', '_research_5.json'].filter(f => fs.existsSync(f));
  const items: any[] = [];
  for (const file of files) {
    const arr = JSON.parse(fs.readFileSync(file, 'utf-8'));
    for (const r of arr) items.push({ ...r, file });
  }

  const { data, error } = await supabase
    .from('products')
    .select('name')
    .eq('empresa_id', EMPRESA_ID);
  if (error) throw new Error(error.message);
  const names = new Set((data || []).map(p => p.name));

  const missing = items.filter(r => !names.has(r.name));
  console.log(`Investigados: ${items.length}; sin coincidencia exacta: ${missing.length}`);
  for (const r of missing) console.log(`${r.file}\t${r.name}`);
}

main().catch(e => { console.error(e); process.exit(1); });
