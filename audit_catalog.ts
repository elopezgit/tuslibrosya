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

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log("=== 1. AUDITORÍA DE EMPRESAS ===");
  const { data: empresas, error: empErr } = await supabase.from('empresas').select('*');
  if (empErr) {
    console.error("Error fetching empresas:", empErr);
    return;
  }
  console.log(`Empresas encontradas (${empresas?.length || 0}):`);
  empresas?.forEach(e => {
    console.log(` - ID: ${e.id} | Slug: "${e.slug}" | Name: "${e.name}"`);
  });

  const libroEmpresa = empresas?.find(e => 
    e.slug?.toLowerCase().includes('libro') || 
    e.name?.toLowerCase().includes('libro')
  );

  if (!libroEmpresa) {
    console.error("❌ No se encontró la empresa de libros!");
    return;
  }

  const empresaId = libroEmpresa.id;
  console.log(`\n🎯 EMPRESA OBJETIVO AISLADA: "${libroEmpresa.name}" (Slug: "${libroEmpresa.slug}", ID: ${empresaId})`);

  console.log("\n=== 2. CATEGORÍAS DE LA EMPRESA ===");
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('empresa_id', empresaId);
  
  const categoryMap = new Map<string, string>();
  categories?.forEach(c => {
    categoryMap.set(c.id, `${c.icon || ''} ${c.name}`);
    console.log(` - Cat ID: ${c.id} | ${c.icon || ''} ${c.name}`);
  });

  console.log("\n=== 3. AUDITORÍA DE PRODUCTOS (WHERE empresa_id = [ID]) ===");
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, description, image_url, price, is_active, code, category_id')
    .eq('empresa_id', empresaId)
    .order('name', { ascending: true });

  if (prodErr) {
    console.error("Error fetching products:", prodErr);
    return;
  }

  console.log(`Total productos en la empresa: ${products?.length || 0}`);

  let missingOrGenericImages = 0;
  let missingOrShortDesc = 0;
  let googleThumbnails = 0;
  let openLibraryCovers = 0;
  let bingCovers = 0;
  let unsplashOrPlaceholders = 0;

  const auditReport: any[] = [];

  products?.forEach(p => {
    const img = p.image_url || '';
    const isUnsplash = img.includes('unsplash');
    const isBing = img.includes('bing.com');
    const isGoogle = img.includes('books.google.com') || img.includes('googleusercontent.com');
    const isOL = img.includes('openlibrary.org');
    const isGenericImg = !img || isUnsplash || img.includes('placeholder') || img.trim() === '';

    if (isGenericImg) missingOrGenericImages++;
    if (isUnsplash) unsplashOrPlaceholders++;
    if (isGoogle) googleThumbnails++;
    if (isOL) openLibraryCovers++;
    if (isBing) bingCovers++;

    const desc = p.description || '';
    const isDescShortOrEmpty = desc.trim().length < 80 || 
      desc.includes('Excelente obra de literatura') || 
      desc.includes('Sin descripción') || 
      desc.trim() === '';

    if (isDescShortOrEmpty) missingOrShortDesc++;

    auditReport.push({
      id: p.id,
      name: p.name,
      category: categoryMap.get(p.category_id) || 'Sin categoría',
      price: p.price,
      code: p.code,
      image_url: img,
      isGenericImg,
      descLength: desc.length,
      descSnippet: desc.replace(/\n/g, ' ').substring(0, 100),
      isDescShortOrEmpty
    });
  });

  console.log(`\n📊 DIAGNÓSTICO DETALLADO:`);
  console.log(` - Total libros en catálogo: ${products?.length}`);
  console.log(` - Imágenes genéricas / Unsplash / Vacías: ${missingOrGenericImages}`);
  console.log(` - Imágenes Google Books: ${googleThumbnails}`);
  console.log(` - Imágenes OpenLibrary: ${openLibraryCovers}`);
  console.log(` - Imágenes Bing CDN: ${bingCovers}`);
  console.log(` - Sinopsis cortas / genéricas / incompletas: ${missingOrShortDesc}`);

  fs.writeFileSync('audit_results.json', JSON.stringify({
    empresa: libroEmpresa,
    stats: {
      total: products?.length,
      genericImages: missingOrGenericImages,
      shortDescriptions: missingOrShortDesc,
      googleThumbnails,
      openLibraryCovers,
      bingCovers,
      unsplashOrPlaceholders
    },
    products: auditReport
  }, null, 2));

  console.log("\nAudit report guardado en audit_results.json");
}

runAudit();
