import type { TipoDeKit } from "@/lib/wizard/types";
import { DURACION_CONFIG, type Duracion } from "./types";

/**
 * Qué se le pide al modelo en un bloque.
 *
 * Es una unión discriminada y no un `kind` suelto porque cada tipo de bloque
 * necesita datos distintos: el setup no pertenece a ninguna tanda, un bloque
 * semanal sí, y los de video largo cuentan videos y no semanas. Así el
 * adaptador recibe siempre exactamente lo que ese bloque necesita, y el
 * compilador exige que el `switch` cubra todos los casos.
 */
export type BloqueRequest =
  | { kind: "setup" }
  /** `semana` es 1-based. */
  | { kind: "angulos"; semana: number }
  | { kind: "guiones"; semana: number }
  /** `video` es 1-based. */
  | { kind: "par_titulo"; video: number }
  | { kind: "guion_largo"; video: number };

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
 *
 * En video largo van dos bloques por video, y en ese orden a propósito: el par
 * título/miniatura primero, porque un video largo se gana antes de
 * reproducirse. Si el par no se sostiene solo, el guion no se escribe.
 */
export function planDeBloques(
  tipoDeKit: TipoDeKit,
  duracion: Duracion
): [BloqueRequest, ...BloqueRequest[]] {
  if (tipoDeKit === "youtube_largo") {
    return [
      { kind: "setup" },
      ...rango(DURACION_CONFIG[duracion].videos).flatMap(
        (video): BloqueRequest[] => [
          { kind: "par_titulo", video },
          { kind: "guion_largo", video },
        ]
      ),
    ];
  }

  // Dos bloques por semana: idear y escribir son turnos separados. El primero
  // se detiene con doce ángulos sobre la mesa y espera a que el creador elija
  // tres — los mejores 3 de 12 le ganan a los primeros 3, y ese filtro es el
  // único punto donde entra criterio humano en todo el plan.
  return [
    { kind: "setup" },
    ...rango(DURACION_CONFIG[duracion].semanas).flatMap(
      (semana): BloqueRequest[] => [
        { kind: "angulos", semana },
        { kind: "guiones", semana },
      ]
    ),
  ];
}
