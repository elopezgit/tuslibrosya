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

const descs: Record<string, string> = JSON.parse(fs.readFileSync('_saga_desc_v2.json', 'utf-8'));
const metas: Record<string, { autor: string; genero: string; tipo: string; titulos: string }> =
  JSON.parse(fs.readFileSync('_saga_meta.json', 'utf-8'));

function build(name: string): string | null {
  const sinopsis = descs[name];
  const meta = metas[name];
  if (!sinopsis || !meta) return null;
  const ficha: string[] = [];
  if (meta.autor) ficha.push(`Autor: ${meta.autor}`);
  if (meta.genero) ficha.push(`Género: ${meta.genero}`);
  if (meta.tipo) ficha.push(`Tipo: ${meta.tipo}`);
  if (meta.titulos) ficha.push(`Títulos: ${meta.titulos}`);
  return `Sinopsis: ${sinopsis}\n\nFicha de la colección:\n${ficha.join('\n')}`;
}

async function main() {
  let ok = 0;
  for (const name of Object.keys(metas)) {
    const description = build(name);
    if (!description) { console.log(`SIN DATOS: ${name}`); continue; }
    const { data, error } = await supabase
      .from('products')
      .update({ description })
      .eq('empresa_id', EMPRESA_ID)
      .eq('name', name)
      .select('id');
    if (error) { console.log(`ERROR ${name}: ${error.message}`); continue; }
    console.log(`OK ${name} (${data?.length || 0}) len=${description.length}`);
    ok++;
  }
  console.log(`\nSagas actualizadas: ${ok}`);
}

main();
