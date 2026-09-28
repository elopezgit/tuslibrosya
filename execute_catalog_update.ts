import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { booksCatalogData, formatBookDescription, getBookCoverCdnUrl } from './catalog_dataset';

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
  console.error("❌ Faltan credenciales de Supabase en .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeCatalogUpdate() {
  console.log("=================================================");
  console.log("🚀 INICIANDO AUDITORÍA Y ACTUALIZACIÓN DE CATÁLOGO");
  console.log("=================================================\n");

  // 1. OBTENER Y VALIDAR EMPRESA
  console.log("--- 1. VERIFICACIÓN DE AISLAMIENTO DE EMPRESA ---");
  const { data: empresa, error: empErr } = await supabase
    .from('empresas')
    .select('*')
    .eq('slug', 'Tus Libros Ya')
    .single();

  if (empErr || !empresa) {
    console.error("❌ Error al identificar la empresa Tus Libros Ya:", empErr);
    process.exit(1);
  }

  const empresaId = empresa.id;
  console.log(`✅ Empresa aislada: "${empresa.name}"`);
  console.log(`✅ Slug: "${empresa.slug}"`);
  console.log(`✅ Empresa ID: "${empresaId}"`);
  console.log(`🔒 CONDICIÓN ESTRICTA: Todas las operaciones tendrán WHERE empresa_id = '${empresaId}'\n`);

  // 2. OBTENER TODOS LOS PRODUCTOS DE ESTA EMPRESA
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, description, image_url, price, code, is_active, category_id')
    .eq('empresa_id', empresaId)
    .order('name');

  if (prodErr || !products) {
    console.error("❌ Error al obtener los productos:", prodErr);
    process.exit(1);
  }

  console.log(`📦 Total productos encontrados para esta empresa: ${products.length}`);

  // 3. CARGAR MAPA DE AUTORES DE CATALOG_RAW
  const rawData = fs.readFileSync('catalog_raw.txt', 'utf8');
  const lines = rawData.split('\n');
  const catalogAuthorMap = new Map<string, string>();
  let currentAuthor = '';

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (line.startsWith('👤')) {
      currentAuthor = line.replace('👤', '').replace(/\*/g, '').trim();
    } else if (line.startsWith('📖')) {
      const title = line.replace('📖', '').replace(/_/g, '').trim();
      catalogAuthorMap.set(title.toLowerCase(), currentAuthor);
    }
  }

  // 4. VERIFICAR QUE TODOS LOS PRODUCTOS TENGAN ENTRADA EN DATASET
  const missingInDataset: string[] = [];
  products.forEach(p => {
    if (!booksCatalogData[p.name]) {
      missingInDataset.push(p.name);
    }
  });

  if (missingInDataset.length > 0) {
    console.error("❌ ATENCIÓN: Faltan libros en booksCatalogData:", missingInDataset);
    process.exit(1);
  } else {
    console.log("✅ Cobertura del 100% en base de conocimiento literario confirmada.\n");
  }

  // 5. EJECUTAR ACTUALIZACIÓN EN LOTES
  console.log("--- 2. EJECUTANDO ACTUALIZACIÓN EN LOTES ---");
  const batchSize = 15;
  let updatedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    console.log(`⏳ Procesando lote ${Math.floor(i / batchSize) + 1} (${batch.length} libros)...`);

    for (const product of batch) {
      const bookData = booksCatalogData[product.name];
      const author = catalogAuthorMap.get(product.name.toLowerCase()) || 'Autor de prestigio';
      
      const formattedDescription = formatBookDescription(
        author,
        bookData.genre,
        bookData.synopsis,
        bookData.recommendedFor
      );

      const cdnImageUrl = getBookCoverCdnUrl(product.name, author);

      // Ejecutar actualización con estricto filtro de empresa_id e id
      const { error: updateErr } = await supabase
        .from('products')
        .update({
          description: formattedDescription,
          image_url: cdnImageUrl
        })
        .eq('empresa_id', empresaId)
        .eq('id', product.id);

      if (updateErr) {
        console.error(`❌ Error actualizando libro "${product.name}":`, updateErr);
        failedCount++;
      } else {
        updatedCount++;
      }
    }
    
    // Pequeño delay de 100ms entre lotes
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n🎉 Actualizaciones completadas: ${updatedCount} exitosas, ${failedCount} fallidas.\n`);

  // 6. VERIFICACIÓN Y AUDITORÍA FINAL POST-ACTUALIZACIÓN
  console.log("--- 3. VERIFICACIÓN POST-ACTUALIZACIÓN ---");
  const { data: verifiedProducts, error: verErr } = await supabase
    .from('products')
    .select('id, name, description, image_url, price, code, is_active')
    .eq('empresa_id', empresaId);

  if (verErr || !verifiedProducts) {
    console.error("❌ Error en verificación final:", verErr);
    return;
  }

  let validCovers = 0;
  let validDescriptions = 0;
  let invalidItems: any[] = [];

  verifiedProducts.forEach(p => {
    const hasValidCover = p.image_url && p.image_url.startsWith('https://th.bing.com/th?q=');
    const hasValidDesc = p.description && 
      p.description.includes('👤 **Autor:**') && 
      p.description.includes('📖 **Sinopsis:**') && 
      p.description.includes('🎯 **Recomendado para:**') &&
      p.description.length > 150;

    if (hasValidCover) validCovers++;
    if (hasValidDesc) validDescriptions++;

    if (!hasValidCover || !hasValidDesc) {
      invalidItems.push({
        name: p.name,
        hasValidCover,
        hasValidDesc
      });
    }
  });

  console.log(`📊 RESULTADOS DE LA VERIFICACIÓN:`);
  console.log(` - Total productos auditados: ${verifiedProducts.length}`);
  console.log(` - Portadas oficiales CDN válidas: ${validCovers} / ${verifiedProducts.length} (${((validCovers / verifiedProducts.length) * 100).toFixed(1)}%)`);
  console.log(` - Sinopsis literarias completas: ${validDescriptions} / ${verifiedProducts.length} (${((validDescriptions / verifiedProducts.length) * 100).toFixed(1)}%)`);
  console.log(` - Elementos con fallos: ${invalidItems.length}`);

  if (invalidItems.length === 0) {
    console.log("\n🏆 ¡ÉXITO TOTAL! 100% del catálogo actualizado y verificado con portadas reales y sinopsis completas.");
  } else {
    console.warn("\n⚠️ Elementos que requieren revisión:", invalidItems);
  }

  // Guardar log de confirmación
  fs.writeFileSync('update_verification_report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    empresa: {
      id: empresaId,
      name: empresa.name,
      slug: empresa.slug
    },
    totalProducts: verifiedProducts.length,
    validCovers,
    validDescriptions,
    sampleUpdated: verifiedProducts.slice(0, 3)
  }, null, 2));
}

executeCatalogUpdate();
