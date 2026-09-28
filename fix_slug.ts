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

async function fixSlug() {
  const empresaId = '39d1961a-2bfb-49b6-82b6-cfb193a0a9ae';
  console.log(`Actualizando slug de la empresa ID ${empresaId} a 'tuslibrosya'...`);
  
  const { data, error } = await supabase
    .from('empresas')
    .update({ slug: 'tuslibrosya' })
    .eq('id', empresaId)
    .select();

  if (error) {
    console.error("Error al actualizar slug:", error);
  } else {
    console.log("✅ Slug actualizado con éxito:", data);
  }
}

fixSlug();
