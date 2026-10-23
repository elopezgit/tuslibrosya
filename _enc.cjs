const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';
const url = 'https://www.buscalibre.com.ar/libro-rota-se-camina-igual/9788466669191/p/53188549';

(async () => {
  const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'es-AR,es;q=0.9' } });
  const buf = Buffer.from(await r.arrayBuffer());
  const utf8 = new TextDecoder('utf-8').decode(buf);
  const w1252 = new TextDecoder('windows-1252').decode(buf);
  const i = utf8.indexOf('id="texto-descripcion"');
  const start = utf8.indexOf('>', i) + 1;
  const end = utf8.indexOf('</span>', start);
  const i2 = w1252.indexOf('id="texto-descripcion"');
  const s2 = w1252.indexOf('>', i2) + 1;
  const e2 = w1252.indexOf('</span>', s2);
  console.log('content-type:', r.headers.get('content-type'));
  console.log('meta:', utf8.match(/<meta[^>]+charset[^>]+>/i)?.[0]);
  console.log('UTF8:', utf8.slice(start, start + 260));
  console.log('W1252:', w1252.slice(s2, s2 + 260));
})();
