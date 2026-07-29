import { describe, expect, it } from "vitest";
import { resolvePlataformaPrincipal, toKitAnswers } from "./kit-answers";
import type { WizardAnswers } from "@/lib/wizard/types";

const completeAutoridad: WizardAnswers = {
  nicho: "Finanzas personales",
  audiencia: "Freelancers de 25 a 35",
  plataformas: ["tiktok"],
  tono: "cercano",
  etapaCuenta: "establecida",
  objetivo: "autoridad",
  formato: "camara",
  equipo: ["solo"],
  tiempoPorPieza: "30_60min",
  frecuencia: "semanal",
  estilosGancho: ["curiosidad"],
};

const completeLanzamiento: WizardAnswers = {
  ...completeAutoridad,
  objetivo: "lanzamiento",
  oferta: "Curso de finanzas",
  objeciones: "No tengo tiempo",
  pruebaSocial: "200 alumnos",
};

describe("toKitAnswers", () => {
  it("returns the autoridad variant when every required answer is present", () => {
    const result = toKitAnswers(completeAutoridad);

    expect(result).not.toBeNull();
    expect(result?.objetivo).toBe("autoridad");
    expect(result?.nicho).toBe("Finanzas personales");
  });

  it("returns the lanzamiento variant with its three oferta fields", () => {
    const result = toKitAnswers(completeLanzamiento);

    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      objetivo: "lanzamiento",
      oferta: "Curso de finanzas",
      objeciones: "No tengo tiempo",
      pruebaSocial: "200 alumnos",
    });
  });

  it("returns null when the questionnaire has not been answered at all", () => {
    expect(toKitAnswers({})).toBeNull();
  });

  it("returns null when any single required answer is missing", () => {
    const requiredKeys: (keyof WizardAnswers)[] = [
      "nicho",
      "audiencia",
      "plataformas",
      "tono",
      "etapaCuenta",
      "objetivo",
      "formato",
      "equipo",
      "tiempoPorPieza",
      "frecuencia",
      "estilosGancho",
    ];

    for (const key of requiredKeys) {
      const incomplete = { ...completeAutoridad };
      delete incomplete[key];

      expect(toKitAnswers(incomplete), `missing ${key}`).toBeNull();
    }
  });

  it("returns null on the lanzamiento path when the oferta fields are missing", () => {
    const withoutOferta = { ...completeLanzamiento };
    delete withoutOferta.oferta;

    expect(toKitAnswers(withoutOferta)).toBeNull();
  });

  it("returns null when a required answer holds only whitespace", () => {
    expect(toKitAnswers({ ...completeAutoridad, nicho: "   " })).toBeNull();
  });

  it("returns null when the platform, hook, or equipo selections are empty arrays", () => {
    expect(toKitAnswers({ ...completeAutoridad, plataformas: [] })).toBeNull();
    expect(toKitAnswers({ ...completeAutoridad, estilosGancho: [] })).toBeNull();
    expect(toKitAnswers({ ...completeAutoridad, equipo: [] })).toBeNull();
  });

  it("accepts more than one equipo level", () => {
    const result = toKitAnswers({
      ...completeAutoridad,
      equipo: ["solo", "con_editor"],
    });

    expect(result?.equipo).toEqual(["solo", "con_editor"]);
  });

  it("drops leftover oferta answers on the autoridad path", () => {
    const result = toKitAnswers({
      ...completeAutoridad,
      oferta: "Curso que ya no vendo",
      objeciones: "Objeción vieja",
      pruebaSocial: "Prueba vieja",
    });

    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty("oferta");
    expect(result).not.toHaveProperty("objeciones");
    expect(result).not.toHaveProperty("pruebaSocial");
  });

  it("trims surrounding whitespace from free-text answers", () => {
    const result = toKitAnswers({
      ...completeLanzamiento,
      nicho: "  Finanzas personales  ",
      oferta: "\n Curso de finanzas \n",
    });

    expect(result?.nicho).toBe("Finanzas personales");
    expect(result).toMatchObject({ oferta: "Curso de finanzas" });
  });

  it("defaults contextoMarca to null when it was never answered", () => {
    const result = toKitAnswers(completeAutoridad);

    expect(result?.contextoMarca).toBeNull();
  });

  it("normalizes a whitespace-only contextoMarca to null", () => {
    const result = toKitAnswers({ ...completeAutoridad, contextoMarca: "   " });

    expect(result?.contextoMarca).toBeNull();
  });

  it("trims and keeps a real contextoMarca", () => {
    const result = toKitAnswers({
      ...completeAutoridad,
      contextoMarca: "  Somos una marca familiar, sin inversores.  ",
    });

    expect(result?.contextoMarca).toBe("Somos una marca familiar, sin inversores.");
  });

  it("does not require contextoMarca for the kit to be valid", () => {
    expect(toKitAnswers(completeAutoridad)).not.toBeNull();
  });
});

describe("resolvePlataformaPrincipal", () => {
  it("picks the platform the user checked first, not the first one listed", () => {
    const answers = toKitAnswers({
      ...completeAutoridad,
      plataformas: ["linkedin", "tiktok"],
    });

    expect(answers).not.toBeNull();
    expect(answers && resolvePlataformaPrincipal(answers)).toBe("linkedin");
  });
});
