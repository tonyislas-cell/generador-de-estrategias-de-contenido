import { describe, expect, it } from "vitest";
import { generatePromptKit } from "./generatePromptKit";
import { getBloquesEnOrden, type Duracion, type PromptKit } from "./types";
import { toKitAnswers } from "./kit-answers";
import { getTrendsSnippet, TRENDS_BY_PLATAFORMA } from "@/lib/trends";
import type { WizardAnswers } from "@/lib/wizard/types";

const BASE: WizardAnswers = {
  nicho: "Finanzas personales",
  audiencia: "Freelancers de 25 a 35 que recién empiezan",
  plataformas: ["tiktok"],
  tono: "cercano",
  objetivo: "autoridad",
  formato: "camara",
  equipo: "solo",
  tiempoPorPieza: "30_60min",
  frecuencia: "dos_tres_semana",
  estilosGancho: ["curiosidad"],
};

/** Construye un kit desde respuestas crudas, resolviendo tendencias como lo hace la app. */
function buildKit(
  overrides: Partial<WizardAnswers> = {},
  duracion: Duracion = "14_dias"
): PromptKit {
  const answers = toKitAnswers({ ...BASE, ...overrides });
  if (!answers) throw new Error("Las respuestas de prueba están incompletas");

  return generatePromptKit(
    answers,
    getTrendsSnippet(answers.plataformas[0]),
    "claude",
    duracion
  );
}

const textoCompleto = (kit: PromptKit): string =>
  getBloquesEnOrden(kit)
    .map((bloque) => bloque.contenido)
    .join("\n");

describe("generatePromptKit", () => {
  it("produces one setup block and two weekly blocks for a 14-day plan", () => {
    const kit = buildKit();

    expect(kit.setup.kind).toBe("setup");
    expect(kit.semanas).toHaveLength(2);
    expect(getBloquesEnOrden(kit)).toHaveLength(3);
  });

  it("produces four weekly blocks for a one-month plan", () => {
    const kit = buildKit({}, "1_mes");

    expect(kit.semanas).toHaveLength(4);
    expect(getBloquesEnOrden(kit)).toHaveLength(5);
  });

  it("numbers and orders the weekly blocks starting at week one", () => {
    const kit = buildKit({}, "1_mes");

    expect(kit.semanas.map((bloque) => bloque.semana)).toEqual([1, 2, 3, 4]);
    expect(kit.semanas.map((bloque) => bloque.id)).toEqual([
      "semana-1",
      "semana-2",
      "semana-3",
      "semana-4",
    ]);
  });

  it("inserts the trends snippet for the chosen platform into the setup prompt", () => {
    const kit = buildKit({ plataformas: ["linkedin"] });
    const snippet = TRENDS_BY_PLATAFORMA.linkedin;

    for (const linea of [...snippet.formatos, ...snippet.ganchos, ...snippet.senales, ...snippet.evitar]) {
      expect(kit.setup.contenido).toContain(linea);
    }
    expect(kit.setup.contenido).toContain(snippet.convencionesCopy);
    expect(kit.plataformaPrincipal).toBe("linkedin");
  });

  it("does not leak trends content from other platforms into any block", () => {
    const kit = buildKit({ plataformas: ["tiktok"] });
    const texto = textoCompleto(kit);

    for (const [plataforma, snippet] of Object.entries(TRENDS_BY_PLATAFORMA)) {
      if (plataforma === "tiktok") continue;

      for (const linea of [...snippet.formatos, ...snippet.ganchos, ...snippet.senales, ...snippet.evitar]) {
        expect(texto, `filtró contenido de ${plataforma}`).not.toContain(linea);
      }
    }
  });

  it("asks the model to acknowledge the context and wait instead of generating content", () => {
    const kit = buildKit();

    expect(kit.setup.contenido).toContain("NO escribas guiones");
    expect(kit.setup.contenido).toContain("para y espera");
  });

  it("asks for camera direction only when the formato is camara", () => {
    const camara = buildKit({ formato: "camara" });
    const faceless = buildKit({ formato: "faceless" });
    const carrusel = buildKit({ formato: "texto_carrusel" });

    expect(textoCompleto(camara)).toContain("Dirección de cámara");

    expect(textoCompleto(faceless)).toContain("Plan de imágenes");
    expect(textoCompleto(faceless)).not.toContain("Dirección de cámara");

    expect(textoCompleto(carrusel)).toContain("Lámina 1");
    expect(textoCompleto(carrusel)).not.toContain("Dirección de cámara");
    expect(textoCompleto(carrusel)).toContain("no hay video");
  });

  it("injects the oferta, objeciones and prueba social on the lanzamiento path", () => {
    const kit = buildKit({
      objetivo: "lanzamiento",
      oferta: "Curso de finanzas para freelancers",
      objeciones: "Creen que necesitan ganar más antes de ordenarse",
      pruebaSocial: "200 alumnos y 30 testimonios en video",
    });

    expect(kit.setup.contenido).toContain("Curso de finanzas para freelancers");
    expect(kit.setup.contenido).toContain(
      "Creen que necesitan ganar más antes de ordenarse"
    );
    expect(kit.setup.contenido).toContain("200 alumnos y 30 testimonios en video");
    expect(kit.setup.contenido).toContain("<estrategia_de_venta>");
  });

  it("forbids selling on the autoridad path", () => {
    const kit = buildKit({ objetivo: "autoridad" });

    expect(kit.setup.contenido).toContain("<estrategia_de_autoridad>");
    expect(kit.setup.contenido).not.toContain("<estrategia_de_venta>");
    expect(kit.setup.contenido).toContain("no hay nada para vender");
    expect(textoCompleto(kit)).toContain("En este plan no se vende nada");
  });

  it("never mentions the oferta on the autoridad path even if those answers were filled in", () => {
    const kit = buildKit({
      objetivo: "autoridad",
      oferta: "Curso que ya no vendo",
      objeciones: "Objeción vieja",
      pruebaSocial: "Prueba vieja",
    });

    const texto = textoCompleto(kit);
    expect(texto).not.toContain("Curso que ya no vendo");
    expect(texto).not.toContain("Objeción vieja");
    expect(texto).not.toContain("Prueba vieja");
  });

  it("limits each weekly block to the number of pieces the declared frecuencia allows", () => {
    expect(textoCompleto(buildKit({ frecuencia: "semanal" }))).toContain(
      "Exactamente 1 pieza."
    );
    expect(textoCompleto(buildKit({ frecuencia: "dos_tres_semana" }))).toContain(
      "Exactamente 3 piezas."
    );
    expect(textoCompleto(buildKit({ frecuencia: "diaria" }))).toContain(
      "Exactamente 7 piezas."
    );
  });

  it("gives each week a distinct mission and only asks later weeks for continuity", () => {
    const kit = buildKit();
    const [semana1, semana2] = kit.semanas;

    expect(semana1?.contenido).not.toBe(semana2?.contenido);
    expect(semana1?.contenido).not.toContain("<continuidad>");
    expect(semana2?.contenido).toContain("<continuidad>");
    expect(semana2?.contenido).toContain("cerraste la Semana 1");
  });

  it("asks secondary platforms for an adaptation block only when more than one was chosen", () => {
    const unaSola = buildKit({ plataformas: ["tiktok"] });
    const varias = buildKit({ plataformas: ["tiktok", "linkedin"] });

    expect(unaSola.setup.contenido).not.toContain("<plataformas_secundarias>");
    expect(varias.setup.contenido).toContain("<plataformas_secundarias>");
    expect(varias.setup.contenido).toContain("LinkedIn");
    expect(textoCompleto(varias)).toContain("### Adaptación");
  });

  it("is deterministic for identical input", () => {
    expect(buildKit()).toEqual(buildKit());
  });
});
