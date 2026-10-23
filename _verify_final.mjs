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

console.log("TOTAL", data.length);
console.log("SIN DESCRIPCIÓN", data.filter(p => !(p.description || "").trim()).length);
for (const p of data.filter(p => !(p.description || "").trim())) console.log("  -", p.name);

const promo = data.filter(p => /PROMO|AGOTAR STOCK|tote bag/i.test(p.description || ""));
console.log("\nCON TEXTO PROMOCIONAL:", promo.length);
for (const p of promo) console.log("  -", p.name);

for (const n of ["Cómo ganarse a la gente", "Heartstopper 5", "Culpa nuestra", "Las luces de febrero", "Tres meses", "Te vas a morir y todavía no has empezado a vivir"]) {
  const p = data.find(x => x.name === n);
  console.log("\n\n#####", n, "#####");
  console.log(p ? p.description : "NO ENCONTRADO");
}
