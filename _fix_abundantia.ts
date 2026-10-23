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
  const { data: source, error } = await supabase
    .from('products')
    .select('description')
    .eq('empresa_id', EMPRESA_ID)
    .eq('name', 'Abundantia: Estoicismo para inversores')
    .maybeSingle();
  if (error || !source?.description) throw new Error(error?.message || 'Sin descripción origen');

  const { data, error: upErr } = await supabase
    .from('products')
    .update({ description: source.description })
    .eq('empresa_id', EMPRESA_ID)
    .eq('name', 'Abundantia')
    .select('id');
  if (upErr) throw new Error(upErr.message);
  console.log(`Actualizados: ${data?.length || 0}`);
}

main().catch(e => { console.error(e); process.exit(1); });
