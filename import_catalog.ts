import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchBookData(title: string, author: string) {
  let imgUrl: string | null = null;
  let description = '';

  // 1. Try Google Books
  try {
    const q = encodeURIComponent(`intitle:"${title}" inauthor:"${author}"`);
    const gRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
    if (gRes.ok) {
      const gData = await gRes.json() as any;
      if (gData.items && gData.items.length > 0) {
        const vol = gData.items[0].volumeInfo;
        description = vol.description || '';
        if (vol.imageLinks?.thumbnail) {
          imgUrl = vol.imageLinks.thumbnail.replace('http:', 'https:');
        }
      }
    }
  } catch (e) {
    console.log(`      ⚠️ Google API falló para ${title}`);
  }

  // 2. Fallback for image: OpenLibrary
  if (!imgUrl) {
    try {
      const q = encodeURIComponent(`${title} ${author}`);
      const olRes = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=1`);
      if (olRes.ok) {
        const olData = await olRes.json() as any;
        if (olData.docs && olData.docs.length > 0 && olData.docs[0].cover_i) {
          imgUrl = `https://covers.openlibrary.org/b/id/${olData.docs[0].cover_i}-L.jpg`;
        }
      }
    } catch(e) {
      console.log(`      ⚠️ OpenLibrary falló para ${title}`);
    }
  }

  return { imgUrl, description };
}

// Map authors to Genres
const authorToGenre: Record<string, string> = {
  'Gabriel Rolón': 'Psicología & Mente',
  'Joe Dispenza': 'Psicología & Mente',
  'Mark Wolynn': 'Psicología & Mente',
  'Marian Rojas Estapé': 'Psicología & Mente',
  'Anabel González': 'Psicología & Mente',
  'Marta Segrelles': 'Psicología & Mente',
  'Lorena Pronsky': 'Psicología & Mente',
  'Katherine Mayer': 'Psicología & Mente',
  
  'Brian Tracy': 'Negocios & Finanzas',
  'Grant Cardone': 'Negocios & Finanzas',
  'Robert T. Kiyosaki': 'Negocios & Finanzas',
  'Napoleon Hill': 'Negocios & Finanzas',
  'Allan Dib': 'Negocios & Finanzas',
  'Alex Dey': 'Negocios & Finanzas',
  'John D Rockefeller': 'Negocios & Finanzas',
  'Carlos Devis': 'Negocios & Finanzas',
  'Waller Eyzaquirre': 'Negocios & Finanzas',
  'Natalia De Santiago': 'Negocios & Finanzas',

  'James Clear': 'Desarrollo Personal',
  'Charles Duhigg': 'Desarrollo Personal',
  'Robin Sharma': 'Desarrollo Personal',
  'Ryan Holiday': 'Desarrollo Personal',
  'David Goggins': 'Desarrollo Personal',
  'Mauricio Benoist': 'Desarrollo Personal',
  'Dale Carnegie': 'Desarrollo Personal',
  'Kobe Bryant': 'Desarrollo Personal',
  'Jake Knapp': 'Desarrollo Personal',
  'David J Schwartz': 'Desarrollo Personal',

  'George Orwell': 'Literatura & Ficción',
  'Albert Camus': 'Literatura & Ficción',
  'Mary Shelley': 'Literatura & Ficción',
  'Antoine De Saint-Exupéry': 'Literatura & Ficción',
  'Isabel Allende': 'Literatura & Ficción',
  'Jane Austen': 'Literatura & Ficción',
  'Eloy Moreno': 'Literatura & Ficción',

  'Agustín Laje': 'Filosofía & Sociedad',
  'Alberto Benegas Lynch': 'Filosofía & Sociedad',
  'Massimo Pigliucci': 'Filosofía & Sociedad',
  'Sun Tzu': 'Filosofía & Sociedad',
  'Viktor Frankl': 'Filosofía & Sociedad',
  'Juan Ramón Rallo': 'Filosofía & Sociedad',

  'Alice Kellen': 'Romance & Juvenil',
  'Collen Hoover': 'Romance & Juvenil',
  'Emily Mcintine': 'Romance & Juvenil',
  'Eva Muñoz': 'Romance & Juvenil',
  'Flor M Salvador': 'Romance & Juvenil',
  'Joana Marcus': 'Romance & Juvenil',
  'Mariana Zapata': 'Romance & Juvenil',
  'Rebecca Yarros': 'Romance & Juvenil',
  'Sarah A Parker': 'Romance & Juvenil',
  'Tillie Cole': 'Romance & Juvenil'
};

const genreIcons: Record<string, string> = {
  'Psicología & Mente': '🧠',
  'Negocios & Finanzas': '📈',
  'Desarrollo Personal': '🌱',
  'Literatura & Ficción': '📖',
  'Filosofía & Sociedad': '💡',
  'Romance & Juvenil': '💖',
  '📚 Otros Géneros': '📚'
};

async function importCatalog() {
  console.log("Iniciando sesión segura en la base de datos...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'tuslibrosya@gmail.com',
    password: 'tuslibrosya123'
  });

  if (authError || !authData.user) {
    console.error("❌ Error al iniciar sesión.");
    return;
  }

  const { data: empresaData } = await supabase.from('empresas').select('id').eq('slug', 'tuslibrosya').single();
  const empresaId = empresaData.id;

  console.log("🗑️  Limpiando categorías y productos...");
  await supabase.from('products').delete().eq('empresa_id', empresaId);
  await supabase.from('categories').delete().eq('empresa_id', empresaId);

  // Crear categorías reales
  const genreIds: Record<string, string> = {};
  for (const [genreName, icon] of Object.entries(genreIcons)) {
    const { data: cat } = await supabase.from('categories').insert({
      empresa_id: empresaId,
      name: genreName,
      icon: icon
    }).select().single();
    if (cat) genreIds[genreName] = cat.id;
  }

  const rawData = fs.readFileSync('catalog_raw.txt', 'utf8');
  const lines = rawData.split('\n');
  
  let currentAuthor = '';
  const defaultPrice = 15000; // PRECIO CORRECTO (15,000 ARS) PARA ACTIVAR DESCUENTOS

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('👤')) {
      currentAuthor = line.replace('👤', '').replace(/\*/g, '').trim();
    } else if (line.startsWith('📖')) {
      const title = line.replace('📖', '').replace(/_/g, '').trim();
      console.log(`  📖 Libro: ${title} (${currentAuthor})`);
      
      const bookData = await fetchBookData(title, currentAuthor);
      
      let rawDesc = bookData.description || `Excelente obra de literatura.`;
      if (rawDesc.length > 400) rawDesc = rawDesc.substring(0, 397) + '...';
      
      // INYECTAMOS EL AUTOR EN LA DESCRIPCIÓN PARA EL BUSCADOR
      const finalDesc = `Autor: ${currentAuthor}\n\n${rawDesc}`;
      
      let img = bookData.imgUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop';
      
      const genre = authorToGenre[currentAuthor] || '📚 Otros Géneros';
      const categoryId = genreIds[genre];

      await supabase.from('products').insert({
        empresa_id: empresaId,
        category_id: categoryId,
        name: title,
        description: finalDesc,
        price: defaultPrice,
        image_url: img,
        code: `LBR-${Math.floor(Math.random() * 1000000)}`,
        is_active: true
      });
      
      await delay(400); // Pausa más larga para evitar baneos de API
    }
  }

  console.log("\n✅ ¡Catálogo completo re-importado exitosamente!");
}

importCatalog();
