import { describe, expect, it } from "vitest";
import { getVisibleSteps } from "./steps";
import type { WizardAnswers } from "./types";

describe("getVisibleSteps", () => {
  it("returns the 5 base steps, in order, when no objetivo is set yet", () => {
    const steps = getVisibleSteps({});

    expect(steps.map((s) => s.id)).toEqual([
      "contexto",
      "objetivo",
      "formato",
      "recursos",
      "gancho",
    ]);
  });

  it("includes the oferta step when objetivo is lanzamiento", () => {
    const answers: WizardAnswers = { objetivo: "lanzamiento" };

    const steps = getVisibleSteps(answers);

    expect(steps.map((s) => s.id)).toEqual([
      "contexto",
      "objetivo",
      "formato",
      "recursos",
      "gancho",
      "oferta",
    ]);
  });

  it("omits the oferta step when objetivo is autoridad", () => {
    const answers: WizardAnswers = { objetivo: "autoridad" };

    const steps = getVisibleSteps(answers);

    expect(steps.map((s) => s.id)).not.toContain("oferta");
    expect(steps).toHaveLength(5);
  });

  it("drops the oferta step immediately if objetivo changes away from lanzamiento", () => {
    const withOferta = getVisibleSteps({
      objetivo: "lanzamiento",
      oferta: "Curso de finanzas",
    });
    expect(withOferta.map((s) => s.id)).toContain("oferta");

    const withoutOferta = getVisibleSteps({
      objetivo: "autoridad",
      oferta: "Curso de finanzas",
    });
    expect(withoutOferta.map((s) => s.id)).not.toContain("oferta");
  });
});
