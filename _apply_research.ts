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

type Research = {
  name: string;
  sinopsis: string;
  ficha?: Record<string, string>;
  fuente?: string;
  confianza?: string;
};

function validIsbn13(isbn?: string): boolean {
  if (!isbn || !/^\d{13}$/.test(isbn)) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(isbn[i], 10) * (i % 2 === 0 ? 1 : 3);
  return sum % 10 === 0;
}

function clean(v?: string): string {
  return (v || '').replace(/\s+/g, ' ').trim();
}

function buildDescription(r: Research): { description: string; issues: string[] } {
  const issues: string[] = [];
  const syn = clean(r.sinopsis);
  if (syn.length < 300) issues.push(`sinopsis_corta:${syn.length}`);
  if (syn.length > 500) issues.push(`sinopsis_larga:${syn.length}`);

  const f = r.ficha || {};
  const isCollection = Boolean(f['Tipo'] || f['Títulos']);
  const order = isCollection
    ? ['Autor', 'Género', 'Tipo', 'Títulos']
    : ['Autor', 'Género', 'Editorial', 'Año', 'Páginas', 'Encuadernación', 'ISBN', 'Idioma'];

  const lines: string[] = [];
  for (const key of order) {
    let value = clean(f[key]);
    if (!value) continue;
    if (key === 'Año' && !/^\d{4}$/.test(value)) { issues.push('ano_invalido'); continue; }
    if (key === 'Páginas' && !/^\d{1,4}$/.test(value)) { issues.push('paginas_invalidas'); continue; }
    if (key === 'ISBN') {
      const digits = value.replace(/[^0-9Xx]/g, '');
      if (!validIsbn13(digits)) { issues.push('isbn_invalido'); continue; }
      value = digits;
    }
    if (key === 'Idioma') value = value.replace(/\s*\(.*?\)\s*/g, '').trim() || 'Español';
    lines.push(`${key}: ${value}`);
  }

  const header = isCollection ? 'Ficha de la colección:' : 'Ficha literaria:';
  const description = lines.length
    ? `Sinopsis: ${syn}\n\n${header}\n${lines.join('\n')}`
    : `Sinopsis: ${syn}`;

  return { description, issues };
}

async function main() {
  const only = process.argv.slice(2).filter(a => /^\d+$/.test(a));
  const dry = process.argv.includes('--dry');
  const files = only.length
    ? only.map(n => `_research_${n}.json`).filter(f => fs.existsSync(f))
    : fs.readdirSync('.').filter(f => /^_research_\d+\.json$/.test(f)).sort();
  if (!files.length) { console.log('No hay archivos _research_*.json'); return; }
  console.log(`Archivos: ${files.join(', ')}${dry ? ' (PRUEBA)' : ''}`);

  const items = new Map<string, Research>();
  for (const file of files) {
    const arr: Research[] = JSON.parse(fs.readFileSync(file, 'utf-8'));
    for (const r of arr) if (r?.name) items.set(r.name, r);
    console.log(`${file}: ${arr.length}`);
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('id,name,description')
    .eq('empresa_id', EMPRESA_ID);
  if (error) throw new Error(error.message);
  const byName = new Map((products || []).map(p => [p.name, p]));

  const report: any[] = [];
  let applied = 0, skipped = 0;

  for (const r of items.values()) {
    const p = byName.get(r.name);
    if (!p) { console.log(`NO EXISTE: ${r.name}`); skipped++; report.push({ name: r.name, applied: false, reason: 'no_existe' }); continue; }

    const { description, issues } = buildDescription(r);
    if (description.length < 300) { skipped++; report.push({ name: r.name, applied: false, issues }); continue; }

    if (!dry) {
      const { error: upErr } = await supabase
        .from('products')
        .update({ description })
        .eq('id', p.id)
        .eq('empresa_id', EMPRESA_ID);
      if (upErr) { console.log(`ERROR ${r.name}: ${upErr.message}`); skipped++; report.push({ name: r.name, applied: false, reason: upErr.message }); continue; }
    }

    console.log(`${dry ? 'OK-PRUEBA' : 'OK'} ${r.name} [${r.confianza || '?'}] len=${description.length}${issues.length ? ' ' + issues.join(',') : ''}`);
    applied++;
    report.push({ name: r.name, applied: true, confianza: r.confianza, fuente: r.fuente, issues, len: description.length });
  }

  fs.writeFileSync(dry ? '_research_apply_dry.json' : '_research_apply_report.json', JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n${dry ? 'Validados' : 'Aplicados'}: ${applied} / ${items.size} (omitidos ${skipped})`);
}

main().catch(e => { console.error(e); process.exit(1); });
