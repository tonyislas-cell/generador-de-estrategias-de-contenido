import type { Plataforma } from "@/lib/wizard/types";
import type { TrendsSnippet } from "./types";

/**
 * Línea base de mecánicas por plataforma.
 *
 * Describe cómo se comporta cada plataforma de forma estable —qué premia el
 * algoritmo, qué estructuras de apertura funcionan, qué formatos están gastados
 * desde hace años— y no las tendencias de esta semana, que envejecen mal y no
 * se pueden mantener desde código.
 *
 * El dueño del producto reemplaza este contenido con investigación propia desde
 * el panel de administración. Cuando eso exista, este archivo desaparece y
 * `getTrendsSnippet` lee de la base de datos.
 */
const PERIODO = "mecánicas estables — línea base, no tendencias del mes";

export const TRENDS_BY_PLATAFORMA: Record<Plataforma, TrendsSnippet> = {
  tiktok: {
    plataforma: "tiktok",
    periodo: PERIODO,
    formatos: [
      "Demostración en una sola toma, sin cortes, donde el resultado se ve antes de los 5 segundos.",
      "Listas en pantalla que avanzan más rápido de lo que se alcanzan a leer, para provocar que la pieza se vuelva a ver.",
      "Antes y después con el después mostrado primero.",
      "Respuesta a un comentario propio fijado, contestando algo que la audiencia preguntó de verdad.",
    ],
    ganchos: [
      "Afirmación numérica concreta que contradice lo que la audiencia da por hecho.",
      "Arrancar en la mitad de la acción, sin presentación ni saludo.",
      "Nombrar en voz alta al segmento exacto al que le hablas dentro de la primera frase.",
    ],
    senales: [
      "Porcentaje de reproducción completa: la pieza tiene que durar lo mínimo que necesita para cerrar la idea.",
      "Repeticiones, que suben cuando hay un detalle que solo se capta la segunda vez.",
      "Comentarios que discuten el contenido, no que felicitan.",
    ],
    evitar: [
      "Intros con logo, cortina musical o presentación del canal.",
      "Bailes o transiciones que no tienen relación con lo que estás contando.",
      "Texto ubicado en los bordes superior e inferior, que la interfaz tapa.",
    ],
    convencionesCopy:
      "Pie de una línea que agregue contexto en lugar de repetir lo que ya se ve. Entre 3 y 5 etiquetas: una amplia del rubro, dos del subtema, ninguna genérica de las que se ponen para rellenar.",
  },

  instagram_reels: {
    plataforma: "instagram_reels",
    periodo: PERIODO,
    formatos: [
      "Pieza pensada para reenviarse por mensaje privado: algo que alguien quiere que otra persona en particular vea.",
      "Secuencia de cortes cortos donde cada corte desarma una objeción distinta.",
      "Tutorial a pantalla completa con una pausa marcada justo en el paso más difícil.",
      "Relato en primera persona sobre una decisión que salió mal y qué se cambió después.",
    ],
    ganchos: [
      "Frase que la audiencia querría reenviarle a alguien, escrita como un reproche cariñoso.",
      "Mostrar el error común dentro del cuadro en el primer segundo, todavía sin explicarlo.",
      "Prometer un criterio para decidir, no un listado de opciones.",
    ],
    senales: [
      "Reenvíos por mensaje privado, que es lo que más empuja alcance nuevo.",
      "Guardados, que indican que la pieza sirve como referencia para volver.",
      "Permanencia medida contra la duración de la propia pieza.",
    ],
    evitar: [
      "Reaprovechar el mismo corte vertical de otra red con la marca de agua puesta.",
      "Audio de moda usado sin ninguna relación con el mensaje.",
      "Portadas que no se entienden si la pieza no se reproduce.",
    ],
    convencionesCopy:
      "La primera línea del texto funciona como titular, porque es lo único que se ve sin desplegar. Etiquetas al final o en el primer comentario, entre 5 y 8, mezclando comunidad y tema.",
  },

  youtube_shorts: {
    plataforma: "youtube_shorts",
    periodo: PERIODO,
    formatos: [
      "Respuesta directa a una pregunta que la gente escribe en el buscador, con esa pregunta dicha textual.",
      "Fragmento que se entiende solo, sin haber visto nada anterior del canal.",
      "Comparación lado a lado de dos maneras de hacer lo mismo, con el costo de cada una.",
      "Explicación de un concepto apoyada en un objeto físico dentro del cuadro.",
    ],
    ganchos: [
      "Enunciar el problema con las mismas palabras que usaría alguien al buscarlo.",
      "Adelantar el resultado final en el primer segundo y recién después explicar cómo se llegó.",
      "Contradecir el consejo más repetido sobre el tema y dar el motivo en la misma frase.",
    ],
    senales: [
      "Relación entre quienes se quedan y quienes deslizan durante los primeros tres segundos.",
      "Duración media vista sobre duración total, bastante más que el número de reproducciones.",
      "Suscripciones atribuidas a la pieza, que muestran que sirvió de puerta de entrada.",
    ],
    evitar: [
      "Pedir suscripción antes de haber entregado algo de valor.",
      "Cortar la idea por la mitad para forzar que vean otra pieza.",
      "Reutilizar la miniatura del formato largo, que acá no cumple ninguna función.",
    ],
    convencionesCopy:
      "Título descriptivo y buscable, con las palabras que alguien tipearía, sin signos de exclamación. Descripción de una o dos líneas que amplíe el tema. Máximo 3 etiquetas.",
  },

  linkedin: {
    plataforma: "linkedin",
    periodo: PERIODO,
    formatos: [
      "Publicación de texto que abre con una decisión profesional concreta y el resultado que produjo.",
      "Desglose de un proceso interno que la mayoría de las empresas mantiene puertas adentro.",
      "Análisis de un error caro propio, con el número real de lo que costó.",
      "Documento de varias páginas donde cada página sostiene un solo argumento.",
    ],
    ganchos: [
      "Abrir con una cifra del propio trabajo y la decisión que la produjo.",
      "Nombrar una práctica aceptada del sector y declarar por qué la dejaste de usar.",
      "Plantear la pregunta que hizo un cliente y que nadie del sector responde en público.",
    ],
    senales: [
      "Lectura sostenida antes de tocar ver más, que depende casi por completo de las tres primeras líneas.",
      "Comentarios extensos de gente del sector, que pesan mucho más que las reacciones.",
      "Republicaciones con comentario agregado.",
    ],
    evitar: [
      "Historias de superación sin relación con el trabajo, puestas para forzar emoción.",
      "Frases motivacionales de una línea separadas por saltos de párrafo vacíos.",
      "Enlaces externos dentro del cuerpo, que recortan el alcance frente a dejarlos en comentarios.",
    ],
    convencionesCopy:
      "Las tres primeras líneas deciden todo, porque el resto queda detrás de ver más. Párrafos de una o dos líneas con aire entre ellos. Sin etiquetas, o tres como máximo al final. El enlace va en el primer comentario.",
  },
};
