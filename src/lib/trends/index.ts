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
