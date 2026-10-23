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

const extractSynopsis = (html) => {
  const i = html.indexOf('id="texto-descripcion"');
  if (i === -1) return '';
  const start = html.indexOf('>', i) + 1;
  const end = html.indexOf('</span>', start);
  if (end === -1) return '';
  return cleanHtml(html.slice(start, end));
};

const urls = [
  ['Cómo ganarse a la gente', 'https://www.buscalibre.com.ar/libro-como-ganarse-a-la-gente-campana-6-95/9788478082551/p/2571013'],
  ['Su primer año en el network marketing', 'https://www.buscalibre.com.ar/libro-su-primer-ano-en-el-network-marketing-supere-sus-miedos-alcance-el-exito-y-logre-sus-suenos/4630273/p/4630273'],
  ['Las luces de febrero', 'https://www.buscalibre.com.ar/libro-las-luces-de-febrero/9789878940762/p/55710250'],
  ['Cómo quieres que te quieran', 'https://www.buscalibre.com.ar/libro-sobre-algunos-asuntos-de-familia-tomo-iii-como-quieres-que-te-quiera/9789588723907/p/31189154'],
  ['Te vas a morir y todavía no has empezado a vivir', 'https://www.buscalibre.com.ar/libro-te-vas-a-morir-y-todavia-no-has-empezado-a-vivir/9791387936112/p/64699077'],
  ['El hombre que plantaba árboles', 'https://www.buscalibre.com.ar/libro-el-hombre-que-plantaba-arboles/9788415945338/p/38211500']
];

for (const [name, url] of urls) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'es-AR,es;q=0.9' } });
    const html = await r.text();
    const syn = extractSynopsis(html);
    console.log(`\n\n===== ${name} [${r.status}] len=${syn.length} =====`);
    console.log(syn || '(sin sinopsis)');
  } catch (e) {
    console.log('\nERROR', name, e.message);
  }
}
