import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("@/lib/supabase", () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from "@/lib/supabase";
import { trendsRepository } from "./repository";

/** Stubea la cadena `.from().select().eq().maybeSingle()` que usa el repositorio. */
function stubQueryResult(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  (supabase.from as Mock).mockReturnValue({ select });
  return { select, eq, maybeSingle };
}

describe("trendsRepository.getByPlatform", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps a found row from snake_case to the domain TrendsSnippet shape", async () => {
    stubQueryResult({
      data: {
        plataforma: "tiktok",
        periodo: "línea base",
        formatos: ["formato 1"],
        ganchos: ["gancho 1"],
        senales: ["senal 1"],
        evitar: ["evitar 1"],
        convenciones_copy: "copy de prueba",
      },
      error: null,
    });

    const snippet = await trendsRepository.getByPlatform("tiktok");

    expect(snippet).toEqual({
      plataforma: "tiktok",
      periodo: "línea base",
      formatos: ["formato 1"],
      ganchos: ["gancho 1"],
      senales: ["senal 1"],
      evitar: ["evitar 1"],
      convencionesCopy: "copy de prueba",
    });
  });

  it("queries the trends_snippets table filtered by the requested platform", async () => {
    const { eq } = stubQueryResult({ data: null, error: null });

    await trendsRepository.getByPlatform("linkedin");

    expect(supabase.from).toHaveBeenCalledWith("trends_snippets");
    expect(eq).toHaveBeenCalledWith("plataforma", "linkedin");
  });

  it("resolves null when no row exists for the platform", async () => {
    stubQueryResult({ data: null, error: null });

    const snippet = await trendsRepository.getByPlatform("youtube_shorts");

    expect(snippet).toBeNull();
  });

  it("rejects when the query itself fails", async () => {
    stubQueryResult({
      data: null,
      error: { message: "network error" },
    });

    await expect(
      trendsRepository.getByPlatform("instagram_reels")
    ).rejects.toBeTruthy();
  });
});
