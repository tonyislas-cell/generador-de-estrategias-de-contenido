import type { ModeloIA } from "../types";
import { claudeAdapter } from "./claude";
import type { PromptAdapter } from "./types";

export type { PromptAdapter } from "./types";

/**
 * Registro de adaptadores.
 *
 * Es un `Record<ModeloIA, …>`, así que al ampliar `ModeloIA` con ChatGPT y
 * Gemini TypeScript falla exactamente acá hasta que se agreguen sus
 * adaptadores. El tipo dirige el trabajo del próximo ticket en vez de depender
 * de que alguien se acuerde.
 */
export const ADAPTERS: Record<ModeloIA, PromptAdapter> = {
  claude: claudeAdapter,
};

/** Cómo se llama cada modelo de cara al usuario. Vive acá para que agregar un modelo sea un solo archivo. */
export const NOMBRE_DE_MODELO: Record<ModeloIA, string> = {
  claude: "Claude",
};
