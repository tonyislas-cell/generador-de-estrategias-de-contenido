import { DURACION_CONFIG, type Duracion } from "./types";

/**
 * Qué se le pide al modelo en un bloque.
 *
 * Es una unión discriminada y no un `kind` suelto porque cada tipo de bloque
 * necesita datos distintos: el setup no pertenece a ninguna tanda, y un bloque
 * semanal sí. Así el adaptador recibe siempre exactamente lo que ese bloque
 * necesita, y el compilador exige que el `switch` cubra todos los casos.
 */
export type BloqueRequest =
  | { kind: "setup" }
  /** `semana` es 1-based. */
  | { kind: "semana"; semana: number };

/** `[1, 2, … n]`. */
function rango(n: number): number[] {
  return Array.from({ length: n }, (_, index) => index + 1);
}

/**
 * Única fuente de verdad de cuántos bloques trae un kit y en qué orden.
 *
 * Vive fuera de `generatePromptKit` para poder probar la forma del plan sin
 * generar una sola línea de prompt, y para que agregar un tipo de kit sea
 * tocar una función y no el orquestador.
 */
export function planDeBloques(
  duracion: Duracion
): [BloqueRequest, ...BloqueRequest[]] {
  return [
    { kind: "setup" },
    ...rango(DURACION_CONFIG[duracion].semanas).map(
      (semana): BloqueRequest => ({ kind: "semana", semana })
    ),
  ];
}
