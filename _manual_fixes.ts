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

const fixes: Record<string, string> = {
  'Rota se sigue igual': `Sinopsis: Este libro ha ayudado a vivir sin miedo a más de 100.000 lectores. ¿Serás tú el siguiente? Si vas a elegir algo, que te empuje el amor; todo lo demás no cuenta ni como recuerdo, porque uno recuerda lo que le deja una marca. Una obra sobre los vínculos, las pérdidas y la valentía de volver a empezar cuando la vida cambia de rumbo.

Ficha literaria:
Autor: Lorena Pronsky
Género: Narrativa romántica contemporánea / Autoayuda y desarrollo personal
Editorial: Ediciones B, S.A.
Año: 2021
Páginas: 272
Encuadernación: Tapa Blanda
ISBN: 9788466669191
Idioma: Español`,

  '38 caras de Rockefeller': `Sinopsis: Las 38 cartas de J. D. Rockefeller a su hijo reúnen la correspondencia que el magnate mantuvo durante décadas con su heredero. En ellas comparte su visión sobre el trabajo, la disciplina, la riqueza, la familia y la sabiduría práctica para afrontar los desafíos de la vida. Una obra que permite conocer de cerca la mentalidad de uno de los empresarios más influyentes de la historia.

Ficha literaria:
Autor: J. D. Rockefeller
Género: Biografía: arte y espectáculo / Consejos sobre carreras profesionales y cómo alcanzar el éxito
Editorial: OS
Páginas: 182
Encuadernación: Tapa Blanda
ISBN: 9798868959578
Idioma: Español`,

  'Abundantia': `Sinopsis: Abundantia invita a repensar la relación con el dinero, el trabajo y la prosperidad desde una mirada práctica y consciente. A lo largo de sus páginas, el autor propone herramientas para construir hábitos financieros sostenibles, tomar decisiones con criterio y entender la abundancia como un proceso de crecimiento personal, no solo como una meta económica.

Ficha literaria:
Autor: Inversor Directivo
Género: Finanzas personales / Desarrollo personal
Editorial: Ediciones B
Año: 2024
Páginas: 336
Encuadernación: Tapa Blanda
ISBN: 9786287634510
Idioma: Español`,
};

async function main() {
  for (const [name, description] of Object.entries(fixes)) {
    const { data, error } = await supabase
      .from('products')
      .update({ description })
      .eq('empresa_id', EMPRESA_ID)
      .eq('name', name)
      .select('id');
    if (error) { console.log(`ERROR ${name}: ${error.message}`); continue; }
    console.log(`OK ${name} (${data?.length || 0}) len=${description.length}`);
  }

  const { data: barrier, error } = await supabase
    .from('products')
    .select('id,description')
    .eq('empresa_id', EMPRESA_ID)
    .eq('name', 'La barrera de romper el no')
    .maybeSingle();
  if (error) { console.log(`ERROR La barrera: ${error.message}`); return; }
  if (barrier?.description) {
    const updated = barrier.description.replace('Autor: Tahl Raz', 'Autor: Chris Voss y Tahl Raz');
    const { error: upErr } = await supabase
      .from('products')
      .update({ description: updated })
      .eq('id', barrier.id)
      .eq('empresa_id', EMPRESA_ID);
    console.log(upErr ? `ERROR autor: ${upErr.message}` : 'OK autor La barrera de romper el no');
  }
}

main();
