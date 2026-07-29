import { describe, expect, it } from "vitest";
import { generatePromptKit } from "./generatePromptKit";
import { getBloquesEnOrden, type Duracion, type ModeloIA, type PromptKit } from "./types";
import { toKitAnswers } from "./kit-answers";
import type { TrendsSnippet } from "@/lib/trends/types";
import type { Plataforma, WizardAnswers } from "@/lib/wizard/types";

const BASE: WizardAnswers = {
  nicho: "Finanzas personales",
  audiencia: "Freelancers de 25 a 35 que recién empiezan",
  plataformas: ["tiktok"],
  tono: "cercano",
  etapaCuenta: "establecida",
  objetivo: "autoridad",
  formato: ["camara"],
  equipo: ["solo"],
  tiempoPorPieza: "30_60min",
  frecuencia: "dos_tres_semana",
  estilosGancho: ["curiosidad"],
};

/**
 * Fixtures locales, desacopladas de Supabase: `generatePromptKit` es una
 * función pura que recibe el snippet como parámetro, así que este test no
 * necesita tocar la red. El contenido no tiene que ser real, solo distinto
 * entre plataformas para que el test de fuga entre plataformas sea válido.
 */
const SNIPPET_BY_PLATAFORMA: Record<Plataforma, TrendsSnippet> = {
  tiktok: {
    plataforma: "tiktok",
    periodo: "línea base de prueba",
    formatos: ["Formato tiktok A", "Formato tiktok B"],
    ganchos: ["Gancho tiktok A"],
    senales: ["Señal tiktok A"],
    evitar: ["Evitar tiktok A"],
    convencionesCopy: "Convenciones de copy de tiktok",
  },
  instagram_reels: {
    plataforma: "instagram_reels",
    periodo: "línea base de prueba",
    formatos: ["Formato reels A", "Formato reels B"],
    ganchos: ["Gancho reels A"],
    senales: ["Señal reels A"],
    evitar: ["Evitar reels A"],
    convencionesCopy: "Convenciones de copy de reels",
  },
  youtube_shorts: {
    plataforma: "youtube_shorts",
    periodo: "línea base de prueba",
    formatos: ["Formato shorts A", "Formato shorts B"],
    ganchos: ["Gancho shorts A"],
    senales: ["Señal shorts A"],
    evitar: ["Evitar shorts A"],
    convencionesCopy: "Convenciones de copy de shorts",
  },
  linkedin: {
    plataforma: "linkedin",
    periodo: "línea base de prueba",
    formatos: ["Formato linkedin A", "Formato linkedin B"],
    ganchos: ["Gancho linkedin A"],
    senales: ["Señal linkedin A"],
    evitar: ["Evitar linkedin A"],
    convencionesCopy: "Convenciones de copy de linkedin",
  },
};

/** Construye un kit desde respuestas crudas, usando fixtures de tendencias locales en vez de Supabase. */
function buildKit(
  overrides: Partial<WizardAnswers> = {},
  duracion: Duracion = "14_dias",
  modelo: ModeloIA = "claude"
): PromptKit {
  const answers = toKitAnswers({ ...BASE, ...overrides });
  if (!answers) throw new Error("Las respuestas de prueba están incompletas");

  return generatePromptKit(
    answers,
    SNIPPET_BY_PLATAFORMA[answers.plataformas[0]],
    modelo,
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

  it("includes contextoMarca in the setup when provided, and nothing extra when it's absent", () => {
    const sinContexto = buildKit();
    expect(textoCompleto(sinContexto)).not.toContain("contexto_de_marca");
    expect(textoCompleto(sinContexto)).not.toContain("Contexto de marca");

    const conContexto = buildKit({
      contextoMarca: "Marca familiar, sin inversores externos.",
    });
    expect(conContexto.setup.contenido).toContain(
      "Marca familiar, sin inversores externos."
    );
  });

  it("changes the account-stage line in the setup without touching the rest of the plan", () => {
    const nueva = buildKit({ etapaCuenta: "nueva" });
    const establecida = buildKit({ etapaCuenta: "establecida" });

    expect(nueva.setup.contenido).toContain("sin audiencia todavía");
    expect(establecida.setup.contenido).not.toContain("sin audiencia todavía");
    expect(establecida.setup.contenido).toContain("ya tiene audiencia");
    expect(nueva.setup.contenido).not.toContain("ya tiene audiencia");

    expect(nueva.semanas).toEqual(establecida.semanas);
  });

  it("describes every selected equipo level in the setup, and none of the others", () => {
    const kit = buildKit({ equipo: ["solo", "con_editor"] });

    expect(kit.setup.contenido).toContain("se graba, edita y publica sin ayuda");
    expect(kit.setup.contenido).toContain("hay alguien que edita");
    expect(kit.setup.contenido).not.toContain("equipo de grabación");
  });

  it("lists every selected equipo level, not just one, in the weekly hard constraints", () => {
    const kit = buildKit({ equipo: ["solo", "con_editor"] });
    const semana1 = kit.semanas[0]?.contenido ?? "";

    expect(semana1).toContain("solo yo");
    expect(semana1).toContain("con editor");
  });

  it("still works with a single equipo level, same as before", () => {
    const kit = buildKit({ equipo: ["solo"] });

    expect(kit.setup.contenido).toContain("se graba, edita y publica sin ayuda");
    expect(kit.setup.contenido).not.toContain("hay alguien que edita");
  });

  it("inserts the trends snippet for the chosen platform into the setup prompt", () => {
    const kit = buildKit({ plataformas: ["linkedin"] });
    const snippet = SNIPPET_BY_PLATAFORMA.linkedin;

    for (const linea of [...snippet.formatos, ...snippet.ganchos, ...snippet.senales, ...snippet.evitar]) {
      expect(kit.setup.contenido).toContain(linea);
    }
    expect(kit.setup.contenido).toContain(snippet.convencionesCopy);
    expect(kit.plataformaPrincipal).toBe("linkedin");
  });

  it("does not leak trends content from other platforms into any block", () => {
    const kit = buildKit({ plataformas: ["tiktok"] });
    const texto = textoCompleto(kit);

    for (const [plataforma, snippet] of Object.entries(SNIPPET_BY_PLATAFORMA)) {
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

  it("still works with a single formato, same as before", () => {
    const camara = buildKit({ formato: ["camara"] });
    const faceless = buildKit({ formato: ["faceless"] });
    const carrusel = buildKit({ formato: ["texto_carrusel"] });

    expect(textoCompleto(camara)).toContain("Dirección de cámara");

    expect(textoCompleto(faceless)).toContain("Plan de imágenes");
    expect(textoCompleto(faceless)).not.toContain("Dirección de cámara");

    expect(textoCompleto(carrusel)).toContain("Lámina 1");
    expect(textoCompleto(carrusel)).not.toContain("Dirección de cámara");
    expect(textoCompleto(carrusel)).toContain("no hay video");
  });

  it("describes every selected formato in the setup, and none of the others", () => {
    const kit = buildKit({ formato: ["camara", "texto_carrusel"] });

    expect(kit.setup.contenido).toContain("se graba a cámara mostrando la cara");
    expect(kit.setup.contenido).toContain("no hay guion hablado");
    expect(kit.setup.contenido).not.toContain("voz en off sobre imágenes");
  });

  it("gives every selected formato its own piece skeleton in the weekly block", () => {
    const kit = buildKit({ formato: ["camara", "texto_carrusel"] });
    const semana1 = kit.semanas[0]?.contenido ?? "";

    expect(semana1).toContain("Dirección de cámara");
    expect(semana1).toContain("Lámina 1");
  });

  it("shows every piece skeleton labeled with the formato it belongs to, only when there's more than one", () => {
    const single = buildKit({ formato: ["camara"] });
    const multi = buildKit({ formato: ["camara", "texto_carrusel"] });

    // `**Formato:**` (bold) is the skeleton's own field, distinct from the
    // plain "Formato: Cámara." that restriccionesDuras always includes.
    expect(textoCompleto(single)).not.toContain("**Formato:**");
    expect((multi.semanas[0]?.contenido ?? "")).toContain("**Formato:** Cámara");
    expect((multi.semanas[0]?.contenido ?? "")).toContain(
      "**Formato:** Texto / carrusel"
    );
  });

  it("only relaxes the formato hard-constraint line, and only adds the mixed-structure quality check, when more than one formato is selected", () => {
    const single = buildKit({ formato: ["camara"] });
    const multi = buildKit({ formato: ["camara", "texto_carrusel"] });
    const semana1Single = single.semanas[0]?.contenido ?? "";
    const semana1Multi = multi.semanas[0]?.contenido ?? "";

    expect(semana1Single).toContain("Formato: Cámara.");
    expect(semana1Single).not.toContain("mezcla campos");

    expect(semana1Multi).toContain(
      "cada pieza usa el que mejor le sirva entre estos"
    );
    expect(semana1Multi).toContain("mezcla campos de dos formatos distintos");
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

describe("cross-model isolation", () => {
  /** Marcadores de prosa/estructura exclusivos de cada adaptador, para detectar fugas. */
  const MARCADOR_POR_MODELO: Record<ModeloIA, string> = {
    claude: "<rol>",
    chatgpt: "## Prohibido",
    gemini: "Regla 1 —",
  };

  it("never lets one adapter's prompt-engineering markers appear in another model's kit", () => {
    const modelos = Object.keys(MARCADOR_POR_MODELO) as ModeloIA[];
    const textoPorModelo = Object.fromEntries(
      modelos.map((modelo) => [modelo, textoCompleto(buildKit({}, "14_dias", modelo))])
    ) as Record<ModeloIA, string>;

    for (const propio of modelos) {
      expect(textoPorModelo[propio]).toContain(MARCADOR_POR_MODELO[propio]);

      for (const otro of modelos) {
        if (otro === propio) continue;
        expect(
          textoPorModelo[otro],
          `el kit de ${otro} filtró el marcador de ${propio}`
        ).not.toContain(MARCADOR_POR_MODELO[propio]);
      }
    }
  });

  it("keeps the modelo field on the kit consistent with what was requested", () => {
    expect(buildKit({}, "14_dias", "chatgpt").modelo).toBe("chatgpt");
    expect(buildKit({}, "14_dias", "gemini").modelo).toBe("gemini");
  });
});
