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

if (!supabaseUrl || !supabaseKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: empresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('slug', 'tuslibrosya')
    .single();

  if (!empresa) return;

  const longDescription = `Autor: Isabel Allende. 

Una historia de violencia, solidaridad, amor y redención que entrelaza las vidas de dos niños separados por la guerra.

Viena, 1938. Samuel Adler es un niño judío de cinco años cuyo padre desaparece durante la Noche de los Cristales Rotos, en la que su familia lo pierde todo. Su madre, desesperada, le consigue una plaza en un tren que le llevará desde la Austria nazi hasta Inglaterra. Samuel emprende una nueva etapa con su fiel violín y con el peso de la soledad y la incertidumbre, que lo acompañarán siempre en su dilatada vida.

Arizona, 2019. Ocho décadas más tarde, Anita Díaz, de siete años, sube con su madre a otro tren para escapar de un inminente peligro en El Salvador y exiliarse en Estados Unidos. Su llegada coincide con una nueva e implacable política gubernamental que la separa de su madre en la frontera. Sola y asustada, lejos de todo lo que le es familiar, Anita se refugia en Azabache, el mundo mágico que solo existe en su imaginación. Mientras tanto, Selena Durán, una joven trabajadora social, y Frank Angileri, un exitoso abogado, luchan por reunir a la niña con su madre y por ofrecerle un futuro mejor.

Esta es una prueba de descripción extensa para validar el comportamiento del desplazamiento (scroll) en la interfaz gráfica del cliente.`;

  await supabase
    .from('products')
    .update({ description: longDescription })
    .eq('empresa_id', empresa.id)
    .eq('name', 'El viento conoce mi nombre');

  console.log("Descripción larga actualizada para: El viento conoce mi nombre");
}

main();
