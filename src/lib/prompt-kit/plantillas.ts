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
}

interface Campo {
  nombre: string;
  valor: string;
}

interface Esqueleto {
  campos: Campo[];
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
        POR_QUE_FUNCIONA,
      ],
      nota: "No escribas guion hablado ni indicaciones de cámara: acá no hay video.",
    };
  }

  if (formato === "faceless") {
    return {
      campos: [
        ...PORTADA,
        {
          nombre: "Gancho (0-3 s)",
          valor: "lo que dice la voz en off, palabra por palabra.",
        },
        {
          nombre: "Texto en pantalla del gancho",
          valor: "siete palabras como máximo.",
        },
        {
          nombre: "Guion de voz en off",
          valor: "bloques con su marca de tiempo.",
        },
        {
          nombre: "Plan de imágenes",
          valor:
            "qué se ve en cada bloque — captura de pantalla, material de archivo, gráfico, mano en cuadro. Concreto y grabable con lo que tengo.",
        },
        { nombre: "Ritmo", valor: "cada cuántos segundos cambia la imagen." },
        LLAMADA_A_LA_ACCION,
        textoDePublicacion(d),
        POR_QUE_FUNCIONA,
      ],
      nota: "El gancho tiene que funcionar sin cara: si depende de una expresión o de la energía de alguien hablando a cámara, no sirve.",
    };
  }

  return {
    campos: [
      ...PORTADA,
      {
        nombre: "Gancho (0-3 s)",
        valor: "lo que se dice, palabra por palabra.",
      },
      {
        nombre: "Texto en pantalla del gancho",
        valor: "siete palabras como máximo.",
      },
      { nombre: "Guion", valor: "bloques con su marca de tiempo." },
      {
        nombre: "Dirección de cámara",
        valor:
          "encuadre, energía, dónde cortar, y qué gesto o acción concreta se hace durante el gancho.",
      },
      {
        nombre: "Texto en pantalla del resto",
        valor: "solo lo imprescindible.",
      },
      LLAMADA_A_LA_ACCION,
      textoDePublicacion(d),
      POR_QUE_FUNCIONA,
    ],
    nota: null,
  };
}

/** El esqueleto de una pieza en un formato dado — donde más se nota el formato elegido. */
export function esqueletoParaFormato(
  formato: Formato,
  d: DialectoDeSalida
): string {
  const { campos, nota } = esqueletoDeFormato(formato, d);

  return lines([
    d.tituloDePieza("Pieza {n} — {título interno corto}"),
    ...campos.map((campo) => d.campo(campo.nombre, campo.valor)),
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
