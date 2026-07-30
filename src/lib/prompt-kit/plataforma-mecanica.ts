import type { Plataforma } from "@/lib/wizard/types";

/**
 * Cómo funciona cada plataforma, con fecha.
 *
 * Vive en código y no en `trends_snippets` a propósito. Las tendencias son
 * blandas —qué está rindiendo ahora— y cambian seguido, así que se editan
 * desde el panel. Esto es lo duro: topes, formatos de exportación, señales que
 * la plataforma dice que mide. Son datos con fuente y con fecha, y el historial
 * de git es el único lugar donde queda registro de cuándo cambió cada uno.
 * «Un dato sin fecha es un dato falso», y una fila de base de datos editable no
 * conserva esa fecha.
 *
 * La separación entre `confirmado` y `discutido` es estructural y no prosa
 * porque el prompt los inyecta con distinta fuerza: lo confirmado entra como
 * restricción, lo discutido entra con la instrucción explícita de no afirmarlo
 * como mecánica. Sin esa separación, «el 70% de finalización viraliza» —que
 * sale de blogs de crecimiento, no de TikTok— llegaría al guion como si fuera
 * documentación.
 *
 * Revisar cada tres meses. Fuentes en `modificaciones/03-hoja-de-plataforma-2026.md`.
 */

export interface MecanicaPlataforma {
  /** Cuándo se revisó esta entrada por última vez. */
  revisada: string;
  /**
   * Documentado por la plataforma o declarado en público por sus
   * responsables. Puede estar vacío: es preferible a inventar.
   */
  confirmado: { etiqueta: string; valor: string }[];
  /** Circula en guías de marketing y no está documentado. No se afirma como mecánica. */
  discutido: string[];
}

const REVISADA = "30 de julio de 2026";

/**
 * Mecánicas de guion que valen para cualquier vertical corto.
 *
 * La hoja las agrupa aparte de las secciones por plataforma, y con razón: no
 * son de TikTok ni de Reels ni de Shorts, son del formato. Van compartidas
 * entre las tres y no en una sola, que es donde estuvieron primero — ahí, quien
 * publicaba en Reels o TikTok nunca las recibía.
 *
 * LinkedIn queda afuera: no es video vertical corto.
 */
const FORMATO_CORTO: MecanicaPlataforma["confirmado"] = [
  {
    etiqueta: "El ritmo decide la retención, no la estructura",
    valor:
      "cada beat existe o se corta. Gancho → conflicto → sueño → solución → CTA es una fórmula de copywriting publicitario, no una mecánica de plataforma: úsala como andamio para no quedarte en blanco y bórrala del entregable. Si un beat no aporta información ni tensión, son segundos que cuestan finalización.",
  },
  {
    etiqueta: "Gancho doble",
    valor:
      "un primer impacto que frena el desplazamiento y, alrededor del segundo 5, un segundo estímulo que cambia la expectativa: un dato, un encuadre distinto, una mini revelación. Es la técnica documentada para el punto exacto donde la gente se va.",
  },
  {
    etiqueta: "El cierre tiene tres opciones, no una",
    valor:
      "cortar en seco justo cuando cae el pago, que maximiza repeticiones; una llamada a la acción de 2 segundos; o cerrar en bucle, para que el arranque tenga sentido al repetirse. Elige una y justifícala.",
  },
  {
    etiqueta: "Una sola llamada a la acción",
    valor: "siempre. Con dos opciones, el espectador no elige ninguna.",
  },
];

/**
 * La regla de producción de la palabra clave. La hoja la declara para Instagram
 * y para TikTok; no la extiende a las demás, así que acá tampoco.
 */
const PALABRA_CLAVE_EN_TRES_CAPAS = {
  etiqueta: "Palabra clave en tres capas",
  valor:
    "la palabra clave por la que quieres aparecer se dice en voz alta en los primeros 3 segundos, se ve en pantalla en el primer cuadro y se escribe al inicio del pie. Las tres capas, o no cuenta.",
} as const;

export const MECANICA_POR_PLATAFORMA: Record<Plataforma, MecanicaPlataforma> = {
  instagram_reels: {
    revisada: REVISADA,
    confirmado: [
      {
        etiqueta: "Señales, en orden de peso",
        valor:
          "tiempo de visualización primero; después envíos por mensaje privado sobre alcance, que es lo que más empuja hacia gente que no te sigue; después likes sobre alcance, que pesan más con tus propios seguidores que con gente nueva. Los comentarios no están en esa lista. Los guardados sirven como señal de referencia, no de alcance.",
      },
      {
        etiqueta: "No hay un solo algoritmo",
        valor:
          "hay sistemas de ranking separados para Feed, Reels, Stories y Explora, y cada uno pondera distinto. Una pieza puede volar en la pestaña de Reels y no aparecer en el feed de tus seguidores.",
      },
      {
        etiqueta: "Etiquetas",
        valor:
          "el tope es 5 por publicación desde enero de 2026. Usa entre 3 y 5, específicas. No mejoran el alcance: sirven para clasificar y para búsqueda, no para distribuir.",
      },
      {
        etiqueta: "Duración",
        valor:
          "por debajo de 90 segundos mientras el objetivo sea gente nueva. Instagram declara que los Reels de más de 3 minutos no se recomiendan a audiencias nuevas. Los topes de grabación son techos técnicos, no recomendaciones de rendimiento.",
      },
      {
        etiqueta: "Descubrimiento",
        valor:
          "el alcance se movió a búsqueda por palabras clave. La plataforma lee el pie, el texto en pantalla por OCR, el audio y el texto alternativo. El pie es un campo de posicionamiento, no un adorno, y los primeros 125 caracteres son los que más importan.",
      },
      {
        etiqueta: "Exportación",
        valor:
          "9:16, 1080 × 1920 px, MP4 H.264 a 30 fps. El feed recorta a 4:5, así que el borde superior y el inferior se pierden ahí.",
      },
      {
        etiqueta: "Descalifica",
        valor:
          "una marca de agua de otra plataforma saca la pieza de Explora y de recomendaciones. Se reporta además que 10 o más reposteos en 30 días sacan la cuenta entera de recomendaciones.",
      },
      PALABRA_CLAVE_EN_TRES_CAPAS,
      ...FORMATO_CORTO,
    ],
    discutido: [
      "La zona segura exacta: las fuentes no coinciden en los píxeles. Lo único consistente es la banda central, así que la regla práctica es no poner texto ni en el tercio superior ni en el inferior.",
      "El recorte de la cuadrícula del perfil, que unas fuentes dan rectangular y otras cuadrado. Compruébalo en tu propio perfil antes de diseñar portadas.",
      "El tiempo medio de visualización de referencia de unos 8,5 segundos: es un promedio de mercado, no un umbral de la plataforma.",
    ],
  },

  tiktok: {
    revisada: REVISADA,
    confirmado: [
      {
        etiqueta: "Señales, en orden de peso",
        valor:
          "tasa de finalización y tiempo medio de visualización pesan más que nada. Un video de 30 s visto al 80% le gana a uno de 60 s visto al 40%, aunque los segundos totales se parezcan. Las repeticiones cuentan: cada bucle suma. Compartidos, guardados y comentarios pesan mucho más que los likes, que son la señal más débil.",
      },
      {
        etiqueta: "Los seguidores no distribuyen",
        valor:
          "el conteo de seguidores no es un factor directo. Cada video se evalúa solo: el modelo prueba primero con tus propios seguidores y de ahí decide si expande.",
      },
      {
        etiqueta: "Tres capas de indexado",
        valor:
          "TikTok indexa cada video por tres vías al mismo tiempo: ASR, que transcribe lo que dices en voz alta; OCR, que lee el texto en pantalla; y el pie. La regla de producción que sale de ahí: tu palabra clave se dice en voz alta en los primeros 3 segundos, se ve en pantalla en el primer cuadro y se escribe al inicio del pie. Las tres capas, o no cuenta.",
      },
      {
        etiqueta: "Reciclar pierde dos capas",
        valor:
          "una pieza subida desde otra red sin regrabar el audio ni rehacer el texto en pantalla pierde el indexado por ASR y por OCR. Por eso recortar y reciclar no funciona acá.",
      },
      {
        etiqueta: "Exportación",
        valor:
          "9:16, 1080 × 1920 px, MP4 o MOV, H.264 a 30 fps. El pie admite hasta 4.000 caracteres.",
      },
      {
        etiqueta: "Zona segura",
        valor:
          "TikTok declara que varía según la dimensión y el largo del pie, y publica archivos por formato en vez de dar un número único. Regla práctica: pie más largo, más interfaz visible, más colisión. La columna derecha completa es de la plataforma.",
      },
      {
        etiqueta: "Comentario fijado",
        valor:
          "publicar un comentario propio con una o dos frases de contexto con palabras clave, y fijarlo arriba, suma texto indexable y suma a la métrica de comentarios.",
      },
      ...FORMATO_CORTO,
    ],
    discutido: [
      "El 70% de finalización como umbral para viralizar: la dirección es correcta —la finalización manda— pero el número sale de blogs de crecimiento, no de TikTok.",
      "Los umbrales de distribución por fases, del tipo 200 a 500 vistas de prueba y después 5.000 a 50.000: son estimaciones de terceros.",
    ],
  },

  youtube_shorts: {
    revisada: REVISADA,
    confirmado: [
      {
        etiqueta: "Shorts y video largo están separados",
        valor:
          "el rendimiento de uno ya no arrastra al otro. No asumas que un Short que funciona empuja al canal largo.",
      },
      ...FORMATO_CORTO,
    ],
    discutido: [],
  },

  youtube_largo: {
    revisada: REVISADA,
    confirmado: [
      {
        etiqueta: "El CTR consigue el clic, la retención consigue la siguiente impresión",
        valor:
          "un CTR alto con retención baja te perjudica: la plataforma lo lee como anzuelo. Se reporta que por debajo de ~40% de retención el video se despriorizada sin importar el CTR.",
      },
      {
        etiqueta: "Dónde se pierde el video",
        valor:
          "los primeros 30 segundos y el sostén hasta la mitad son lo que más pesa. Una caída fuerte al inicio es peor señal que no haber conseguido el clic. Las encuestas de satisfacción del espectador pesan más que el tiempo de visualización crudo.",
      },
      {
        etiqueta: "Contribución a la sesión",
        valor:
          "cuánto extiende tu video la sesión del usuario es señal principal en formato largo. Por eso las series y las listas de reproducción rinden más que subidas sueltas.",
      },
      {
        etiqueta: "La miniatura corresponde a los primeros 60 segundos",
        valor:
          "si la miniatura muestra algo, esos primeros segundos lo entregan. Es la regla dura de coherencia del formato.",
      },
      {
        etiqueta: "Miniatura",
        valor:
          "1280 × 720 px, 16:9. JPG para foto, a calidad 85 y por debajo de 2 MB. YouTube encima la duración del video en la esquina inferior derecha y no se puede mover: nada importante en ese 15%. Se muestra desde 116 × 65 px en móvil, así que si no se lee a ese tamaño, no se lee.",
      },
      {
        etiqueta: "Capítulos",
        valor:
          "tres condiciones, y si falla una no se activan: la primera marca es exactamente 00:00; hay 3 marcas como mínimo, en orden ascendente; cada capítulo dura al menos 10 segundos. Formato «0:00 Título», uno por línea, con los segundos a dos dígitos. Un punto en vez de dos puntos rompe la lista entera, en silencio.",
      },
      {
        etiqueta: "Búsqueda",
        valor:
          "la gente busca en preguntas completas, no en palabras clave estilo 2019. Los primeros 100 caracteres de la descripción tienen que reflejar lo que una persona escribiría de verdad.",
      },
      {
        etiqueta: "Estructura",
        valor:
          "un video de 8 minutos apretado casi siempre rinde más que uno de 15 estirado. El ritmo va más apretado en los primeros tres minutos y puede aflojar cuando el espectador ya se comprometió. Una sola llamada a la acción por video: con dos opciones, no elige ninguna. Las listas de consejos se olvidan; los mismos consejos con contraste, conflicto y consecuencia se quedan.",
      },
      {
        etiqueta: "Shorts y largo están separados",
        valor:
          "el rendimiento de uno ya no arrastra al otro. Y recortar este video en vertical con la interfaz de YouTube encima está prohibido: el derivado se regraba.",
      },
    ],
    discutido: [
      "El tope de peso de la miniatura: las fuentes se contradicen entre 2 MB y 50 MB, y el aumento parece estar en despliegue. Quédate por debajo de 2 MB y no tienes problema.",
      "El «efecto sándwich», que tu video suba si cae entre dos de alta retención en una sesión.",
      "La «memoria de 90 días» del algoritmo. Es lectura de terceros, no documentación.",
    ],
  },

  linkedin: {
    revisada: REVISADA,
    // La hoja de plataforma no cubre LinkedIn. Dejarlo vacío es la respuesta
    // correcta: el prompt va a decir explícitamente que no hay mecánicas
    // verificadas para esta plataforma, en vez de que el modelo se invente
    // unas. Las tendencias de LinkedIn siguen llegando por `trends_snippets`.
    confirmado: [],
    discutido: [],
  },
};
