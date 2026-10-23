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
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';
const STATE_FILE = '_desc_state.json';
const BACKUP_FILE = '_desc_backup.json';
const REPORT_FILE = '_desc_report.json';

const STOP = new Set([
  'de','la','el','los','las','un','una','unos','unas','y','que','para','con','por','en','del','al','se','su','sus',
  'mi','mis','tu','tus','lo','a','e','o','u','the','of','and','to','in','on','vol','volumen','tomo','libro',
  'coleccion','saga','serie','edicion','especial','nueva','nuevo'
]);

const norm = (s: string) => (s || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9ñ\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const stem = (t: string) => {
  if (/^\d+$/.test(t)) return String(parseInt(t, 10));
  if (t.length > 5 && t.endsWith('es')) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith('s')) return t.slice(0, -1);
  return t;
};

const tokens = (s: string) => norm(s).split(' ')
  .filter(t => t && !STOP.has(t) && (t.length > 1 || /^\d+$/.test(t)))
  .map(stem);

const decodeEntities = (s: string) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&aacute;/gi, 'á').replace(/&eacute;/gi, 'é').replace(/&iacute;/gi, 'í')
  .replace(/&oacute;/gi, 'ó').replace(/&uacute;/gi, 'ú').replace(/&ntilde;/gi, 'ñ')
  .replace(/&uuml;/gi, 'ü').replace(/&quot;/gi, '"').replace(/&#0?39;/g, "'")
  .replace(/&amp;/gi, '&').replace(/&nbsp;/gi, ' ').replace(/&laquo;/gi, '«').replace(/&raquo;/gi, '»');

function cleanHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
}

function isSpanish(text: string): boolean {
  const es = (text.match(/\b(de|la|el|los|las|que|en|y|un|una|para|con|por|del|se|su|al|es|como|más|pero|sus|este|esta|entre|desde|cuando)\b/gi) || []).length;
  const en = (text.match(/\b(the|and|of|to|in|is|that|for|with|as|on|be|this|are|from|it|you|your|was|were)\b/gi) || []).length;
  return !(en > 3 && en > es * 0.6);
}

function summarize(text: string, min = 300, max = 500): { text: string; note: string } {
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ«"¿¡0-9])/).map(s => s.trim()).filter(Boolean);
  let out = '';
  for (const s of sentences) {
    const next = out ? out + ' ' + s : s;
    if (next.length > max) break;
    out = next;
    if (out.length >= min) break;
  }
  if (!out) {
    const cut = text.slice(0, max);
    const lastSpace = cut.lastIndexOf(' ');
    out = (lastSpace > min ? cut.slice(0, lastSpace) : cut).trim();
    return { text: out + (out.endsWith('.') ? '' : '…'), note: 'recorte_forzado' };
  }
  if (out.length < 200) return { text: out, note: 'corta' };
  return { text: out, note: '' };
}

async function fetchText(url: string): Promise<{ status: number; text: string }> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'es-AR,es;q=0.9' } });
  return { status: res.status, text: await res.text() };
}

function extractSynopsis(html: string): string | null {
  const i = html.indexOf('id="texto-descripcion"');
  if (i === -1) return null;
  const start = html.indexOf('>', i) + 1;
  const end = html.indexOf('</span>', start);
  if (end === -1) return null;
  const text = cleanHtml(html.slice(start, end));
  return text.length >= 150 ? text : null;
}

function extractAuthor(html: string): string | null {
  const i = html.indexOf('id="metadata-autor"');
  if (i === -1) return null;
  const end = html.indexOf('</div>', i);
  if (end === -1) return null;
  const block = html.slice(i, end);
  const names = [...block.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)]
    .map(m => cleanHtml(m[1]))
    .filter(n => n && n.length > 1);
  const uniq = [...new Set(names)];
  return uniq.length ? uniq.join(' y ') : null;
}

function extractPageTitle(html: string): string | null {
  const og = html.match(/property="og:title" content="([^"]+)"/i)?.[1];
  if (!og) return null;
  const m = og.match(/^Libro (.+) De (.+?) - Buscalibre/i);
  return m ? decodeEntities(m[1]).trim() : null;
}

function titleMatches(query: string, pageTitle: string): boolean {
  const q = tokens(query);
  const a = tokens(pageTitle);
  if (!q.length) return false;
  const aSet = new Set(a);
  const covered = q.every(t => aSet.has(t));
  if (!covered) return false;

  // Títulos muy cortos: exigir que el título de la ficha no añada palabras de más.
  if (q.length <= 2) {
    const extra = a.filter(t => !q.includes(t));
    if (extra.length > 0) return false;
  }

  // Los números del título (tomos, años) deben coincidir exactamente.
  const qNums = q.filter(t => /^\d+$/.test(t)).sort();
  const aNums = a.filter(t => /^\d+$/.test(t)).sort();
  if (qNums.length && JSON.stringify(qNums) !== JSON.stringify(aNums)) return false;

  return true;
}

function candidateScore(query: string, slug: string): number {
  const q = new Set(tokens(query));
  const a = new Set(tokens(slug.replace(/-/g, ' ')));
  if (!q.size) return 0;
  let hit = 0;
  q.forEach(t => { if (a.has(t)) hit++; });
  return hit / q.size;
}

function simplifyTitle(name: string): string {
  return name
    .replace(/\((?:saga|cada tomo|tomos disponibles|t[ií]tulos disponibles|colecci[oó]n)[^)]*\)/gi, '')
    .split(':')[0]
    .split(' - ')[0]
    .trim();
}

type Item = { id: string; name: string; description: string | null };
type Result = {
  id: string; name: string; description: string | null; author: string | null;
  status: string; url: string | null; matched: string | null; note: string; len: number;
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function searchAndExtract(name: string, existingAuthor: string | null): Promise<Result | null> {
  const variants = [name];
  const simple = simplifyTitle(name);
  if (simple && simple !== name) variants.push(simple);

  for (const variant of variants) {
    let search;
    try {
      search = await fetchText('https://www.buscalibre.com.ar/libros/search?q=' + encodeURIComponent(variant));
    } catch { continue; }
    if (!/^2/.test(String(search.status))) continue;

    const hrefs = [...new Set([...search.text.matchAll(/href="(\/libro-[^"]+)"/g)].map(m => m[1]))];
    const ranked = hrefs
      .map(h => ({ h, score: candidateScore(variant, h.split('/')[1] || '') }))
      .filter(x => x.score >= 0.8)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    for (const { h } of ranked) {
      let page;
      try {
        page = await fetchText('https://www.buscalibre.com.ar' + h);
      } catch { continue; }
      if (!/^2/.test(String(page.status))) continue;

      const pageTitle = extractPageTitle(page.text);
      if (!pageTitle || !titleMatches(name, pageTitle)) continue;

      const synopsis = extractSynopsis(page.text);
      if (!synopsis || !isSpanish(synopsis)) continue;

      const author = extractAuthor(page.text) || existingAuthor;
      const { text, note } = summarize(synopsis);
      let finalText = text;
      if (author && !finalText.toLowerCase().includes(author.toLowerCase().slice(0, 12))) {
        finalText = `${finalText} Autor: ${author}.`;
      }
      if (finalText.length > 560) finalText = finalText.slice(0, 557).trim() + '…';

      return {
        id: '', name, description: finalText, author,
        status: note === 'corta' ? 'corta' : 'ok',
        url: 'https://www.buscalibre.com.ar' + h,
        matched: pageTitle, note, len: finalText.length,
      };
    }
    await sleep(250);
  }
  return null;
}

async function loadProducts(): Promise<Item[]> {
  const all: Item[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id,name,description')
      .eq('empresa_id', EMPRESA_ID)
      .order('name')
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    if (!data || !data.length) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function main() {
  const allProducts = await loadProducts();
  const limit = parseInt(process.env.DESC_LIMIT || '0', 10);
  const products = limit > 0 ? allProducts.slice(0, limit) : allProducts;
  console.log(`Productos: ${allProducts.length} (procesando ${products.length})`);

  if (!fs.existsSync(BACKUP_FILE)) {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(products, null, 2), 'utf-8');
    console.log(`Respaldo creado: ${BACKUP_FILE}`);
  }

  let state: Record<string, Result> = {};
  if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    console.log(`Estado previo: ${Object.keys(state).length}`);
  }

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (state[p.id]) continue;

    const existing = (p.description || '').trim();
    const existingAuthor = existing && existing.length <= 70 && !/[.!?]\s/.test(existing) ? existing : null;

    let result: Result | null = null;
    try {
      result = await searchAndExtract(p.name, existingAuthor);
    } catch (e: any) {
      console.log(`ERROR ${p.name}: ${e.message}`);
    }

    if (!result) {
      result = {
        id: p.id, name: p.name, description: null, author: existingAuthor,
        status: 'sin_fuente', url: null, matched: null, note: '', len: 0,
      };
    }
    result.id = p.id;
    state[p.id] = result;
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');

    const mark = result.status === 'ok' ? 'OK ' : (result.status === 'corta' ? 'COR' : '---');
    console.log(`[${i + 1}/${products.length}] ${mark} ${p.name}${result.matched ? `  <~  "${result.matched}"` : ''}`);
    await sleep(350);
  }

  const results = Object.values(state);
  const report = {
    generated_at: new Date().toISOString(),
    total: results.length,
    ok: results.filter(r => r.status === 'ok').length,
    corta: results.filter(r => r.status === 'corta').length,
    sin_fuente: results.filter(r => r.status === 'sin_fuente').length,
    results,
  };
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nResumen: ok=${report.ok}, corta=${report.corta}, sin_fuente=${report.sin_fuente}`);
  console.log(`Reporte: ${REPORT_FILE}`);
}

main().catch(e => { console.error(e); process.exit(1); });
