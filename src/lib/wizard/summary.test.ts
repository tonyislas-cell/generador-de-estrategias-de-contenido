import { describe, expect, it } from "vitest";
import { getSummaryItems } from "./summary";
import type { WizardAnswers } from "./types";

describe("getSummaryItems", () => {
  it("renders human-readable labels for selected option values", () => {
    const answers: WizardAnswers = {
      nicho: "Finanzas personales",
      plataformas: ["tiktok", "linkedin"],
      tono: "cercano",
      etapaCuenta: "nueva",
      objetivo: "autoridad",
    };

    const items = getSummaryItems(answers);
    const byLabel = Object.fromEntries(items.map((i) => [i.label, i.value]));

    expect(byLabel["Nicho o industria"]).toBe("Finanzas personales");
    expect(byLabel["Plataformas"]).toBe("TikTok, LinkedIn");
    expect(byLabel["Tono de marca"]).toBe("Cercano");
    expect(byLabel["Etapa de la cuenta"]).toBe("Cuenta nueva");
    expect(byLabel["Objetivo"]).toBe("Autoridad y consistencia de marca");
  });

  it("joins multiple selected formatos with a comma, same as plataformas", () => {
    const items = getSummaryItems({ formato: ["camara", "texto_carrusel"] });
    const byLabel = Object.fromEntries(items.map((i) => [i.label, i.value]));

    expect(byLabel["Formato"]).toBe("Cámara, Texto / carrusel");
  });

  it("omits unanswered fields", () => {
    const items = getSummaryItems({ nicho: "Finanzas personales" });

    expect(items.map((i) => i.label)).toEqual(["Nicho o industria"]);
  });

  it("omits the oferta fields entirely when objetivo is autoridad, even if stray data exists", () => {
    const items = getSummaryItems({
      objetivo: "autoridad",
      oferta: "Curso de finanzas",
    });

    expect(items.map((i) => i.label)).not.toContain("Qué vendes");
  });

  it("includes the oferta fields when objetivo is lanzamiento", () => {
    const items = getSummaryItems({
      objetivo: "lanzamiento",
      oferta: "Curso de finanzas",
      objeciones: "No tengo tiempo",
      pruebaSocial: "200 alumnos",
    });

    const byLabel = Object.fromEntries(items.map((i) => [i.label, i.value]));
    expect(byLabel["Qué vendes"]).toBe("Curso de finanzas");
    expect(byLabel["Objeciones comunes"]).toBe("No tengo tiempo");
    expect(byLabel["Prueba social"]).toBe("200 alumnos");
  });
});
