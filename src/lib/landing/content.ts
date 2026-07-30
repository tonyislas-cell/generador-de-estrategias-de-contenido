/**
 * Copy de la landing, como datos y en un solo lugar.
 *
 * Mismo criterio que `options.ts` o `descriptors.ts`: el texto que ve el
 * usuario no vive suelto dentro del JSX, así los tests afirman contra una única
 * fuente y no contra literales duplicados por toda la página.
 *
 * Lo que sí se deriva del producto (el arco semanal) se importa de
 * `misiones.ts` en el componente que lo pinta, no se copia acá.
 */

export const MARCA = {
  nombre: "El Brief",
} as const;

export const HERO = {
  /** El `<h1>`. Se parte en dos para poder enfatizar la segunda mitad. */
  titularLinea1: "No genera tu contenido.",
  titularLinea2: "Genera las órdenes que tu IA necesita.",
  entrada:
    "Respondes un cuestionario sobre tu nicho, tu audiencia y cuánto tiempo tienes de verdad. Te llevas los prompts listos para pegar en Claude, ChatGPT o Gemini, y el plan sale con tu voz, no con la del modelo.",
  cta: "Empezar el cuestionario",
  ctaNota: "Gratis, sin cuenta y sin correo.",
  /** Las tres tarjetas escalonadas que ilustran el mecanismo, sin una sola imagen. */
  pila: [
    {
      etiqueta: "Prompt 1 — Configuración",
      lineas: [
        "<rol>",
        "Eres estratega de contenido y",
        "guionista de formato corto…",
      ],
    },
    {
      etiqueta: "Prompt 2 — Semana 1 · Ángulos",
      lineas: [
        "Dame 12 ángulos. No escribas",
        "guiones todavía: marca los 3",
        "que tú escogerías, y para ahí.",
      ],
    },
    {
      etiqueta: "Prompt 3 — Semana 1 · Guiones",
      lineas: [
        "| s | qué se dice | texto |",
        "La suma tiene que dar la",
        "duración objetivo…",
      ],
    },
  ],
} as const;

export const DONACION = {
  url: "https://buymeacoffee.com/tonyisland",
  etiqueta: "Invítame un café",
  nota: "El proyecto es gratis y no tiene publicidad. Si te sirvió, esto ayuda a mantenerlo en pie.",
} as const;

export const COMO_FUNCIONA = {
  eyebrow: "Cómo funciona",
  titulo: "Tres pasos, y el tercero es el que importa",
  pasos: [
    {
      titulo: "Eliges qué produces y respondes",
      cuerpo:
        "Primero, si vas por video vertical corto o por video largo de YouTube: son dos kits distintos y no se mezclan. Después, nicho, audiencia, tono y estilo de gancho, más cuánto tiempo tienes por pieza y con qué equipo cuentas. Entre tres y cinco minutos.",
      detalle:
        "Esa última parte es la que evita que el plan te proponga cosas que no vas a poder grabar.",
    },
    {
      titulo: "Eliges con qué IA y por cuánto tiempo",
      cuerpo:
        "Claude, ChatGPT o Gemini. Las tres si quieres: cada una recibe un prompt escrito para cómo lee ese modelo en particular, no el mismo texto copiado tres veces.",
      detalle: "Plan de catorce días o de un mes.",
    },
    {
      titulo: "Pegas los bloques de a uno, y eliges en el medio",
      cuerpo:
        "Acá está la diferencia. No es un botón de «genérame treinta posts». Cada semana son dos bloques: el primero te da doce ángulos y se detiene, tú marcas tres, y el segundo escribe esos tres.",
      detalle:
        "Los mejores tres de doce le ganan a los primeros tres. Ese es el único punto donde entra tu criterio, y es el que decide la calidad del plan entero.",
    },
  ],
} as const;

export const QUE_RECIBES = {
  eyebrow: "Qué te llevas",
  titulo: "Prompts, no contenido ya escrito",
  entrada:
    "Un bloque de configuración que instala el contexto, y después dos por semana: uno para elegir ángulos y otro para escribirlos. Todo en texto plano, tuyo para editar antes de pegarlo.",
  bloques: {
    titulo: "La estructura del kit",
    setup: {
      etiqueta: "Prompt 1 — Configuración",
      cuerpo:
        "Instala quién eres, a quién le hablas y qué no se puede escribir. El modelo confirma el contexto y se detiene: todavía no escribe guiones, y eso es a propósito.",
    },
    semanal: {
      etiqueta: "Prompt 2 en adelante — dos bloques por semana",
      cuerpo:
        "El de ángulos trae la misión de esa semana y se detiene con doce ideas sobre la mesa. El de guiones escribe los tres que elegiste, con tabla de segundos, tres ganchos por pieza y una verificación que el modelo tiene que imprimir, no hacer en silencio.",
    },
  },
  extras: {
    titulo: "Y además",
    items: [
      "Una pestaña por modelo, si elegiste más de uno.",
      "Descarga del kit completo en .md para guardarlo o pasarlo a tu equipo.",
      "Mecánicas reales de cada plataforma, con fecha, separando lo que la plataforma documenta de lo que solo repiten las guías de marketing.",
      "Kit aparte para video largo de YouTube: primero el par título/miniatura, después el guion.",
    ],
  },
} as const;

export const ARCO = {
  eyebrow: "El arco del plan",
  titulo: "Cada semana tiene un trabajo distinto",
  entrada:
    "Sin esto, cada bloque sería intercambiable con el anterior y el plan se sentiría como una lista de ideas sueltas en vez de una campaña. Estos son los arcos reales del plan de un mes.",
  autoridad: "Si construyes autoridad",
  lanzamiento: "Si estás lanzando algo",
} as const;

/**
 * La lista de clichés vetados. Es un subconjunto de `<prohibiciones>`, la
 * sección que los tres adaptadores inyectan en el prompt de configuración
 * (`src/lib/prompt-kit/adapters/*.ts`). Se transcribe y no se importa porque
 * ahí vive como prosa dentro de la plantilla, no como lista.
 */
export const PROHIBIDO = {
  eyebrow: "Lo que tu kit prohíbe",
  titulo: "El prompt trae una lista de lo que el modelo no puede escribir",
  entrada:
    "No es un pedido amable de «sé original». Son cadenas concretas que quedan vetadas antes de que el modelo escriba la primera línea.",
  frases: [
    "En este video te voy a contar…",
    "Quédate hasta el final",
    "3 tips que nadie te dice",
    "el secreto que nadie quiere que sepas",
    "¿Sabías que…?",
    "En un mundo donde…",
    "esto te va a volar la cabeza",
    "No es magia, es método",
  ],
  citaTitulo: "La prueba del reemplazo",
  cita: "Si puedes cambiar tu nicho por cualquier otro rubro y el guion sigue teniendo sentido, el guion está mal.",
  citaPie:
    "Es la primera de las siete reglas de escritura que van dentro del prompt de configuración.",
} as const;

export const CIERRE = {
  titulo: "Tu próxima semana de contenido, en cinco minutos",
  cuerpo:
    "Sin cuenta, sin correo y sin rastreo. El contador de usos es un número que sube: no guarda tu IP, ni una cookie, ni una huella de navegador.",
  cta: "Empezar el cuestionario",
} as const;
