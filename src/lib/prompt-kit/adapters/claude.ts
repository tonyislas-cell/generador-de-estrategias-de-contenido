import type { PromptContext } from "../context";
import type { MisionSemana } from "../misiones";
import { bullets, lines, present, sections } from "./prose";
import type { PromptAdapter } from "./types";

/**
 * Adaptador de Claude.
 *
 * Decisiones de ingeniería de prompt específicas de este modelo:
 *
 * - Etiquetas XML con nombres semánticos en toda la estructura. Claude atiende
 *   a los límites marcados con etiquetas mucho mejor que a los encabezados en
 *   markdown, y los nombres descriptivos rinden más que `<context>`.
 * - Contexto largo primero, instrucciones imperativas al final. Claude pondera
 *   más el cierre del mensaje, y el cierre es justamente el que dice "todavía
 *   no generes nada".
 * - Rol adversarial en vez de asistencial. Es lo que más baja el registro
 *   amable y genérico al que tiende cualquier modelo por defecto.
 * - Prohibiciones enumeradas como cadenas concretas. Los modelos cumplen listas
 *   de frases prohibidas e ignoran adjetivos de calidad abstractos.
 * - Razonamiento previo acotado dentro de `<analisis>`, que Claude respeta como
 *   espacio de borrador separado del entregable.
 */

// ---------------------------------------------------------------- setup

function apertura(ctx: PromptContext): string {
  return [
    `Vas a ayudarme a producir contenido para redes sociales durante ${ctx.duracionEtiqueta}.`,
    "Lee todo este mensaje antes de responder. Al final te digo exactamente qué contestar.",
  ].join("\n");
}

function rol(ctx: PromptContext): string {
  return [
    "<rol>",
    `Eres estratega de contenido y guionista de formato corto. Llevas diez años levantando cuentas desde cero en ${ctx.plataformaPrincipalLabel} y sabes qué se ve, qué se guarda, qué se comparte y qué no.`,
    "Trabajas como el editor exigente de un creador, no como un asistente complaciente: si una idea es floja, la descartas y propones otra mejor en vez de maquillarla. No te importa sonar inspirador. Te importa que el contenido funcione.",
    "</rol>",
  ].join("\n");
}

function contextoDelCreador(ctx: PromptContext): string {
  const contextoMarca = ctx.answers.contextoMarca
    ? `<contexto_de_marca>${ctx.answers.contextoMarca}</contexto_de_marca>`
    : null;

  return lines([
    "<contexto_del_creador>",
    `<nicho>${ctx.answers.nicho}</nicho>`,
    `<audiencia>${ctx.answers.audiencia}</audiencia>`,
    `<plataforma_principal>${ctx.plataformaPrincipalLabel}</plataforma_principal>`,
    `<tono_de_marca>${ctx.tonoLabel} — ${ctx.tonoDescriptor}</tono_de_marca>`,
    `<etapa_de_cuenta>${ctx.etapaCuentaLabel} — ${ctx.etapaCuentaDescriptor}</etapa_de_cuenta>`,
    contextoMarca,
    `<formato_de_produccion>${ctx.formatoLabel} — ${ctx.formatoDescriptor}</formato_de_produccion>`,
    "<estilos_de_gancho>",
    bullets(ctx.ganchos.map((g) => `${g.label}: ${g.mecanica}`)),
    "</estilos_de_gancho>",
    "</contexto_del_creador>",
  ]);
}

function plataformasSecundarias(ctx: PromptContext): string | null {
  if (ctx.plataformasSecundariasLabels.length === 0) return null;

  return [
    "<plataformas_secundarias>",
    `También publico en: ${ctx.plataformasSecundariasLabels.join(", ")}.`,
    `Escribe todo pensado para ${ctx.plataformaPrincipalLabel}, nativo de ${ctx.plataformaPrincipalLabel}. Al final de cada semana agrega un bloque corto de adaptación, de dos líneas como máximo por plataforma secundaria: qué cambiar en duración, primer cuadro, texto y llamada a la acción. No dupliques los guiones.`,
    "</plataformas_secundarias>",
  ].join("\n");
}

function oferta(ctx: PromptContext): string | null {
  const { answers } = ctx;
  if (answers.objetivo !== "lanzamiento") return null;

  return [
    "<oferta>",
    `<que_vendo>${answers.oferta}</que_vendo>`,
    `<objeciones_frecuentes>${answers.objeciones}</objeciones_frecuentes>`,
    `<prueba_social_disponible>${answers.pruebaSocial}</prueba_social_disponible>`,
    "</oferta>",
  ].join("\n");
}

function capacidadDeProduccion(ctx: PromptContext): string {
  const agrupado = ctx.requiereAgrupado
    ? `<agrupado>Con ${ctx.piezasPorSemanaLabel} por semana y ${ctx.tiempoPorPiezaLabel.toLowerCase()} por pieza, agrupa en un mismo día las piezas que compartan encuadre, ropa o preparación, y marca cuáles se graban juntas.</agrupado>`
    : null;

  return lines([
    "<capacidad_de_produccion>",
    `<frecuencia>${ctx.frecuenciaLabel} — ${ctx.piezasPorSemanaLabel} por semana, ni una más</frecuencia>`,
    `<tiempo_por_pieza>${ctx.tiempoDescriptor}</tiempo_por_pieza>`,
    `<equipo>${ctx.equipoDescriptor}</equipo>`,
    agrupado,
    "</capacidad_de_produccion>",
  ]);
}

function tendencias(ctx: PromptContext): string {
  const { trends } = ctx;

  return [
    `<tendencias_de_plataforma plataforma="${ctx.plataformaPrincipalLabel}" periodo="${trends.periodo}">`,
    "<formatos_que_rinden>",
    bullets(trends.formatos),
    "</formatos_que_rinden>",
    "<patrones_de_gancho>",
    bullets(trends.ganchos),
    "</patrones_de_gancho>",
    "<senales_que_premia_la_plataforma>",
    bullets(trends.senales),
    "</senales_que_premia_la_plataforma>",
    "<quemado_no_usar>",
    bullets(trends.evitar),
    "</quemado_no_usar>",
    `<convenciones_de_texto>${trends.convencionesCopy}</convenciones_de_texto>`,
    "</tendencias_de_plataforma>",
  ].join("\n");
}

function comoUsarLasTendencias(ctx: PromptContext): string {
  return [
    "<como_usar_las_tendencias>",
    "Estas tendencias son datos que te doy yo. No son tu conocimiento propio, no las cites ni las menciones como «tendencia» en lo que me entregues, y no supongas que sabes algo más nuevo. Úsalas así:",
    bullets([
      "<formatos_que_rinden>: al menos la mitad de las piezas de cada semana sale de ahí.",
      "<patrones_de_gancho>: son patrones, no plantillas. Nunca copies la frase literal.",
      "<senales_que_premia_la_plataforma>: si una pieza no empuja ninguna de esas señales, cámbiala.",
      "<quemado_no_usar>: prohibido. Si una idea cae ahí, descártala sin avisarme.",
    ]),
    `Si algo de las tendencias choca con el tono ${ctx.tonoLabel.toLowerCase()}, gana el tono.`,
    "</como_usar_las_tendencias>",
  ].join("\n");
}

function reglasDeEscritura(ctx: PromptContext): string {
  return [
    "<reglas_de_escritura>",
    `1. Prueba del reemplazo. Si puedes cambiar «${ctx.answers.nicho}» por cualquier otro rubro y el guion sigue teniendo sentido, el guion está mal. Reescríbelo hasta que solo funcione para esta audiencia.`,
    "2. Especificidad obligatoria. Cada pieza tiene al menos un detalle concreto del mundo de esta audiencia: una herramienta con nombre, un número, un momento del día, una frase que esa persona realmente dice. Nada de «muchos», «la mayoría» ni «hoy en día».",
    "3. Una idea por pieza. Si una pieza tiene dos ideas, pártela en dos.",
    "4. El gancho es una promesa, no un anuncio. Prohibido presentar la pieza. Se entra directo a la afirmación, la escena o el dato.",
    "5. Escribe como hablo yo. Mira cómo escribí mis respuestas más arriba: registro, nivel de formalidad, si trato de tú o de usted. Imítalo. No lo neutralices.",
    "6. Sin relleno. Si una frase no agrega información nueva o tensión nueva, bórrala. En formato corto, cada segundo que no aporta cuesta retención.",
    "7. No inventes datos. Ni cifras, ni estudios, ni casos, ni testimonios que no te haya dado yo. Si un guion necesita un dato, deja [DATO A COMPLETAR: qué necesito] y sigue.",
    "</reglas_de_escritura>",
  ].join("\n");
}

function prohibiciones(): string {
  return [
    "<prohibiciones>",
    "No uses ninguna de estas fórmulas, ni sus variantes:",
    bullets([
      "«En este video te voy a contar…», «Hoy te traigo…», «Quédate hasta el final».",
      "«3 tips que nadie te dice», «el secreto que nadie quiere que sepas», «esto te va a volar la cabeza».",
      "«¿Sabías que…?» como apertura.",
      "«En un mundo donde…», «No es magia, es método», «La clave está en…».",
      "Listas de emojis como estructura, etiquetas de relleno, MAYÚSCULAS GRITADAS.",
      "Cualquier frase motivacional genérica que podrías haber escrito antes de leer este contexto.",
    ]),
    "</prohibiciones>",
  ].join("\n");
}

function estrategia(ctx: PromptContext): string {
  const { answers } = ctx;

  if (answers.objetivo === "lanzamiento") {
    return [
      "<estrategia_de_venta>",
      bullets([
        "Estamos en campaña: hay algo concreto para vender, arriba en <oferta>.",
        "No todas las piezas venden. En cada bloque semanal te voy a marcar cuáles llevan llamada a la acción de venta y cuáles no. Respétalo.",
        "Cada objeción de <objeciones_frecuentes> queda desarmada por al menos una pieza del plan, sin nombrarla como objeción: se desarma mostrando, no discutiendo.",
        "Usa <prueba_social_disponible> tal cual está. No la infles, no la redondees y no le agregues testimonios nuevos.",
        "Una llamada a la acción por pieza, una sola acción, específica: qué hace la persona, dónde, y qué pasa después.",
      ]),
      "</estrategia_de_venta>",
    ].join("\n");
  }

  return [
    "<estrategia_de_autoridad>",
    bullets([
      "En este plan no hay nada para vender. Está prohibido mencionar precios, ofertas, cupos, lanzamientos, «enlace en la biografía para comprar» o cualquier llamada a la acción de compra. Si te sale un guion que termina vendiendo, reescríbelo.",
      "El objetivo es que esta cuenta quede asociada a UNA idea. Vas a definir esa idea, la tesis, en tu primera respuesta, y todas las piezas la empujan desde ángulos distintos.",
      "Las llamadas a la acción son de conversación y de guardado: una pregunta que solo esta audiencia puede responder, un motivo real para guardar la pieza, o una invitación a discrepar.",
      "La autoridad se demuestra mostrando criterio en casos difíciles, no repitiendo consejos correctos.",
    ]),
    "</estrategia_de_autoridad>",
  ].join("\n");
}

function planGeneral(ctx: PromptContext): string {
  return [
    "<plan_general>",
    `El plan es de ${ctx.duracionEtiqueta}, partido en ${ctx.totalSemanas} bloques semanales. Te los voy a pasar de a uno, en mensajes separados, en esta misma conversación. Nunca me des más de un bloque por vez, aunque yo te lo pida sin querer: si te pido dos semanas juntas, haz solo la primera y avísame.`,
    "</plan_general>",
  ].join("\n");
}

function instruccionesFinales(ctx: PromptContext): string {
  const segundoPunto =
    ctx.answers.objetivo === "lanzamiento"
      ? "**Ángulo de la campaña:** una sola oración con el ángulo desde el que vamos a vender, que no puede ser «compra esto»."
      : "**Tesis de la cuenta:** una sola oración con la idea que esta cuenta va a instalar durante todo el plan.";

  return [
    "<instrucciones_finales>",
    "Ahora, y solo ahora.",
    "",
    "NO escribas guiones. NO escribas un calendario. NO escribas ideas de contenido. Nada de eso todavía.",
    "",
    "Responde exactamente con estas cuatro cosas, en este orden, y nada más:",
    "",
    "1. **A quién le hablamos:** una oración, en tus palabras, sobre quién es esta audiencia y qué le está pasando. Si repites literal lo que te escribí, no sirve.",
    `2. ${segundoPunto}`,
    `3. **Clichés prohibidos de este nicho:** tres frases o formatos concretos, propios de ${ctx.answers.nicho}, que se usan hasta el cansancio y que te vas a prohibir durante todo el plan. Específicos del nicho, no genéricos.`,
    "4. **Preguntas:** dos como máximo, y solo si hay algo que de verdad te impide trabajar. Si no tienes dudas reales, escribe «Ninguna».",
    "",
    "Después de eso, para y espera. Yo te paso el bloque de la Semana 1.",
    "</instrucciones_finales>",
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
    "<restricciones_duras>",
    `1. Exactamente ${ctx.piezasPorSemanaLabel}. Ni una más, ni una menos.`,
    `2. Formato: ${ctx.formatoLabel}. Nada que necesite más de «${ctx.tiempoPorPiezaLabel.toLowerCase()}» por pieza, ni más equipo que «${ctx.equipoLabel.toLowerCase()}».`,
    `3. ${mision.reglaCTA}`,
    `4. Prueba del reemplazo: si cambias «${ctx.answers.nicho}» por otro rubro y el guion sigue funcionando, está mal.`,
    `5. Sigue prohibido lo que está quemado en ${ctx.plataformaPrincipalLabel}:`,
    bullets(ctx.trends.evitar),
    "</restricciones_duras>",
  ].join("\n");
}

function continuidad(semana: number): string | null {
  if (semana === 1) return null;

  return [
    "<continuidad>",
    `Mira el bloque <memoria> con el que cerraste la Semana ${semana - 1}. No repitas ninguno de esos ganchos, ángulos ni ejemplos. Esta semana avanza sobre la anterior, no la recicla.`,
    "</continuidad>",
  ].join("\n");
}

function antesDeEscribir(ctx: PromptContext): string {
  return [
    "<antes_de_escribir>",
    "Dentro de etiquetas <analisis>, en 150 palabras como máximo (lo voy a saltear al leer):",
    "1. Qué creencia concreta de mi audiencia ataca cada pieza de esta semana. Una línea por pieza.",
    `2. De las ${ctx.piezasPorSemanaLabel}, cuál es la más floja y por qué. Después reemplázala por una mejor antes de escribir el entregable.`,
    "3. Cómo evitas que dos ganchos arranquen con la misma estructura.",
    "Cierra </analisis> y recién ahí escribe el entregable.",
    "</antes_de_escribir>",
  ].join("\n");
}

/** El esqueleto de cada pieza es la rama donde más se nota el formato elegido. */
function esqueletoDePieza(ctx: PromptContext): string {
  if (ctx.answers.formato === "texto_carrusel") {
    return [
      "### Pieza {n} — {título interno corto}",
      "**Publicar:** {día}",
      "**Ángulo:** una línea con qué creencia toca o qué tensión abre.",
      "**Lámina 1 (portada):** diez palabras como máximo. Es el gancho y es lo único que se ve en el feed.",
      "**Láminas 2 a N:** numeradas, veinticinco palabras como máximo por lámina, una idea por lámina.",
      "**Lámina del giro:** marca en cuál cambia la idea.",
      "**Lámina final:** la llamada a la acción.",
      "**Texto de la publicación:** según <convenciones_de_texto>.",
      "**Por qué funciona:** una línea, honesta.",
      "",
      "No escribas guion hablado ni indicaciones de cámara: acá no hay video.",
    ].join("\n");
  }

  if (ctx.answers.formato === "faceless") {
    return [
      "### Pieza {n} — {título interno corto}",
      "**Publicar:** {día}",
      "**Ángulo:** una línea con qué creencia toca o qué tensión abre.",
      "**Gancho (0-3 s):** lo que dice la voz en off, palabra por palabra.",
      "**Texto en pantalla del gancho:** siete palabras como máximo.",
      "**Guion de voz en off:** bloques con su marca de tiempo.",
      "**Plan de imágenes:** qué se ve en cada bloque — captura de pantalla, material de archivo, gráfico, mano en cuadro. Concreto y grabable con lo que tengo.",
      "**Ritmo:** cada cuántos segundos cambia la imagen.",
      "**Llamada a la acción:** una sola acción.",
      "**Texto de la publicación:** según <convenciones_de_texto>.",
      "**Por qué funciona:** una línea, honesta.",
      "",
      "El gancho tiene que funcionar sin cara: si depende de una expresión o de la energía de alguien hablando a cámara, no sirve.",
    ].join("\n");
  }

  return [
    "### Pieza {n} — {título interno corto}",
    "**Publicar:** {día}",
    "**Ángulo:** una línea con qué creencia toca o qué tensión abre.",
    "**Gancho (0-3 s):** lo que se dice, palabra por palabra.",
    "**Texto en pantalla del gancho:** siete palabras como máximo.",
    "**Guion:** bloques con su marca de tiempo.",
    "**Dirección de cámara:** encuadre, energía, dónde cortar, y qué gesto o acción concreta se hace durante el gancho.",
    "**Texto en pantalla del resto:** solo lo imprescindible.",
    "**Llamada a la acción:** una sola acción.",
    "**Texto de la publicación:** según <convenciones_de_texto>.",
    "**Por qué funciona:** una línea, honesta.",
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
    "<formato_de_salida>",
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
    "<memoria>",
    "- Ganchos usados: …",
    "- Ángulos ya quemados: …",
    "- Qué queda pendiente para la semana que viene: …",
    "</memoria>",
    "</formato_de_salida>",
  ]);
}

function controlDeCalidad(ctx: PromptContext): string {
  const noVender =
    ctx.answers.objetivo === "autoridad"
      ? "¿Alguna pieza termina vendiendo algo? Reescríbela."
      : null;

  return lines([
    "<control_de_calidad>",
    "Antes de mandarme la respuesta, revísala en silencio contra esta lista y corrige lo que falle. No me muestres la revisión.",
    bullets(
      [
        `¿Hay exactamente ${ctx.piezasPorSemanaLabel}?`,
        "¿Alguna arranca presentando la pieza, o con una fórmula de <prohibiciones>? Reescríbela.",
        "¿Dos ganchos empiezan con la misma estructura sintáctica? Cambia uno.",
        "¿Alguna pieza pasa la prueba del reemplazo, es decir, podría ser de cualquier otro nicho? Reescríbela.",
        `¿Alguna necesita más de «${ctx.tiempoPorPiezaLabel.toLowerCase()}» o más equipo que «${ctx.equipoLabel.toLowerCase()}»? Simplifícala.`,
        "¿Inventaste algún dato, cifra o testimonio? Cámbialo por [DATO A COMPLETAR: …].",
        "¿Usaste alguno de los tres clichés que tú mismo te prohibiste al principio?",
        noVender,
      ].filter(present)
    ),
    "</control_de_calidad>",
  ]);
}

function siTeQuedasSinEspacio(): string {
  return [
    "<si_te_quedas_sin_espacio>",
    "Termina la pieza en la que estés, no la cortes por la mitad, y escribe en una línea aparte, exactamente: CONTINÚO",
    "Yo te voy a responder «sigue» y retomas desde la pieza siguiente.",
    "</si_te_quedas_sin_espacio>",
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
    `<bloque_semanal numero="${semana}" de="${ctx.totalSemanas}">`,
    "Seguimos en la misma conversación, con el mismo contexto del primer mensaje. No lo repitas ni lo resumas.",
    restriccionesDuras(ctx, mision),
    ["<mision_de_la_semana>", mision.mision, "</mision_de_la_semana>"].join("\n"),
    continuidad(semana),
    antesDeEscribir(ctx),
    formatoDeSalida(ctx, semana, mision),
    controlDeCalidad(ctx),
    siTeQuedasSinEspacio(),
    "</bloque_semanal>",
  ]);
}

export const claudeAdapter: PromptAdapter = { buildSetup, buildSemana };
