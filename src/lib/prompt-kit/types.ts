import type { Plataforma } from "@/lib/wizard/types";

/**
 * Modelos de IA para los que sabemos generar un kit.
 *
 * Es una unión de un solo miembro a propósito. `ADAPTERS` es un
 * `Record<ModeloIA, PromptAdapter>`, así que hoy es exhaustivo sin ramas
 * muertas ni errores en runtime. Cuando se agreguen ChatGPT y Gemini, ampliar
 * esta unión hace que TypeScript falle exactamente en `adapters/index.ts`, que
 * es el archivo que hay que tocar. No la "arregles" a tres miembros antes de
 * tener los adaptadores.
 */
export type ModeloIA = "claude";

export type Duracion = "14_dias" | "1_mes";

export const DURACION_CONFIG: Record<
  Duracion,
  { semanas: number; etiqueta: string }
> = {
  "14_dias": { semanas: 2, etiqueta: "14 días" },
  "1_mes": { semanas: 4, etiqueta: "1 mes" },
};

export type PromptBlockKind = "setup" | "semana";

export interface PromptBlock {
  /** "setup" | "semana-1" | "semana-2" … */
  id: string;
  kind: PromptBlockKind;
  /** 1-based. Ausente en el bloque de setup. */
  semana?: number;
  titulo: string;
  /** Cuándo y cómo pegar este bloque. */
  descripcion: string;
  /** El prompt, tal cual se copia. */
  contenido: string;
}

export interface PromptKit {
  modelo: ModeloIA;
  duracion: Duracion;
  plataformaPrincipal: Plataforma;
  setup: PromptBlock;
  semanas: PromptBlock[];
}

/** Lista plana en el orden en que se pegan. */
export const getBloquesEnOrden = (kit: PromptKit): PromptBlock[] => [
  kit.setup,
  ...kit.semanas,
];
