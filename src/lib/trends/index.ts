import { PLATAFORMA_OPTIONS } from "@/lib/wizard/options";
import type { Plataforma } from "@/lib/wizard/types";
import { trendsRepository } from "./repository";
import type { TrendsSnippet } from "./types";

export type { TrendsSnippet } from "./types";
export type { TrendsRepository } from "./repository";

/**
 * Única puerta de entrada a las tendencias.
 *
 * Lee de Supabase a través de `TrendsRepository`. El motor de prompts recibe
 * el snippet como parámetro y no conoce este módulo. Si no hay fila para la
 * plataforma pedida, o si la lectura falla, esta función rechaza en vez de
 * devolver contenido genérico de respaldo.
 */
export async function getTrendsSnippet(
  plataforma: Plataforma
): Promise<TrendsSnippet> {
  const snippet = await trendsRepository.getByPlatform(plataforma);
  if (!snippet) {
    throw new Error(`No hay tendencias cargadas para la plataforma "${plataforma}".`);
  }
  return snippet;
}

/**
 * Para el panel de admin: trae las 4 plataformas en paralelo. A diferencia
 * de `getTrendsSnippet`, no rechaza si a una plataforma le falta la fila —
 * un dato corrupto en una sola plataforma no debe tumbar el panel entero,
 * así que esa plataforma llega como `null` y el form arranca vacío.
 */
export async function getAllTrends(): Promise<
  Record<Plataforma, TrendsSnippet | null>
> {
  const entries = await Promise.all(
    PLATAFORMA_OPTIONS.map(async (option) => [
      option.value,
      await trendsRepository.getByPlatform(option.value),
    ] as const)
  );

  return Object.fromEntries(entries) as Record<Plataforma, TrendsSnippet | null>;
}
