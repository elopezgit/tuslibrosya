import fs from "fs";
import { createClient } from "@supabase/supabase-js";
const env = {};
fs.readFileSync(".env", "utf8").split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
});
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const E = "39d1961a-2bfb-49b6-82b6-cfb193a0a9ae";
const { data, error } = await sb.from("products").select("id,name,description").eq("empresa_id", E).order("name");
if (error) throw new Error(error.message);

const isbnOk = (i) => {
  if (!/^97[89]\d{10}$/.test(i)) return false;
  let s = 0;
  for (let k = 0; k < 13; k++) s += +i[k] * (k % 2 ? 3 : 1);
  return s % 10 === 0;
};

const buckets = { sin: 0, "<200": 0, "200-299": 0, "300-500": 0, ">500": 0 };
const flags = [];
const badIsbn = [];
for (const p of data) {
  const d = p.description || "";
  if (!d.trim()) { buckets.sin++; continue; }
  const i = d.indexOf("\n\nFicha");
  const sin = (i >= 0 ? d.slice(0, i) : d).replace(/^Sinopsis:\s*/i, "").trim();
  const len = sin.length;
  if (len < 200) buckets["<200"]++;
  else if (len < 300) buckets["200-299"]++;
  else if (len <= 500) buckets["300-500"]++;
  else buckets[">500"]++;

  const f = [];
  if (!d.startsWith("Sinopsis:")) f.push("sin_prefijo");
  if (!d.includes("Ficha literaria:") && !d.includes("Ficha de la colección:")) f.push("sin_ficha");
  if (/[¨®£¢¯]/.test(d)) f.push("simbolos");
  if (/\u00a0/.test(d)) f.push("nbsp");
  if (/\d[a-zA-ZÁÉÍÓÚÑáéíóúñ]/.test(d)) f.push("num_pegado");
  if (/[a-záéíóúñ][A-ZÁÉÍÓÚÑ]/.test(d)) f.push("mayus_pegada");
  if (/PROMO HASTA AGOTAR STOCK|AGOTAR STOCK|tote bag/i.test(d)) f.push("promocion");
  if (f.length) flags.push({ name: p.name, flags: f });

  const isbns = [...d.matchAll(/\b(97[89]\d{10})\b/g)].map(m => m[1]);
  for (const isbn of new Set(isbns)) if (!isbnOk(isbn)) badIsbn.push({ name: p.name, isbn });
}

console.log("TOTAL:", data.length);
console.log("CON DESCRIPCIÓN:", data.length - buckets.sin);
console.log("SIN DESCRIPCIÓN:", buckets.sin);
console.log("BUCKETS SINOPSIS:", buckets);
console.log("\nCON BANDERAS REALES:", flags.length);
for (const x of flags) console.log("  -", x.name, "[" + x.flags.join(",") + "]");
console.log("\nISBN-13 INVÁLIDOS:", badIsbn.length);
for (const x of badIsbn) console.log("  -", x.name, x.isbn);
console.log("\nSIN DESCRIPCIÓN:");
for (const p of data.filter(p => !(p.description || "").trim())) console.log("  -", p.name);
