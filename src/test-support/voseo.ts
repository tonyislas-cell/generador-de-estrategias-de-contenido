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
export const VOSEO = [
  // Presente de indicativo
  /\bsos\b/i,
  /\bvos\b/i,
  /\btenés\b/i,
  /\bpodés\b/i,
  /\bquerés\b/i,
  /\bsabés\b/i,
  /\bhacés\b/i,
  /\bvenís\b/i,
  /\belegís\b/i,
  /\bescribís\b/i,
  /\bdecís\b/i,
  /\bmirás\b/i,
  // Imperativo con pronombre enclítico, que en voseo pierde la tilde
  /\binvitame\b/i,
  /\bgenerame\b/i,
  /\bcontame\b/i,
  /\bmirame\b/i,
  /\bdecime\b/i,
  /\bfijate\b/i,
  /\bmarcame\b/i,
  // Imperativo suelto
  /\bmirá\b/i,
  /\bhacé\b/i,
  /\bponé\b/i,
  /\bempezá\b/i,
  /\belegí\b/i,
  /\bescribí\b/i,
  /\bdejá\b/i,
  /\bmarcá\b/i,
  /\bcortá\b/i,
];

/** Las cadenas que violan la regla, para que el mensaje de fallo diga cuáles. */
export function conVoseo(cadenas: string[]): string[] {
  return cadenas.filter((cadena) => VOSEO.some((forma) => forma.test(cadena)));
}
