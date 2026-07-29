import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Plataforma } from "@/lib/wizard/types";
import type { TrendsSnippet } from "./types";

/**
 * No valida el shape de `snippet` — confía en el caller. La frontera de
 * validación vive en el Route Handler que llama esto, mismo principio que
 * `toKitAnswers` en prompt-kit/kit-answers.ts.
 *
 * El mapeo camelCase → snake_case de acá es el inverso de `mapRowToSnippet`
 * en ./repository.ts — si un campo de `TrendsSnippet` cambia de nombre, hay
 * que actualizar los dos.
 */
export async function updateTrendsSnippet(
  plataforma: Plataforma,
  snippet: Omit<TrendsSnippet, "plataforma">
): Promise<void> {
  const { error } = await supabaseAdmin.from("trends_snippets").upsert(
    {
      plataforma,
      periodo: snippet.periodo,
      formatos: snippet.formatos,
      ganchos: snippet.ganchos,
      senales: snippet.senales,
      evitar: snippet.evitar,
      convenciones_copy: snippet.convencionesCopy,
    },
    { onConflict: "plataforma" }
  );

  if (error) throw error;
}
