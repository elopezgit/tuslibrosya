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
const cleanHtml = (html) => decodeEntities(html.replace(/<br\s*\/?>/gi, ' ').replace(/<\/p>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const extractSynopsis = (html) => {
  const i = html.indexOf('id="texto-descripcion"');
  if (i === -1) return '';
  const start = html.indexOf('>', i) + 1;
  const end = html.indexOf('</span>', start);
  if (end === -1) return '';
  return cleanHtml(html.slice(start, end));
};
const urls = [
  ['Tres meses', 'https://www.buscalibre.com.ar/libro-tres-meses/9789878940380/p/54555406'],
  ['Culpa nuestra', 'https://www.buscalibre.com.ar/libro-culpa-nuestra/9789873820960/p/50092334'],
  ['Heartstopper 5', 'https://www.buscalibre.com.ar/libro-heartstopper-5/9786313001002/p/55725516']
];
for (const [name, url] of urls) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'es-AR,es;q=0.9' } });
  const html = await r.text();
  const syn = extractSynopsis(html);
  console.log(`\n\n===== ${name} [${r.status}] len=${syn.length} =====`);
  console.log(syn || '(sin sinopsis)');
}
