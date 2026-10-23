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

const decisions = JSON.parse(fs.readFileSync('_decisions.json', 'utf-8'));
const accept = new Set<string>(decisions.accept);
const reject = new Set<string>(decisions.reject);

const sagaDescs: Record<string, string> = JSON.parse(fs.readFileSync('_saga_desc.json', 'utf-8'));
const sagaMetas: Record<string, { autor: string; genero: string; tipo: string; titulos: string }> =
  JSON.parse(fs.readFileSync('_saga_meta.json', 'utf-8'));

function sagaText(name: string): string | null {
  const sinopsis = sagaDescs[name];
  const meta = sagaMetas[name];
  if (!sinopsis || !meta) return null;
  const ficha: string[] = [];
  if (meta.autor) ficha.push(`Autor: ${meta.autor}`);
  if (meta.genero) ficha.push(`Género: ${meta.genero}`);
  if (meta.tipo) ficha.push(`Tipo: ${meta.tipo}`);
  if (meta.titulos) ficha.push(`Títulos: ${meta.titulos}`);
  return `Sinopsis: ${sinopsis}\n\nFicha de la colección:\n${ficha.join('\n')}`;
}

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id,name,description,image_url')
    .eq('empresa_id', EMPRESA_ID)
    .order('name');
  if (error) throw new Error(error.message);

  const v2 = JSON.parse(fs.readFileSync('_desc_v2_report.json', 'utf-8')).results as any[];
  const v3 = fs.existsSync('_desc_v3_retry.json')
    ? JSON.parse(fs.readFileSync('_desc_v3_retry.json', 'utf-8')) as any[]
    : [];
  const byId = new Map<string, any>();
  for (const r of v2) byId.set(r.id, r);
  for (const r of v3) if (r?.id) byId.set(r.id, r);

  const report: any[] = [];
  let applied = 0, nulled = 0, unchanged = 0, failed = 0;
  const missing: string[] = [];

  for (const p of products!) {
    const r = byId.get(p.id);
    let description: string | null = null;
    let reason = 'sin_datos';

    const st = sagaText(p.name);
    if (st) {
      description = st;
      reason = 'saga';
    } else if (accept.has(p.name)) {
      if (r?.description) { description = r.description; reason = 'dudoso_aceptado'; }
      else { reason = 'aceptado_sin_texto'; }
    } else if (reject.has(p.name)) {
      description = null;
      reason = 'rechazado';
    } else if (r?.description && ['ok', 'corta', 'dudoso', 'sin_ficha'].includes(r.status)) {
      description = r.description;
      reason = r.status;
    } else if (r?.description && r.status === 'sin_ficha') {
      description = r.description;
      reason = 'sin_ficha';
    }

    if (!description) missing.push(p.name);

    if ((p.description || null) === description) {
      unchanged++;
      report.push({ id: p.id, name: p.name, description, reason, changed: false });
      continue;
    }

    const { error: upErr } = await supabase
      .from('products')
      .update({ description })
      .eq('id', p.id)
      .eq('empresa_id', EMPRESA_ID);

    if (upErr) {
      failed++;
      console.log(`ERROR ${p.name}: ${upErr.message}`);
      report.push({ id: p.id, name: p.name, description, reason, changed: false, error: upErr.message });
      continue;
    }

    if (description) applied++; else nulled++;
    report.push({ id: p.id, name: p.name, description, reason, changed: true });
  }

  fs.writeFileSync('_apply_report.json', JSON.stringify({ applied, nulled, unchanged, failed, missing, report }, null, 2), 'utf-8');
  console.log({ applied, nulled, unchanged, failed, missing: missing.length });
  console.log('Faltantes:');
  for (const name of missing) console.log(`- ${name}`);
}

main().catch(e => { console.error(e); process.exit(1); });
