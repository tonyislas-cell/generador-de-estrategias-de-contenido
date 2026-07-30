import { describe, expect, it } from "vitest";
import { generatePromptKit } from "./generatePromptKit";
import { toKitAnswers } from "./kit-answers";
import { MECANICA_POR_PLATAFORMA } from "./plataforma-mecanica";
import type { Duracion, ModeloIA } from "./types";
import { conVoseo } from "@/test-support/voseo";
import { PLATAFORMA_OPTIONS } from "@/lib/wizard/options";
import type { TrendsSnippet } from "@/lib/trends/types";
import type { WizardAnswers } from "@/lib/wizard/types";

/**
 * El prompt es donde más copy nuevo se escribe y el único que nadie lee entero
 * antes de publicar: son miles de palabras repartidas en tres adaptadores. Un
 * guardarrail automático sobre el texto generado atrapa lo que una revisión a
 * ojo no.
 */

const MODELOS: ModeloIA[] = ["claude", "chatgpt", "gemini"];

/**
 * Fixture neutra: nada de lo que el usuario escribe puede activar los guardas,
 * así que las respuestas van en tuteo impecable y sin ninguna de las cadenas
 * que se buscan. Si un test falla, la culpa es del texto del prompt.
 */
const RESPUESTAS: WizardAnswers = {
  nicho: "Finanzas personales",
  audiencia: "Freelancers que recién empiezan",
  plataformas: ["tiktok"],
  tono: "cercano",
  etapaCuenta: "establecida",
  objetivo: "autoridad",
  formato: ["camara", "faceless", "texto_carrusel"],
  equipo: ["solo", "con_editor"],
  tiempoPorPieza: "30_60min",
  frecuencia: "dos_tres_semana",
  estilosGancho: ["curiosidad", "polemico"],
};

const SNIPPET: TrendsSnippet = {
  plataforma: "tiktok",
  periodo: "línea base de prueba",
  formatos: ["Formato de prueba"],
  ganchos: ["Gancho de prueba"],
  senales: ["Señal de prueba"],
  evitar: ["Evitar de prueba"],
  convencionesCopy: "Convenciones de prueba",
};

function texto(
  modelo: ModeloIA,
  duracion: Duracion = "1_mes",
  overrides: Partial<WizardAnswers> = {}
): string {
  const answers = toKitAnswers({ ...RESPUESTAS, ...overrides });
  if (!answers) throw new Error("Las respuestas de prueba están incompletas");

  const snippet = { ...SNIPPET, plataforma: answers.plataformas[0] };
  return generatePromptKit(answers, snippet, modelo, duracion)
    .bloques.map((bloque) => bloque.contenido)
    .join("\n");
}

describe("prompt copy stays in tuteo", () => {
  it.each(MODELOS)("has no voseo forms anywhere in the %s kit", (modelo) => {
    // Por líneas, para que el fallo señale la línea exacta y no un muro.
    const lineas = texto(modelo).split("\n");
    expect(lineas.length).toBeGreaterThan(100);

    expect(conVoseo(lineas)).toEqual([]);
  });
});

describe("MECANICA_POR_PLATAFORMA", () => {
  const entradas = PLATAFORMA_OPTIONS.map(
    (option) => [option.value, MECANICA_POR_PLATAFORMA[option.value]] as const
  );

  it("covers every platform the questionnaire offers", () => {
    // El `Record` lo garantiza en compilación; esto atrapa la entrada que
    // alguien agrega vacía solo para que compile.
    for (const [plataforma, mecanica] of entradas) {
      expect(mecanica, plataforma).toBeDefined();
      expect(mecanica.revisada, plataforma).not.toBe("");
    }
  });

  it("dates every entry, because an undated fact is a false fact", () => {
    for (const [plataforma, mecanica] of entradas) {
      expect(mecanica.revisada, plataforma).toMatch(/\d{4}$/);
    }
  });

  it("never states the same claim as both confirmed and discussed", () => {
    for (const [plataforma, mecanica] of entradas) {
      const confirmado = mecanica.confirmado.map((d) => d.valor);
      for (const discutido of mecanica.discutido) {
        expect(confirmado, plataforma).not.toContain(discutido);
      }
    }
  });

  it("leaves no blank labels or values behind", () => {
    for (const [plataforma, mecanica] of entradas) {
      for (const dato of mecanica.confirmado) {
        expect(dato.etiqueta.trim(), plataforma).not.toBe("");
        expect(dato.valor.trim(), plataforma).not.toBe("");
      }
    }
  });
});

describe("platform mechanics in the generated prompt", () => {
  it.each(MODELOS)("dates the mechanics section in the %s kit", (modelo) => {
    expect(texto(modelo)).toContain(MECANICA_POR_PLATAFORMA.tiktok.revisada);
  });

  it.each(MODELOS)(
    "carries every confirmed mechanic for the chosen platform into the %s kit",
    (modelo) => {
      const kit = texto(modelo);
      for (const dato of MECANICA_POR_PLATAFORMA.tiktok.confirmado) {
        expect(kit).toContain(dato.valor);
      }
    }
  );

  it.each(MODELOS)(
    "flags the discussed claims as forbidden to assert, in the %s kit",
    (modelo) => {
      const kit = texto(modelo);
      // Estar presentes no alcanza: tienen que llegar con la advertencia, o el
      // modelo los trataría igual que a los confirmados.
      for (const discutido of MECANICA_POR_PLATAFORMA.tiktok.discutido) {
        expect(kit).toContain(discutido);
      }
      expect(kit).toContain("prohibido afirmarlo como mecánica");
    }
  );

  it.each(MODELOS)(
    "orders the mechanics before the trends in the %s kit",
    (modelo) => {
      const kit = texto(modelo);
      const mecanica = kit.indexOf(MECANICA_POR_PLATAFORMA.tiktok.revisada);
      const tendencias = kit.indexOf(SNIPPET.formatos[0]);

      // Las mecánicas restringen y las tendencias inspiran: primero el marco.
      expect(mecanica).toBeGreaterThan(-1);
      expect(tendencias).toBeGreaterThan(mecanica);
    }
  );

  it.each(MODELOS)("teaches the %s kit to mark unverified claims", (modelo) => {
    expect(texto(modelo)).toContain("[NO VERIFICADO]");
  });

  it.each(MODELOS)(
    "says so plainly when there are no verified mechanics for the platform, in the %s kit",
    (modelo) => {
      // LinkedIn no está en la hoja de plataforma. Decirlo es la respuesta
      // correcta: la alternativa es que el modelo se invente las mecánicas.
      const kit = texto(modelo, "1_mes", { plataformas: ["linkedin"] });

      expect(MECANICA_POR_PLATAFORMA.linkedin.confirmado).toEqual([]);
      expect(kit).toContain("No tengo mecánicas verificadas de LinkedIn");
    }
  );

  it("uses the mechanics of the platform in play, not of another one", () => {
    const kit = texto("claude", "1_mes", { plataformas: ["instagram_reels"] });

    expect(kit).toContain("el tope es 5 por publicación desde enero de 2026");
    for (const dato of MECANICA_POR_PLATAFORMA.tiktok.confirmado) {
      expect(kit, "filtró mecánicas de TikTok").not.toContain(dato.valor);
    }
  });
});

describe("the trends seed agrees with the platform sheet", () => {
  /**
   * El seed de tendencias y la hoja de plataforma se editan por separado y
   * pueden contradecirse. Ya pasó: el seed recomendaba «entre 5 y 8» etiquetas
   * después de que Instagram bajara el tope a 5. Este test fija el número en
   * un solo lugar para que la próxima divergencia se note.
   */
  it("caps Instagram hashtags at five in the platform sheet", () => {
    const etiquetas = MECANICA_POR_PLATAFORMA.instagram_reels.confirmado.find(
      (dato) => dato.etiqueta === "Etiquetas"
    );

    expect(etiquetas?.valor).toContain("el tope es 5 por publicación");
    expect(etiquetas?.valor).toContain("entre 3 y 5");
  });
});
