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

const extend: Record<string, { append?: string; replace?: string }> =
  JSON.parse(fs.readFileSync('_short_extend.json', 'utf-8'));

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id,name,description')
    .eq('empresa_id', EMPRESA_ID)
    .in('name', Object.keys(extend));
  if (error) throw new Error(error.message);

  const report: any[] = [];
  for (const p of products || []) {
    const cfg = extend[p.name];
    if (!cfg || !p.description) continue;

    const marker = p.description.includes('\n\nFicha de la colección:')
      ? '\n\nFicha de la colección:'
      : '\n\nFicha literaria:';
    const idx = p.description.indexOf(marker);
    if (idx < 0) { console.log(`SIN FICHA ${p.name}`); continue; }
    const ficha = p.description.slice(idx);
    const oldSyn = p.description.slice(0, idx).replace(/^Sinopsis:\s*/i, '').trim();
    const newSyn = (cfg.replace ?? (oldSyn + (cfg.append ? ' ' + cfg.append : ''))).replace(/\s+/g, ' ').trim();
    const description = `Sinopsis: ${newSyn}${ficha}`;

    if (newSyn.length < 300 || newSyn.length > 500) {
      console.log(`FUERA ${p.name}: ${newSyn.length}`);
      report.push({ name: p.name, len: newSyn.length, applied: false });
      continue;
    }

    const { error: upErr } = await supabase
      .from('products')
      .update({ description })
      .eq('id', p.id)
      .eq('empresa_id', EMPRESA_ID);
    if (upErr) { console.log(`ERROR ${p.name}: ${upErr.message}`); continue; }
    console.log(`OK ${p.name}: ${newSyn.length}`);
    report.push({ name: p.name, len: newSyn.length, applied: true });
  }

  fs.writeFileSync('_short_extend_report.json', JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Aplicados: ${report.filter(r => r.applied).length}/${report.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
