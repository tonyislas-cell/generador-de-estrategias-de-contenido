import type { Formato } from "@/lib/wizard/types";
import { lines } from "./adapters/prose";
import type { PromptContext } from "./context";

/**
 * Los esqueletos del entregable: lo que el modelo tiene que **emitir**.
 *
 * Vive fuera de los adaptadores por el mismo motivo que `descriptors.ts`: es
 * agnóstico al modelo. Qué campos lleva una pieza, en qué orden y con qué
 * instrucción es una decisión de producto, idéntica para los tres modelos —
 * lo único que cambia es cómo se decora cada línea, y eso entra por
 * `DialectoDeSalida`.
 *
 * La distinción importa: el envoltorio de las secciones del prompt (tags XML
 * en Claude, encabezados markdown en ChatGPT, rótulos planos en Gemini) sí es
 * ingeniería de prompt específica de cada modelo y se sigue escribiendo a mano
 * en cada adaptador. Esto de acá no: es la plantilla de la respuesta, y
 * duplicarla tres veces solo produce deriva. Ya la produjo — antes de esta
 * extracción los tres esqueletos habían quedado con los mismos campos pero con
 * tres decoraciones distintas escritas por separado.
 */

/** Cómo decora cada modelo las líneas del entregable que pide. */
export interface DialectoDeSalida {
  /** Encabezado de una pieza dentro del entregable. */
  tituloDePieza: (texto: string) => string;
  /** Un campo que el modelo tiene que rellenar. */
  campo: (nombre: string, valor: string) => string;
  /** Cómo se nombra un campo cuando el texto habla *de* ese campo. */
  nombreDeCampo: (nombre: string) => string;
  /**
   * Cómo se cita una sección anterior del prompt. Claude entiende la
   * referencia por su etiqueta; los otros dos la necesitan en prosa.
   */
  cita: (etiqueta: string, prosa: string) => string;
  /** Una línea suelta que hace de rótulo dentro del entregable. */
  rotulo: (texto: string) => string;
  /**
   * Un bloque literal que el modelo tiene que devolver entero — la memoria de
   * arrastre, la tabla de resultados. Claude lo pide con etiquetas porque
   * después hay que citarlo; los otros dos con un encabezado.
   */
  bloqueLiteral: (etiqueta: string, titulo: string, cuerpo: string) => string;
}

interface Campo {
  nombre: string;
  valor: string;
}

interface Esqueleto {
  campos: Campo[];
  /** Partes de varias líneas: la tabla de beats, los tres ganchos. */
  bloques?: string[];
  /** Advertencia al pie, cuando el formato la necesita. */
  nota: string | null;
}

const textoDePublicacion = (d: DialectoDeSalida): Campo => ({
  nombre: "Texto de la publicación",
  valor: `según ${d.cita("convenciones_de_texto", "las convenciones de texto de arriba")}.`,
});

const PORTADA: Campo[] = [
  { nombre: "Publicar", valor: "{día}" },
  {
    nombre: "Ángulo",
    valor: "una línea con qué creencia toca o qué tensión abre.",
  },
];

const POR_QUE_FUNCIONA: Campo = {
  nombre: "Por qué funciona",
  valor: "una línea, honesta.",
};

const LLAMADA_A_LA_ACCION: Campo = {
  nombre: "Llamada a la acción",
  valor: "una sola acción.",
};


/** Bloques del entregable que no son un campo suelto: llevan varias líneas. */
function tresGanchos(d: DialectoDeSalida): string {
  return lines([
    d.rotulo("Tres ganchos, palabra por palabra:"),
    "- A: … (doce palabras como máximo)",
    "- B: … (doce palabras como máximo)",
    "- C: … (doce palabras como máximo)",
    "Los tres abren con una estructura sintáctica distinta. Marca cuál recomiendas y por qué, en una línea.",
  ]);
}

function tablaDeBeats(d: DialectoDeSalida): string {
  return lines([
    d.rotulo("Tabla de beats:"),
    "| s | qué se dice, palabra por palabra | texto en pantalla (≤ 6 palabras) | corte |",
    "| 0-3 | | | — |",
    "| 3-… | | | |",
    "La suma tiene que dar exactamente la duración objetivo. Si no da, reescribe la pieza en vez de estirarla.",
  ]);
}

const DURACION_OBJETIVO: Campo = {
  nombre: "Duración objetivo",
  valor:
    "{n} segundos, por debajo de 90 mientras el objetivo sea gente nueva. Es un compromiso: la tabla de beats tiene que sumar ese número.",
};

const SEGUNDO_CINCO: Campo = {
  nombre: "El segundo 5",
  valor:
    "qué cambia ahí. Es el punto donde la gente se va, así que necesita un segundo estímulo que mueva la expectativa: un dato, un encuadre distinto, una mini revelación.",
};

const TIPO_DE_CIERRE: Campo = {
  nombre: "Tipo de cierre",
  valor:
    "elige uno y justifícalo en media línea: corte seco justo cuando cae el pago, llamada a la acción de 2 segundos, o bucle para que el arranque tenga sentido al repetirse.",
};

const PALABRA_CLAVE: Campo = {
  nombre: "Palabra clave, en las tres capas",
  valor:
    "cuál es, y dónde va: dicha en voz alta dentro de los primeros 3 segundos, en pantalla en el primer cuadro, y escrita al inicio del pie.",
};

const PRIMER_COMENTARIO: Campo = {
  nombre: "Primer comentario",
  valor: "qué va, o «ninguno».",
};

const DELTA_POR_RED: Campo = {
  nombre: "Delta por red",
  valor:
    "qué cambia entre una red y otra. Si va a más de una, el audio se regraba y el texto en pantalla se rehace: copiar el archivo pierde el indexado por voz y por texto. Si no cambia nada, dilo.",
};

function esqueletoDeFormato(formato: Formato, d: DialectoDeSalida): Esqueleto {
  if (formato === "texto_carrusel") {
    return {
      campos: [
        ...PORTADA,
        {
          nombre: "Lámina 1 (portada)",
          valor:
            "diez palabras como máximo. Es el gancho y es lo único que se ve en el feed.",
        },
        {
          nombre: "Láminas 2 a N",
          valor:
            "numeradas, veinticinco palabras como máximo por lámina, una idea por lámina.",
        },
        { nombre: "Lámina del giro", valor: "marca en cuál cambia la idea." },
        { nombre: "Lámina final", valor: "la llamada a la acción." },
        textoDePublicacion(d),
        PRIMER_COMENTARIO,
        DELTA_POR_RED,
        POR_QUE_FUNCIONA,
      ],
      nota: "No escribas guion hablado ni indicaciones de cámara: acá no hay video.",
    };
  }

  if (formato === "faceless") {
    return {
      campos: [
        ...PORTADA,
        DURACION_OBJETIVO,
        {
          nombre: "Plan de imágenes",
          valor:
            "qué se ve en cada bloque — captura de pantalla, material de archivo, gráfico, mano en cuadro. Concreto y grabable con lo que tengo.",
        },
        { nombre: "Ritmo", valor: "cada cuántos segundos cambia la imagen." },
        SEGUNDO_CINCO,
        TIPO_DE_CIERRE,
        PALABRA_CLAVE,
        LLAMADA_A_LA_ACCION,
        textoDePublicacion(d),
        PRIMER_COMENTARIO,
        DELTA_POR_RED,
        POR_QUE_FUNCIONA,
      ],
      bloques: [tresGanchos(d), tablaDeBeats(d)],
      nota: "El gancho tiene que funcionar sin cara: si depende de una expresión o de la energía de alguien hablando a cámara, no sirve.",
    };
  }

  return {
    campos: [
      ...PORTADA,
      DURACION_OBJETIVO,
      {
        nombre: "Dirección de cámara",
        valor:
          "encuadre, altura de cámara, dónde cortar, y qué gesto o acción concreta se hace durante el gancho: algo que se vea, no un estado de ánimo.",
      },
      { nombre: "Tomas y cortes", valor: "cuántas de cada uno." },
      {
        nombre: "Cuadro de portada",
        valor: "en qué segundo, y qué tiene que verse en él.",
      },
      SEGUNDO_CINCO,
      TIPO_DE_CIERRE,
      PALABRA_CLAVE,
      LLAMADA_A_LA_ACCION,
      textoDePublicacion(d),
      PRIMER_COMENTARIO,
      DELTA_POR_RED,
      POR_QUE_FUNCIONA,
    ],
    bloques: [tresGanchos(d), tablaDeBeats(d)],
    nota: "El texto en pantalla queda fuera de la zona segura declarada más arriba: nada en el tercio superior ni en el inferior.",
  };
}

/** El esqueleto de una pieza en un formato dado — donde más se nota el formato elegido. */
export function esqueletoParaFormato(
  formato: Formato,
  d: DialectoDeSalida
): string {
  const { campos, bloques = [], nota } = esqueletoDeFormato(formato, d);

  return lines([
    d.tituloDePieza("Pieza {n} — {título interno corto}"),
    ...campos.map((campo) => d.campo(campo.nombre, campo.valor)),
    ...bloques.flatMap((bloque) => ["", bloque]),
    ...(nota ? ["", nota] : []),
  ]);
}

/**
 * Inserta la línea del campo «Formato» justo después del título, para que el
 * esqueleto muestre dónde va el campo que la instrucción de arriba pide.
 */
export function declararFormatoEnEsqueleto(
  esqueleto: string,
  etiqueta: string,
  d: DialectoDeSalida
): string {
  const [titulo, ...resto] = esqueleto.split("\n");
  return [titulo, d.campo("Formato", etiqueta), ...resto].join("\n");
}

/** Con un solo formato, el esqueleto de siempre. Con más de uno, cada pieza declara cuál usa. */
export function esqueletoDePieza(
  ctx: PromptContext,
  d: DialectoDeSalida
): string {
  if (ctx.formatos.length === 1) {
    return esqueletoParaFormato(ctx.formatos[0].value, d);
  }

  return lines([
    `Elegiste más de un formato de producción. Cada pieza declara con cuál se hizo, con la línea ${d.nombreDeCampo("Formato")} al principio, y sigue exactamente la estructura de esa sección — no mezcles campos de un formato con otro. Repártelas entre los formatos elegidos según lo que mejor sirva a cada idea; no hace falta usar todos cada semana.`,
    "",
    ...ctx.formatos.flatMap((f, i) => [
      i === 0 ? null : "",
      d.rotulo(`Si la pieza es ${f.label}:`),
      declararFormatoEnEsqueleto(esqueletoParaFormato(f.value, d), f.label, d),
    ]),
  ]);
}

// ------------------------------------------------------- YouTube largo

/**
 * El par título/miniatura.
 *
 * Va antes del guion porque un video largo se decide antes de reproducirse:
 * título y miniatura son una sola decisión del espectador, no dos. Si el par
 * no se sostiene solo, el video no se hace.
 */
export function esqueletoDelPar(d: DialectoDeSalida): string {
  return lines([
    d.tituloDePieza("Par {n}"),
    d.campo("Título", "{título}. Legible en móvil sin que se corte la parte que importa."),
    d.campo(
      "Miniatura",
      "qué se ve, en una frase. Objetos y encuadre concretos: nada de «expresión de sorpresa» ni de gráficos que no pueda hacer yo."
    ),
    d.campo(
      "Texto en miniatura",
      "cuatro palabras como máximo, y ninguna repetida del título."
    ),
    d.campo("Promesa", "qué se lleva el espectador. Una línea."),
    d.campo("Dónde se paga", "en qué minuto del video se cumple esa promesa."),
  ]);
}

/** El guion de un video largo: por minutos, no por segundos. */
export function esqueletoDelGuionLargo(d: DialectoDeSalida): string {
  return lines([
    d.rotulo("Primer minuto, palabra por palabra:"),
    "Sin presentación, sin «bienvenidos» y sin decir mi nombre. Se entra directo al caso. Al cerrar ese minuto tiene que estar claro qué se lleva el espectador y por qué le conviene quedarse. Escríbelo completo, no en viñetas.",
    "",
    d.rotulo("Cuerpo, por bloques:"),
    "| minuto | qué se dice (idea, no palabra por palabra) | qué se ve | por qué no se van aquí |",
    "| 1-3 | | | |",
    "| 3-… | | | |",
    "",
    "Cada bloque cierra abriendo el siguiente: ninguno termina cerrado. Marca los dos minutos donde creo que la gente se va, y qué pusiste ahí para retenerla. Al menos un bloque muestra criterio en un caso difícil.",
    "",
    d.campo(
      "Capítulos",
      "marcas de tiempo con nombre. La primera es exactamente 00:00, van al menos 3 en orden ascendente, cada una dura 10 segundos o más, y el formato es «0:00 Título» con los segundos a dos dígitos. Un punto en vez de dos puntos rompe la lista entera en silencio. Títulos descriptivos y por debajo de 40 caracteres: «Introducción» y «Parte 1» no dicen nada."
    ),
    d.campo(
      "Tomas de apoyo",
      "lo que tengo que grabar aparte. Solo cosas que pueda grabar solo, con celular, en la misma sesión. Cinco como máximo."
    ),
    d.campo(
      "Cierre",
      "una sola llamada a la acción, de conversación o de guardado. Cero venta."
    ),
    d.campo(
      "Descripción",
      "primera línea como titular, escrita como alguien la buscaría de verdad, y las marcas de tiempo abajo."
    ),
    d.campo(
      "Derivados verticales",
      "dos ideas que salen de este video, cada una con su gancho nuevo regrabado. No son recortes: son piezas nuevas que usan el mismo material."
    ),
    d.campo("Por qué funciona", "una línea, honesta."),
  ]);
}

// --------------------------------------------------------- kit vertical

/** El formato exacto del banco de ángulos. Doce, y ninguno se parece a otro. */
export function formatoDeAngulos(d: DialectoDeSalida): string {
  return lines([
    "[n]. [creencia concreta que ataca] → [gancho en una frase, doce palabras como máximo] → [formato de la pieza] → [dato concreto que la sostiene]",
    "",
    d.rotulo("Reglas:"),
    "- Los 12 atacan creencias distintas. Nada de variaciones del mismo ángulo con otras palabras.",
    "- Ningún gancho abre con la misma estructura sintáctica que otro.",
    "- Ninguno repite un ángulo o un gancho que ya esté en el estado de la semana pasada.",
    "- Cada uno declara qué dato concreto lo sostiene. Si no hay dato, el ángulo no entra.",
  ]);
}

/** El bloque de arrastre entre semanas. Se pide literal para poder pegarlo después. */
export function bloqueDeEstado(d: DialectoDeSalida): string {
  return d.bloqueLiteral(
    "estado",
    "Estado",
    lines([
      "- Ganchos usados, por estructura de apertura: …",
      "- Ángulos quemados: …",
      "- Datos concretos ya gastados: …",
      "- Piezas publicadas y en qué red: …",
      "- Pendiente para la semana que viene: …",
    ])
  );
}

/** La tabla que el creador rellena con sus propios números antes de pedir ángulos. */
export function resultadosDeLaSemanaAnterior(
  semana: number,
  d: DialectoDeSalida
): string {
  return lines([
    d.bloqueLiteral(
      "resultados_semana_anterior",
      "Mis números de la semana pasada",
      lines([
        "| pieza | red | retención 3 s | reproducción completa | reenvíos | guardados | comentarios |",
        "",
        "La peor pieza fue: [cuál] · Lo que creo que pasó: [mi lectura, en una línea].",
      ])
    ),
    "",
    `Antes de darme los 12 ángulos de la Semana ${semana}, dime en tres líneas qué cambias por estos números y qué dejas igual. Si los números no alcanzan para concluir nada, dilo en vez de inventar una lectura.`,
  ]);
}

/** La verificación que el modelo tiene que imprimir al final de los guiones. */
export function verificacionDeLaSemana(
  nicho: string,
  variosFormatos: boolean,
  d: DialectoDeSalida
): string {
  return d.bloqueLiteral(
    "verificacion",
    "Verificación, para imprimir",
    lines([
      "Imprime esta tabla al final. Si una celda falla, corrige la pieza antes de mandarme la respuesta y deja la celda en OK. No me expliques la corrección.",
      "",
      "| pieza | duración objetivo | suma de beats | palabras del gancho recomendado | datos inventados | ganchos que abren igual que otro |",
      "",
      "Y después, en una línea cada uno:",
      `- Prueba del reemplazo: ¿alguna pieza funcionaría igual en un nicho que no sea «${nicho}»? Cuál, y qué cambiaste.`,
      "- Clichés del nicho: ¿usaste alguno de los tres que tú mismo te prohibiste? Cuál.",
      "- Producción: ¿alguna pasa del tiempo por pieza declarado, o necesita a otra persona? Cuál, y cómo la simplificaste.",
      variosFormatos
        ? "- Estructura: ¿alguna pieza mezcla campos de dos formatos distintos? Corrígela para que use solo la estructura del formato que declaró."
        : null,
    ])
  );
}
