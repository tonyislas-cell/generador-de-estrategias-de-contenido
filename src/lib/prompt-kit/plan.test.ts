import { describe, expect, it } from "vitest";
import { planDeBloques } from "./plan";

/**
 * `planDeBloques` es la única fuente de verdad de cuántos bloques trae un kit
 * y en qué orden, así que se prueba sola: la forma del plan no debería
 * necesitar generar una línea de prompt para verificarse.
 */
describe("planDeBloques", () => {
  it("opens with the setup and then one block per week, for a 14-day plan", () => {
    expect(planDeBloques("vertical", "14_dias")).toEqual([
      { kind: "setup" },
      { kind: "semana", semana: 1 },
      { kind: "semana", semana: 2 },
    ]);
  });

  it("stretches to four weeks for a one-month plan", () => {
    expect(planDeBloques("vertical", "1_mes")).toEqual([
      { kind: "setup" },
      { kind: "semana", semana: 1 },
      { kind: "semana", semana: 2 },
      { kind: "semana", semana: 3 },
      { kind: "semana", semana: 4 },
    ]);
  });

  it("always starts with the setup", () => {
    // El invariante del que depende `generatePromptKit` para prometer una
    // tupla no vacía cuyo primer elemento es el setup.
    expect(planDeBloques("vertical", "14_dias")[0]).toEqual({ kind: "setup" });
    expect(planDeBloques("vertical", "1_mes")[0]).toEqual({ kind: "setup" });
  });
});
