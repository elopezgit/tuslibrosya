import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "child_process";

const env = {};
fs.readFileSync(".env", "utf8").split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
});
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const E = "39d1961a-2bfb-49b6-82b6-cfb193a0a9ae";
const norm = s => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const { data, error } = await sb.from("products").select("id,name,description").eq("empresa_id", E).order("name");
if (error) throw new Error(error.message);

for (const n of ["Charlas TED", "Las luces de febrero"]) {
  const p = data.find(x => norm(x.name) === norm(n));
  console.log("\n#####", n, "#####");
  console.log(p ? p.description : "NO ENCONTRADO");
}

const titles = [
  "Cómo ganarse a la gente",
  "Su primer año en el network marketing",
  "Te vas a morir y todavía no has empezado a vivir",
  "Las luces de febrero",
  "Cómo quieres que te quieran"
];
console.log("\n\n########## BUSCALIBRE ##########");
try {
  const out = execFileSync("node", ["_lookup.mjs", ...titles], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  console.log(out);
} catch (e) {
  console.log("ERROR lookup:", e.message);
  if (e.stdout) console.log(e.stdout);
}
