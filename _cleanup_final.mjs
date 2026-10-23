import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const DRY = process.argv.includes("--dry");
const env = {};
fs.readFileSync(".env", "utf8").split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
});
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const E = "39d1961a-2bfb-49b6-82b6-cfb193a0a9ae";

const promoFix = [
  "Binding 13",
  "Culpa mía",
  "Culpa nuestra",
  "Culpa tuya",
  "Dímelo bajito",
  "Fabricante de lágrimas",
  "Heartstopper 5",
  "Heartstopper. Volumen 5",
  "Las luces de febrero",
  "Lujuria, libro 1",
  "Redeeming 6",
  "Tres meses"
];

const newSynopsis = {
  "Cómo ganarse a la gente": "Cómo ganarse a la gente es un programa de 14 días para ejercer un dominio total sobre los hechos, las personas y las circunstancias que moldean la vida personal. Día tras día, la guía presenta evaluaciones, ejercicios y planes de fácil aplicación para perder el miedo al fracaso, neutralizar a las personas difíciles, definir metas, reconstruir relaciones dañadas y conseguir que las ideas sean captadas por los demás. También enseña a eliminar los malos hábitos que impiden alcanzar el éxito.",
  "Cómo quieres que te quieran": "La expresión teatral en Colombia, después de un cerrado politicismo en los años setenta que privilegió muchas veces el discurso sobre la obra de creación, pasó a un cerrado esteticismo que oculta el entorno; un reflejo condicionado por la réplica imitativa del teatro europeo. Esa vertiente teatral terminó en la sala de las instituciones de cultura, en el economicismo de la industria cultural o en un particularísimo lenguaje municipal con la teatral túnica cosmopolita.",
  "Las luces de febrero": "Ellie Ross vive por y para el baloncesto. ¿Su objetivo? Ser la primera chica en entrar en el equipo de su ciudad. ¿Su mayor obstáculo? Víctor, con quien no habla desde los quince años y con quien no terminó nada bien. Jay Ross vive por y para su familia. ¿Su objetivo? Encontrar su propósito de una vez por todas. ¿Su mayor obstáculo? El nuevo cuidador de su abuela: el despreocupado y odiosamente perfecto Nolan. Del amor al odio hay solo un paso, pero del odio al amor hay un camino muy largo.",
  "Su primer año en el network marketing": "El network marketing es una de las oportunidades de negocios de más rápido crecimiento en Estados Unidos y en el mundo. Millones de personas han abandonado trabajos sin futuro para desarrollar sus propios negocios. Sin embargo, para muchas de ellas el primer año es el que presenta más desafíos y el más desalentador. Mark Yarnell y René Reid Yarnell, dos profesionales respetados de la industria, ofrecen estrategias para superar esos obstáculos y consolidarse en el éxito a largo plazo.",
  "Te vas a morir y todavía no has empezado a vivir": "A menudo creemos que para cambiar nuestra vida tenemos que embarcarnos en un gran viaje o encontrar una revelación repentina. Mientras tanto, la vida se nos escapa. El problema no es que, antes o después, vayamos a morir, sino morir sin haber empezado a vivir. Esperar que nuestra vida cambie por sí sola es dejarla en manos de un mundo que no podemos controlar, pasando por alto todo lo que sí depende de nosotros.",
  "Culpa nuestra": "La relación de Nick y Noah está pasando por su peor momento, y parece que nada podrá volver a ser como antes. Van a tener que pasar por muchas cosas para comprender si de verdad están hechos el uno para el otro o si, por el contrario, estar separados es lo que les conviene. Pero ¿acaso se puede olvidar un amor tan fuerte? ¿Cómo borrar los recuerdos tatuados en el corazón? El amor no siempre es suficiente y el perdón a veces no basta.",
  "Tres meses": "Conocer a una persona te puede cambiar la vida. Jack Ross no creía en el compromiso; y hasta ahora no le había ido mal. La fantasía del amor verdadero, de ese cruce de miradas que te cambia la vida por completo, no era más que un argumento sobreexplotado de las películas que más solía criticar. Por eso, ¿qué importaba que hubiera conocido a Jenna? ¿Qué importaba si pasaban tanto tiempo juntos? En tres meses pueden ocurrir muchas cosas; y enamorarse es una de ellas.",
  "Heartstopper 5": "De la novela gráfica que inspiró a la aclamada serie de Netflix, la novela gráfica LGBT+ más vendida. Nick y Charlie están muy enamorados, pero Nick está a punto de dar un paso a la universidad y todo podría ser diferente. No te pierdas la esperada continuación de tu historia favorita. Quinta entrega de la serie Heartstopper, de Alice Oseman.",
  "Heartstopper. Volumen 5": "De la novela gráfica que inspiró a la aclamada serie de Netflix, la novela gráfica LGBT+ más vendida. Nick y Charlie están muy enamorados, pero Nick está a punto de dar un paso a la universidad y todo podría ser diferente. No te pierdas la esperada continuación de tu historia favorita. Quinta entrega de la serie Heartstopper, de Alice Oseman."
};

const truncFix = Object.keys(newSynopsis);

function splitDesc(d) {
  const i = d.indexOf("\n\nFicha");
  if (i === -1) return { sin: d.replace(/^Sinopsis:\s*/i, "").trim(), ficha: "" };
  return {
    sin: d.slice(0, i).replace(/^Sinopsis:\s*/i, "").trim(),
    ficha: d.slice(i)
  };
}

function cleanPromo(sin) {
  return sin
    .replace(/Con la compra de Heartstopper 5! te llevas una tote bag \+ stickers de regalo! \(hasta agotar stock solo valido Argentina\)\s*/gi, "")
    .replace(/PROMO HASTA AGOTAR STOCK\s*/gi, "")
    .replace(/HASTA AGOTAR STOCK\s*/gi, "")
    .replace(/^"\s*/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const { data, error } = await sb.from("products").select("id,name,description").eq("empresa_id", E).order("name");
if (error) throw new Error(error.message);

if (!DRY) {
  fs.writeFileSync("_desc_backup_cleanup.json", JSON.stringify(data, null, 2), "utf8");
  console.log("Respaldo: _desc_backup_cleanup.json (" + data.length + " productos)");
} else {
  console.log("MODO PRUEBA: no se escribe nada");
}

const changes = [];
for (const p of data) {
  const name = p.name;
  if (!promoFix.includes(name) && !truncFix.includes(name)) continue;
  const old = p.description || "";
  const { sin, ficha } = splitDesc(old);
  let nextSin = sin;
  let nextFicha = ficha;

  if (newSynopsis[name]) {
    nextSin = newSynopsis[name];
  } else {
    nextSin = cleanPromo(sin);
  }

  if (name === "Cómo ganarse a la gente") {
    nextFicha = nextFicha.replace("Género: Cocina / comidas y bebidas, etc.", "Género: Desarrollo personal / Relaciones interpersonales");
  }

  const next = "Sinopsis: " + nextSin.trim() + nextFicha;
  if (next === old) {
    console.log("SIN CAMBIOS " + name);
    continue;
  }
  changes.push({ id: p.id, name, old, next, sinLen: nextSin.trim().length });
}

console.log("\nCambios preparados: " + changes.length);
for (const c of changes) {
  const before = c.old.slice(0, 90).replace(/\n/g, " ");
  const after = c.next.slice(0, 90).replace(/\n/g, " ");
  console.log(`\n- ${c.name} [sinopsis ${c.sinLen}]`);
  console.log("  ANTES: " + before);
  console.log("  DESPUÉS: " + after);
  if (c.sinLen < 300 || c.sinLen > 500) console.log("  AVISO: sinopsis fuera de 300-500");
  if (/PROMO|AGOTAR STOCK|tote bag/i.test(c.next)) console.log("  AVISO: queda texto promocional");
}

if (!DRY) {
  let ok = 0;
  for (const c of changes) {
    const { error: upErr } = await sb.from("products").update({ description: c.next }).eq("id", c.id).eq("empresa_id", E);
    if (upErr) { console.log("ERROR " + c.name + ": " + upErr.message); continue; }
    console.log("OK " + c.name);
    ok++;
  }
  console.log(`\nAplicados: ${ok} / ${changes.length}`);
}
