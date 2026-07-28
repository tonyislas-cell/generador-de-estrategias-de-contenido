import type { Plataforma } from "@/lib/wizard/types";

/**
 * Un fragmento de tendencias por plataforma.
 *
 * Está estructurado en campos y no como un bloque de prosa a propósito: cada
 * campo se inyecta en una parte distinta del prompt (`evitar` como prohibición
 * dura, `ganchos` en la sección de aperturas, `senales` en qué medir). Un blob
 * de texto se volcaría en un solo lugar, que es justamente el modo de fallo
 * "plantilla rellenada" que este producto tiene que evitar.
 */
export interface TrendsSnippet {
  plataforma: Plataforma;
  /** Cuándo se escribió este contenido. Señal explícita de cuándo actualizarlo. */
  periodo: string;
  /** Estructuras de pieza que rinden en la plataforma. */
  formatos: string[];
  /** Patrones de apertura, no frases literales. */
  ganchos: string[];
  /** Qué premia el algoritmo — define qué métrica mirar. */
  senales: string[];
  /** Formatos saturados. Se inyecta como prohibición. */
  evitar: string[];
  /** Convenciones de caption y hashtags. */
  convencionesCopy: string;
}
