import { describe, expect, it, vi } from "vitest";
import type { TrendsSnippet } from "./types";

const getByPlatform = vi.fn();

vi.mock("./repository", () => ({
  trendsRepository: { getByPlatform: (...args: unknown[]) => getByPlatform(...args) },
}));

const { getAllTrends, getTrendsSnippet } = await import("./index");

const SNIPPET: TrendsSnippet = {
  plataforma: "tiktok",
  periodo: "línea base",
  formatos: ["formato 1"],
  ganchos: ["gancho 1"],
  senales: ["senal 1"],
  evitar: ["evitar 1"],
  convencionesCopy: "copy de prueba",
};

describe("getTrendsSnippet", () => {
  it("resolves the snippet the repository returns, unchanged", async () => {
    getByPlatform.mockResolvedValueOnce(SNIPPET);

    await expect(getTrendsSnippet("tiktok")).resolves.toEqual(SNIPPET);
    expect(getByPlatform).toHaveBeenCalledWith("tiktok");
  });

  it("rejects with a clear message when the repository has no row for the platform", async () => {
    getByPlatform.mockResolvedValueOnce(null);

    await expect(getTrendsSnippet("linkedin")).rejects.toThrow(/linkedin/);
  });

  it("propagates a repository failure instead of swallowing it", async () => {
    const failure = new Error("network error");
    getByPlatform.mockRejectedValueOnce(failure);

    await expect(getTrendsSnippet("youtube_shorts")).rejects.toBe(failure);
  });
});

describe("getAllTrends", () => {
  it("returns every supported platform's snippet, keyed by platform", async () => {
    getByPlatform.mockImplementation(async (plataforma: string) => ({
      ...SNIPPET,
      plataforma,
    }));

    const all = await getAllTrends();

    expect(Object.keys(all).sort()).toEqual(
      ["instagram_reels", "linkedin", "tiktok", "youtube_shorts"].sort()
    );
    expect(all.tiktok?.plataforma).toBe("tiktok");
  });

  it("uses null for a platform with no row instead of failing the whole batch", async () => {
    getByPlatform.mockImplementation(async (plataforma: string) =>
      plataforma === "linkedin" ? null : { ...SNIPPET, plataforma }
    );

    const all = await getAllTrends();

    expect(all.linkedin).toBeNull();
    expect(all.tiktok?.plataforma).toBe("tiktok");
  });
});
