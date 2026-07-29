// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("@/lib/supabase-admin", () => ({
  supabaseAdmin: { from: vi.fn() },
}));

import { supabaseAdmin } from "@/lib/supabase-admin";
import { updateTrendsSnippet } from "./admin-repository";

const mockFrom = supabaseAdmin.from as Mock;

describe("updateTrendsSnippet", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("upserts the row with snake_case columns, keyed by plataforma", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ upsert });

    await updateTrendsSnippet("tiktok", {
      periodo: "línea base",
      formatos: ["formato 1"],
      ganchos: ["gancho 1"],
      senales: ["senal 1"],
      evitar: ["evitar 1"],
      convencionesCopy: "copy de prueba",
    });

    expect(mockFrom).toHaveBeenCalledWith("trends_snippets");
    expect(upsert).toHaveBeenCalledWith(
      {
        plataforma: "tiktok",
        periodo: "línea base",
        formatos: ["formato 1"],
        ganchos: ["gancho 1"],
        senales: ["senal 1"],
        evitar: ["evitar 1"],
        convenciones_copy: "copy de prueba",
      },
      { onConflict: "plataforma" }
    );
  });

  it("rejects when the write fails", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: { message: "network error" } });
    mockFrom.mockReturnValue({ upsert });

    await expect(
      updateTrendsSnippet("linkedin", {
        periodo: "línea base",
        formatos: ["formato 1"],
        ganchos: ["gancho 1"],
        senales: ["senal 1"],
        evitar: ["evitar 1"],
        convencionesCopy: "copy de prueba",
      })
    ).rejects.toBeTruthy();
  });
});
