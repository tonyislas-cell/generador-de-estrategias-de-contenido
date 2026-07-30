import type { PromptContext } from "../context";
import type { BloqueRequest } from "../plan";

/**
 * Un adaptador es solo prosa y estructura.
 *
 * Todo lo que hay que resolver a partir de las respuestas ya viene resuelto en
 * `PromptContext`. Lo que cambia entre modelos es cómo se ordena la
 * información, qué se enfatiza y qué convenciones de formato entiende mejor
 * cada uno.
 *
 * Un solo método con `BloqueRequest` discriminado, en vez de un método por
 * tipo de bloque: así el `switch` de cada adaptador queda chequeado por el
 * compilador, y agregar un tipo de bloque hace fallar la compilación en los
 * tres hasta que los tres lo cubran.
 */
export interface PromptAdapter {
  build: (ctx: PromptContext, req: BloqueRequest) => string;
}

/**
 * La rama imposible del `switch` de cada adaptador.
 *
 * El parámetro es `never`, así que en cuanto `BloqueRequest` gane un caso que
 * un adaptador no cubra, la llamada deja de compilar **en ese adaptador**. Eso
 * es lo que hace que agregar un tipo de bloque sea seguro: el compilador
 * nombra los tres lugares que hay que escribir.
 *
 * El `throw` es para el caso de que un `req` inválido llegue en tiempo de
 * ejecución saltándose los tipos; nunca debería pasar.
 */
export function bloqueSinCubrir(req: never): never {
  throw new Error(
    `Este adaptador no cubre el bloque ${JSON.stringify(req)}.`
  );
}
