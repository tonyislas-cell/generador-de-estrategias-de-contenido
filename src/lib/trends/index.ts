import type { Plataforma } from "@/lib/wizard/types";
import { TRENDS_BY_PLATAFORMA } from "./static-trends";
import type { TrendsSnippet } from "./types";

export type { TrendsSnippet } from "./types";
export { TRENDS_BY_PLATAFORMA } from "./static-trends";

/**
 * Única puerta de entrada a las tendencias.
 *
 * Hoy lee de un objeto estático. Cuando las tendencias vivan en Supabase y las
 * edite el panel de administración, este cuerpo es lo único que cambia — el
 * motor de prompts recibe el snippet como parámetro y no conoce este módulo.
 */
export function getTrendsSnippet(plataforma: Plataforma): TrendsSnippet {
  return TRENDS_BY_PLATAFORMA[plataforma];
}
