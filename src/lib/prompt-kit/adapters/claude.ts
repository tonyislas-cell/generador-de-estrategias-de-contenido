import type { PromptContext } from "../context";
import type { MisionDeTanda } from "../misiones";
import { bullets, lines, sections } from "./prose";
import { bloqueSinCubrir, type PromptAdapter } from "./types";
import {
  bloqueDeEstado,
  esqueletoDelGuionLargo,
  esqueletoDelPar,
  esqueletoDePieza,
  formatoDeAngulos,
  resultadosDeLaSemanaAnterior,
  verificacionDeLaSemana,
  type DialectoDeSalida,
} from "../plantillas";

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

/**
 * Cómo decora Claude las líneas del entregable que pide.
 *
 * Negritas de markdown y no etiquetas: las etiquetas marcan lo que YO le doy
 * de contexto, y esto es lo que ÉL tiene que devolverme. Mezclarlas haría que
 * el entregable saliera envuelto en tags.
 *
 * `cita` sí usa la etiqueta, porque es una referencia a una sección del
 * contexto, y ahí Claude resuelve la etiqueta mejor que una descripción.
 */
const SALIDA: DialectoDeSalida = {
  tituloDePieza: (texto) => `### ${texto}`,
  campo: (nombre, valor) => `**${nombre}:** ${valor}`,
  nombreDeCampo: (nombre) => `**${nombre}:**`,
  cita: (etiqueta) => `<${etiqueta}>`,
  rotulo: (texto) => `**${texto}**`,
  bloqueLiteral: (etiqueta, _titulo, cuerpo) =>
    `<${etiqueta}>\n${cuerpo}\n</${etiqueta}>`,
};

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
    "<formatos_de_produccion>",
    bullets(ctx.formatos.map((f) => `${f.label}: ${f.descriptor}`)),
    "</formatos_de_produccion>",
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


/** La capacidad de producción del kit de video largo: por video, no por semana. */
function capacidadDeVideoLargo(ctx: PromptContext): string {
  return lines([
    "<capacidad_de_produccion>",
    `<cadencia>${ctx.totalVideos === 1 ? "Un video" : `${ctx.totalVideos} videos`} en ${ctx.duracionEtiqueta}: uno cada dos semanas. Un video largo no cabe en menos.</cadencia>`,
    `<tiempo_de_produccion>${ctx.tiempoDescriptor} Es el presupuesto por sesión de grabación, no por el video entero.</tiempo_de_produccion>`,
    "<equipo_disponible>",
    bullets(ctx.equipos.map((e) => `${e.label}: ${e.descriptor}`)),
    "</equipo_disponible>",
    "</capacidad_de_produccion>",
  ]);
}

function capacidadDeProduccion(ctx: PromptContext): string {
  // En video largo la cadencia sale de la duración, no de una frecuencia
  // semanal: no tiene sentido hablar de piezas por semana.
  if (ctx.tipoDeKit === "youtube_largo") return capacidadDeVideoLargo(ctx);

  const agrupado = ctx.requiereAgrupado
    ? `<agrupado>Con ${ctx.piezasPorSemanaLabel} por semana y ${ctx.tiempoPorPiezaLabel.toLowerCase()} por pieza, agrupa en un mismo día las piezas que compartan encuadre, ropa o preparación, y marca cuáles se graban juntas.</agrupado>`
    : null;

  return lines([
    "<capacidad_de_produccion>",
    `<frecuencia>${ctx.frecuenciaLabel} — ${ctx.piezasPorSemanaLabel} por semana, ni una más</frecuencia>`,
    `<tiempo_por_pieza>${ctx.tiempoDescriptor}</tiempo_por_pieza>`,
    "<equipo_disponible>",
    bullets(ctx.equipos.map((e) => `${e.label}: ${e.descriptor}`)),
    "</equipo_disponible>",
    agrupado,
    "</capacidad_de_produccion>",
  ]);
}

/**
 * Cómo funciona la plataforma, separado de qué está rindiendo.
 *
 * Va antes de `<tendencias_de_plataforma>` porque las mecánicas restringen y
 * las tendencias inspiran: primero el marco, después las ideas.
 */
function mecanicaDePlataforma(ctx: PromptContext): string {
  const { mecanica } = ctx;

  const confirmado =
    mecanica.confirmado.length > 0
      ? lines([
          "<confirmado>",
          bullets(mecanica.confirmado.map((d) => `${d.etiqueta}: ${d.valor}`)),
          "</confirmado>",
        ])
      : `<confirmado>No tengo mecánicas verificadas de ${ctx.plataformaPrincipalLabel}. Cualquier afirmación sobre cómo funciona esta plataforma va marcada [NO VERIFICADO].</confirmado>`;

  const discutido =
    mecanica.discutido.length > 0
      ? lines([
          "<discutido>",
          "Esto circula en guías de marketing y no está documentado por la plataforma. Puedes tenerlo en cuenta para decidir, pero está prohibido afirmarlo como mecánica o construir una instrucción sobre eso:",
          bullets(mecanica.discutido),
          "</discutido>",
        ])
      : null;

  return lines([
    `<mecanica_de_plataforma plataforma="${ctx.plataformaPrincipalLabel}" revisada="${mecanica.revisada}">`,
    confirmado,
    discutido,
    "</mecanica_de_plataforma>",
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
      "<formatos_que_rinden>: al menos la mitad de las piezas de cada tanda sale de ahí.",
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
    "8. No inventes mecánicas de plataforma. Nunca afirmes un dato sobre cómo funciona la plataforma —topes, duraciones, señales, medidas, umbrales— que no esté en <mecanica_de_plataforma>. Si no está ahí, escribe [NO VERIFICADO] al lado de la afirmación y sigue. Lo que está en <discutido> no se afirma como mecánica.",
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
        "No todas las piezas venden. En cada bloque te voy a marcar cuáles llevan llamada a la acción de venta y cuáles no. Respétalo.",
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
    `El plan es de ${ctx.duracionEtiqueta}, partido en ${ctx.tipoDeKit === "youtube_largo" ? `${ctx.totalVideos} videos` : `${ctx.totalSemanas} bloques semanales`}. Te los voy a pasar de a uno, en mensajes separados, en esta misma conversación. Nunca me des más de un bloque por vez, aunque yo te lo pida sin querer: si te pido dos bloques juntos, haz solo la primera y avísame.`,
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
    `Después de eso, para y espera. Yo te paso el primer bloque: ${ctx.tipoDeKit === "youtube_largo" ? "el par título/miniatura del Video 1" : "el banco de ángulos de la Semana 1"}.`,
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

function restriccionesDuras(ctx: PromptContext, mision: MisionDeTanda): string {
  const equipoListado = ctx.equipos
    .map((e) => `«${e.label.toLowerCase()}»`)
    .join(" o ");
  const formatoLinea =
    ctx.formatos.length === 1
      ? `Formato: ${ctx.formatos[0].label}.`
      : `Formato: cada pieza usa el que mejor le sirva entre estos, con la estructura que le corresponde: ${ctx.formatos.map((f) => `«${f.label.toLowerCase()}»`).join(" o ")}.`;

  return [
    "<restricciones_duras>",
    `1. Exactamente ${ctx.piezasPorSemanaLabel}. Ni una más, ni una menos.`,
    `2. ${formatoLinea} Nada que necesite más de «${ctx.tiempoPorPiezaLabel.toLowerCase()}» por pieza. Cada pieza usa el equipo que mejor le sirva, sin superar ninguno de estos niveles: ${equipoListado}.`,
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
    `Mira el bloque <estado> con el que cerraste la Semana ${semana - 1}. No repitas ninguno de esos ganchos, ángulos ni ejemplos. Esta semana avanza sobre la anterior, no la recicla.`,
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

function formatoDeSalida(
  ctx: PromptContext,
  semana: number,
  mision: MisionDeTanda
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
    `Después, las ${ctx.piezasPorSemanaLabel}, cada una con ${ctx.formatos.length === 1 ? "esta estructura exacta" : "la estructura que le corresponda según su formato"}:`,
    "",
    esqueletoDePieza(ctx, SALIDA),
    adaptacion,
    "",
    "Termina con este bloque, literal:",
    "",
    bloqueDeEstado(SALIDA),
    "</formato_de_salida>",
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

function buildGuiones(ctx: PromptContext, semana: number): string {
  const mision = misionDeSemana(ctx, semana);

  return sections([
    `<bloque_semanal numero="${semana}" de="${ctx.totalSemanas}">`,
    "Seguimos en la misma conversación, con el mismo contexto del primer mensaje. No lo repitas ni lo resumas.",
    restriccionesDuras(ctx, mision),
    ["<mision_de_la_semana>", mision.mision, "</mision_de_la_semana>"].join("\n"),
    continuidad(semana),
    antesDeEscribir(ctx),
    formatoDeSalida(ctx, semana, mision),
    verificacionDeLaSemana(ctx.answers.nicho, ctx.formatos.length > 1, SALIDA),
    siTeQuedasSinEspacio(),
    "</bloque_semanal>",
  ]);
}


/** La misión de la tanda, con el mismo guard que usa el bloque semanal. */
function misionDeVideo(ctx: PromptContext, video: number): MisionDeTanda {
  const mision = ctx.misiones[video - 1];
  if (!mision) {
    throw new Error(
      `No hay misión definida para el video ${video} de un plan de ${ctx.totalVideos} videos.`
    );
  }
  return mision;
}

// ------------------------------------------------------ video largo

function buildParTitulo(ctx: PromptContext, video: number): string {
  const mision = misionDeVideo(ctx, video);

  return sections([
    `<bloque_par_titulo video="${video}" de="${ctx.totalVideos}">`,
    "Seguimos en la misma conversación, con el mismo contexto del primer mensaje. No lo repitas ni lo resumas.",
    ["<mision_del_video>", mision.mision, "</mision_del_video>"].join("\n"),
    lines([
      "<antes_del_guion>",
      "Todavía no escribas el guion. Un video largo se gana antes de reproducirse: el título y la miniatura son una sola decisión del espectador, no dos. Si el par no se sostiene solo, el video no se hace.",
      "</antes_del_guion>",
    ]),
    lines([
      "<formato_de_salida>",
      "Dame 5 pares, con esta estructura exacta:",
      "",
      esqueletoDelPar(SALIDA),
      "",
      "Reglas:",
      bullets([
        "Los 5 prometen cosas distintas, no el mismo video con otro nombre.",
        "La miniatura se graba con lo que tengo: celular, mi cara y objetos que ya existen en mi mundo. Nada de gráficos que yo no pueda hacer.",
        "Si la promesa no se puede pagar antes del minuto 3, el par se descarta.",
        "Ninguno usa las fórmulas prohibidas ni los clichés del nicho que tú mismo te prohibiste.",
      ]),
      "</formato_de_salida>",
    ]),
    lines([
      "<cierre>",
      "Después de los 5, marca el que escogerías y por qué, en una línea. Y para ahí: yo elijo el definitivo y te lo digo.",
      "</cierre>",
    ]),
    "</bloque_par_titulo>",
  ]);
}

function buildGuionLargo(ctx: PromptContext, video: number): string {
  const mision = misionDeVideo(ctx, video);

  return sections([
    `<bloque_guion_largo video="${video}" de="${ctx.totalVideos}">`,
    "Ya elegí el par. Escribe el guion de ese video.",
    lines([
      "<restricciones_duras>",
      "1. Duración objetivo: entre 8 y 12 minutos. Un video de 8 minutos apretado rinde más que uno de 15 estirado.",
      "2. La promesa del par elegido se paga en el minuto que ese par declaró, y nunca después del minuto 3 si el título la promete de entrada.",
      `3. ${mision.reglaCTA}`,
      `4. Prueba del reemplazo: si cambias «${ctx.answers.nicho}» por otro rubro y el video sigue funcionando, está mal.`,
      "5. Nada que necesite a otra persona ni equipo que no esté declarado arriba.",
      "</restricciones_duras>",
    ]),
    lines([
      "<formato_de_salida>",
      "Empieza con el título elegido, la promesa textual del par y el minuto en que se paga. Después:",
      "",
      esqueletoDelGuionLargo(SALIDA),
      "</formato_de_salida>",
    ]),
    verificacionDelVideo(ctx),
    siTeQuedasSinEspacio(),
    "</bloque_guion_largo>",
  ]);
}

/** La verificación se imprime: una revisión en silencio no se puede auditar. */
function verificacionDelVideo(ctx: PromptContext): string {
  return lines([
    "<verificacion>",
    "Imprime esta tabla al final. Si una celda falla, corrige el guion antes de mandarme la respuesta y deja la celda en OK. No me expliques la corrección.",
    "",
    "| duración objetivo | suma del minutaje | minuto donde se paga la promesa | caracteres del título | palabras en la miniatura | tomas de apoyo | datos que inventaste |",
    "",
    "Y después, en una línea cada uno:",
    bullets([
      "¿El título promete algo que el video no entrega antes del minuto 3?",
      "¿La miniatura se puede grabar sola, con celular y con lo que hay?",
      "¿El primer minuto se presenta a sí mismo en vez de entrar al caso?",
      "¿Algún bloque cierra sin abrir el siguiente? Cuál.",
    ]),
    `Prueba del reemplazo: ¿este video funcionaría igual en otro nicho que no sea «${ctx.answers.nicho}»?`,
    "</verificacion>",
  ]);
}


/** La misión de la tanda, con el mismo guard que usa el bloque de video. */
function misionDeSemana(ctx: PromptContext, semana: number): MisionDeTanda {
  const mision = ctx.misiones[semana - 1];
  if (!mision) {
    throw new Error(
      `No hay misión definida para la semana ${semana} de un plan de ${ctx.totalSemanas} semanas.`
    );
  }
  return mision;
}

function buildAngulos(ctx: PromptContext, semana: number): string {
  const mision = misionDeSemana(ctx, semana);

  return sections([
    `<banco_de_angulos semana="${semana}" de="${ctx.totalSemanas}">`,
    "Seguimos en la misma conversación, con el mismo contexto del primer mensaje. No lo repitas ni lo resumas.",
    semana > 1 ? resultadosDeLaSemanaAnterior(semana, SALIDA) : null,
    ["<mision_de_la_semana>", mision.mision, "</mision_de_la_semana>"].join("\n"),
    lines([
      "<instruccion>",
      "No escribas guiones todavía. En este turno solo se idea.",
      "",
      "Dame 12 ángulos, uno por línea, en este formato exacto:",
      "",
      formatoDeAngulos(SALIDA),
      "</instruccion>",
    ]),
    lines(["<cierre>", "Después de los 12, marca los 3 que tú escogerías y por qué, en una línea cada uno. Y para ahí: yo elijo los 3 definitivos y te los digo.", "</cierre>"]),
    "</banco_de_angulos>",
  ]);
}

export const claudeAdapter: PromptAdapter = {
  build: (ctx, req) => {
    // `switch` con rama por defecto imposible, y no un ternario: cuando entre
    // un tipo de bloque nuevo, esto tiene que dejar de compilar acá. Un
    // ternario lo mandaría en silencio a la rama equivocada.
    switch (req.kind) {
      case "setup":
        return buildSetup(ctx);
      case "angulos":
        return buildAngulos(ctx, req.semana);
      case "guiones":
        return buildGuiones(ctx, req.semana);
      case "par_titulo":
        return buildParTitulo(ctx, req.video);
      case "guion_largo":
        return buildGuionLargo(ctx, req.video);
      default:
        return bloqueSinCubrir(req);
    }
  },
};
