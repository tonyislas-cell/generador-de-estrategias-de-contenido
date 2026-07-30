import type { PromptContext } from "../context";
import type { MisionSemana } from "../misiones";
import { bullets, lines, present, sections } from "./prose";
import { bloqueSinCubrir, type PromptAdapter } from "./types";
import {
  esqueletoDePieza,
  type DialectoDeSalida,
} from "../plantillas";

/**
 * Adaptador de Gemini.
 *
 * Decisiones de ingeniería de prompt específicas de este modelo, distintas de
 * las de Claude y de ChatGPT a propósito:
 *
 * - Las reglas críticas (cantidad de piezas, frases prohibidas, "no escribas
 *   guiones todavía") se declaran una vez temprano y se **refuerzan de nuevo**
 *   justo antes del pedido final. Gemini tiende a perder restricciones
 *   tempranas en prompts largos y estructurados.
 * - Rótulos en negrita y oraciones cortas y declarativas, evitando párrafos
 *   largos.
 * - Reglas enumeradas explícitamente como "Regla 1", "Regla 2"… en vez de
 *   prosa narrativa o listas con viñetas sueltas.
 * - Estructura más plana que el esquema XML anidado de Claude y que los
 *   encabezados markdown de ChatGPT: sin tags ni `#`/`##`, solo rótulos en
 *   negrita seguidos de su contenido.
 */

/**
 * Cómo decora Gemini las líneas del entregable que pide.
 *
 * Estructura plana, coherente con el resto del adaptador: sin etiquetas, sin
 * `#` y sin negritas dentro del entregable. Cada campo cierra en punto porque
 * acá todo se lee como una oración; el `valor` que ya viene con punto no lleva
 * otro.
 */
const SALIDA: DialectoDeSalida = {
  tituloDePieza: (texto) => texto,
  campo: (nombre, valor) =>
    `${nombre}: ${valor}${valor.endsWith(".") ? "" : "."}`,
  nombreDeCampo: (nombre) => `"${nombre}:"`,
  cita: (_etiqueta, prosa) => prosa,
  rotulo: (texto) => texto,
};

// ---------------------------------------------------------------- setup

function apertura(ctx: PromptContext): string {
  return [
    `Vas a ayudarme a producir contenido para redes sociales durante ${ctx.duracionEtiqueta}.`,
    "**Regla 0 (la más importante):** lee el mensaje completo antes de responder. No escribas guiones, ideas ni calendario todavía. Al final te digo exactamente qué contestar primero.",
  ].join("\n");
}

function rol(ctx: PromptContext): string {
  return [
    "**Quién eres:** estratega de contenido y guionista de formato corto, con diez años de experiencia levantando cuentas desde cero en " +
      `${ctx.plataformaPrincipalLabel}. Sabes qué se ve, qué se guarda, qué se comparte y qué no.`,
    "Actúas como el editor exigente de un creador, no como un asistente complaciente: si una idea es floja, la descartas y propones una mejor. No te importa sonar inspirador, te importa que el contenido funcione.",
  ].join("\n");
}

function contextoDelCreador(ctx: PromptContext): string {
  const contextoMarca = ctx.answers.contextoMarca
    ? `Contexto de marca: ${ctx.answers.contextoMarca}`
    : null;

  return lines([
    "**Contexto del creador:**",
    `Nicho: ${ctx.answers.nicho}.`,
    `Audiencia: ${ctx.answers.audiencia}.`,
    `Plataforma principal: ${ctx.plataformaPrincipalLabel}.`,
    `Tono de marca: ${ctx.tonoLabel} — ${ctx.tonoDescriptor}.`,
    `Etapa de la cuenta: ${ctx.etapaCuentaLabel} — ${ctx.etapaCuentaDescriptor}.`,
    contextoMarca,
    "Formato de producción:",
    bullets(ctx.formatos.map((f) => `${f.label}: ${f.descriptor}`)),
    "Estilos de gancho que resuenan:",
    bullets(ctx.ganchos.map((g) => `${g.label}: ${g.mecanica}`)),
  ]);
}

function plataformasSecundarias(ctx: PromptContext): string | null {
  if (ctx.plataformasSecundariasLabels.length === 0) return null;

  return [
    "**Plataformas secundarias:**",
    `También publico en: ${ctx.plataformasSecundariasLabels.join(", ")}.`,
    `Escribe todo pensado para ${ctx.plataformaPrincipalLabel}, nativo de esa plataforma. Al final de cada semana agrega un bloque corto de adaptación, de dos líneas como máximo por plataforma secundaria: qué cambiar en duración, primer cuadro, texto y llamada a la acción. No dupliques los guiones.`,
  ].join("\n");
}

function oferta(ctx: PromptContext): string | null {
  const { answers } = ctx;
  if (answers.objetivo !== "lanzamiento") return null;

  return [
    "**Oferta:**",
    `Qué vendo: ${answers.oferta}.`,
    `Objeciones frecuentes: ${answers.objeciones}.`,
    `Prueba social disponible: ${answers.pruebaSocial}.`,
  ].join("\n");
}

function capacidadDeProduccion(ctx: PromptContext): string {
  const agrupado = ctx.requiereAgrupado
    ? `Agrupado: con ${ctx.piezasPorSemanaLabel} por semana y ${ctx.tiempoPorPiezaLabel.toLowerCase()} por pieza, agrupa en un mismo día las piezas que compartan encuadre, ropa o preparación, y marca cuáles se graban juntas.`
    : null;

  return lines([
    "**Capacidad de producción:**",
    `Frecuencia: ${ctx.frecuenciaLabel} — ${ctx.piezasPorSemanaLabel} por semana, ni una más.`,
    `Tiempo por pieza: ${ctx.tiempoDescriptor}.`,
    "Equipo disponible:",
    bullets(ctx.equipos.map((e) => `${e.label}: ${e.descriptor}`)),
    agrupado,
  ]);
}

/**
 * Cómo funciona la plataforma, separado de qué está rindiendo.
 *
 * Va antes de las tendencias porque las mecánicas restringen y las tendencias
 * inspiran: primero el marco, después las ideas.
 */
function mecanicaDePlataforma(ctx: PromptContext): string {
  const { mecanica } = ctx;

  const confirmado =
    mecanica.confirmado.length > 0
      ? lines([
          "Confirmado por la plataforma:",
          bullets(mecanica.confirmado.map((d) => `${d.etiqueta}: ${d.valor}`)),
        ])
      : `Confirmado por la plataforma: nada. No tengo mecánicas verificadas de ${ctx.plataformaPrincipalLabel}, así que cualquier afirmación sobre cómo funciona esta plataforma va marcada [NO VERIFICADO].`;

  const discutido =
    mecanica.discutido.length > 0
      ? lines([
          "Discutido, no documentado. Esto circula en guías de marketing y la plataforma no lo documenta. Puedes tenerlo en cuenta para decidir, pero está prohibido afirmarlo como mecánica o construir una instrucción sobre eso:",
          bullets(mecanica.discutido),
        ])
      : null;

  return lines([
    `**Cómo funciona ${ctx.plataformaPrincipalLabel}, revisado el ${mecanica.revisada}:**`,
    confirmado,
    discutido,
  ]);
}

function tendencias(ctx: PromptContext): string {
  const { trends } = ctx;

  return [
    `**Tendencias de ${ctx.plataformaPrincipalLabel}, período ${trends.periodo}:**`,
    "Formatos que rinden:",
    bullets(trends.formatos),
    "Patrones de gancho:",
    bullets(trends.ganchos),
    "Señales que premia la plataforma:",
    bullets(trends.senales),
    "Quemado, no usar:",
    bullets(trends.evitar),
    `Convenciones de texto: ${trends.convencionesCopy}`,
  ].join("\n");
}

function comoUsarLasTendencias(ctx: PromptContext): string {
  return [
    "**Cómo usar las tendencias:** son datos que te doy yo, no tu conocimiento propio. No las cites, no las menciones como «tendencia» en lo que me entregues, y no supongas que sabes algo más nuevo.",
    bullets([
      "Formatos que rinden: al menos la mitad de las piezas de cada semana sale de ahí.",
      "Patrones de gancho: son patrones, no plantillas. Nunca copies la frase literal.",
      "Señales que premia la plataforma: si una pieza no empuja ninguna de esas señales, cámbiala.",
      "Quemado, no usar: prohibido. Si una idea cae ahí, descártala sin avisarme.",
    ]),
    `Si algo de las tendencias choca con el tono ${ctx.tonoLabel.toLowerCase()}, gana el tono.`,
  ].join("\n");
}

function reglasDeEscritura(ctx: PromptContext): string {
  return [
    "**Reglas de escritura:**",
    `Regla 1 — Prueba del reemplazo: si puedes cambiar «${ctx.answers.nicho}» por cualquier otro rubro y el guion sigue teniendo sentido, el guion está mal. Reescríbelo hasta que solo funcione para esta audiencia.`,
    "Regla 2 — Especificidad obligatoria: cada pieza tiene al menos un detalle concreto del mundo de esta audiencia — una herramienta con nombre, un número, un momento del día, una frase que esa persona realmente dice. Nada de «muchos», «la mayoría» ni «hoy en día».",
    "Regla 3 — Una idea por pieza. Si una pieza tiene dos ideas, pártela en dos.",
    "Regla 4 — El gancho es una promesa, no un anuncio. Prohibido presentar la pieza: se entra directo a la afirmación, la escena o el dato.",
    "Regla 5 — Escribe como hablo yo: mira el registro y el nivel de formalidad de mis respuestas más arriba, e imítalo sin neutralizarlo.",
    "Regla 6 — Sin relleno: si una frase no agrega información nueva o tensión nueva, bórrala.",
    "Regla 7 — No inventes datos, cifras, estudios ni testimonios que no te haya dado yo. Si un guion necesita un dato, deja [DATO A COMPLETAR: qué necesito] y sigue.",
    "Regla 8 — No inventes mecánicas de plataforma. Nunca afirmes un dato sobre cómo funciona la plataforma —topes, duraciones, señales, medidas, umbrales— que no esté en la sección de cómo funciona, de arriba. Si no está ahí, escribe [NO VERIFICADO] al lado de la afirmación y sigue. Lo que está marcado como discutido no se afirma como mecánica.",
  ].join("\n");
}

function prohibiciones(): string {
  return [
    "**Prohibido usar, ni sus variantes:**",
    bullets([
      "«En este video te voy a contar…», «Hoy te traigo…», «Quédate hasta el final».",
      "«3 tips que nadie te dice», «el secreto que nadie quiere que sepas», «esto te va a volar la cabeza».",
      "«¿Sabías que…?» como apertura.",
      "«En un mundo donde…», «No es magia, es método», «La clave está en…».",
      "Listas de emojis como estructura, etiquetas de relleno, MAYÚSCULAS GRITADAS.",
      "Cualquier frase motivacional genérica que podrías haber escrito antes de leer este contexto.",
    ]),
  ].join("\n");
}

function estrategia(ctx: PromptContext): string {
  const { answers } = ctx;

  if (answers.objetivo === "lanzamiento") {
    return [
      "**Estrategia de venta:**",
      "Regla A — Estamos en campaña: hay algo concreto para vender, arriba en Oferta.",
      "Regla B — No todas las piezas venden. En cada bloque semanal te voy a marcar cuáles llevan llamada a la acción de venta y cuáles no. Respétalo.",
      "Regla C — Cada objeción de la lista queda desarmada por al menos una pieza del plan, sin nombrarla como objeción: se desarma mostrando, no discutiendo.",
      "Regla D — Usa la prueba social disponible tal cual está. No la infles, no la redondees y no le agregues testimonios nuevos.",
      "Regla E — Una llamada a la acción por pieza, una sola acción, específica: qué hace la persona, dónde, y qué pasa después.",
    ].join("\n");
  }

  return [
    "**Estrategia de autoridad:**",
    "Regla A — En este plan no hay nada para vender. Está prohibido mencionar precios, ofertas, cupos, lanzamientos, «enlace en la biografía para comprar» o cualquier llamada a la acción de compra. Si te sale un guion que termina vendiendo, reescríbelo.",
    "Regla B — El objetivo es que esta cuenta quede asociada a UNA idea. Vas a definir esa idea, la tesis, en tu primera respuesta, y todas las piezas la empujan desde ángulos distintos.",
    "Regla C — Las llamadas a la acción son de conversación y de guardado: una pregunta que solo esta audiencia puede responder, un motivo real para guardar la pieza, o una invitación a discrepar.",
    "Regla D — La autoridad se demuestra mostrando criterio en casos difíciles, no repitiendo consejos correctos.",
  ].join("\n");
}

function planGeneral(ctx: PromptContext): string {
  return `**Plan general:** ${ctx.duracionEtiqueta}, partido en ${ctx.totalSemanas} bloques semanales. Te los voy a pasar de a uno, en mensajes separados, en esta misma conversación. Nunca me des más de un bloque por vez, aunque yo te lo pida sin querer: si te pido dos semanas juntas, haz solo la primera y avísame.`;
}

function instruccionesFinales(ctx: PromptContext): string {
  const segundoPunto =
    ctx.answers.objetivo === "lanzamiento"
      ? "Ángulo de la campaña: una sola oración con el ángulo desde el que vamos a vender, que no puede ser «compra esto»."
      : "Tesis de la cuenta: una sola oración con la idea que esta cuenta va a instalar durante todo el plan.";

  return [
    "**Recordatorio de la Regla 0:** todavía no generes guiones, calendario ni ideas de contenido.",
    "",
    "Contesta exactamente con estas cuatro cosas, en este orden, y nada más:",
    `1. A quién le hablamos: una oración, en tus palabras, sobre quién es esta audiencia y qué le está pasando. Si repites literal lo que te escribí, no sirve.`,
    `2. ${segundoPunto}`,
    `3. Clichés prohibidos de este nicho: tres frases o formatos concretos, propios de ${ctx.answers.nicho}, que se usan hasta el cansancio y que te vas a prohibir durante todo el plan. Específicos del nicho, no genéricos.`,
    "4. Preguntas: dos como máximo, y solo si hay algo que de verdad te impide trabajar. Si no tienes dudas reales, escribe «Ninguna».",
    "",
    "Después de eso, paras y esperas. Yo te paso el bloque de la Semana 1.",
  ].join("\n");
}

function buildSetup(ctx: PromptContext): string {
  return sections([
    apertura(ctx),
    rol(ctx),
    contextoDelCreador(ctx),
    plataformasSecundarias(ctx),
    oferta(ctx),
    capacidadDeProduccion(ctx),
    mecanicaDePlataforma(ctx),
    tendencias(ctx),
    comoUsarLasTendencias(ctx),
    reglasDeEscritura(ctx),
    prohibiciones(),
    estrategia(ctx),
    planGeneral(ctx),
    instruccionesFinales(ctx),
  ]);
}

// --------------------------------------------------------- bloque semanal

function restriccionesDuras(ctx: PromptContext, mision: MisionSemana): string {
  const equipoListado = ctx.equipos
    .map((e) => `«${e.label.toLowerCase()}»`)
    .join(" o ");
  const formatoLinea =
    ctx.formatos.length === 1
      ? `Formato: ${ctx.formatos[0].label}.`
      : `Formato: cada pieza usa el que mejor le sirva entre estos, con la estructura que le corresponde: ${ctx.formatos.map((f) => `«${f.label.toLowerCase()}»`).join(" o ")}.`;

  return [
    "**Restricciones duras de esta semana:**",
    `Regla 1 — Exactamente ${ctx.piezasPorSemanaLabel}. Ni una más, ni una menos.`,
    `Regla 2 — ${formatoLinea} Nada que necesite más de «${ctx.tiempoPorPiezaLabel.toLowerCase()}» por pieza. Cada pieza usa el equipo que mejor le sirva, sin superar ninguno de estos niveles: ${equipoListado}.`,
    `Regla 3 — ${mision.reglaCTA}`,
    `Regla 4 — Prueba del reemplazo: si cambias «${ctx.answers.nicho}» por otro rubro y el guion sigue funcionando, está mal.`,
    `Regla 5 — Sigue prohibido lo que está quemado en ${ctx.plataformaPrincipalLabel}: ${ctx.trends.evitar.join("; ")}.`,
  ].join("\n");
}

function continuidad(semana: number): string | null {
  if (semana === 1) return null;

  return `**Continuidad:** mira el bloque "Memoria" con el que cerraste la Semana ${semana - 1}. No repitas ninguno de esos ganchos, ángulos ni ejemplos. Esta semana avanza sobre la anterior, no la recicla.`;
}

function antesDeEscribir(ctx: PromptContext): string {
  return [
    "**Antes de escribir, repasa tú mismo en un máximo de 150 palabras:**",
    bullets([
      "Qué creencia concreta de mi audiencia ataca cada pieza de esta semana — una línea por pieza.",
      `De las ${ctx.piezasPorSemanaLabel}, cuál es la más floja y por qué — después reemplázala por una mejor antes de escribir el entregable.`,
      "Cómo evitas que dos ganchos arranquen con la misma estructura.",
    ]),
    "Recién después de ese repaso escribe el entregable.",
  ].join("\n");
}

function formatoDeSalida(
  ctx: PromptContext,
  semana: number,
  mision: MisionSemana
): string {
  const conexion =
    semana > 1 ? `Cómo se conecta con la Semana ${semana - 1}: una oración.` : null;

  const adaptacion =
    ctx.plataformasSecundariasLabels.length > 0
      ? [
          "",
          "Y después, un bloque «Adaptación» con dos líneas como máximo por cada una de estas plataformas: " +
            `${ctx.plataformasSecundariasLabels.join(", ")}.`,
        ].join("\n")
      : null;

  return lines([
    "**Formato de salida. Empieza con:**",
    `Semana ${semana} — ${mision.titulo}`,
    "Idea que empuja la semana: una oración.",
    conexion,
    "Qué mirar esta semana: elige cuál de estas señales te dice si la semana funcionó, y con qué número te das por satisfecho:",
    bullets(ctx.trends.senales),
    "",
    `Después, las ${ctx.piezasPorSemanaLabel}, cada una con ${ctx.formatos.length === 1 ? "esta estructura exacta" : "la estructura que le corresponda según su formato"}:`,
    "",
    esqueletoDePieza(ctx, SALIDA),
    adaptacion,
    "",
    "Termina con este bloque, literal:",
    "",
    "Memoria:",
    "- Ganchos usados: …",
    "- Ángulos ya quemados: …",
    "- Qué queda pendiente para la semana que viene: …",
  ]);
}

function controlDeCalidad(ctx: PromptContext): string {
  const noVender =
    ctx.answers.objetivo === "autoridad"
      ? "¿Alguna pieza termina vendiendo algo? Reescríbela."
      : null;
  const equipoListado = ctx.equipos
    .map((e) => `«${e.label.toLowerCase()}»`)
    .join(" o ");
  const estructuraMezclada =
    ctx.formatos.length > 1
      ? "¿Alguna pieza mezcla campos de dos formatos distintos? Corrígela para que use solo la estructura del formato que declaró."
      : null;

  return lines([
    "**Verificación final, antes de responder — repite las reglas críticas:**",
    bullets(
      [
        `¿Hay exactamente ${ctx.piezasPorSemanaLabel}? (Regla 1 de arriba.)`,
        "¿Alguna arranca presentando la pieza, o con una fórmula prohibida? Reescríbela.",
        "¿Dos ganchos empiezan con la misma estructura sintáctica? Cambia uno.",
        "¿Alguna pieza pasa la prueba del reemplazo, es decir, podría ser de cualquier otro nicho? Reescríbela.",
        `¿Alguna pieza necesita más de «${ctx.tiempoPorPiezaLabel.toLowerCase()}» por pieza, o más equipo del disponible (${equipoListado})? Simplifícala. (Regla 2 de arriba.)`,
        estructuraMezclada,
        "¿Inventaste algún dato, cifra o testimonio? Cámbialo por [DATO A COMPLETAR: …].",
        "¿Usaste alguno de los tres clichés que tú mismo te prohibiste al principio?",
        noVender,
      ].filter(present)
    ),
    "Corrige en silencio lo que falle antes de mandarme la respuesta. No me muestres esta verificación.",
  ]);
}

function siTeQuedasSinEspacio(): string {
  return [
    "**Si te quedas sin espacio:** termina la pieza en la que estés, no la cortes por la mitad, y escribe en una línea aparte, exactamente: CONTINÚO",
    "Yo te voy a responder «sigue» y retomas desde la pieza siguiente.",
  ].join("\n");
}

function buildSemana(ctx: PromptContext, semana: number): string {
  const mision = ctx.misiones[semana - 1];
  if (!mision) {
    throw new Error(
      `No hay misión definida para la semana ${semana} de un plan de ${ctx.totalSemanas} semanas.`
    );
  }

  return sections([
    `**Bloque semanal ${semana} de ${ctx.totalSemanas}.**`,
    "Seguimos en la misma conversación, con el mismo contexto del primer mensaje. No lo repitas ni lo resumas.",
    restriccionesDuras(ctx, mision),
    `**Misión de la semana:** ${mision.mision}`,
    continuidad(semana),
    antesDeEscribir(ctx),
    formatoDeSalida(ctx, semana, mision),
    controlDeCalidad(ctx),
    siTeQuedasSinEspacio(),
  ]);
}

export const geminiAdapter: PromptAdapter = {
  build: (ctx, req) => {
    // `switch` con rama por defecto imposible, y no un ternario: cuando entre
    // un tipo de bloque nuevo, esto tiene que dejar de compilar acá. Un
    // ternario lo mandaría en silencio a la rama equivocada.
    switch (req.kind) {
      case "setup":
        return buildSetup(ctx);
      case "semana":
        return buildSemana(ctx, req.semana);
      default:
        return bloqueSinCubrir(req);
    }
  },
};
