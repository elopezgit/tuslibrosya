import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
fs.readFileSync(".env", "utf8").split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
});
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const E = "39d1961a-2bfb-49b6-82b6-cfb193a0a9ae";

const norm = s => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const { data, error } = await sb.from("products").select("id,name,description,image_url").eq("empresa_id", E).order("name");
if (error) throw new Error(error.message);

const targets = [
  "Binding 13", "Culpa mía", "Culpa nuestra", "Culpa tuya", "Dímelo bajito",
  "Fabricante de lágrimas", "Las luces de febrero", "Lujuria, libro 1",
  "Redeeming 6", "Tres meses", "Heartstopper 5", "Heartstopper. Volumen 5",
  "Cómo ganarse a la gente", "Cómo quieres que te quieran", "El hombre que plantaba árboles",
  "Su primer año en el network marketing", "Te vas a morir y todavía no has empezado a vivir"
];

for (const t of targets) {
  const p = data.find(x => norm(x.name) === norm(t));
  if (!p) { console.log("\n##### NO ENCONTRADO:", t); continue; }
  console.log("\n#####", p.name, "[" + (p.description || "").length + "]");
  console.log(p.description);
}

console.log("\n\n##### DESCRIPCIONES CON 'GASTOS DE ENV' #####");
for (const p of data) if (norm(p.description).includes("gastos de env")) {
  console.log("\n-", p.name);
  console.log(p.description);
}

console.log("\n\n##### DESCRIPCIONES CON PROMO/STOCK/TOTE #####");
for (const p of data) {
  const d = p.description || "";
  if (/PROMO|AGOTAR STOCK|tote bag/i.test(d)) console.log("-", p.name);
}

console.log("\n\n##### FUENTES DE LOS TRUNCADOS #####");
try {
  const rep = JSON.parse(fs.readFileSync("_desc_v2_report.json", "utf8"));
  const arr = Array.isArray(rep) ? rep : (rep.results || rep.items || Object.values(rep));
  for (const t of ["Cómo ganarse a la gente", "Cómo quieres que te quieran", "El hombre que plantaba árboles", "Su primer año en el network marketing", "Te vas a morir y todavía no has empezado a vivir"]) {
    const r = arr.find(x => norm(x.name) === norm(t));
    console.log("\n-", t, "->", r ? r.url : "(sin registro)");
  }
} catch (e) { console.log("No se pudo leer el reporte:", e.message); }
