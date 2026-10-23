import fs from "fs";
import { createClient } from "@supabase/supabase-js";
const env = {};
fs.readFileSync(".env", "utf8").split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
});
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const E = "39d1961a-2bfb-49b6-82b6-cfb193a0a9ae";
const pending = ["Abraza tu destino", "Charlas de diván", "De Dios para mí", "Eterno", "Las claves del dinero", "Riqueza", "Todo lo que sea Rolón"];

const { data, error } = await sb.from("products").select("*").eq("empresa_id", E).in("name", pending);
if (error) throw new Error(error.message);
console.log("##### FICHAS DEL CATÁLOGO #####");
for (const p of data) {
  console.log("\n-", p.name);
  for (const [k, v] of Object.entries(p)) {
    if (v !== null && v !== "" && k !== "description" && k !== "name") console.log("  ", k + ":", typeof v === "object" ? JSON.stringify(v) : v);
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
for (const title of pending) {
  console.log("\n\n########## GOOGLE BOOKS: " + title + " ##########");
  const url = "https://www.googleapis.com/books/v1/volumes?q=" + encodeURIComponent(`intitle:"${title}"`) + "&maxResults=10&langRestrict=es";
  try {
    const r = await fetch(url);
    const j = await r.json();
    if (!j.items) { console.log("Sin resultados"); continue; }
    for (const it of j.items) {
      const v = it.volumeInfo || {};
      const ids = (v.industryIdentifiers || []).map(x => x.type + ":" + x.identifier).join(", ");
      console.log(`\n- ${v.title}${v.subtitle ? ": " + v.subtitle : ""}`);
      console.log(`  Autor: ${(v.authors || []).join(" / ") || "-"} | Editorial: ${v.publisher || "-"} | Fecha: ${v.publishedDate || "-"} | Págs: ${v.pageCount || "-"}`);
      console.log(`  ISBN: ${ids || "-"} | Idioma: ${v.language || "-"}`);
      if (v.description) console.log(`  Desc: ${v.description.slice(0, 260).replace(/\s+/g, " ")}`);
    }
  } catch (e) { console.log("ERROR:", e.message); }
  await sleep(300);
}
