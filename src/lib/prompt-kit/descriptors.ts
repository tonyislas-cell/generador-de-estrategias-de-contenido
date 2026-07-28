import type {
  Equipo,
  EstiloGancho,
  Formato,
  Frecuencia,
  TiempoPorPieza,
  Tono,
} from "@/lib/wizard/types";

/**
 * Expansión conductual de cada respuesta del cuestionario.
 *
 * La etiqueta sola no le dice nada útil a un modelo: "Cercano" no es una
 * instrucción. El prompt inyecta siempre `etiqueta — descriptor`, y el
 * descriptor es lo que convierte una opción de formulario en una restricción
 * concreta y verificable. Es la palanca más fuerte contra la salida genérica.
 *
 * Vive fuera de los adaptadores a propósito: es agnóstico al modelo, así que
 * los adaptadores de otros modelos lo reutilizan y solo aportan estructura,
 * orden y énfasis.
 */

/** Cómo tiene que escribir el modelo. */
export const TONO_DESCRIPTOR: Record<Tono, string> = {
  cercano:
    "escribe como quien le explica algo a un amigo en un café: segunda persona, frases cortas, cero jerga corporativa, y se admiten los propios errores.",
  autoritario:
    "afirma sin amortiguar. Nada de «quizás», «podría ser» ni «en mi humilde opinión». Toma posición y sostenla con criterio propio.",
  divertido:
    "el humor sale del reconocimiento («esto me pasa»), no del chiste puesto encima. Exageración y ritmo, nunca payasada gratuita.",
  provocador:
    "ataca creencias cómodas del nicho, nunca personas. Cada pieza deja a alguien incómodo, pero con un argumento atrás, no solo con la provocación.",
  profesional:
    "preciso y sobrio, pero no aburrido: datos, procesos y ejemplos concretos por encima de adjetivos.",
};

/** Qué se puede pedir y qué no, según cómo se produce. */
export const FORMATO_DESCRIPTOR: Record<Formato, string> = {
  camara:
    "se graba a cámara mostrando la cara. Puedes indicar encuadre, energía, gestos y texto en pantalla.",
  faceless:
    "voz en off sobre imágenes, capturas o material de archivo, sin que aparezca ninguna cara. El gancho tiene que funcionar sin persona en cuadro.",
  texto_carrusel:
    "no hay guion hablado. Todo se resuelve en láminas de texto o imagen más el pie de publicación.",
};

/** El presupuesto de producción por pieza. */
export const TIEMPO_POR_PIEZA_DESCRIPTOR: Record<TiempoPorPieza, string> = {
  menos_30min:
    "menos de 30 minutos por pieza: una sola toma, sin material de apoyo, sin gráficos animados y sin guion para memorizar.",
  "30_60min":
    "entre 30 y 60 minutos por pieza: hasta tres o cuatro cortes, texto en pantalla simple y subtítulos automáticos.",
  "1_2h":
    "entre una y dos horas por pieza: varias tomas, material de apoyo liviano, subtítulos y gráficos simples.",
  mas_2h:
    "más de dos horas por pieza: producción cuidada, material de apoyo, gráficos y edición con ritmo.",
};

/** Quién ejecuta, y por lo tanto qué es delegable. */
export const EQUIPO_DESCRIPTOR: Record<Equipo, string> = {
  solo: "se graba, edita y publica sin ayuda. No propongas nada que necesite una segunda persona.",
  con_editor:
    "hay alguien que edita. Separa siempre el guion de las notas de edición, para que se puedan delegar tal cual.",
  con_equipo_grabacion:
    "hay equipo de grabación: puedes pedir segunda cámara, locaciones distintas o invitados, pero el costo de coordinar sigue existiendo.",
};

/** La mecánica de apertura, no el adjetivo. */
export const ESTILO_GANCHO_MECANICA: Record<EstiloGancho, string> = {
  polemico:
    "abre con una afirmación que a la mayoría del nicho le va a molestar, y sosténla con un argumento dentro de los primeros diez segundos.",
  educativo:
    "abre prometiendo un mecanismo concreto («cómo funciona X»), nunca un beneficio vago. El valor tiene que estar visible en los primeros tres segundos.",
  storytelling:
    "abre en medio de la escena, sin preámbulo. Por ejemplo: «Me llamó un cliente a las once de la noche y…».",
  humor:
    "abre con la situación reconocible llevada al extremo. Nunca expliques el chiste.",
  curiosidad:
    "abre con un vacío de información específico. Prohibido el anzuelo vacío: la persona tiene que entender igual de qué se trata.",
};

/** Cuántas piezas por semana tolera la frecuencia declarada. */
export const PIEZAS_POR_SEMANA: Record<Frecuencia, number> = {
  semanal: 1,
  dos_tres_semana: 3,
  diaria: 7,
};

export function piezasLabel(cantidad: number): string {
  return cantidad === 1 ? "1 pieza" : `${cantidad} piezas`;
}
