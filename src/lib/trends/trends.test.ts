import { describe, expect, it } from "vitest";
import { getTrendsSnippet, TRENDS_BY_PLATAFORMA } from "./index";
import { PLATAFORMA_OPTIONS } from "@/lib/wizard/options";
import type { TrendsSnippet } from "./types";

const allLines = (snippet: TrendsSnippet): string[] => [
  ...snippet.formatos,
  ...snippet.ganchos,
  ...snippet.senales,
  ...snippet.evitar,
];

describe("getTrendsSnippet", () => {
  it("returns a snippet for every platform offered in the questionnaire", () => {
    for (const option of PLATAFORMA_OPTIONS) {
      const snippet = getTrendsSnippet(option.value);

      expect(snippet.plataforma).toBe(option.value);
      expect(snippet.periodo).not.toBe("");
      expect(snippet.convencionesCopy).not.toBe("");
    }
  });

  it("gives every platform content in all four trend categories", () => {
    for (const option of PLATAFORMA_OPTIONS) {
      const snippet = getTrendsSnippet(option.value);

      expect(snippet.formatos.length).toBeGreaterThan(0);
      expect(snippet.ganchos.length).toBeGreaterThan(0);
      expect(snippet.senales.length).toBeGreaterThan(0);
      expect(snippet.evitar.length).toBeGreaterThan(0);
    }
  });

  // Guards the "no other platform's trends leak into the kit" test in
  // generatePromptKit.test.ts: that test is only meaningful while every trend
  // line is unique to a single platform.
  it("never repeats a trend line across two platforms", () => {
    const seen = new Map<string, string>();

    for (const [plataforma, snippet] of Object.entries(TRENDS_BY_PLATAFORMA)) {
      for (const linea of allLines(snippet)) {
        const previousOwner = seen.get(linea);
        expect(
          previousOwner,
          `"${linea}" appears in both ${previousOwner} and ${plataforma}`
        ).toBeUndefined();
        seen.set(linea, plataforma);
      }
    }
  });
});
