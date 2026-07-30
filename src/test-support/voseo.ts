/**
 * Formas de voseo que de hecho se cuelan en este proyecto.
 *
 * El producto es de tuteo, nunca voseo, y ya se colaron dos veces en el copy
 * de la landing («Invitame», «generame»). Esto no es un corrector de gramática:
 * es la lista concreta de las formas que aparecen en la práctica, que es lo que
 * atrapa este error antes de que llegue a producción.
 *
 * Vive acá y no en cada test para que el copy de la landing y el texto de los
 * prompts se revisen contra la misma lista — el prompt es lo que más copy nuevo
 * suma y es el que nadie lee entero antes de publicar.
 */

/**
 * Los límites de palabra se arman a mano, y no con `\b`.
 *
 * `\b` de JavaScript se define sobre `[A-Za-z0-9_]`, así que una vocal
 * acentuada cuenta como carácter no-palabra: en `/\bmirá\b/`, el `\b` final
 * exige un límite después de la `á` y solo lo encuentra si lo que sigue es una
 * letra ASCII. Contra «Mirá el video» no engancha. Es decir: **todas las formas
 * de imperativo voseante, que son justamente las que terminan en vocal
 * acentuada, eran patrones muertos** — el guarda pasaba porque no podía fallar.
 *
 * Con `\p{L}` y la bandera `u` el límite sí abarca el alfabeto entero.
 */
const LIMITE_IZQUIERDO = "(?<![\\p{L}\\p{N}_])";
const LIMITE_DERECHO = "(?![\\p{L}\\p{N}_])";

const FORMAS = [
  // Presente de indicativo
  "sos",
  "vos",
  "tenés",
  "podés",
  "querés",
  "sabés",
  "hacés",
  "venís",
  "elegís",
  "escribís",
  "decís",
  "mirás",
  // Imperativo con pronombre enclítico, que en voseo pierde la tilde
  "invitame",
  "generame",
  "contame",
  "mirame",
  "decime",
  "fijate",
  "marcame",
  "elegime",
  // Imperativo suelto.
  //
  // Acá solo entran verbos de la primera conjugación y de la segunda, donde el
  // imperativo voseante no choca con nada. Quedan deliberadamente afuera
  // «escribí» y «elegí»: en los verbos de la tercera conjugación el imperativo
  // voseante y el pretérito de primera persona se escriben igual, así que
  // «mira cómo escribí mis respuestas» —tuteo impecable— daría positivo. Un
  // guarda que grita sobre texto correcto termina desactivado.
  "mirá",
  "hacé",
  "poné",
  "empezá",
  "dejá",
  "marcá",
  "cortá",
  "usá",
  "armá",
  "contá",
];

export const VOSEO = FORMAS.map(
  (forma) => new RegExp(`${LIMITE_IZQUIERDO}${forma}${LIMITE_DERECHO}`, "iu")
);

/** Las cadenas que violan la regla, para que el mensaje de fallo diga cuáles. */
export function conVoseo(cadenas: string[]): string[] {
  return cadenas.filter((cadena) => VOSEO.some((forma) => forma.test(cadena)));
}
