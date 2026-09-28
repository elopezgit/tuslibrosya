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

async function inspectAllBooks() {
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id, name, slug')
    .eq('slug', 'Tus Libros Ya')
    .single();

  if (!empresa) {
    console.error("Empresa not found");
    return;
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('empresa_id', empresa.id)
    .order('name');

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('empresa_id', empresa.id);

  const catMap = new Map();
  categories?.forEach(c => catMap.set(c.id, c.name));

  // Also parse catalog_raw.txt to build title -> author map
  const rawData = fs.readFileSync('catalog_raw.txt', 'utf8');
  const lines = rawData.split('\n');
  const catalogMap = new Map<string, string>();
  let currentAuthor = '';

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (line.startsWith('👤')) {
      currentAuthor = line.replace('👤', '').replace(/\*/g, '').trim();
    } else if (line.startsWith('📖')) {
      const title = line.replace('📖', '').replace(/_/g, '').trim();
      catalogMap.set(title.toLowerCase(), currentAuthor);
    }
  }

  const bookList: any[] = [];
  products?.forEach(p => {
    // try to extract author from description or catalogMap
    let author = catalogMap.get(p.name.toLowerCase()) || '';
    if (!author && p.description?.startsWith('Autor:')) {
      const match = p.description.match(/^Autor:\s*([^.\n]+)/i);
      if (match) author = match[1].trim();
    }

    bookList.push({
      id: p.id,
      name: p.name,
      author: author || 'Desconocido',
      category: catMap.get(p.category_id) || 'Sin categoría',
      image_url: p.image_url,
      current_desc: p.description
    });
  });

  fs.writeFileSync('all_books_extracted.json', JSON.stringify(bookList, null, 2));
  console.log(`Extracted ${bookList.length} books.`);
  const withoutAuthor = bookList.filter(b => b.author === 'Desconocido');
  console.log(`Books without author: ${withoutAuthor.length}`);
  if (withoutAuthor.length > 0) {
    console.log("Samples without author:", withoutAuthor);
  }
}

inspectAllBooks();
