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
const STATE_FILE = '_desc_v2_state.json';
const BACKUP_FILE = '_desc_backup.json';
const REPORT_FILE = '_desc_v2_report.json';

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
    html.replace(/<br\s*\/?>/gi, ' ').replace(/<\/p>/gi, ' ').replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
}

function fixText(s: string): string {
  return s
    .replace(/([a-záéíóúüñ])([A-ZÁÉÍÓÚÜÑ])/g, '$1 $2')
    .replace(/([.!?…])([A-ZÁÉÍÓÚÜÑ«¿¡])/g, '$1 $2')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,;:])(?=[^\s\d])/g, '$1 ')
    .replace(/\s{2,}/g, ' ')
    .trim();
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
  if (out.length < min) return { text: out, note: 'algo_corta' };
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
  const text = fixText(cleanHtml(html.slice(start, end)));
  return text.length >= 150 ? text : null;
}

type Meta = {
  autor?: string; genero?: string; editorial?: string; ano?: string; paginas?: string;
  encuadernacion?: string; isbn?: string; idioma?: string; coleccion?: string; edicion?: string;
};

function extractMeta(html: string): Meta {
  const found: Record<string, { block: string; anchors: string[] }> = {};
  const re = /id="(metadata-[^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const rawId = m[1];
    const key = norm(rawId).replace(/^metadata /, '').trim();
    if (found[key]) continue;
    const start = html.indexOf('>', m.index) + 1;
    const end = html.indexOf('</div>', start);
    if (end === -1) continue;
    const block = html.slice(start, end);
    const anchors = [...block.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)]
      .map(a => cleanHtml(a[1]))
      .filter(t => t.length > 1);
    found[key] = { block, anchors };
  }

  const value = (key: string): string | undefined => {
    const f = found[key];
    if (!f) return undefined;
    if (f.anchors.length) return f.anchors.join(key === 'categorias' ? ' / ' : ' y ');
    const text = cleanHtml(f.block);
    return text || undefined;
  };

  const isbn13 = value('isbn13');
  const isbn10 = value('isbn');
  const cleanIsbn = (s?: string) => s ? s.replace(/[^0-9Xx]/g, '') : undefined;

  return {
    autor: value('autor'),
    genero: value('categorias'),
    editorial: value('editorial'),
    ano: value('ano'),
    paginas: value('numero paginas'),
    encuadernacion: value('encuadernacion'),
    isbn: cleanIsbn(isbn13) || cleanIsbn(isbn10),
    idioma: value('idioma'),
    coleccion: value('coleccion'),
    edicion: value('numero edicion'),
  };
}

function validIsbn13(isbn?: string): boolean {
  if (!isbn || !/^\d{13}$/.test(isbn)) return false;
  let sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(isbn[i], 10) * (i % 2 === 0 ? 1 : 3);
  return sum % 10 === 0;
}

function extractPageTitle(html: string): string | null {
  const og = html.match(/property="og:title" content="([^"]+)"/i)?.[1];
  if (!og) return null;
  const m = og.match(/^Libro (.+) De (.+?) - Buscalibre/i);
  return m ? decodeEntities(m[1]).trim() : null;
}

function titleMatches(query: string, pageTitle: string): { ok: boolean; dudoso: boolean } {
  const q = tokens(query);
  const a = tokens(pageTitle);
  if (!q.length) return { ok: false, dudoso: false };
  const aSet = new Set(a);
  if (!q.every(t => aSet.has(t))) return { ok: false, dudoso: false };

  const qNums = q.filter(t => /^\d+$/.test(t)).sort();
  const aNums = a.filter(t => /^\d+$/.test(t)).sort();
  if (qNums.length && JSON.stringify(qNums) !== JSON.stringify(aNums)) return { ok: false, dudoso: false };

  if (q.length <= 2) {
    const extra = a.filter(t => !q.includes(t));
    if (extra.length > 0) return { ok: true, dudoso: true };
  }
  return { ok: true, dudoso: false };
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
  id: string; name: string; description: string | null; autor: string | null;
  status: string; url: string | null; matched: string | null; note: string; len: number;
  meta: Meta;
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function metaCount(meta: Meta): number {
  return Object.values(meta).filter(v => v && String(v).trim()).length;
}

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

    let best: { h: string; pageTitle: string; synopsis: string | null; meta: Meta; dudoso: boolean } | null = null;
    let bestScore = -1;

    for (const { h } of ranked) {
      let page;
      try {
        page = await fetchText('https://www.buscalibre.com.ar' + h);
      } catch { continue; }
      if (!/^2/.test(String(page.status))) continue;

      const pageTitle = extractPageTitle(page.text);
      const matchInfo = pageTitle ? titleMatches(name, pageTitle) : { ok: false, dudoso: false };
      if (!matchInfo.ok) continue;

      const meta = extractMeta(page.text);
      if (meta.idioma && !/espa|castell/i.test(meta.idioma)) continue;

      const synopsis = extractSynopsis(page.text);
      if (synopsis && !isSpanish(synopsis)) continue;

      const fields = metaCount(meta);
      const score = (synopsis ? 100 : 0) + fields * 5 + (meta.idioma ? 0 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = { h, pageTitle, synopsis, meta, dudoso: matchInfo.dudoso };
      }
      if (synopsis && fields >= 6) break;
    }

    if (best) {
      const author = best.meta.autor || existingAuthor || null;
      const meta = { ...best.meta };
      if (!meta.autor && author) meta.autor = author;

      let status = 'ok';
      let description: string | null = null;

      if (!best.synopsis) {
        status = 'sin_sinopsis';
      } else {
        const { text, note } = summarize(best.synopsis);
        const ficha: string[] = [];
        if (meta.autor) ficha.push(`Autor: ${meta.autor}`);
        if (meta.genero) ficha.push(`Género: ${meta.genero}`);
        if (meta.editorial) ficha.push(`Editorial: ${meta.editorial}`);
        if (meta.ano && /^\d{4}$/.test(meta.ano)) ficha.push(`Año: ${meta.ano}`);
        if (meta.paginas && /^\d{1,4}$/.test(meta.paginas)) ficha.push(`Páginas: ${meta.paginas}`);
        if (meta.encuadernacion) ficha.push(`Encuadernación: ${meta.encuadernacion}`);
        if (meta.isbn && validIsbn13(meta.isbn)) ficha.push(`ISBN: ${meta.isbn}`);
        if (meta.idioma) ficha.push(`Idioma: ${meta.idioma}`);

        description = `Sinopsis: ${text}\n\nFicha literaria:\n${ficha.join('\n')}`;
        status = best.dudoso ? 'dudoso' : (note === 'corta' || note === 'algo_corta' ? 'corta' : 'ok');
        if (ficha.length < 3) status = 'sin_ficha';
      }

      return {
        id: '', name, description, autor: author,
        status, url: 'https://www.buscalibre.com.ar' + best.h,
        matched: best.pageTitle,
        note: best.dudoso ? 'titulo_corto_con_extra' : (best.synopsis ? '' : 'sin_sinopsis'),
        len: description ? description.length : 0,
        meta,
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
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(allProducts, null, 2), 'utf-8');
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
        id: p.id, name: p.name, description: null, autor: existingAuthor,
        status: 'sin_fuente', url: null, matched: null, note: '', len: 0, meta: {},
      };
    }
    result.id = p.id;
    state[p.id] = result;
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');

    const mark = result.status === 'ok' ? 'OK ' : (result.status === 'dudoso' ? 'DUD' : (result.status === 'sin_fuente' ? '---' : 'PAR'));
    console.log(`[${i + 1}/${products.length}] ${mark} ${p.name}${result.matched ? `  <~  "${result.matched}"` : ''}`);
    await sleep(350);
  }

  const results = Object.values(state);
  const report = {
    generated_at: new Date().toISOString(),
    total: results.length,
    ok: results.filter(r => r.status === 'ok').length,
    dudoso: results.filter(r => r.status === 'dudoso').length,
    corta: results.filter(r => r.status === 'corta').length,
    sin_ficha: results.filter(r => r.status === 'sin_ficha').length,
    sin_sinopsis: results.filter(r => r.status === 'sin_sinopsis').length,
    sin_fuente: results.filter(r => r.status === 'sin_fuente').length,
    results,
  };
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nResumen: ${JSON.stringify({ ok: report.ok, dudoso: report.dudoso, corta: report.corta, sin_ficha: report.sin_ficha, sin_sinopsis: report.sin_sinopsis, sin_fuente: report.sin_fuente })}`);
  console.log(`Reporte: ${REPORT_FILE}`);
}

main().catch(e => { console.error(e); process.exit(1); });
