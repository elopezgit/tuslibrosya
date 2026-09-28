import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function verifyIsolation() {
  const { data: empresas } = await supabase.from('empresas').select('id, name, slug');
  console.log("=== COMPROBACIÓN DE AISLAMIENTO MULTI-TENANT ===");
  for (const emp of empresas || []) {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', emp.id);
    console.log(`Empresa: [${emp.slug}] "${emp.name}" (ID: ${emp.id}) -> Total productos: ${count}`);
  }
}

verifyIsolation();
