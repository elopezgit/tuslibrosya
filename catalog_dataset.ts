import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 1. CARGA DE CREDENCIALES
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Faltan credenciales de Supabase en .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. BASE DE CONOCIMIENTO LITERARIO COMPLETA PARA LOS 149 LIBROS
export interface BookMeta {
  title: string;
  author: string;
  genre: string;
  synopsis: string;
  recommendedFor: string;
}

export const booksCatalogData: Record<string, { genre: string; synopsis: string; recommendedFor: string }> = {
  "1984": {
    genre: "Ciencia Ficción Distópica / Clásico",
    synopsis: "En una sociedad opresiva dominada por el régimen del Gran Hermano y la Policía del Pensamiento, Winston Smith trabaja en el Ministerio de la Verdad reescribiendo la historia para amoldarla a los intereses del Partido. Desafiando el sistema, inicia una rebelión íntima y un romance prohibido con Julia, arriesgándolo todo por el derecho a la individualidad y a la verdad objetiva.",
    recommendedFor: "Lectores apasionados por los clásicos del siglo XX, la crítica social, la filosofía política y las advertencias sobre el totalitarismo y la vigilancia masiva."
  },
  "50 Proverbios Estoicos Para Una Buena Vida": {
    genre: "Filosofía Práctica / Crecimiento Personal",
    synopsis: "Una recopilación destilada de cincuenta máximas fundamentales del estoicismo clásico (Séneca, Epicteto, Marco Aurelio), explicadas con un lenguaje directo, accesible y aplicable a los dilemas cotidianos modernos. El libro ofrece herramientas concretas para cultivar la serenidad, la resiliencia mental y el autodominio ante la incertidumbre.",
    recommendedFor: "Personas que buscan iniciarse en la filosofía estoica y aplicar la sabiduría milenaria para gestionar el estrés, la frustración y la toma de decisiones."
  },
  "A Dos Metros Sobre Ti": {
    genre: "Romance Juvenil / Drama Emocional",
    synopsis: "Stella Grant y Will Newman padecen fibrosis quística y deben mantener una estricta distancia de seguridad para evitar infecciones cruzadas que pondrían en riesgo sus vidas. A pesar de las restricciones físicas, entre ellos nace una conexión profunda e inevitable que los desafía a cuestionar qué significa vivir plenamente cuando el contacto físico está prohibido.",
    recommendedFor: "Amantes de las historias de amor juveniles intensas, conmovedoras y reflexivas sobre la fragilidad de la vida y la superación personal."
  },
  "Abraza A La Niña Que Fuiste": {
    genre: "Psicología & Autocuidado Emocional",
    synopsis: "Marta Segrelles ofrece una guía terapéutica y compasiva para reconectar con el niño interior y sanar las heridas del apego y los traumas de la infancia que condicionan la vida adulta. Con ejercicios prácticos y explicaciones claras, invita a transformar la autocrítica en autocompasión y límites saludables.",
    recommendedFor: "Quienes desean trabajar en su autoestima, sanar heridas del pasado, regular sus emociones y construir una relación amorosa consigo mismos."
  },
  "Actúa Como Dama Pero Piensa Como Hombre": {
    genre: "Relaciones & Autoayuda",
    synopsis: "Steve Harvey comparte con humor, franqueza y perspectiva masculina cómo piensan y operan los hombres en el ámbito de las citas, el compromiso y las relaciones de pareja. Ofrece consejos directos para comprender las expectativas masculinas y establecer estándares claros en el amor.",
    recommendedFor: "Lectores interesados en comprender las dinámicas de pareja, la comunicación afectiva y el autovalor en las relaciones sentimentales."
  },
  "Alas Ónix, Alas De Hierro, Alas De Sangre": {
    genre: "Fantasía Épica / Romantasy",
    synopsis: "Ambientada en el implacable Colegio de Guerra de Basgiath, la saga sigue a Violet Sorrengail mientras sobrevive al brutal entrenamiento de jinetes de dragones, a traiciones políticas y a una atracción magnética y peligrosa con Xaden Riorson en medio de una guerra que amenaza con destruir el continente.",
    recommendedFor: "Fans de la fantasía con dragones, academias militares letales, giros argumentales vertiginosos y romances apasionados y oscuros."
  },
  "Aprendiendo A Amarme": {
    genre: "Autoestima & Crecimiento Espiritual",
    synopsis: "Sara Espejo plantea un viaje introspectivo hacia la reconciliación con uno mismo, desmantelando la necesidad de aprobación externa y los patrones de dependencia afectiva. Un libro lleno de reflexiones cálidas que devuelven el poder personal a quien lo lee.",
    recommendedFor: "Personas que buscan fortalecer su amor propio, superar rupturas y cultivar una paz interior duradera e inquebrantable."
  },
  "Boulevard": {
    genre: "Romance Juvenil / Drama",
    synopsis: "La conmovedora historia de Luke Howland, un chico atormentado por su pasado, y Hasley Weigel, una joven optimista pero desordenada. En el callejón de los sueños y las almas rotas, ambos construirán un refugio mutuo que cambiará sus destinos para siempre.",
    recommendedFor: "Lectores juveniles que disfrutan del romance emotivo, las historias 'enemies-to-lovers' con vulnerabilidad y los dramas que tocan el corazón."
  },
  "Burlar Al Diablo": {
    genre: "Mentalidad de Éxito & Filosofía Personal",
    synopsis: "Escrito en 1938 y censurado durante décadas, Napoleon Hill desglosa una conversación alegórica y penetrante con 'el Diablo', desenmascarando las trampas mentales universales: el miedo, la duda, la procrastinación y la deriva psicológica que impiden a las personas alcanzar su verdadero potencial.",
    recommendedFor: "Emprendedores, estudiantes y profesionales que buscan eliminar el autosabotaje y dominar su mentalidad frente a la adversidad."
  },
  "Camino Hacia La Riqueza En Acción": {
    genre: "Finanzas Personales & Emprendimiento",
    synopsis: "Brian Tracy condensa principios universales de acumulación de riqueza, gestión del tiempo y desarrollo de competencias de alto valor. Un manual práctico para transformar las intenciones financieras en acciones disciplinadas de ejecución diaria.",
    recommendedFor: "Emprendedores y profesionales decididos a construir libertad financiera mediante hábitos de ahorro, inversión y productividad."
  },
  "Cartas A Lucilo": {
    genre: "Filosofía Clásica / Estoicismo",
    synopsis: "La correspondencia inmortal del filósofo romano Séneca a su discípulo Lucilio, donde aborda temas cruciales como la brevedad de la vida, el valor de la amistad, el control de las pasiones, el desapego material y la serenidad ante la muerte.",
    recommendedFor: "Amantes de la filosofía clásica, el pensamiento crítico y la búsqueda de una vida virtuosa y con propósito."
  },
  "Céntrate": {
    genre: "Productividad & Gestión del Tiempo",
    synopsis: "Cal Newport introduce el concepto de 'Deep Work' (trabajo profundo), demostrando que la habilidad de concentrarse sin distracciones en tareas complejas es la superpotencia definitiva en la economía contemporánea hiperconectada y ruidosa.",
    recommendedFor: "Estudiantes, creativos y profesionales del conocimiento que desean multiplicar su rendimiento y eliminar la dispersión digital."
  },
  "Charlas Ted": {
    genre: "Comunicación & Oratoria",
    synopsis: "Chris Anderson, director de TED, revela los secretos detrás de las presentaciones más memorables e impactantes del mundo. Enseña a estructurar ideas poderosas, conectar emocionalmente con la audiencia y comunicar con claridad y pasión.",
    recommendedFor: "Líderes, docentes, conferencistas y cualquier persona que necesite exponer proyectos o hablar en público con elocuencia e impacto."
  },
  "Cincuenta Sombras": {
    genre: "Romance Erótico / Ficción Contemporánea",
    synopsis: "El apasionado y complejo vínculo entre la estudiante universitaria Anastasia Steele y el enigmático multimillonario Christian Grey, cuyos oscuros secretos y singulares gustos amorosos pondrán a prueba los límites del deseo, la confianza y la entrega.",
    recommendedFor: "Lectores que disfrutan de las novelas románticas de alto voltaje, la tensión psicológica y las relaciones intensas."
  },
  "Circe": {
    genre: "Mitología Griega / Ficción Histórica",
    synopsis: "Madeline Miller reinventa con maestría lírica la vida de la diosa y hechicera Circe. Marginada por los dioses del Olimpo, es desterrada a la isla de Eea, donde descubre su poder botánico y mágico, desafiando a monstruos, héroes como Odiseo y al mismísimo destino.",
    recommendedFor: "Aficionados a la mitología clásica, la ficción literaria feminista y las narrativas de empoderamiento e introspección poética."
  },
  "Como Lideran Los Mejores Líderes": {
    genre: "Liderazgo & Gestión de Equipos",
    synopsis: "Brian Tracy identifica las cualidades, actitudes y métodos de los directivos más exitosos a nivel global. Aporta directrices claras sobre visión estratégica, motivación de personal, delegación efectiva y toma de decisiones bajo presión.",
    recommendedFor: "Gerentes, ejecutivos, directores de proyecto y personas que asumen roles de coordinación y liderazgo de grupos humanos."
  },
  "Como Mandar A La Mierda De Forma Educada": {
    genre: "Psicología & Asertividad",
    synopsis: "Alba Cardalda ofrece herramientas prácticas de comunicación asertiva y psicología conductual para aprender a decir 'no' sin culpa, marcar límites infranqueables y desactivar situaciones tóxicas en el entorno familiar, laboral y social.",
    recommendedFor: "Personas complacientes que sufren por la dificultad de poner límites y buscan ganar respeto y tranquilidad mental."
  },
  "Cómo Hacer Que Te Pasen Cosas Buenas": {
    genre: "Neurociencia & Salud Emocional",
    synopsis: "La psiquiatra Marian Rojas Estapé une neurociencia, psicología y medicina para explicar el impacto del cortisol y la actitud mental en la salud. Enseña a programar el sistema reticular activador del cerebro para atraer oportunidades y bienestar.",
    recommendedFor: "Quienes desean reducir la ansiedad, comprender la relación mente-cuerpo y enfocar su vida hacia el optimismo inteligente."
  },
  "Cómo Ser Un Estoico": {
    genre: "Filosofía Práctica / Filosofía Contemporánea",
    synopsis: "Massimo Pigliucci actualiza las enseñanzas de Epicteto para el siglo XXI, demostrando cómo la dicotomía del control, el coraje moral y la templanza pueden guiarnos a través de los dilemas modernos del trabajo, el amor y la sociedad.",
    recommendedFor: "Lectores racionales en busca de un marco ético sólido y sereno para navegar los desafíos cotidianos."
  },
  "Crea Tu Mente Millonaria": {
    genre: "Finanzas & Mentalidad Emprendedora",
    synopsis: "Mauricio Benoist expone los patrones de pensamiento limitantes sobre el dinero y enseña a reprogramar el subconsciente para adoptar la mentalidad de abundancia, riesgo calculado e inversión estratégica de los grandes empresarios.",
    recommendedFor: "Emprendedores y profesionales que quieren romper techos financieros y transformar su relación con el dinero."
  },
  "Crea Tu Riqueza Infinita": {
    genre: "Educación Financiera / Mentalidad de Abundancia",
    synopsis: "Harriet Hale Rix ofrece una visión integradora sobre cómo las leyes universales de la abundancia, la gratitud y la acción estratégica confluyen para generar prosperidad material y satisfacción espiritual.",
    recommendedFor: "Personas interesadas en el desarrollo personal, las leyes de manifestación y la mentalidad de prosperidad."
  },
  "Damian": {
    genre: "Thriller Psicológico / Ficción Juvenil",
    synopsis: "Una oscura y adictiva novela donde los secretos, los crímenes sin resolver y las relaciones perturbadoras se entrelazan. Padme Colins se ve envuelta en la misteriosa atmósfera que rodea a Damian, un joven fascinante y peligroso.",
    recommendedFor: "Lectores apasionados por el suspense, las intrigas psicológicas y las tramas juveniles llenas de tensión y giros inesperados."
  },
  "De Lukov Con Amor": {
    genre: "Romance Deportivo / Ficción Contemporánea",
    synopsis: "Mariana Zapata narra la rivalidad y romance a fuego lento entre Jasmine Santos e Ivan Lukov, dos patinadores artísticos de élite que deben convertirse en pareja sobre el hielo para conseguir su última oportunidad de alcanzar la gloria.",
    recommendedFor: "Amantes del subgénero 'enemies-to-lovers', el patinaje artístico y los romances con desarrollo emocional profundo y realista."
  },
  "Deja De Ser Tú": {
    genre: "Neurociencia & Física Cuántica Aplicada",
    synopsis: "El Dr. Joe Dispenza explica cómo los pensamientos y emociones generan circuitos neuronales y estados del ser automáticos. Proporciona técnicas de meditación guiada para desprogramar viejos patrones y crear una nueva realidad consciente.",
    recommendedFor: "Lectores interesados en la plasticidad cerebral, la meditación transformacional y la superación de bloqueos emocionales."
  },
  "Dejarás De Doler": {
    genre: "Poesía Contemporánea & Prosa Poética",
    synopsis: "Una recopilación conmovedora de versos y reflexiones sobre el desamor, el duelo afectivo, la reconstrucción del corazón roto y el renacimiento de la esperanza tras una despedida dolorosa.",
    recommendedFor: "Quienes atraviesan un proceso de desahogo emocional, sanación de una ruptura y redescubrimiento personal."
  },
  "Desbloquea Tu Mente Millonaria": {
    genre: "Mentalidad Financiera & Motivación",
    synopsis: "Julián S. Musa desentraña los bloqueos psicológicos y emocionales que sabotean el éxito económico, brindando pautas paso a paso para adoptar hábitos de riqueza, enfoque inquebrantable y acción masiva.",
    recommendedFor: "Emprendedores, inversionistas y soñadores dispuestos a construir negocios sólidos y mentalidades triunfadoras."
  },
  "Dioses En Neón": {
    genre: "Fantasía Urbana / Romantasy",
    synopsis: "Katee Robert reimagina el mito de la mitología clásica en una urbe futurista e implacable donde el poder, los pactos secretos, la ambición y la pasión desbordante dictan las reglas entre dioses caídos y mortales audaces.",
    recommendedFor: "Lectores de fantasía urbana, mitología adaptada a escenarios modernos y romances cargados de adrenalina."
  },
  "Disciplina Sin Lágrimas": {
    genre: "Crianza Respetuosa & Neuroeducación",
    synopsis: "Daniel J. Siegel y Tina Payne Bryson enseñan a los padres a educar y disciplinar comprendiendo el cerebro infantil en desarrollo. Ofrecen métodos prácticos para calmar rabietas, conectar antes de corregir y fomentar la empatía en los hijos.",
    recommendedFor: "Madres, padres, educadores y psicopedagogos comprometidos con una educación consciente, respetuosa y eficaz."
  },
  "El Arte De Cerrar La Venta": {
    genre: "Ventas & Negociación Comercial",
    synopsis: "Brian Tracy detalla técnicas comprobadas para superar objeciones, leer las señales de compra del cliente y concluir transacciones comerciales con solvencia, elegancia y profesionalismo.",
    recommendedFor: "Vendedores, ejecutivos comerciales, asesores y consultores que buscan optimizar sus ratios de conversión y ventas."
  },
  "El Arte De Hablar En Público": {
    genre: "Oratoria & Comunicación Persuasiva",
    synopsis: "El clásico indiscutible de Dale Carnegie que enseña a dominar el miedo escénico, estructurar discursos magnéticos, captar la atención de la audiencia y comunicar con seguridad y autoridad natural.",
    recommendedFor: "Cualquier persona que deba expresarse ante audiencias, reuniones ejecutivas, conferencias o defensas académicas."
  },
  "El Arte De La Guerra": {
    genre: "Estrategia Militar & Liderazgo Filosófico",
    synopsis: "El tratado milenario de Sun Tzu sobre la estrategia bélica, cuyos principios de conocimiento del adversario, adaptabilidad, economía de fuerzas y victoria sin combate son hoy referentes en los negocios, el deporte y la vida.",
    recommendedFor: "Líderes, directivos, estrategas, deportistas y amantes de los grandes clásicos de la sabiduría universal."
  },
  "El Arte De No Amargarse La Vida": {
    genre: "Psicología Cognitiva / Autoayuda",
    synopsis: "Rafael Santandreu (Santander) expone las claves de la terapia cognitivo-conductual para desactivar las creencias irracionales ('terribilitis') y alcanzar una solidez emocional a prueba de contratiempos.",
    recommendedFor: "Personas propensas a la preocupación excesiva, la ansiedad y el estrés que desean cultivar una mentalidad más libre y alegre."
  },
  "El Bosque Grimm": {
    genre: "Fantasía Oscura / Cuentos de Hadas",
    synopsis: "Kathryn Purdie teje una atmósfera mágica y siniestra donde una maldición ancestral acecha a una aldea rodeada por un bosque impenetrable. Secretos familiares, magia prohibida y peligros mortales aguardan entre las sombras.",
    recommendedFor: "Amantes de los 'retellings' oscuros inspirados en los hermanos Grimm y la fantasía gótica juvenil."
  },
  "El Camino Del Libertario": {
    genre: "Política & Ensayo Económico",
    synopsis: "Alberto Benegas Lynch expone los fundamentos éticos, económicos e institucionales del liberalismo clásico y el libre mercado, defendiendo la soberanía individual frente a la intervención estatal.",
    recommendedFor: "Interesados en las teorías económicas austriacas, la filosofía política de la libertad y el debate ideológico contemporáneo."
  },
  "El Club De Las 5 De La Mañana": {
    genre: "Desarrollo Personal & Rutinas de Éxito",
    synopsis: "Robin Sharma presenta una fábula transformadora sobre la importancia de madrugar y dedicar la primera hora del día al crecimiento personal, el ejercicio y la meditación mediante la fórmula 20/20/20.",
    recommendedFor: "Quienes desean revolucionar su energía matutina, mejorar su disciplina y alcanzar una productividad extraordinaria."
  },
  "El Club Del Olvido": {
    genre: "Romance Contemporáneo & Drama",
    synopsis: "Alice Kellen nos envuelve en una historia sobre la memoria, las segundas oportunidades y las cicatrices del alma, donde dos personas marcadas por el dolor intentan reencontrarse a sí mismas a través del amor y el perdón.",
    recommendedFor: "Lectores que adoran las novelas íntimas, poéticas y de gran sensibilidad sobre los lazos humanos."
  },
  "El Cuadrante Del Flujo Del Dinero": {
    genre: "Educación Financiera / Inversión",
    synopsis: "Robert Kiyosaki describe los cuatro cuadrantes que componen el mundo laboral y financiero: Empleado, Autoempleado, Dueño de negocio e Inversionista, mostrando la ruta exacta para migrar hacia los cuadrantes de ingresos pasivos.",
    recommendedFor: "Personas atrapadas en la rutina laboral que anhelan alcanzar la libertad financiera y crear activos perdurables."
  },
  "El Duelo": {
    genre: "Psicoanálisis & Ensayo Psicológico",
    synopsis: "Gabriel Rolón aborda el duelo como un territorio inevitable y profundamente humano. A través de casos clínicos y reflexiones profundas, acompaña al lector en el difícil proceso de reconstruirse tras la pérdida de un ser querido, un amor o un proyecto.",
    recommendedFor: "Quienes transitan pérdidas significativas o buscan comprender las complejidades del dolor y la sanación emocional."
  },
  "El Ego Es Tu Enemigo (Azul)": {
    genre: "Filosofía Práctica & Estoicismo Moderno",
    synopsis: "Ryan Holiday advierte cómo el ego distorsiona el juicio, sabotea el progreso y destruye las relaciones tanto en la cúspide del éxito como en los valles del fracaso. Plantea la humildad y el trabajo silencioso como antídotos.",
    recommendedFor: "Profesionales, creadores y líderes que desean mantenerse enfocados, humildes y resilientes a largo plazo."
  },
  "El Ego Es Tu Enemigo (Roja)": {
    genre: "Filosofía Práctica & Superación",
    synopsis: "Edición complementaria del influyente ensayo de Ryan Holiday donde se profundiza en las historias de líderes, artistas y deportistas históricos que conquistaron sus ambiciones dominando su ego y priorizando el dominio interior.",
    recommendedFor: "Lectores que valoran la sabiduría práctica, el autocontrol y el enfoque estratégico para una vida con propósito."
  },
  "El Extranjero": {
    genre: "Filosofía Existencialista / Clásico Literario",
    synopsis: "La icónica obra maestra de Albert Camus protagonizada por Meursault, un hombre que vive en un estado de indiferencia y extrañeza ante las convenciones sociales, la muerte de su madre y un fatídico crimen en las playas de Argel.",
    recommendedFor: "Amantes de la gran literatura universal, el existencialismo, la reflexión moral y la prosa concisa y penetrante."
  },
  "El Hombre En Busca Del Sentido": {
    genre: "Psicología Existencial / Memoria Histórica",
    synopsis: "El psiquiatra Viktor Frankl relata su experiencia como prisionero en los campos de concentración nazis y explica los fundamentos de la Logoterapia: la convicción de que el ser humano puede superar cualquier sufrimiento si encuentra un sentido a su vida.",
    recommendedFor: "Cualquier persona en búsqueda de propósito vital, resiliencia interior y fuerza espiritual frente a la adversidad."
  },
  "El Libro Prohibido De La Economía": {
    genre: "Divulgación Económica & Finanzas",
    synopsis: "Fernando Trías de Bes desmitifica con un estilo provocador y claro los secretos del sistema monetario, la inflación, las deudas estatales y el funcionamiento del dinero que los bancos no suelen explicar.",
    recommendedFor: "Ciudadanos curiosos que desean comprender la realidad económica global sin tecnicismos engorrosos."
  },
  "El Lugar Más Triste Del Mundo": {
    genre: "Ficción Contemporánea / Drama Juvenil",
    synopsis: "Kristopher Rodas explora los rincones de la soledad, el desamor y la búsqueda de identidad a través de personajes que enfrentan sus propios abismos emocionales en busca de una luz de redención.",
    recommendedFor: "Lectores jóvenes que conectan con historias introspectivas sobre salud mental y superación del dolor."
  },
  "El Método De Briones": {
    genre: "Productividad & Crecimiento Profesional",
    synopsis: "Beltrán Briones sistematiza una metodología probada de organización del trabajo, establecimiento de prioridades y disciplina mental para multiplicar resultados sin caer en el agotamiento.",
    recommendedFor: "Profesionales independientes, directores y emprendedores que buscan una estructura de trabajo eficiente."
  },
  "El Monje Que Vendió Su Ferrari": {
    genre: "Fábula Espiritual & Desarrollo Personal",
    synopsis: "La inspiradora historia de Julian Mantle, un abogado de éxito al borde del colapso que emprende un viaje a los Himalayas donde sabios monjes le revelan los siete principios eternos para una vida plena y equilibrada.",
    recommendedFor: "Quienes sienten el vacío del materialismo y buscan paz interior, equilibrio vital y claridad de propósito."
  },
  "El Negocio Del Siglo 21": {
    genre: "Emprendimiento & Modelos de Negocio",
    synopsis: "Robert Kiyosaki analiza por qué el marketing de redes y los modelos de negocio descentralizados representan una de las alternativas más accesibles para generar riqueza y desarrollar habilidades empresariales en el mundo moderno.",
    recommendedFor: "Personas interesadas en el emprendimiento en red, el liderazgo comercial y las fuentes de ingreso complementarias."
  },
  "El Nuevo Viaje De El Principito": {
    genre: "Fábula Poética & Crecimiento Espiritual",
    synopsis: "Eloy Moreno rinde un sentido homenaje al clásico universal de Saint-Exupéry, transportando la tierna mirada del Principito al mundo contemporáneo para reflexionar sobre la tecnología, la soledad y la autenticidad.",
    recommendedFor: "Lectores de todas las edades que valoran las fábulas filosóficas, la ternura y la sabiduría de lo esencial."
  },
  "El Obstáculo Es El Camino": {
    genre: "Estoicismo Aplicado & Liderazgo",
    synopsis: "Ryan Holiday toma la máxima estoica de Marco Aurelio para demostrar que los problemas, crisis y dificultades no son barreras que impiden el progreso, sino el combustible y la oportunidad para forjar un carácter superior.",
    recommendedFor: "Emprendedores, atletas y líderes que enfrentan momentos de crisis y buscan convertir reveses en triunfos."
  },
  "El Placebo Eres Tú": {
    genre: "Neurociencia, Biología & Mente Cuántica",
    synopsis: "El Dr. Joe Dispenza demuestra científicamente el poder de la mente para sanar el cuerpo. A través de estudios médicos y meditaciones guiadas, enseña a modificar la química cerebral y activar la respuesta biológica regenerativa.",
    recommendedFor: "Personas interesadas en la autocuración, la medicina integrativa y la reprogramación mental."
  },
  "El Plan De Marketing De 1 Página": {
    genre: "Marketing Estratégico & Negocios",
    synopsis: "Allan Dib simplifica el marketing para pequeñas y medianas empresas en un lienzo de nueve pasos. Enseña a captar clientes potenciales, nutrirlos sistemáticamente y convertirlos en compradores recurrentes.",
    recommendedFor: "Dueños de negocios, autónomos, agencias y freelancers que necesitan un plan de ventas claro y sin rodeos."
  },
  "El Poder De Confiar En Ti Mismo": {
    genre: "Autoestima & Logro de Objetivos",
    synopsis: "Brian Tracy enseña a erradicar el miedo al fracaso y a desarrollar una confianza inquebrantable que permita asumir riesgos audaces, superar límites autoimpuestos y conquistar cualquier meta.",
    recommendedFor: "Personas decididas a superar la inseguridad y dar un salto cualitativo en su vida personal y profesional."
  },
  "El Poder De Los Hábitos": {
    genre: "Psicología Conductual & Productividad",
    synopsis: "El periodista Charles Duhigg explora la ciencia detrás de la creación y modificación de hábitos individuales, corporativos y sociales. Desglosa el bucle señal-rutina-recompensa para cambiar conductas para siempre.",
    recommendedFor: "Todo aquel que quiera transformar hábitos negativos, optimizar su rendimiento y entender cómo funciona la mente humana."
  },
  "El Precio De La Pasión": {
    genre: "Psicoanálisis & Literatura",
    synopsis: "Gabriel Rolón se sumerge en los laberintos del deseo ardiente, la culpa, los amores prohibidos y las decisiones extremas que el ser humano toma cuando la pasión desborda la razón.",
    recommendedFor: "Lectores interesados en el análisis psicológico de los vínculos afectivos y la intensidad de las emociones humanas."
  },
  "El Principito": {
    genre: "Clásico Universal / Fábula Filosófica",
    synopsis: "La joya literaria de Antoine de Saint-Exupéry sobre un pequeño príncipe que viaja de asteroide en asteroide aprendiendo sobre la amistad, el amor por su rosa, el valor del tiempo y la gran verdad: lo esencial es invisible a los ojos.",
    recommendedFor: "Lectores de todas las edades que buscan recordar la pureza de la infancia y la belleza de las cosas sencillas."
  },
  "El Secreto De La Asistenta": {
    genre: "Thriller Psicológico / Suspense",
    synopsis: "Freida McFadden entrega una secuela vertiginosa llena de giros inesperados donde Millie, trabajando en un nuevo hogar adinerado, descubre que los secretos de la familia Garrick son mucho más oscuros y letales de lo que aparentan.",
    recommendedFor: "Fans de las novelas de suspense psicológico de ritmo acelerado y finales impactantes."
  },
  "El Viento Conoce Mi Nombre": {
    genre: "Novela Histórica & Ficción Contemporánea",
    synopsis: "Isabel Allende entrelaza dos historias conmovedoras: la de Samuel, un niño judío que escapa de la Viena nazi en 1938, y la de Anita, una niña salvadoreña separada de su madre en la frontera de EE. UU. en 2019.",
    recommendedFor: "Amantes de las sagas humanas de gran calado emocional sobre la memoria, la emigración y la resiliencia familiar."
  },
  "El Zorro": {
    genre: "Aventura Histórica / Ficción Literaria",
    synopsis: "Isabel Allende narra los orígenes legendarios de Diego de la Vega: su infancia en la California virreinal, su juventud en una España en guerra y su transformación en el justiciero enmascarado defensor de los desfavorecidos.",
    recommendedFor: "Lectores que disfrutan de las novelas de capa y espada, la acción de época y los relatos de aventuras cautivantes."
  },
  "Élite Plateada": {
    genre: "Fantasía Juvenil / Distopía",
    synopsis: "Dani Francis nos sumerge en una corte llena de privilegios, intrigas palaciegas y rebeliones silenciosas donde un grupo de jóvenes desafía el orden establecido para descubrir la verdad detrás del poder hereditario.",
    recommendedFor: "Jóvenes lectores atraídos por la fantasía de reinos, las conspiraciones cortesanas y las batallas épicas."
  },
  "Emprende Tu Propio Negocio": {
    genre: "Emprendimiento & Estrategia Comercial",
    synopsis: "Brian Tracy condensa las lecciones fundamentales para arrancar una empresa desde cero con mínimo capital, maximizando la rentabilidad y reduciendo drásticamente los riesgos de fracaso inicial.",
    recommendedFor: "Nuevos emprendedores y personas con ideas de negocio que desean lanzarse al mercado con pasos firmes."
  },
  "Encuentra Tu Persona Vitamina": {
    genre: "Psicología Afectiva & Bienestar",
    synopsis: "Marian Rojas Estapé analiza el impacto de la oxitocina y las relaciones afectivas saludables en nuestra vida. Enseña a identificar personas que potencian nuestro bienestar y a poner distancia con vínculos tóxicos.",
    recommendedFor: "Quienes buscan mejorar la calidad de sus relaciones personales, familiares y de pareja."
  },
  "Encuentros El Lado B Del Amor": {
    genre: "Psicoanálisis & Vínculos de Pareja",
    synopsis: "Gabriel Rolón desmitifica el amor romántico tradicional y examina sus aristas complejas: los celos, la infidelidad, el desamor y la ilusión de completud, proponiendo amar desde la lucidez y la aceptación de la falta.",
    recommendedFor: "Lectores que quieren cuestionar los mitos del amor y construir vínculos de pareja más reales y maduros."
  },
  "Eres Lo Que Piensas": {
    genre: "Crecimiento Personal & Espiritualidad",
    synopsis: "Wayne Dyer profundiza en el poder creativo del pensamiento consciente y la intención para erradicar las creencias limitantes y manifestar una vida llena de paz, armonía y realizaciones personales.",
    recommendedFor: "Buscadores de desarrollo espiritual, paz mental y alineación con su verdadero potencial."
  },
  "Escape": {
    genre: "Terror / Suspense Psicológico",
    synopsis: "Ángel David Revilla (Dross) sumerge al lector en una pesadilla claustrofóbica donde la locura, el miedo a lo desconocido y los horrores de la mente humana desdibujan la línea entre la realidad y la alucinación.",
    recommendedFor: "Aficionados al terror psicológico, las atmósferas opresivas y el suspense sobrenatural."
  },
  "Este Dolor No Es Mío": {
    genre: "Psicología Sistémica & Trauma Transgeneracional",
    synopsis: "Mark Wolynn expone cómo los traumas no resueltos de padres y abuelos pueden transmitirse a través del lenguaje, las emociones y la epigenética, ofreciendo el enfoque del Lenguaje Nuclear para sanar patrones heredados.",
    recommendedFor: "Personas que luchan contra fobias, depresión, dolores crónicos o patrones repetitivos sin causa aparente."
  },
  "Eufr, El Secreto Mejor Guardado": {
    genre: "Misterio & Novela Juvenil",
    synopsis: "Barbara Anielo nos adentra en una apasionante trama donde enigmas ancestrales, pistas ocultas y un grupo de jóvenes intrépidos desentrañan un secreto que podría cambiar la historia de su comunidad.",
    recommendedFor: "Jóvenes y adolescentes aficionados a las historias de misterio, aventuras arqueológicas y enigmas."
  },
  "Frankenstein": {
    genre: "Clásico Gótico / Ciencia Ficción",
    synopsis: "La legendaria obra cumbre de Mary Shelley sobre el ambicioso científico Víctor Frankenstein, quien desafía las leyes de la naturaleza dando vida a una criatura creada con fragmentos cadavéricos, desencadenando una tragedia sobre la soledad y la responsabilidad.",
    recommendedFor: "Amantes de la literatura gótica, la ciencia ficción clásica y los debates éticos sobre la ambición humana."
  },
  "Gravity Falls": {
    genre: "Misterio & Aventura Juvenil / Humor",
    synopsis: "Las fascinantes crónicas y misterios sobrenaturales del pintoresco pueblo de Gravity Falls, Oregon, donde los diarios secretos y las criaturas insólitas desafían el ingenio de quienes se atreven a explorarlos.",
    recommendedFor: "Fanáticos del misterio, el humor fantástico y los acertijos de las leyendas urbanas."
  },
  "Hábitos Atómicos": {
    genre: "Desarrollo Personal & Productividad",
    synopsis: "James Clear expone un marco práctico y científicamente fundamentado para mejorar un 1% cada día. Demuestra que los cambios monumentales provienen de la acumulación de pequeñas decisiones diarias bien estructuradas.",
    recommendedFor: "Cualquiera que desee eliminar la pereza, instaurar hábitos saludables y alcanzar metas ambiciosas con constancia."
  },
  "Has Llamado A Sam": {
    genre: "Ficción Romántica & Realismo Mágico",
    synopsis: "Dustin Thao conmueve con la historia de Julie, quien tras la repentina muerte de su novio Sam, llama desesperada a su buzón de voz para escuchar su voz... y sorprendentemente Sam contesta desde el más allá.",
    recommendedFor: "Lectores sensibles que aprecian los dramas románticos que abordan el duelo y las despedidas pendientes."
  },
  "Hasta Que Salga La Luna": {
    genre: "Romance Sobrenatural & Fantasía",
    synopsis: "Sarah A. Parker teje un universo cautivador de magia ancestral, peligros latentes y un romance prohibido e indomable entre seres predestinados a chocar bajo la luz de la luna.",
    recommendedFor: "Lectores de romance fantástico con criaturas mágicas, tensión creciente y batallas de poder."
  },
  "Hauting Adeline": {
    genre: "Dark Romance / Thriller Oscuro",
    synopsis: "H.D. Carlton presenta una historia intensa y controvertida donde una exitosa escritora se convierte en la obsesión de un misterioso vigilante que la acecha en las sombras mientras ambos descubren una oscura red criminal.",
    recommendedFor: "Lectores adultos aficionados al Dark Romance, el misterio criminal y las emociones al límite."
  },
  "Hooked": {
    genre: "Dark Romance / Retelling",
    synopsis: "Emily McIntire reimagina el cuento de Peter Pan en clave contemporánea y oscura: James es un hombre implacable que busca venganza contra su peor enemigo utilizando a Wendy, la inocente hija de este, desatando una pasión letal.",
    recommendedFor: "Fans de los retellings oscuros para adultos, romances con antihéroes y villanos seductores."
  },
  "Invierte En Ti": {
    genre: "Finanzas Personales & Economía Práctica",
    synopsis: "Natalia de Santiago explica con humor, cercanía y cero jerga financiera cómo organizar el presupuesto mensual, ahorrar sin sufrir, entender las hipotecas y empezar a invertir de forma inteligente.",
    recommendedFor: "Jóvenes y adultos que quieren ordenar su economía doméstica y construir tranquilidad para su futuro."
  },
  "Invisible": {
    genre: "Ficción Contemporánea / Drama Social",
    synopsis: "Eloy Moreno conmueve con la historia de un niño que adquiere el poder de ser invisible. Una novela estremecedora que retrata con crudeza y sensibilidad la realidad del acoso escolar y la indiferencia de los demás.",
    recommendedFor: "Jóvenes, padres, docentes y cualquier lector conmovido por los relatos de empatía y compromiso social."
  },
  "Javier Milei": {
    genre: "Ensayo Político & Económico",
    synopsis: "El economista Juan Ramón Rallo analiza de manera rigurosa las propuestas, teorías y fundamentos de la escuela austriaca y el anarcocapitalismo representados por Javier Milei en el escenario político hispanoamericano.",
    recommendedFor: "Interesados en la política internacional, la economía de libre mercado y las transformaciones sociopolíticas actuales."
  },
  "La Actitud Mental Positiva": {
    genre: "Éxito Personal & Psicología del Logro",
    synopsis: "Napoleon Hill y W. Clement Stone muestran cómo la Actitud Mental Positiva es el catalizador indispensable para transformar cualquier dificultad en una oportunidad de éxito, salud y prosperidad.",
    recommendedFor: "Personas que buscan cultivar optimismo, perseverancia inquebrantable y determinación para triunfar."
  },
  "La Bailarina De Auschwitz": {
    genre: "Memorias / Psicología & Superación",
    synopsis: "La desgarradora y luminosa autobiografía de Edith Eger, quien sobrevivió a los horrores del campo de exterminio de Auschwitz gracias a su valentía y más tarde se convirtió en una renombrada terapeuta especializada en traumas.",
    recommendedFor: "Lectores inspirados por testimonios de superación humana, perdón, resiliencia y libertad interior."
  },
  "La Batalla Cultural": {
    genre: "Ensayo Político & Sociología",
    synopsis: "Agustín Laje analiza los frentes ideológicos, mediáticos, educativos y lingüísticos de la política contemporánea, llamando a dar la batalla por los valores de la libertad, la tradición y la soberanía individual.",
    recommendedFor: "Lectores interesados en el debate sociopolítico, la filosofía contemporánea y la crítica cultural."
  },
  "La Biblia Del Vendedor": {
    genre: "Ventas & Negociación Comercial",
    synopsis: "Alex Dey entrega un compendio exhaustivo de técnicas de prospección, argumentación, manejo de objeciones y cierres maestros para convertir a cualquier persona en un vendedor estrella de alto rendimiento.",
    recommendedFor: "Profesionales comerciales, agentes inmobiliarios, asesores de seguros y emprendedores de ventas."
  },
  "La Biblioteca De La Medianoche": {
    genre: "Ficción Filosófica / Realismo Mágico",
    synopsis: "Matt Haig nos presenta a Nora Seed, quien en el límite de su vida encuentra una biblioteca mágica donde cada libro le permite experimentar las vidas alternativas que habría vivido si hubiera tomado decisiones distintas.",
    recommendedFor: "Quienes reflexionan sobre los 'qué hubiera pasado', el perdón hacia uno mismo y el valor de vivir el presente."
  },
  "La Casa De Los Espíritus": {
    genre: "Realismo Mágico / Novela Histórica",
    synopsis: "La deslumbrante saga de la familia Trueba a lo largo de cuatro generaciones en un país latinoamericano sin nombre, entrelazando pasiones tempestuosas, clarividencia y los grandes cataclismos políticos de la época.",
    recommendedFor: "Amantes de la gran literatura latinoamericana, el realismo mágico y las sagas familiares inolvidables."
  },
  "La Escuela De Negocios": {
    genre: "Educación Financiera & Emprendimiento",
    synopsis: "Robert Kiyosaki expone los valores ocultos de las empresas de mercadeo en red más allá del dinero: el desarrollo del liderazgo personal, la oratoria, la resiliencia y la construcción de redes de contactos.",
    recommendedFor: "Emprendedores interesados en desarrollar habilidades blandas y modelos colaborativos de negocio."
  },
  "La Felicidad": {
    genre: "Psicología & Crecimiento Personal",
    synopsis: "Marian Rojas Estapé desglosa los componentes neurobiológicos y emocionales de la felicidad auténtica, enseñando a gestionar las expectativas, sanar heridas y encontrar sentido en lo cotidiano.",
    recommendedFor: "Personas en búsqueda de serenidad, bienestar mental y una vida más plena y conectada."
  },
  "La Magia De Pensar En Grande": {
    genre: "Desarrollo Personal & Liderazgo",
    synopsis: "El Dr. David J. Schwartz demuestra que el éxito y la prosperidad no dependen del talento innato, sino del tamaño de nuestros pensamientos y de la firmeza con que desterramos la mediocridad y las excusas.",
    recommendedFor: "Profesionales, estudiantes y soñadores que desean elevar sus aspiraciones y conquistar metas audaces."
  },
  "La Psicología Del Dinero": {
    genre: "Finanzas Conductuales & Economía",
    synopsis: "Morgan Housel revela que la manera en que manejamos el dinero tiene poco que ver con las matemáticas y mucho con la psicología, el orgullo, la paciencia y las emociones humanas a lo largo del tiempo.",
    recommendedFor: "Inversionistas, ahorristas y cualquier persona que quiera tomar decisiones financieras sabias y sin estrés."
  },
  "La Regla De Oro De Los Negocios": {
    genre: "Productividad & Ventas Exponenciales",
    synopsis: "Grant Cardone expone el principio 10X: para alcanzar el éxito masivo es necesario fijar metas diez veces más altas y ejecutar diez veces más acciones de lo que la mayoría considera prudente.",
    recommendedFor: "Emprendedores ambiciosos y vendedores que quieren dominar su mercado y multiplicar sus resultados."
  },
  "La República Del Dragón": {
    genre: "Fantasía Épica / Ficción Militar",
    synopsis: "R.F. Kuang continúa la aclamada trilogía con Rin sumida en la culpa y la sed de venganza tras la guerra, aliándose con los rebeldes de la República del Dragón para derrocar a la despiadada Emperatriz de Nikan.",
    recommendedFor: "Lectores de fantasía oscura y militar con trasfondo histórico asiático y dilemas morales complejos."
  },
  "La Respuesta Está En Ti": {
    genre: "Psicología & Autoconocimiento",
    synopsis: "Una obra inspiradora de Marian Rojas Estapé que invita a la introspección honesta, enseñando a escuchar nuestras señales corporales y emocionales para tomar decisiones alineadas con nuestros valores.",
    recommendedFor: "Quienes buscan autocomprensión, madurez afectiva y paz mental ante encrucijadas vitales."
  },
  "La Riqueza Que El Dinero No Puede Comprar": {
    genre: "Filosofía de Vida & Éxito Integral",
    synopsis: "Robin Sharma propone un nuevo paradigma de riqueza fundamentado en ocho hábitos diarios: salud, familia, artesanía profesional, sabiduría interior y contribución generosa a la comunidad.",
    recommendedFor: "Personas que buscan un éxito integral y una vida rica en experiencias, relaciones y propósito."
  },
  "La Soledad": {
    genre: "Psicoanálisis & Ensayo Filosófico",
    synopsis: "Gabriel Rolón indaga en las múltiples dimensiones de la soledad: desde el doloroso aislamiento hasta la soledad fecunda y necesaria para el autoconocimiento, la creación artística y la libertad.",
    recommendedFor: "Lectores que desean reconciliarse con sus momentos de soledad y profundizar en el entendimiento de su mundo interior."
  },
  "La Vida De Las Marionetas": {
    genre: "Ciencia Ficción Fantástica / Relato Conmovedor",
    synopsis: "T.J. Klune narra la entrañable historia de Victor Lawson, un humano criado en un bosque remoto por androides peculiares y entrañables, quien debe emprender un peligroso viaje para rescatar a su figura paterna robótica.",
    recommendedFor: "Amantes de las historias cálidas y emotivas que celebran la familia elegida, la empatía y la bondad."
  },
  "La Voz Ausente": {
    genre: "Thriller Psicoanalítico / Ficción Policial",
    synopsis: "El psicoanalista Pablo Rouviot se niega a aceptar el supuesto suicidio de su mejor amigo y colega, adentrándose en una peligrosa investigación policial y psicológica donde nada es lo que parece.",
    recommendedFor: "Aficionados a las novelas de suspense psicológico, intriga policial y tramas inteligentes."
  },
  "Las 38 Cartas De Rockefeller": {
    genre: "Finanzas & Consejos de Vida Empresarial",
    synopsis: "Las cartas íntimas y sabias que el magnate petrolero John D. Rockefeller escribió a su hijo, transmitiéndole principios invaluables sobre la ética de trabajo, el valor del dinero y el carácter frente a la adversidad.",
    recommendedFor: "Líderes, padres, empresarios y jóvenes que valoran las lecciones históricas de éxito y disciplina."
  },
  "Las Leyes Del Poder": {
    genre: "Liderazgo & Estrategia Personal",
    synopsis: "Brian Tracy analiza las leyes inmutables que rigen la influencia, el prestigio y el poder personal y profesional en las organizaciones, brindando pautas éticas para ganar autoridad y respeto.",
    recommendedFor: "Ejecutivos, directivos y líderes que buscan consolidar su influencia y reputación."
  },
  "Las Palabras Que Jamás Dije": {
    genre: "Poesía Emocional & Prosa Poética",
    synopsis: "Isabelle Miumiu recoge cartas no enviadas, pensamientos nocturnos y confesiones íntimas sobre el amor no correspondido, la vulnerabilidad y la liberación que surge al poner en palabras lo callado.",
    recommendedFor: "Jóvenes lectores que buscan refugio poético y desahogo para sus sentimientos más profundos."
  },
  "Lascivia": {
    genre: "Dark Romance / Ficción Pasional",
    synopsis: "Eva Muñoz atrapa a los lectores en una vorágine de secretos militares, poder y seducción prohibida entre Rachel James y el implacable coronel Christopher Morgan dentro de un juego de dominación y deseo ardiente.",
    recommendedFor: "Aficionados al romance oscuro, las historias de amor militar y las pasiones intensas."
  },
  "Libro De La Sabiduría": {
    genre: "Filosofía Hermética & Espiritualidad",
    synopsis: "Harry B. Joseph condensa conocimientos esotéricos, correspondencias universales y principios herméticos sobre la fisiología oculta y la conexión entre la mente cósmica y el cuerpo humano.",
    recommendedFor: "Estudiosos de la filosofía hermética, el simbolismo esotérico y las leyes universales."
  },
  "Lo Bueno De Tener Un Mal Dia": {
    genre: "Psicología & Gestión Emocional",
    synopsis: "La psiquiatra Anabel González explica cómo normalizar las emociones difíciles como la tristeza o el enfado, utilizándolas como aliadas para la autorregulación y el crecimiento personal en lugar de reprimirlas.",
    recommendedFor: "Personas que buscan herramientas prácticas para gestionar el malestar emocional y la autoexigencia."
  },
  "Lo Mejor Y Lo Peor De Internet": {
    genre: "Cultura Digital & Humor / Crónica",
    synopsis: "Una crónica entretenida e incisiva sobre la evolución de las redes sociales, los fenómenos virales, los memes y el impacto sociológico de la vida hiperconectada en nuestra psicología diaria.",
    recommendedFor: "Nativos digitales, creadores de contenido y curiosos de las dinámicas de internet."
  },
  "Los Compás Y El Despertar De La Momia": {
    genre: "Aventura Infantil / Humor Gráfico",
    synopsis: "Mikecrack, El Trollino y Timba Vk se embarcan en una divertida y alocada expedición a Egipto donde despertarán accidentalmente una momia milenaria y deberán resolver enigmas para salvar el día.",
    recommendedFor: "Niños y preadolescentes fanáticos del humor, los cómics dinámicos y las aventuras de YouTube."
  },
  "Luna De Plutón": {
    genre: "Fantasía Épica & Ciencia Ficción",
    synopsis: "Ángel David Revilla (Dross) construye un universo fantástico con reinos lejanos, guerras interplanetarias, magia y profecías donde seres insólitos luchan por el destino de su mundo.",
    recommendedFor: "Lectores de fantasía épica juvenil, batallas mágicas e historias llenas de acción e imaginación."
  },
  "Make Time": {
    genre: "Productividad & Minimalismo Digital",
    synopsis: "Jake Knapp y John Zeratsky (creadores del Design Sprint en Google) proponen un sistema simple de 4 pasos diarios para frenar el piloto automático, elegir un 'Highlight' y enfocarse en lo que de verdad importa.",
    recommendedFor: "Personas abrumadas por la hiperconectividad que desean recuperar el control de su tiempo y energía."
  },
  "Manos A La Obra": {
    genre: "Eficacia Personal & Gestión del Tiempo",
    synopsis: "Brian Tracy enseña a eliminar la postergación, organizar las tareas por su verdadero impacto económico y ejecutar con disciplina para duplicar los resultados en la mitad de tiempo.",
    recommendedFor: "Profesionales y estudiantes con tendencia a la procrastinación que necesitan método y enfoque."
  },
  "Más Que Rivales": {
    genre: "Romance Deportivo / Ficción LGBTQ+",
    synopsis: "Rachel Reid narra el romance secreto y apasionado entre dos estrellas rivales de la liga profesional de hockey sobre hielo: Shane Hollander e Ilya Rozanov, quienes deben conciliar su amor con la presión deportiva.",
    recommendedFor: "Lectores de romance deportivo, tramas 'rivales a amantes' y narrativas de visibilidad e inclusión afectiva."
  },
  "Mentalidad Mamba": {
    genre: "Autobiografía / Deporte & Superación",
    synopsis: "La leyenda del baloncesto Kobe Bryant revela los secretos de su mentalidad implacable: la disciplina obsesiva, la preparación técnica y la resiliencia mental que lo llevaron a la cima de la NBA.",
    recommendedFor: "Deportistas, competidores, líderes y cualquier persona que persiga la excelencia absoluta en su campo."
  },
  "Meses": {
    genre: "Romance Juvenil / Ficción Emocional",
    synopsis: "Joana Marcus retrata con frescura y sensibilidad los vaivenes emocionales, las dudas y los descubrimientos del primer amor juvenil a lo largo de los meses más decisivos de la adolescencia.",
    recommendedFor: "Jóvenes y adolescentes seguidores de los grandes fenómenos de la literatura romántica contemporánea."
  },
  "Metabolismo Ultra Poderoso": {
    genre: "Salud, Nutrición & Bienestar",
    synopsis: "Frank Suárez ofrece las pautas definitivas para reactivar el metabolismo lento, vencer la resistencia a la pérdida de peso, equilibrar el sistema hormonal y recuperar la energía vital.",
    recommendedFor: "Quienes buscan mejorar su salud física, entender su cuerpo y adoptar un estilo de vida saludable."
  },
  "Metas": {
    genre: "Desarrollo Personal & Éxito Estratégico",
    synopsis: "Brian Tracy presenta un sistema de 21 pasos comprobado para fijar objetivos claros y alcanzables, reprogramar el subconsciente y perseverar hasta materializar los sueños más ambiciosos.",
    recommendedFor: "Cualquier persona que necesite un plan de acción riguroso para transformar intenciones en realidades."
  },
  "Mi Nombre Es Emilia Del Valle": {
    genre: "Ficción Histórica & Femenina",
    synopsis: "Isabel Allende da vida a una inolvidable protagonista que desafía los prejuicios de su época para forjar su propio destino a través de la pasión, el arte y la fuerza inquebrantable de sus convicciones.",
    recommendedFor: "Lectores amantes de las protagonistas valientes y la narrativa histórica conmovedora."
  },
  "Mi Psicóloga Me Dijo": {
    genre: "Salud Mental & Autocompasión",
    synopsis: "Katherine Mayer recopila reflexiones terapéuticas directas y reconfortantes sobre la gestión de la ansiedad, el síndrome del impostor, los apegos afectivos y la importancia de validar las propias emociones.",
    recommendedFor: "Personas que buscan un acompañamiento cálido y desestigmatizado en su camino hacia el bienestar mental."
  },
  "Mil Besos Tuyos": {
    genre: "Romance Juvenil / Drama Inolvidable",
    synopsis: "Tillie Cole conmueve con la tierna e intensa historia de Poppy y Rune, dos almas gemelas que desde niños juraron recolectar mil besos de ensueño en un frasco, enfrentándose luego a una prueba desgarradora.",
    recommendedFor: "Lectores románticos dispuestos a emocionarse profundamente con una historia de amor puro y eterno."
  },
  "Neuro Oratoria": {
    genre: "Neurociencias & Comunicación Persuasiva",
    synopsis: "Jürgen Klarić revela cómo opera el cerebro humano ante los estímulos verbales y no verbales, enseñando a conectar con la mente del público y persuadir con técnicas basadas en la neurociencia.",
    recommendedFor: "Oradores, conferencistas, formadores y vendedores que buscan maximizar el impacto de su comunicación."
  },
  "No Me Puedes Lastimar": {
    genre: "Autobiografía & Resiliencia Mental Extrema",
    synopsis: "David Goggins comparte su asombrosa transformación de un joven traumatizado y con sobrepeso a un Navy SEAL de élite y plusmarquista mundial de ultrafondo mediante la 'Regla del 40%' y el callo mental.",
    recommendedFor: "Quienes necesitan un choque de disciplina radical, superación de límites y fortaleza psicológica."
  },
  "No Te Creas Todo Lo Que Piensas": {
    genre: "Psicología & Paz Interior",
    synopsis: "Joseph Nguyen desentraña la causa raíz del sufrimiento humano: la sobrecarga del pensamiento excesivo. Enseña a experimentar la vida desde la consciencia plena y el silencio mental.",
    recommendedFor: "Personas atrapadas en el sobrepensamiento, la rumiación obsesiva y la ansiedad cotidiana."
  },
  "Nosotros En La Luna": {
    genre: "Romance Contemporáneo & Búsqueda Personal",
    synopsis: "Alice Kellen narra el mágico encuentro en París entre Ginger y Rhys, dos desconocidos con vidas dispares que sellan un pacto de correos electrónicos bajo la luna, explorando qué significa encontrar el propio camino.",
    recommendedFor: "Amantes de las historias románticas con viajes, introspección poética y diálogos que dejan huella."
  },
  "Nunca Terminar": {
    genre: "Desarrollo Personal & Filosofía de Superación",
    synopsis: "David Goggins profundiza en su filosofía de evolución continua, demostrando que la construcción de la grandeza no tiene línea de meta y que cada logro es sólo el punto de partida para el siguiente nivel.",
    recommendedFor: "Lectores inspirados por los desafíos extremos y la búsqueda incansable del máximo potencial humano."
  },
  "Orgullo Y Prejuicio": {
    genre: "Clásico Literario / Romance de Época",
    synopsis: "La inmortal obra cumbre de Jane Austen que narra la compleja relación entre la inteligente e independiente Elizabeth Bennet y el altivo señor Darcy, en una brillante sátira sobre la sociedad inglesa del siglo XIX.",
    recommendedFor: "Amantes de la literatura clásica universal, los romances ingeniosos y la agudeza psicológica."
  },
  "Padre Rico, Padre Pobre": {
    genre: "Educación Financiera / Bestseller Mundial",
    synopsis: "Robert Kiyosaki contrasta las lecciones financieras de su padre biológico con las de su padre mentor, derribando el mito de que se necesita un ingreso elevado para hacerse rico y explicando cómo adquirir activos.",
    recommendedFor: "Cualquier persona que desee iniciar su educación financiera y transformar su visión sobre el dinero."
  },
  "Piense Y Hágase Rico": {
    genre: "Filosofía del Éxito & Crecimiento Personal",
    synopsis: "El fruto de más de veinte años de estudio de Napoleon Hill sobre las personas más ricas del mundo, sintetizado en trece principios fundamentales de deseo ardiente, fe inquebrantable y mente maestra.",
    recommendedFor: "Emprendedores, inversores y líderes que buscan las leyes atemporales del éxito material y personal."
  },
  "Por Qué Caminar Cuando Puedes Volar": {
    genre: "Espiritualidad Práctica & Crecimiento Interior",
    synopsis: "Brian Tracy presenta métodos sencillos para elevar la vibración emocional, disolver rencores del pasado y volar alto hacia la plenitud afectiva y espiritual.",
    recommendedFor: "Personas en búsqueda de paz interior, perdón y desahogo de ataduras del pasado."
  },
  "Por Qué Los Ricos Se Vuelven Más Ricos": {
    genre: "Finanzas Avanzadas & Economía Global",
    synopsis: "Robert Kiyosaki y Tom Wheelwright profundizan en las leyes fiscales, la deuda inteligente y las estrategias de inversión que permiten a los grandes patrimonios prosperar en cualquier ciclo económico.",
    recommendedFor: "Inversores y dueños de negocio que desean optimizar sus impuestos y apalancar su crecimiento."
  },
  "Psicología De Ventas": {
    genre: "Ventas & Psicología de la Persuasión",
    synopsis: "Brian Tracy explica cómo los factores psicológicos y las emociones dominan las decisiones de compra, enseñando a programar la mente para el éxito y generar confianza instantánea en los clientes.",
    recommendedFor: "Profesionales comerciales que buscan entender la mente del comprador y cerrar ventas de forma ética."
  },
  "Querida Mama: Me Dueles": {
    genre: "Psicoterapia & Vínculos Maternos",
    synopsis: "Marta Segrelles ofrece un espacio seguro para analizar y sanar las relaciones maternofiliales complejas o dañinas, permitiendo validar el propio dolor y construir una identidad libre de culpas.",
    recommendedFor: "Quienes necesitan sanar el vínculo materno y reparar las heridas emocionales de su crianza."
  },
  "Querido Yo": {
    genre: "Crecimiento Personal & Prosa Poética",
    synopsis: "Alejandro Sequera Pinto comparte una serie de cartas íntimas de reconciliación con uno mismo, recordándonos que los tropiezos son parte del camino y que merecemos amarnos sin condiciones.",
    recommendedFor: "Jóvenes y adultos que transitan etapas de incertidumbre y necesitan palabras de consuelo y aliento."
  },
  "Quiero Que Sepas": {
    genre: "Ficción Emocional & Novela Juvenil",
    synopsis: "Anna Russo entrega un relato tierno y conmovedor sobre la valentía de expresar los sentimientos antes de que sea tarde, el valor de la empatía y la fuerza sanadora de los lazos familiares.",
    recommendedFor: "Lectores sensibles que aprecian las novelas familiares emotivas y esperanzadoras."
  },
  "Rebelión En La Granja": {
    genre: "Sátira Política / Fábula Clásica",
    synopsis: "George Orwell crea una genial alegoría donde los animales de la Granja Solar expulsan a los humanos para instaurar una sociedad igualitaria, sólo para ver cómo los cerdos pervierten los ideales y se convierten en nuevos tiranos.",
    recommendedFor: "Lectores de clásicos, interesados en la ciencia política, la sociología y la defensa de la libertad."
  },
  "Recupera Tu Mente, Reconquista Tu Vida": {
    genre: "Neurociencia & Salud Mental",
    synopsis: "Marian Rojas Estapé analiza los peligros de la sobreestimulación digital y la dopamina fácil, ofreciendo estrategias para recuperar la capacidad de concentración, el asombro y el equilibrio emocional.",
    recommendedFor: "Personas con fatiga mental, adicción a las pantallas o dificultad para concentrarse en la vida diaria."
  },
  "Redeeming": {
    genre: "Romance Juvenil / Drama",
    synopsis: "Chloe Walsh sumerge al lector en una historia apasionada de redención, lealtad y segundas oportunidades entre jóvenes deportistas marcados por secretos que amenazan con destruirlos.",
    recommendedFor: "Fanáticos de los romances juveniles intensos, las sagas deportivas y los dramas universitarios."
  },
  "Redes": {
    genre: "Ficción Contemporánea / Crítica Social",
    synopsis: "Eloy Moreno desentraña con crudeza el impacto de las redes sociales, los 'likes' y la búsqueda compulsiva de aprobación digital en la psicología de los adolescentes y sus familias.",
    recommendedFor: "Padres, educadores y jóvenes que desean reflexionar sobre el uso consciente de las tecnologías."
  },
  "Riverdale": {
    genre: "Misterio Juvenil / Thriller",
    synopsis: "Micol Ostow amplía el universo del célebre drama televisivo con misterios inéditos, rivalidades escolares y secretos oscuros que rodean a Archie, Betty, Veronica y Jughead.",
    recommendedFor: "Seguidores de la serie Riverdale y amantes del suspense juvenil ambientado en pueblos enigmáticos."
  },
  "Romper El Círculo": {
    genre: "Ficción Contemporánea / Romance y Superación",
    synopsis: "Colleen Hoover narra la impactante historia de Lily Bloom, una joven que lucha por romper con los patrones de abuso y violencia que presenció en su infancia mientras enfrenta una dolorosa encrucijada amorosa.",
    recommendedFor: "Lectores que valoran las novelas realistas, intensas y valientes sobre el amor propio y la fortaleza femenina."
  },
  "Rota Se Camina Mejor": {
    genre: "Psicología Emocional & Crónicas del Alma",
    synopsis: "Lorena Pronsky invita a desarmar el mandato de la perfección y aceptar la propia vulnerabilidad, mostrando que el dolor asumido con honestidad es el punto de partida para reconstruirse con dignidad.",
    recommendedFor: "Personas en procesos de duelo afectivo, reconstrucción personal y búsqueda de autenticidad."
  },
  "Scarred": {
    genre: "Dark Romance / Retelling",
    synopsis: "Emily McIntire reinventa el mito de El Rey León en clave contemporánea y oscura con Tristan, un príncipe marginado que conspira para derrocar a su hermano arrebatándole a su futura esposa.",
    recommendedFor: "Aficionados a los retellings picantes para adultos con intrigas palaciegas y romances prohibidos."
  },
  "Si No Te Amas Nadie Te Amara": {
    genre: "Autoestima & Relaciones Sanas",
    synopsis: "Jazmín Duarte aborda de forma directa la raíz de la dependencia afectiva y enseña a cultivar un amor propio innegociable antes de buscar la validación en una pareja.",
    recommendedFor: "Quienes desean fortalecer su autoestima y construir relaciones basadas en la igualdad y el respeto."
  },
  "Sigue Lloviendo": {
    genre: "Romance Contemporáneo & Drama",
    synopsis: "Alice Kellen relata la desgarradora y esperanzadora historia de Víctor y Sara, cuyo amor de juventud se quiebra tras una tragedia, explorando si el tiempo y el perdón pueden sanar un corazón roto.",
    recommendedFor: "Amantes de los dramas románticos intensos y poéticos sobre el dolor de la pérdida y las segundas oportunidades."
  },
  "Sobrenatural": {
    genre: "Neurociencia & Mística Cuántica",
    synopsis: "El Dr. Joe Dispenza enseña a acceder al campo unificado cuántico y activar centros energéticos superiores a través de meditaciones avanzadas para experimentar estados trascendentes de sanación y consciencia.",
    recommendedFor: "Buscadores de espiritualidad práctica, meditación avanzada y expansión de la consciencia."
  },
  "Te Espero En El Fin Del Mundo": {
    genre: "Romance Juvenil & Ficción Contemporánea",
    synopsis: "Andrea Longarela nos transporta a una historia mágica entre dos personas que crecieron juntas y cuyos caminos se separan y cruzan a lo largo de los años en busca de su propio lugar en el mundo.",
    recommendedFor: "Lectores que adoran las historias sobre el destino, la amistad incondicional y el amor verdadero."
  },
  "Tocando Fondo, Sana Desde Las Profundidades": {
    genre: "Superación Personal & Sanación Interior",
    synopsis: "Alejandra Sequeira Pinto relata su proceso de renacimiento tras tocar fondo emocional, ofreciendo una guía cálida para transformar las crisis existenciales en peldaños de evolución.",
    recommendedFor: "Personas que atraviesan momentos oscuros y buscan inspiración para salir adelante."
  },
  "Todos Los Lugares Que Mantuvimos En Secreto": {
    genre: "Romance Juvenil / New Adult",
    synopsis: "Inma Rubiales nos lleva a un pintoresco pueblo nevado donde Maeve y Connor, dos almas heridas, descubren que compartir sus secretos más vulnerables es la única manera de empezar a sanar.",
    recommendedFor: "Jóvenes lectores que buscan romances tiernos, reconfortantes y con mensajes de esperanza."
  },
  "Tráguese Ese Sapo!": {
    genre: "Productividad & Gestión del Tiempo",
    synopsis: "El aclamado bestseller de Brian Tracy con 21 técnicas prácticas para vencer la procrastinación, priorizar las tareas más desafiantes y cruciales ('los sapos') y lograr un alto rendimiento profesional.",
    recommendedFor: "Estudiantes, autónomos y ejecutivos que quieren duplicar su productividad y eliminar la postergación."
  },
  "Trilogía Estoica": {
    genre: "Filosofía Clásica & Estoicismo",
    synopsis: "Humberto Montesinos compila las enseñanzas esenciales de Séneca, Epicteto y Marco Aurelio, articulando un sistema coherente de principios para cultivar el autodominio, la calma y la sabiduría moral.",
    recommendedFor: "Interesados en la filosofía perenne y las herramientas prácticas para una vida con propósito y entereza."
  },
  "Trono De Monstruos": {
    genre: "Fantasía Épica / Romantasy Oscuro",
    synopsis: "Amber V. Nicole sumerge a los lectores en un mundo brutal de reyes monstruosos, batallas sangrientas y una heroína indómita dispuesta a todo para reclamar su legado y proteger a los suyos.",
    recommendedFor: "Amantes de la fantasía oscura con heroínas fuertes, romances tempestuosos y acción constante."
  },
  "Tu Eres Tu Prioridad": {
    genre: "Autoestima & Desarrollo Personal",
    synopsis: "Jaden Finn plantea un manifiesto directo para dejar de complacer a los demás, priorizar el bienestar propio sin culpas y asumir la plena responsabilidad de la propia felicidad.",
    recommendedFor: "Personas complacientes que necesitan reafirmar su autonomía emocional y poner límites."
  },
  "Un Inmueble Al Niño No Hace Daño": {
    genre: "Bienes Raíces & Inversión Patrimonial",
    synopsis: "Carlos Devis explica paso a paso cómo cualquier persona común puede construir un patrimonio seguro mediante la inversión en bienes raíces con bajo riesgo y flujo de caja positivo constante.",
    recommendedFor: "Inversionistas principiantes que buscan libertad financiera a través del mercado inmobiliario."
  },
  "Un Velo Escarlata": {
    genre: "Fantasía Juvenil / Vampiros & Brujería",
    synopsis: "Shelby Mahurin expande el fascinante universo de 'Asesino de Brujas' con Célie Tremblay, quien al convertirse en la primera cazadora de la guardia debe enfrentarse a una letal amenaza vampírica que acecha en la niebla.",
    recommendedFor: "Fans de las brujas, vampiros elegantes, misterios góticos y romances llenos de peligro."
  },
  "Will": {
    genre: "Autobiografía / Memorias & Superación",
    synopsis: "Will Smith y Mark Manson se unen para narrar con honestidad brutal el ascenso estratosférico del actor desde los suburbios de Filadelfia hasta Hollywood, revelando las sombras detrás del éxito deslumbrante.",
    recommendedFor: "Lectores de biografías inspiradoras sobre el éxito, la vulnerabilidad humana y la búsqueda del equilibrio personal."
  },
  "Y Si Hacemos Dinero ?": {
    genre: "Finanzas Personales & Emprendimiento",
    synopsis: "Walter Eyzaguirre desmitifica el mundo de las finanzas con consejos prácticos para sanar las deudas, optimizar los ahorros y aprovechar las oportunidades de inversión del entorno actual.",
    recommendedFor: "Jóvenes y familias que quieren tomar el control de su dinero y alcanzar la tranquilidad económica."
  },
  "Yo Soy Éxito": {
    genre: "Mentalidad de Abundancia & Motivación",
    synopsis: "David Thea presenta una guía motivacional para reprogramar las creencias limitantes, asumir el liderazgo de la propia vida y proyectar una mentalidad de victoria ante cualquier desafío.",
    recommendedFor: "Emprendedores y personas enfocadas en potenciar su motivación, enfoque y resultados."
  }
};

// 3. FUNCIÓN PARA FORMATEAR LA DESCRIPCIÓN SEGÚN EL ESTÁNDAR EXIGIDO
export function formatBookDescription(author: string, genre: string, synopsis: string, recommendedFor: string): string {
  return `👤 **Autor:** ${author}\n🏷️ **Género:** ${genre}\n\n📖 **Sinopsis:**\n${synopsis}\n\n🎯 **Recomendado para:**\n${recommendedFor}`;
}

// 4. FUNCIÓN PARA GENERAR URL DE CDN DE ALTA DISPONIBILIDAD
export function getBookCoverCdnUrl(title: string, author: string): string {
  const query = `${title} ${author} Portada Libro`;
  return `https://th.bing.com/th?q=${encodeURIComponent(query)}&w=300&h=300&c=7&rs=1&p=0`;
}
