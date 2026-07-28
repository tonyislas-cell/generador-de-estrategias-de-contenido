import type { PromptContext } from "../context";

/**
 * Un adaptador es solo prosa y estructura.
 *
 * Todo lo que hay que resolver a partir de las respuestas ya viene resuelto en
 * `PromptContext`. Lo que cambia entre modelos es cómo se ordena la
 * información, qué se enfatiza y qué convenciones de formato entiende mejor
 * cada uno.
 */
export interface PromptAdapter {
  buildSetup: (ctx: PromptContext) => string;
  /** `semana` es 1-based. */
  buildSemana: (ctx: PromptContext, semana: number) => string;
}
