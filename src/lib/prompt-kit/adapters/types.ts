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
