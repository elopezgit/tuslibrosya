import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Insertando banners promocionales para 'Tus Libros Ya'...");

  const { data: empresa, error: empError } = await supabase
    .from('empresas')
    .select('id')
    .eq('slug', 'tuslibrosya')
    .single();

  if (empError || !empresa) {
    console.error("No se pudo obtener la empresa Tus Libros Ya:", empError);
    return;
  }

  const empresaId = empresa.id;

  // Limpiar banners anteriores por si acaso
  await supabase.from('banners').delete().eq('empresa_id', empresaId);

  const bannersToInsert = [
    {
      empresa_id: empresaId,
      image_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop',
      link: null,
      is_active: true
    },
    {
      empresa_id: empresaId,
      image_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop',
      link: null,
      is_active: true
    },
    {
      empresa_id: empresaId,
      image_url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop',
      link: null,
      is_active: true
    }
  ];

  const { data: banners, error: bannerError } = await supabase
    .from('banners')
    .insert(bannersToInsert)
    .select();

  if (bannerError) {
    console.error("Error al insertar banners:", bannerError);
  } else {
    console.log(`Banners insertados exitosamente: ${banners?.length}`);
  }
}

main();
