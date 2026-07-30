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
          "una marca de agua de otra plataforma saca la pieza de Explora y de recomendaciones.",
      },
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
      {
        etiqueta: "Gancho doble",
        valor:
          "un primer impacto que frena el desplazamiento y, alrededor del segundo 5, un segundo estímulo que cambia la expectativa: un dato, un encuadre distinto, una mini revelación. Es la técnica documentada para el punto exacto donde la gente se va.",
      },
      {
        etiqueta: "El cierre tiene tres opciones",
        valor:
          "cortar en seco justo cuando cae el pago, que maximiza repeticiones; una llamada a la acción de 2 segundos; o cerrar en bucle, para que el arranque tenga sentido al repetirse. Elige una y justifícala.",
      },
    ],
    discutido: [],
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
