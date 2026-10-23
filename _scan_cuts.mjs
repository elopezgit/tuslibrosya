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

const suspicious = [];
for (const p of data) {
  const d = p.description || "";
  if (!d) continue;
  const i = d.indexOf("\n\nFicha");
  let sin = i >= 0 ? d.slice(0, i) : d;
  sin = sin.replace(/^Sinopsis:\s*/i, "").trim();
  if (!sin) continue;
  const tail = sin.slice(-140);
  const last = sin.slice(-1);
  const lastSentence = sin.split(/(?<=[.!?…])\s+/).pop() || "";
  let reason = "";
  if (/[?:;,]$/.test(last)) reason = "termina en " + last;
  else if (/\.\.\.$|…$/.test(sin)) reason = "puntos suspensivos";
  else if (/[«"“]$/.test(last)) reason = "comilla abierta";
  else if (lastSentence.length < 28 && /[?!]$/.test(lastSentence)) reason = "pregunta/exclamacion corta";
  else if (/(?:^|\s)(y|o|de|del|la|el|los|las|que|en|con|por|para|un|una|unos|unas|al|a|su|sus|se|lo|le|les|es|son|fue|era|como|más|pero|sino|entre|desde|hasta|sobre|sin|tras|durante|mientras|cuando|donde|porque|aunque|si|no)$/i.test(sin)) reason = "palabra colgada";
  if (reason) suspicious.push({ name: p.name, reason, tail, len: sin.length });
}
console.log("SOSPECHOSOS:", suspicious.length);
for (const s of suspicious) {
  console.log(`\n- ${s.name} [${s.len}] (${s.reason})`);
  console.log("  ..." + s.tail);
}
