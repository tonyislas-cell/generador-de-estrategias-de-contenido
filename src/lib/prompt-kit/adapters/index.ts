import type { Option } from "@/lib/wizard/types";
import type { ModeloIA } from "../types";
import { chatgptAdapter } from "./chatgpt";
import { claudeAdapter } from "./claude";
import { geminiAdapter } from "./gemini";
import type { PromptAdapter } from "./types";

export type { PromptAdapter } from "./types";

/** Registro de adaptadores: uno por cada miembro de `ModeloIA`. */
export const ADAPTERS: Record<ModeloIA, PromptAdapter> = {
  claude: claudeAdapter,
  chatgpt: chatgptAdapter,
  gemini: geminiAdapter,
};

/** Cómo se llama cada modelo de cara al usuario. Vive acá para que agregar un modelo sea un solo archivo. */
export const NOMBRE_DE_MODELO: Record<ModeloIA, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
};

/** Derivado de `NOMBRE_DE_MODELO` para que la pantalla de selección y el registro nunca diverjan. */
export const MODELO_OPTIONS: Option<ModeloIA>[] = (
  Object.entries(NOMBRE_DE_MODELO) as [ModeloIA, string][]
).map(([modelo, nombre]) => ({ value: modelo, label: nombre }));
