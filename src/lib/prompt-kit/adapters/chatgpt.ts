import type { PromptContext } from "../context";
import type { MisionSemana } from "../misiones";
import { bullets, lines, present, sections } from "./prose";
import type { PromptAdapter } from "./types";

/**
 * Adaptador de ChatGPT.
 *
 * Decisiones de ingeniería de prompt específicas de este modelo, distintas de
 * las de Claude a propósito:
 *
 * - Encabezados markdown (`##`, `###`) y rótulos en negrita en vez de tags
 *   XML. La familia GPT sigue estructura markdown de forma más confiable que
 *   XML.
 * - La instrucción de "todavía no generes nada, esperá confirmación" se repite
 *   al principio y al final. GPT pondera más las instrucciones tempranas que
 *   las de cierre — al revés que Claude, que pesa más el cierre.
 * - Listas numeradas para todo lo procedimental, en vez de prosa con viñetas.
 * - Una sola persona al estilo "system prompt" al principio, en tono de
 *   experto seguro — no adversarial como en Claude.
 * - Prohibiciones bajo un rótulo en negrita "Prohibido:", no un bloque
 *   `<prohibiciones>`.
 * - El chequeo de calidad va como checklist corto pegado justo antes del
 *   pedido del entregable, en vez de separado por texto largo.
 */

// ---------------------------------------------------------------- setup

function apertura(ctx: PromptContext): string {
  return [
    `Vas a ayudarme a producir contenido para redes sociales durante ${ctx.duracionEtiqueta}.`,
    "**Instrucción importante, válida para todo este mensaje:** lee todo antes de responder. Todavía no generes ningún guion ni idea de contenido. Al final te digo exactamente qué contestar primero.",
  ].join("\n");
}

function rol(ctx: PromptContext): string {
  return [
    "## Quién eres",
    `Eres estratega de contenido y guionista de formato corto, con diez años de experiencia levantando cuentas desde cero en ${ctx.plataformaPrincipalLabel}. Sabes qué se ve, qué se guarda, qué se comparte y qué no.`,
    "Tu criterio es el de un editor exigente: si una idea es floja, la descartas y propones una mejor en vez de maquillarla. Prioriza que el contenido funcione por sobre sonar inspirador.",
  ].join("\n");
}

function contextoDelCreador(ctx: PromptContext): string {
  const contextoMarca = ctx.answers.contextoMarca
    ? `- **Contexto de marca:** ${ctx.answers.contextoMarca}`
    : null;

  return lines([
    "## Contexto del creador",
    `- **Nicho:** ${ctx.answers.nicho}`,
    `- **Audiencia:** ${ctx.answers.audiencia}`,
    `- **Plataforma principal:** ${ctx.plataformaPrincipalLabel}`,
    `- **Tono de marca:** ${ctx.tonoLabel} — ${ctx.tonoDescriptor}`,
    `- **Etapa de la cuenta:** ${ctx.etapaCuentaLabel} — ${ctx.etapaCuentaDescriptor}`,
    contextoMarca,
    `- **Formato de producción:** ${ctx.formatoLabel} — ${ctx.formatoDescriptor}`,
    "- **Estilos de gancho que resuenan:**",
    bullets(ctx.ganchos.map((g) => `${g.label}: ${g.mecanica}`)),
  ]);
}

function plataformasSecundarias(ctx: PromptContext): string | null {
  if (ctx.plataformasSecundariasLabels.length === 0) return null;

  return [
    "## Plataformas secundarias",
    `También publico en: ${ctx.plataformasSecundariasLabels.join(", ")}.`,
    `Escribe todo pensado para ${ctx.plataformaPrincipalLabel}, nativo de esa plataforma. Al final de cada semana agrega un bloque corto de adaptación, de dos líneas como máximo por plataforma secundaria: qué cambiar en duración, primer cuadro, texto y llamada a la acción. No dupliques los guiones.`,
  ].join("\n");
}

function oferta(ctx: PromptContext): string | null {
  const { answers } = ctx;
  if (answers.objetivo !== "lanzamiento") return null;

  return [
    "## Oferta",
    `- **Qué vendo:** ${answers.oferta}`,
    `- **Objeciones frecuentes:** ${answers.objeciones}`,
    `- **Prueba social disponible:** ${answers.pruebaSocial}`,
  ].join("\n");
}

function capacidadDeProduccion(ctx: PromptContext): string {
  const agrupado = ctx.requiereAgrupado
    ? `- **Agrupado:** con ${ctx.piezasPorSemanaLabel} por semana y ${ctx.tiempoPorPiezaLabel.toLowerCase()} por pieza, agrupa en un mismo día las piezas que compartan encuadre, ropa o preparación, y marca cuáles se graban juntas.`
    : null;

  return lines([
    "## Capacidad de producción",
    `- **Frecuencia:** ${ctx.frecuenciaLabel} — ${ctx.piezasPorSemanaLabel} por semana, ni una más.`,
    `- **Tiempo por pieza:** ${ctx.tiempoDescriptor}`,
    `- **Equipo:** ${ctx.equipoDescriptor}`,
    agrupado,
  ]);
}

function tendencias(ctx: PromptContext): string {
  const { trends } = ctx;

  return [
    `## Tendencias de ${ctx.plataformaPrincipalLabel} (${trends.periodo})`,
    "**Formatos que rinden:**",
    bullets(trends.formatos),
    "**Patrones de gancho:**",
    bullets(trends.ganchos),
    "**Señales que premia la plataforma:**",
    bullets(trends.senales),
    "**Quemado, no usar:**",
    bullets(trends.evitar),
    `**Convenciones de texto:** ${trends.convencionesCopy}`,
  ].join("\n");
}

function comoUsarLasTendencias(ctx: PromptContext): string {
  return [
    "## Cómo usar las tendencias",
    "Estas tendencias son datos que te doy yo. No son tu conocimiento propio: no las cites, no las menciones como «tendencia» en lo que me entregues, y no supongas que sabes algo más nuevo. Úsalas así:",
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
    "## Reglas de escritura",
    bullets([
      `Prueba del reemplazo: si puedes cambiar «${ctx.answers.nicho}» por cualquier otro rubro y el guion sigue teniendo sentido, el guion está mal. Reescríbelo hasta que solo funcione para esta audiencia.`,
      "Especificidad obligatoria: cada pieza tiene al menos un detalle concreto del mundo de esta audiencia — una herramienta con nombre, un número, un momento del día, una frase que esa persona realmente dice. Nada de «muchos», «la mayoría» ni «hoy en día».",
      "Una idea por pieza. Si una pieza tiene dos ideas, pártela en dos.",
      "El gancho es una promesa, no un anuncio. Prohibido presentar la pieza: se entra directo a la afirmación, la escena o el dato.",
      "Escribe como hablo yo: mira el registro y el nivel de formalidad de mis respuestas más arriba e imítalo, sin neutralizarlo.",
      "Sin relleno: si una frase no agrega información nueva o tensión nueva, bórrala.",
      "No inventes datos, cifras, estudios ni testimonios que no te haya dado yo. Si un guion necesita un dato, deja [DATO A COMPLETAR: qué necesito] y sigue.",
    ]),
  ].join("\n");
}

function prohibiciones(): string {
  return [
    "## Prohibido",
    "No uses ninguna de estas fórmulas, ni sus variantes:",
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
      "## Estrategia de venta",
      bullets([
        "Estamos en campaña: hay algo concreto para vender, arriba en Oferta.",
        "No todas las piezas venden. En cada bloque semanal te voy a marcar cuáles llevan llamada a la acción de venta y cuáles no. Respétalo.",
        "Cada objeción de «Objeciones frecuentes» queda desarmada por al menos una pieza del plan, sin nombrarla como objeción: se desarma mostrando, no discutiendo.",
        "Usa «Prueba social disponible» tal cual está. No la infles, no la redondees y no le agregues testimonios nuevos.",
        "Una llamada a la acción por pieza, una sola acción, específica: qué hace la persona, dónde, y qué pasa después.",
      ]),
    ].join("\n");
  }

  return [
    "## Estrategia de autoridad",
    bullets([
      "En este plan no hay nada para vender. Está prohibido mencionar precios, ofertas, cupos, lanzamientos, «enlace en la biografía para comprar» o cualquier llamada a la acción de compra. Si te sale un guion que termina vendiendo, reescríbelo.",
      "El objetivo es que esta cuenta quede asociada a UNA idea. Vas a definir esa idea, la tesis, en tu primera respuesta, y todas las piezas la empujan desde ángulos distintos.",
      "Las llamadas a la acción son de conversación y de guardado: una pregunta que solo esta audiencia puede responder, un motivo real para guardar la pieza, o una invitación a discrepar.",
      "La autoridad se demuestra mostrando criterio en casos difíciles, no repitiendo consejos correctos.",
    ]),
  ].join("\n");
}

function planGeneral(ctx: PromptContext): string {
  return [
    "## Plan general",
    `El plan es de ${ctx.duracionEtiqueta}, partido en ${ctx.totalSemanas} bloques semanales. Te los voy a pasar de a uno, en mensajes separados, en esta misma conversación. Nunca me des más de un bloque por vez, aunque yo te lo pida sin querer: si te pido dos semanas juntas, haz solo la primera y avísame.`,
  ].join("\n");
}

function instruccionesFinales(ctx: PromptContext): string {
  const segundoPunto =
    ctx.answers.objetivo === "lanzamiento"
      ? "**Ángulo de la campaña:** una sola oración con el ángulo desde el que vamos a vender, que no puede ser «compra esto»."
      : "**Tesis de la cuenta:** una sola oración con la idea que esta cuenta va a instalar durante todo el plan.";

  return [
    "## Qué contestar ahora",
    "**Recordatorio:** todavía no generes guiones, calendario ni ideas de contenido. Nada de eso todavía.",
    "",
    "Contesta exactamente con estas cuatro cosas, en este orden, y nada más:",
    "",
    "1. **A quién le hablamos:** una oración, en tus palabras, sobre quién es esta audiencia y qué le está pasando. Si repites literal lo que te escribí, no sirve.",
    `2. ${segundoPunto}`,
    `3. **Clichés prohibidos de este nicho:** tres frases o formatos concretos, propios de ${ctx.answers.nicho}, que se usan hasta el cansancio y que te vas a prohibir durante todo el plan. Específicos del nicho, no genéricos.`,
    "4. **Preguntas:** dos como máximo, y solo si hay algo que de verdad te impide trabajar. Si no tienes dudas reales, escribe «Ninguna».",
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
  return [
    "## Restricciones duras",
    bullets([
      `Exactamente ${ctx.piezasPorSemanaLabel}. Ni una más, ni una menos.`,
      `Formato: ${ctx.formatoLabel}. Nada que necesite más de «${ctx.tiempoPorPiezaLabel.toLowerCase()}» por pieza, ni más equipo que «${ctx.equipoLabel.toLowerCase()}».`,
      mision.reglaCTA,
      `Prueba del reemplazo: si cambias «${ctx.answers.nicho}» por otro rubro y el guion sigue funcionando, está mal.`,
      `Sigue prohibido lo que está quemado en ${ctx.plataformaPrincipalLabel}: ${ctx.trends.evitar.join("; ")}.`,
    ]),
  ].join("\n");
}

function continuidad(semana: number): string | null {
  if (semana === 1) return null;

  return [
    "## Continuidad",
    `Mira el bloque "Memoria" con el que cerraste la Semana ${semana - 1}. No repitas ninguno de esos ganchos, ángulos ni ejemplos. Esta semana avanza sobre la anterior, no la recicla.`,
  ].join("\n");
}

function antesDeEscribir(ctx: PromptContext): string {
  return [
    "## Antes de escribir",
    "En un máximo de 150 palabras, contesta tú mismo antes de armar el entregable:",
    bullets([
      "Qué creencia concreta de mi audiencia ataca cada pieza de esta semana — una línea por pieza.",
      `De las ${ctx.piezasPorSemanaLabel}, cuál es la más floja y por qué — después reemplázala por una mejor antes de escribir el entregable.`,
      "Cómo evitas que dos ganchos arranquen con la misma estructura.",
    ]),
    "Cuando termines ese repaso, recién ahí escribe el entregable.",
  ].join("\n");
}

/** El esqueleto de cada pieza es la rama donde más se nota el formato elegido. */
function esqueletoDePieza(ctx: PromptContext): string {
  if (ctx.answers.formato === "texto_carrusel") {
    return [
      "### Pieza {n} — {título interno corto}",
      "- **Publicar:** {día}",
      "- **Ángulo:** una línea con qué creencia toca o qué tensión abre.",
      "- **Lámina 1 (portada):** diez palabras como máximo. Es el gancho y es lo único que se ve en el feed.",
      "- **Láminas 2 a N:** numeradas, veinticinco palabras como máximo por lámina, una idea por lámina.",
      "- **Lámina del giro:** marca en cuál cambia la idea.",
      "- **Lámina final:** la llamada a la acción.",
      "- **Texto de la publicación:** según las convenciones de texto de arriba.",
      "- **Por qué funciona:** una línea, honesta.",
      "",
      "No escribas guion hablado ni indicaciones de cámara: acá no hay video.",
    ].join("\n");
  }

  if (ctx.answers.formato === "faceless") {
    return [
      "### Pieza {n} — {título interno corto}",
      "- **Publicar:** {día}",
      "- **Ángulo:** una línea con qué creencia toca o qué tensión abre.",
      "- **Gancho (0-3 s):** lo que dice la voz en off, palabra por palabra.",
      "- **Texto en pantalla del gancho:** siete palabras como máximo.",
      "- **Guion de voz en off:** bloques con su marca de tiempo.",
      "- **Plan de imágenes:** qué se ve en cada bloque — captura de pantalla, material de archivo, gráfico, mano en cuadro. Concreto y grabable con lo que tengo.",
      "- **Ritmo:** cada cuántos segundos cambia la imagen.",
      "- **Llamada a la acción:** una sola acción.",
      "- **Texto de la publicación:** según las convenciones de texto de arriba.",
      "- **Por qué funciona:** una línea, honesta.",
      "",
      "El gancho tiene que funcionar sin cara: si depende de una expresión o de la energía de alguien hablando a cámara, no sirve.",
    ].join("\n");
  }

  return [
    "### Pieza {n} — {título interno corto}",
    "- **Publicar:** {día}",
    "- **Ángulo:** una línea con qué creencia toca o qué tensión abre.",
    "- **Gancho (0-3 s):** lo que se dice, palabra por palabra.",
    "- **Texto en pantalla del gancho:** siete palabras como máximo.",
    "- **Guion:** bloques con su marca de tiempo.",
    "- **Dirección de cámara:** encuadre, energía, dónde cortar, y qué gesto o acción concreta se hace durante el gancho.",
    "- **Texto en pantalla del resto:** solo lo imprescindible.",
    "- **Llamada a la acción:** una sola acción.",
    "- **Texto de la publicación:** según las convenciones de texto de arriba.",
    "- **Por qué funciona:** una línea, honesta.",
  ].join("\n");
}

function formatoDeSalida(
  ctx: PromptContext,
  semana: number,
  mision: MisionSemana
): string {
  const conexion =
    semana > 1
      ? `**Cómo se conecta con la Semana ${semana - 1}:** una oración.`
      : null;

  const adaptacion =
    ctx.plataformasSecundariasLabels.length > 0
      ? [
          "",
          "Y después:",
          "",
          "### Adaptación",
          `Dos líneas como máximo por cada una de estas plataformas: ${ctx.plataformasSecundariasLabels.join(", ")}.`,
        ].join("\n")
      : null;

  return lines([
    "## Formato de salida",
    "Empieza con:",
    "",
    `## Semana ${semana} — ${mision.titulo}`,
    "**Idea que empuja la semana:** una oración.",
    conexion,
    "**Qué mirar esta semana:** elige cuál de estas señales te dice si la semana funcionó, y con qué número te das por satisfecho:",
    bullets(ctx.trends.senales),
    "",
    `Después, las ${ctx.piezasPorSemanaLabel}, cada una con esta estructura exacta:`,
    "",
    esqueletoDePieza(ctx),
    adaptacion,
    "",
    "Termina con este bloque, literal:",
    "",
    "### Memoria",
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

  return lines([
    "## Antes de responder, verifica",
    bullets(
      [
        `¿Hay exactamente ${ctx.piezasPorSemanaLabel}?`,
        "¿Alguna arranca presentando la pieza, o con una fórmula prohibida? Reescríbela.",
        "¿Dos ganchos empiezan con la misma estructura sintáctica? Cambia uno.",
        "¿Alguna pieza pasa la prueba del reemplazo, es decir, podría ser de cualquier otro nicho? Reescríbela.",
        `¿Alguna necesita más de «${ctx.tiempoPorPiezaLabel.toLowerCase()}» o más equipo que «${ctx.equipoLabel.toLowerCase()}»? Simplifícala.`,
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
    "## Si te quedas sin espacio",
    "Termina la pieza en la que estés, no la cortes por la mitad, y escribe en una línea aparte, exactamente: CONTINÚO",
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
    `# Bloque semanal ${semana} de ${ctx.totalSemanas}`,
    "Seguimos en la misma conversación, con el mismo contexto del primer mensaje. No lo repitas ni lo resumas.",
    restriccionesDuras(ctx, mision),
    ["## Misión de la semana", mision.mision].join("\n"),
    continuidad(semana),
    antesDeEscribir(ctx),
    formatoDeSalida(ctx, semana, mision),
    controlDeCalidad(ctx),
    siTeQuedasSinEspacio(),
  ]);
}

export const chatgptAdapter: PromptAdapter = { buildSetup, buildSemana };
