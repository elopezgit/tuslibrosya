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
  console.log("Iniciando carga de datos para 'Tus Libros Ya'...");

  // 1. Crear Empresa
  const empresaData = {
    slug: 'tuslibrosya',
    name: 'Tus Libros Ya',
    phone: '3816219762',
    instagram_url: 'https://instagram.com/tus.librosya',
    maps_url: 'San Martín 650, Galería Pezza, Local 42',
    logo_url: null, // Placeholder
    is_active: true
  };

  let empresaId = null;

  const { data: empresa, error: empError } = await supabase
    .from('empresas')
    .insert(empresaData)
    .select()
    .single();

  if (empError) {
    if (empError.code === '23505' || empError.code === '23503' || String(empError.message).includes('duplicate')) {
      console.log("La empresa ya existe. Obteniendo ID...");
      const { data: existingEmpresa } = await supabase.from('empresas').select('*').eq('slug', 'tuslibrosya').single();
      if (existingEmpresa) {
        empresaId = existingEmpresa.id;
      }
    } else {
      console.error("Error creando empresa:", empError);
      return;
    }
  } else {
    empresaId = empresa.id;
  }

  if (!empresaId) {
    console.error("No se pudo obtener el ID de la empresa");
    return;
  }
  
  console.log(`Empresa creada/obtenida con ID: ${empresaId}`);

  console.log("Limpiando datos viejos...");
  await supabase.from('products').delete().eq('empresa_id', empresaId);
  await supabase.from('categories').delete().eq('empresa_id', empresaId);

  // 2. Crear Categorías
  const categoriasToInsert = [
    { empresa_id: empresaId, name: 'Novelas', icon: '📖' },
    { empresa_id: empresaId, name: 'Desarrollo Personal', icon: '🌱' },
    { empresa_id: empresaId, name: 'Infantiles', icon: '🧸' },
    { empresa_id: empresaId, name: 'Ciencia Ficción', icon: '🚀' }
  ];

  const { data: categorias, error: catError } = await supabase
    .from('categories')
    .insert(categoriasToInsert)
    .select();

  if (catError) {
    console.error("Error creando categorías:", catError);
    return;
  }

  console.log(`Creadas ${categorias.length} categorías.`);

  // 3. Crear Productos
  const getCatId = (name: string) => categorias.find(c => c.name === name)?.id;
  const price = 15000;

  const productosToInsert = [
    { empresa_id: empresaId, category_id: getCatId('Novelas'), name: 'El viento conoce mi nombre', description: 'Isabel Allende', price, image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600', is_active: true },
    { empresa_id: empresaId, category_id: getCatId('Novelas'), name: 'La sombra del viento', description: 'Carlos Ruiz Zafón', price, image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600', is_active: true },
    { empresa_id: empresaId, category_id: getCatId('Novelas'), name: 'Cien años de soledad', description: 'Gabriel García Márquez', price, image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600', is_active: true },
    { empresa_id: empresaId, category_id: getCatId('Desarrollo Personal'), name: 'Hábitos Atómicos', description: 'James Clear', price, image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600', is_active: true },
    { empresa_id: empresaId, category_id: getCatId('Desarrollo Personal'), name: 'El club de las 5 de la mañana', description: 'Robin Sharma', price, image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600', is_active: true },
    { empresa_id: empresaId, category_id: getCatId('Desarrollo Personal'), name: 'El poder del ahora', description: 'Eckhart Tolle', price, image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600', is_active: true },
    { empresa_id: empresaId, category_id: getCatId('Infantiles'), name: 'El Principito', description: 'Antoine de Saint-Exupéry', price, image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600', is_active: true },
    { empresa_id: empresaId, category_id: getCatId('Infantiles'), name: 'Cuentos de buenas noches para niñas rebeldes', description: 'Elena Favilli', price, image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600', is_active: true },
    { empresa_id: empresaId, category_id: getCatId('Infantiles'), name: 'Donde los monstruos habitan', description: 'Maurice Sendak', price, image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600', is_active: true },
    { empresa_id: empresaId, category_id: getCatId('Ciencia Ficción'), name: 'Dune', description: 'Frank Herbert', price, image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600', is_active: true },
    { empresa_id: empresaId, category_id: getCatId('Ciencia Ficción'), name: 'Fahrenheit 451', description: 'Ray Bradbury', price, image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600', is_active: true },
    { empresa_id: empresaId, category_id: getCatId('Ciencia Ficción'), name: '1984', description: 'George Orwell', price, image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600', is_active: true }
  ];

  const { data: prods, error: prodError } = await supabase
    .from('products')
    .insert(productosToInsert)
    .select();

  if (prodError) {
    console.error("Error creando productos:", prodError);
    return;
  }

  console.log(`Creados ${prods.length} productos.`);
  console.log("¡Carga de datos completada exitosamente!");
}

main();
