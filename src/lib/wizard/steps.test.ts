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

describe("contexto step's isAnswered", () => {
  const contextoStep = getVisibleSteps({}).find((s) => s.id === "contexto")!;
  const complete: WizardAnswers = {
    nicho: "Finanzas personales",
    audiencia: "Freelancers de 25 a 35",
    plataformas: ["tiktok"],
    tono: "cercano",
    etapaCuenta: "establecida",
  };

  it("is answered once every required field is present, even without contextoMarca", () => {
    expect(contextoStep.isAnswered(complete)).toBe(true);
  });

  it("is not answered when etapaCuenta is missing", () => {
    const withoutEtapa = { ...complete };
    delete withoutEtapa.etapaCuenta;

    expect(contextoStep.isAnswered(withoutEtapa)).toBe(false);
  });

  it("is answered the same whether or not contextoMarca was filled in", () => {
    expect(
      contextoStep.isAnswered({ ...complete, contextoMarca: "Marca familiar" })
    ).toBe(true);
  });
});

describe("recursos step's isAnswered", () => {
  const recursosStep = getVisibleSteps({}).find((s) => s.id === "recursos")!;
  const complete: WizardAnswers = {
    equipo: ["solo"],
    tiempoPorPieza: "30_60min",
    frecuencia: "semanal",
  };

  it("is answered with a single equipo selected", () => {
    expect(recursosStep.isAnswered(complete)).toBe(true);
  });

  it("is also answered with more than one equipo selected", () => {
    expect(
      recursosStep.isAnswered({ ...complete, equipo: ["solo", "con_editor"] })
    ).toBe(true);
  });

  it("is not answered when equipo is an empty array", () => {
    expect(recursosStep.isAnswered({ ...complete, equipo: [] })).toBe(false);
  });

  it("is not answered when equipo was never set", () => {
    const withoutEquipo = { ...complete };
    delete withoutEquipo.equipo;

    expect(recursosStep.isAnswered(withoutEquipo)).toBe(false);
  });
});
