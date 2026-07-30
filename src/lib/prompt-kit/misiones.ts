import type { Objetivo } from "@/lib/wizard/types";
import { DURACION_CONFIG, type Duracion } from "./types";

export interface MisionDeTanda {
  /** Encabezado corto que el modelo repite al abrir la tanda. */
  titulo: string;
  /** Qué tiene que lograr esta tanda dentro del arco completo. */
  mision: string;
  /** Qué puede y qué no puede pedir esta semana en materia de llamada a la acción. */
  reglaCTA: string;
}

const SIN_VENTA =
  "En este plan no se vende nada. Cero llamadas a la acción de compra: ni precios, ni cupos, ni enlaces para comprar. Las llamadas a la acción son de conversación y de guardado.";

/** La primera semana de autoridad es la misma en los dos arcos; se comparte para que no se separen al editar. */
const INSTALAR_LA_TESIS: MisionDeTanda = {
  titulo: "Instalar la tesis",
  mision:
    "Esta semana la cuenta tiene que quedar clara. Las piezas instalan la tesis: qué crees que la mayoría de esta audiencia tiene mal, y por qué. Al menos una pieza va abiertamente en contra del consenso del nicho, y al menos una muestra criterio en un caso concreto y difícil.",
  reglaCTA: SIN_VENTA,
};

/**
 * Arco narrativo del plan.
 *
 * Sin esto, cada bloque semanal sería intercambiable con el anterior y el plan
 * se sentiría como una lista de ideas sueltas en vez de una campaña. Cada
 * semana tiene un trabajo distinto y explícito.
 */
const MISIONES: Record<Objetivo, Record<Duracion, MisionDeTanda[]>> = {
  autoridad: {
    "14_dias": [
      INSTALAR_LA_TESIS,
      {
        titulo: "Del qué al cómo",
        mision:
          "Ya quedó dicho qué crees; esta semana muestras cómo se hace. Piezas de mecanismo: pasos, errores caros, decisiones que la audiencia no sabe que está tomando. Al menos una pieza desarma el consejo más repetido del nicho. Cierra con una pieza que funcione como formato repetible, algo que pueda convertirse en serie.",
        reglaCTA: SIN_VENTA,
      },
    ],
    "1_mes": [
      INSTALAR_LA_TESIS,
      {
        titulo: "Del qué al cómo",
        mision:
          "Ya quedó dicho qué crees; esta semana muestras cómo se hace. Piezas de mecanismo: pasos, errores caros, decisiones que la audiencia no sabe que está tomando. Al menos una pieza desarma el consejo más repetido del nicho.",
        reglaCTA: SIN_VENTA,
      },
      {
        titulo: "Contraste",
        mision:
          "Comparas tu forma de hacer las cosas con la forma habitual del sector y muestras el costo real de la forma habitual. Al menos una pieza anticipa la crítica más obvia a tu tesis y la responde de frente, sin ponerse a la defensiva.",
        reglaCTA: SIN_VENTA,
      },
      {
        titulo: "Consolidación",
        mision:
          "Recuperas las ideas que más tracción tuvieron y las conviertes en formatos repetibles: una serie con nombre propio, una pregunta recurrente. Al menos una pieza le habla a quien ya te sigue, no a quien recién llega.",
        reglaCTA: SIN_VENTA,
      },
    ],
  },
  lanzamiento: {
    "14_dias": [
      {
        titulo: "Siembra del problema",
        mision:
          "Todavía no se vende. Instalas el problema que la oferta resuelve, en el lenguaje exacto de la audiencia, y haces visible el costo de no resolverlo. La audiencia tiene que llegar a la semana que viene ya convencida de que el problema es suyo y es caro.",
        reglaCTA:
          "Ninguna pieza de esta semana lleva llamada a la acción de compra. La última puede anticipar que viene algo, sin decir todavía qué es.",
      },
      {
        titulo: "Apertura y cierre",
        mision:
          "Esta semana se vende. Abres la oferta: qué es, para quién es y para quién no es. Al menos una pieza por cada objeción de la lista, desarmada mostrando y no discutiendo. Al menos una pieza usa la prueba social disponible. La última pieza es de cierre.",
        reglaCTA:
          "De la segunda pieza en adelante hay llamada a la acción de venta, una sola acción por pieza. Si existe un plazo o un límite real, úsalo; si no existe, no lo inventes.",
      },
    ],
    "1_mes": [
      {
        titulo: "Siembra del problema",
        mision:
          "Todavía no se vende. Instalas el problema que la oferta resuelve, en el lenguaje exacto de la audiencia, y haces visible el costo de no resolverlo.",
        reglaCTA:
          "Ninguna pieza de esta semana lleva llamada a la acción de compra.",
      },
      {
        titulo: "Mecanismo y solución",
        mision:
          "Sigues sin vender. Muestras que existe una forma mejor de resolver el problema y explicas por qué funciona. La oferta todavía no se nombra, pero todo lo que se enseña esta semana es lo que la oferta hace más rápido o más fácil.",
        reglaCTA:
          "Ninguna pieza lleva llamada a la acción de compra. La última puede anticipar que viene algo.",
      },
      {
        titulo: "Apertura de la oferta",
        mision:
          "Se abre la oferta: qué es, para quién es y para quién no es. Al menos una pieza por cada objeción de la lista, desarmada mostrando y no discutiendo.",
        reglaCTA:
          "Todas las piezas menos la primera llevan llamada a la acción de venta, una sola acción por pieza.",
      },
      {
        titulo: "Prueba social y cierre",
        mision:
          "Última semana. Las piezas se apoyan en la prueba social disponible y en casos concretos, y el plan termina con una pieza de cierre que da un motivo real para decidir ahora.",
        reglaCTA:
          "Todas las piezas llevan llamada a la acción de venta. Si existe un plazo o un límite real, úsalo; si no existe, no lo inventes.",
      },
    ],
  },
};

export function getMisiones(
  objetivo: Objetivo,
  duracion: Duracion
): MisionDeTanda[] {
  const misiones = MISIONES[objetivo][duracion];

  // El arco y la duración se editan por separado; si alguna vez dejan de
  // coincidir, es mejor romper acá que emitir un kit con semanas de menos.
  if (misiones.length !== DURACION_CONFIG[duracion].semanas) {
    throw new Error(
      `El arco de ${objetivo}/${duracion} tiene ${misiones.length} semanas y la duración declara ${DURACION_CONFIG[duracion].semanas}.`
    );
  }

  return misiones;
}

/**
 * Arco del plan de video largo.
 *
 * Es más corto porque la cadencia lo es: un video cada dos semanas, así que un
 * plan de 14 días trae uno y uno de un mes trae dos. Con tan pocas piezas el
 * arco no puede permitirse una semana de calentamiento — cada video tiene que
 * sostenerse solo y a la vez empujar el siguiente.
 */
const MISIONES_VIDEO: Record<Objetivo, Record<Duracion, MisionDeTanda[]>> = {
  autoridad: {
    "14_dias": [
      {
        titulo: "El caso difícil",
        mision:
          "Un solo video, así que tiene que ser el que mejor te representa. Elige un caso concreto y difícil de tu trabajo y muestra cómo lo resolviste, con el criterio a la vista. No un listado de consejos: una decisión, sus alternativas y por qué descartaste cada una. Quien llegue por primera vez tiene que salir sabiendo cómo piensas.",
        reglaCTA: SIN_VENTA,
      },
    ],
    "1_mes": [
      {
        titulo: "Instalar la tesis",
        mision:
          "El primero de dos. Este video instala qué crees que la mayoría de esta audiencia tiene mal, y por qué. Va en contra del consenso del nicho de frente, con un caso concreto que lo sostenga. Cierra abriendo la pregunta que responde el segundo video.",
        reglaCTA: SIN_VENTA,
      },
      {
        titulo: "El mecanismo, en detalle",
        mision:
          "Ya quedó dicho qué crees; este muestra cómo se hace, paso a paso y con los errores caros marcados. Retoma explícitamente la pregunta con la que cerró el anterior — los dos videos tienen que leerse como una serie, no como dos subidas sueltas, porque la contribución a la sesión es señal principal en formato largo.",
        reglaCTA: SIN_VENTA,
      },
    ],
  },
  lanzamiento: {
    "14_dias": [
      {
        titulo: "El problema, con la oferta al final",
        mision:
          "Un solo video. Los primeros dos tercios instalan el problema que la oferta resuelve, en el lenguaje exacto de la audiencia, y hacen visible el costo de no resolverlo. El último tercio abre la oferta: qué es, para quién es y para quién no es.",
        reglaCTA:
          "Una sola llamada a la acción, de venta, al final. Nada de repetirla a lo largo del video: con dos menciones el espectador desconfía del video entero.",
      },
    ],
    "1_mes": [
      {
        titulo: "Siembra del problema",
        mision:
          "Todavía no se vende. Este video instala el problema y hace visible su costo, con un caso propio y un número real. La oferta no se nombra. Cierra anticipando que hay una forma mejor de resolverlo, que es lo que muestra el segundo.",
        reglaCTA:
          "Ninguna llamada a la acción de compra. Puede anticipar que viene algo, sin decir qué es.",
      },
      {
        titulo: "Mecanismo y apertura",
        mision:
          "Muestra la forma mejor de resolver el problema y por qué funciona, y recién sobre el final abre la oferta: qué es, para quién es y para quién no es. Al menos una objeción de la lista queda desarmada mostrando, no discutiendo.",
        reglaCTA:
          "Una sola llamada a la acción, de venta, al final. Si existe un plazo o un límite real, úsalo; si no existe, no lo inventes.",
      },
    ],
  },
};

/** El arco del plan de video largo, una misión por video. */
export function getMisionesDeVideo(
  objetivo: Objetivo,
  duracion: Duracion
): MisionDeTanda[] {
  const misiones = MISIONES_VIDEO[objetivo][duracion];

  if (misiones.length !== DURACION_CONFIG[duracion].videos) {
    throw new Error(
      `El arco de video de ${objetivo}/${duracion} tiene ${misiones.length} videos y la duración declara ${DURACION_CONFIG[duracion].videos}.`
    );
  }

  return misiones;
}
