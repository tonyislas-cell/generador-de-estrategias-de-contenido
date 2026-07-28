import { supabase } from "@/lib/supabase";
import type { Plataforma } from "@/lib/wizard/types";
import type { TrendsSnippet } from "./types";

interface TrendsSnippetRow {
  plataforma: Plataforma;
  periodo: string;
  formatos: string[];
  ganchos: string[];
  senales: string[];
  evitar: string[];
  convenciones_copy: string;
}

function mapRowToSnippet(row: TrendsSnippetRow): TrendsSnippet {
  return {
    plataforma: row.plataforma,
    periodo: row.periodo,
    formatos: row.formatos,
    ganchos: row.ganchos,
    senales: row.senales,
    evitar: row.evitar,
    convencionesCopy: row.convenciones_copy,
  };
}

export interface TrendsRepository {
  getByPlatform(plataforma: Plataforma): Promise<TrendsSnippet | null>;
}

async function getByPlatform(
  plataforma: Plataforma
): Promise<TrendsSnippet | null> {
  const { data, error } = await supabase
    .from("trends_snippets")
    .select("plataforma, periodo, formatos, ganchos, senales, evitar, convenciones_copy")
    .eq("plataforma", plataforma)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRowToSnippet(data as TrendsSnippetRow);
}

export const trendsRepository: TrendsRepository = { getByPlatform };
