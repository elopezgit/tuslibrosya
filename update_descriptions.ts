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
  console.log("Actualizando descripciones de libros de prueba...");

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

  const updates = [
    { name: 'El viento conoce mi nombre', description: 'Autor: Isabel Allende. Una historia de violencia, solidaridad, amor y redención que entrelaza las vidas de dos niños separados por la guerra.' },
    { name: 'La sombra del viento', description: 'Autor: Carlos Ruiz Zafón. Un amanecer de 1945 un muchacho es conducido a un misterioso lugar oculto: El Cementerio de los Libros Olvidados.' },
    { name: 'Cien años de soledad', description: 'Autor: Gabriel García Márquez. La mítica y fascinante historia de la familia Buendía a lo largo de siete generaciones en el pueblo de Macondo.' },
    { name: 'Hábitos Atómicos', description: 'Autor: James Clear. Un método sencillo y comprobado para desarrollar buenos hábitos, eliminar los malos y dominar los pequeños comportamientos.' },
    { name: 'El club de las 5 de la mañana', description: 'Autor: Robin Sharma. Una fórmula que te ayudará a levantarte temprano con inspiración y enfoque para maximizar tu productividad.' },
    { name: 'El poder del ahora', description: 'Autor: Eckhart Tolle. Una guía para la iluminación espiritual. Un libro que nos enseña a vivir en el presente y liberarnos del dolor.' },
    { name: 'El Principito', description: 'Autor: Antoine de Saint-Exupéry. Una narración sobre un pequeño príncipe en una travesía por el universo, descubriendo cómo los adultos ven la vida.' },
    { name: 'Cuentos de buenas noches para niñas rebeldes', description: 'Autor: Elena Favilli. Cien historias de mujeres extraordinarias del pasado y del presente que inspiran a las niñas a soñar en grande.' },
    { name: 'Donde los monstruos habitan', description: 'Autor: Maurice Sendak. Max se pone su traje de lobo y es castigado en su cuarto, donde inicia un viaje imaginario al país de los monstruos.' },
    { name: 'Dune', description: 'Autor: Frank Herbert. En el desértico planeta Arrakis, el joven Paul Atreides se enfrenta a una épica lucha por el control de la especia melange.' },
    { name: 'Fahrenheit 451', description: 'Autor: Ray Bradbury. La historia de Guy Montag, un bombero en un futuro distópico donde su trabajo es quemar libros que están prohibidos.' },
    { name: '1984', description: 'Autor: George Orwell. Una novela distópica en la que el Gran Hermano controla hasta los pensamientos bajo un régimen de vigilancia extrema.' }
  ];

  let successCount = 0;
  for (const update of updates) {
    const { error } = await supabase
      .from('products')
      .update({ description: update.description })
      .eq('empresa_id', empresaId)
      .eq('name', update.name);
      
    if (error) {
      console.error(`Error actualizando ${update.name}:`, error);
    } else {
      successCount++;
    }
  }

  console.log(`Descripciones actualizadas exitosamente: ${successCount} de ${updates.length}`);
}

main();
