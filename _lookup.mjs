// Consulta puntual de fichas en Buscalibre. No escribe en Supabase.
// Uso: node _lookup.mjs "consulta 1" "consulta 2" ...
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

const decodeEntities = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&aacute;/gi, 'á').replace(/&eacute;/gi, 'é').replace(/&iacute;/gi, 'í')
  .replace(/&oacute;/gi, 'ó').replace(/&uacute;/gi, 'ú').replace(/&ntilde;/gi, 'ñ')
  .replace(/&uuml;/gi, 'ü').replace(/&quot;/gi, '"').replace(/&#0?39;/g, "'")
  .replace(/&amp;/gi, '&').replace(/&nbsp;/gi, ' ').replace(/&laquo;/gi, '«').replace(/&raquo;/gi, '»')
  .replace(/&ldquo;/gi, '“').replace(/&rdquo;/gi, '”').replace(/&mdash;/gi, '—').replace(/&ndash;/gi, '–')
  .replace(/&hellip;/gi, '…').replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É')
  .replace(/&Iacute;/g, 'Í').replace(/&Oacute;/g, 'Ó').replace(/&Uacute;/g, 'Ú').replace(/&Ntilde;/g, 'Ñ');

const cleanHtml = (html) => decodeEntities(
  html.replace(/<br\s*\/?>/gi, ' ').replace(/<\/p>/gi, ' ').replace(/<[^>]+>/g, ' ')
).replace(/\s+/g, ' ').trim();

const norm = (s) => (s || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim();

const tokens = (s) => norm(s).split(' ').filter(t => t.length > 1);
const score = (q, slug) => {
  const a = new Set(tokens(slug.replace(/-/g, ' ')));
  const qq = tokens(q);
  if (!qq.length) return 0;
  return qq.filter(t => a.has(t)).length / qq.length;
};

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'es-AR,es;q=0.9' } });
  return { status: res.status, text: await res.text() };
}

function extractMeta(html) {
  const out = {};
  const re = /id="(metadata-[^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    const key = norm(m[1]).replace(/^metadata /, '');
    if (out[key]) continue;
    const start = html.indexOf('>', m.index) + 1;
    const end = html.indexOf('</div>', start);
    if (end === -1) continue;
    const block = html.slice(start, end);
    const anchors = [...block.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)].map(a => cleanHtml(a[1])).filter(t => t.length > 1);
    out[key] = anchors.length ? anchors.join(' y ') : cleanHtml(block);
  }
  return out;
}

function extractSynopsis(html) {
  const i = html.indexOf('id="texto-descripcion"');
  if (i === -1) return '';
  const start = html.indexOf('>', i) + 1;
  const end = html.indexOf('</span>', start);
  if (end === -1) return '';
  return cleanHtml(html.slice(start, end));
}

function pageTitle(html) {
  const og = html.match(/property="og:title" content="([^"]+)"/i)?.[1];
  if (!og) return '';
  const m = og.match(/^Libro (.+) De (.+?) - Buscalibre/i);
  return m ? decodeEntities(m[1]).trim() : decodeEntities(og).trim();
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const queries = process.argv.slice(2);
for (const q of queries) {
  console.log(`\n===== ${q} =====`);
  let search;
  try {
    search = await fetchText('https://www.buscalibre.com.ar/libros/search?q=' + encodeURIComponent(q));
  } catch (e) {
    console.log('ERROR busqueda:', e.message);
    continue;
  }
  if (!/^2/.test(String(search.status))) {
    console.log('HTTP', search.status);
    continue;
  }
  const hrefs = [...new Set([...search.text.matchAll(/href="(\/libro-[^"]+)"/g)].map(m => m[1]))];
  const ranked = hrefs
    .map(h => ({ h, s: score(q, h.split('/')[1] || '') }))
    .filter(x => x.s >= 0.5)
    .sort((a, b) => b.s - a.s)
    .slice(0, 5);
  if (!ranked.length) {
    console.log('Sin resultados con puntuacion suficiente');
    continue;
  }
  for (const { h, s } of ranked) {
    let page;
    try { page = await fetchText('https://www.buscalibre.com.ar' + h); } catch { continue; }
    if (!/^2/.test(String(page.status))) continue;
    const meta = extractMeta(page.text);
    const syn = extractSynopsis(page.text);
    console.log(`\n  [${s.toFixed(2)}] ${pageTitle(page.text)}`);
    console.log('  URL:', 'https://www.buscalibre.com.ar' + h);
    console.log('  Autor:', meta.autor || '-', '| Editorial:', meta.editorial || '-', '| Año:', meta.ano || '-', '| Págs:', meta['numero paginas'] || '-');
    console.log('  ISBN:', meta.isbn13 || meta.isbn || '-', '| Idioma:', meta.idioma || '-');
    console.log('  Sinopsis:', syn ? syn.slice(0, 420) : '(sin sinopsis)');
    await sleep(200);
  }
  await sleep(300);
}
