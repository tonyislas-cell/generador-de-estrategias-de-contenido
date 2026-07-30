import { describe, expect, it } from "vitest";
import { generatePromptKit } from "./generatePromptKit";
import type { Duracion, ModeloIA, PromptBlock, PromptKit } from "./types";
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
  youtube_largo: {
    plataforma: "youtube_largo",
    periodo: "línea base de prueba",
    formatos: ["Formato largo A", "Formato largo B"],
    ganchos: ["Gancho largo A"],
    senales: ["Señal largo A"],
    evitar: ["Evitar largo A"],
    convencionesCopy: "Convenciones de copy de video largo",
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

/** El setup es siempre el primero — invariante de `generatePromptKit`. */
const setupDe = (kit: PromptKit): PromptBlock => kit.bloques[0];
const semanasDe = (kit: PromptKit): PromptBlock[] => kit.bloques.slice(1);
const angulosDe = (kit: PromptKit, semana = 1): string =>
  kit.bloques.find((b) => b.id === `semana-${semana}-angulos`)?.contenido ?? "";
const guionesDe = (kit: PromptKit, semana = 1): string =>
  kit.bloques.find((b) => b.id === `semana-${semana}-guiones`)?.contenido ?? "";

const textoCompleto = (kit: PromptKit): string =>
  kit.bloques.map((bloque) => bloque.contenido).join("\n");

describe("generatePromptKit", () => {
  it("splits each week into an angles block and a scripts block", () => {
    const kit = buildKit();

    expect(setupDe(kit).kind).toBe("setup");
    expect(kit.bloques.map((bloque) => bloque.kind)).toEqual([
      "setup",
      "angulos",
      "guiones",
      "angulos",
      "guiones",
    ]);
  });

  it("produces nine blocks for a one-month plan: setup plus two per week", () => {
    const kit = buildKit({}, "1_mes");

    expect(kit.bloques).toHaveLength(9);
    expect(semanasDe(kit).map((bloque) => bloque.grupo?.numero)).toEqual([
      1, 1, 2, 2, 3, 3, 4, 4,
    ]);
  });

  it("numbers and orders the weekly blocks starting at week one", () => {
    const kit = buildKit({}, "1_mes");

    expect(semanasDe(kit).map((bloque) => bloque.id)).toEqual([
      "semana-1-angulos",
      "semana-1-guiones",
      "semana-2-angulos",
      "semana-2-guiones",
      "semana-3-angulos",
      "semana-3-guiones",
      "semana-4-angulos",
      "semana-4-guiones",
    ]);
  });

  it("numbers the block titles by paste order, which is what the user follows", () => {
    const kit = buildKit();

    expect(kit.bloques.map((bloque) => bloque.titulo)).toEqual([
      "Prompt 1 — Configuración",
      "Prompt 2 — Semana 1 · Ángulos",
      "Prompt 3 — Semana 1 · Guiones",
      "Prompt 4 — Semana 2 · Ángulos",
      "Prompt 5 — Semana 2 · Guiones",
    ]);
  });

  it("labels every block after the setup with the tanda it belongs to", () => {
    const kit = buildKit();

    expect(setupDe(kit).grupo).toBeUndefined();
    expect(semanasDe(kit).map((bloque) => bloque.grupo)).toEqual([
      { unidad: "semana", numero: 1 },
      { unidad: "semana", numero: 1 },
      { unidad: "semana", numero: 2 },
      { unidad: "semana", numero: 2 },
    ]);
  });

  it("keeps the angles block from writing scripts, which is the whole point of the split", () => {
    const kit = buildKit();
    const angulos = angulosDe(kit);

    expect(angulos).toContain("12 ángulos");
    expect(angulos).toContain("No escribas guiones todavía");
    expect(angulos).not.toContain("Dirección de cámara");
    expect(angulos).not.toContain("Tabla de beats");
  });

  it("asks the scripts block for three hooks, a beats table and a close type", () => {
    const guiones = guionesDe(buildKit());

    expect(guiones).toContain("Tres ganchos, palabra por palabra");
    expect(guiones).toContain("Tabla de beats");
    expect(guiones).toContain("El segundo 5");
    expect(guiones).toContain("Tipo de cierre");
    expect(guiones).toContain("Palabra clave, en las tres capas");
    expect(guiones).toContain("Delta por red");
    expect(guiones).not.toContain("12 ángulos");
  });

  it("prints the verification instead of running it in silence", () => {
    const guiones = guionesDe(buildKit());

    expect(guiones).toContain("Imprime esta tabla");
  });

  it("only asks for last week's numbers from the second week onward", () => {
    const kit = buildKit();

    expect(angulosDe(kit, 1)).not.toContain("resultados_semana_anterior");
    expect(angulosDe(kit, 2)).toContain("La peor pieza fue");
  });

  it("includes contextoMarca in the setup when provided, and nothing extra when it's absent", () => {
    const sinContexto = buildKit();
    expect(textoCompleto(sinContexto)).not.toContain("contexto_de_marca");
    expect(textoCompleto(sinContexto)).not.toContain("Contexto de marca");

    const conContexto = buildKit({
      contextoMarca: "Marca familiar, sin inversores externos.",
    });
    expect(setupDe(conContexto).contenido).toContain(
      "Marca familiar, sin inversores externos."
    );
  });

  it("changes the account-stage line in the setup without touching the rest of the plan", () => {
    const nueva = buildKit({ etapaCuenta: "nueva" });
    const establecida = buildKit({ etapaCuenta: "establecida" });

    expect(setupDe(nueva).contenido).toContain("sin audiencia todavía");
    expect(setupDe(establecida).contenido).not.toContain("sin audiencia todavía");
    expect(setupDe(establecida).contenido).toContain("ya tiene audiencia");
    expect(setupDe(nueva).contenido).not.toContain("ya tiene audiencia");

    expect(semanasDe(nueva)).toEqual(semanasDe(establecida));
  });

  it("describes every selected equipo level in the setup, and none of the others", () => {
    const kit = buildKit({ equipo: ["solo", "con_editor"] });

    expect(setupDe(kit).contenido).toContain("se graba, edita y publica sin ayuda");
    expect(setupDe(kit).contenido).toContain("hay alguien que edita");
    expect(setupDe(kit).contenido).not.toContain("equipo de grabación");
  });

  it("lists every selected equipo level, not just one, in the weekly hard constraints", () => {
    const kit = buildKit({ equipo: ["solo", "con_editor"] });
    const semana1 = guionesDe(kit);

    expect(semana1).toContain("solo yo");
    expect(semana1).toContain("con editor");
  });

  it("still works with a single equipo level, same as before", () => {
    const kit = buildKit({ equipo: ["solo"] });

    expect(setupDe(kit).contenido).toContain("se graba, edita y publica sin ayuda");
    expect(setupDe(kit).contenido).not.toContain("hay alguien que edita");
  });

  it("inserts the trends snippet for the chosen platform into the setup prompt", () => {
    const kit = buildKit({ plataformas: ["linkedin"] });
    const snippet = SNIPPET_BY_PLATAFORMA.linkedin;

    for (const linea of [...snippet.formatos, ...snippet.ganchos, ...snippet.senales, ...snippet.evitar]) {
      expect(setupDe(kit).contenido).toContain(linea);
    }
    expect(setupDe(kit).contenido).toContain(snippet.convencionesCopy);
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

    expect(setupDe(kit).contenido).toContain("NO escribas guiones");
    expect(setupDe(kit).contenido).toContain("para y espera");
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

    expect(setupDe(kit).contenido).toContain("se graba a cámara mostrando la cara");
    expect(setupDe(kit).contenido).toContain("no hay guion hablado");
    expect(setupDe(kit).contenido).not.toContain("voz en off sobre imágenes");
  });

  it("gives every selected formato its own piece skeleton in the weekly block", () => {
    const kit = buildKit({ formato: ["camara", "texto_carrusel"] });
    const semana1 = guionesDe(kit);

    expect(semana1).toContain("Dirección de cámara");
    expect(semana1).toContain("Lámina 1");
  });

  it("shows every piece skeleton labeled with the formato it belongs to, only when there's more than one", () => {
    const single = buildKit({ formato: ["camara"] });
    const multi = buildKit({ formato: ["camara", "texto_carrusel"] });

    // `**Formato:**` (bold) is the skeleton's own field, distinct from the
    // plain "Formato: Cámara." that restriccionesDuras always includes.
    expect(textoCompleto(single)).not.toContain("**Formato:**");
    expect(guionesDe(multi)).toContain("**Formato:** Cámara");
    expect(guionesDe(multi)).toContain("**Formato:** Texto / carrusel");
  });

  it("only relaxes the formato hard-constraint line, and only adds the mixed-structure quality check, when more than one formato is selected", () => {
    const single = buildKit({ formato: ["camara"] });
    const multi = buildKit({ formato: ["camara", "texto_carrusel"] });
    const semana1Single = guionesDe(single);
    const semana1Multi = guionesDe(multi);

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

    expect(setupDe(kit).contenido).toContain("Curso de finanzas para freelancers");
    expect(setupDe(kit).contenido).toContain(
      "Creen que necesitan ganar más antes de ordenarse"
    );
    expect(setupDe(kit).contenido).toContain("200 alumnos y 30 testimonios en video");
    expect(setupDe(kit).contenido).toContain("<estrategia_de_venta>");
  });

  it("forbids selling on the autoridad path", () => {
    const kit = buildKit({ objetivo: "autoridad" });

    expect(setupDe(kit).contenido).toContain("<estrategia_de_autoridad>");
    expect(setupDe(kit).contenido).not.toContain("<estrategia_de_venta>");
    expect(setupDe(kit).contenido).toContain("no hay nada para vender");
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

    expect(guionesDe(kit, 1)).not.toBe(guionesDe(kit, 2));
    expect(guionesDe(kit, 1)).not.toContain("<continuidad>");
    expect(guionesDe(kit, 2)).toContain("<continuidad>");
    expect(guionesDe(kit, 2)).toContain("cerraste la Semana 1");
  });

  it("produces a YouTube long-form kit that never mentions weeks", () => {
    const kit = buildKit(
      { tipoDeKit: "youtube_largo", plataformas: ["youtube_largo"] },
      "1_mes"
    );

    expect(kit.bloques).toHaveLength(5);
    expect(kit.bloques.map((bloque) => bloque.kind)).toEqual([
      "setup",
      "par_titulo",
      "guion_largo",
      "par_titulo",
      "guion_largo",
    ]);
    expect(textoCompleto(kit)).not.toContain("Semana");
    expect(textoCompleto(kit)).not.toContain("piezas. Ni una más");
  });

  it("asks for the title/thumbnail pair before the script, and stops in between", () => {
    const kit = buildKit(
      { tipoDeKit: "youtube_largo", plataformas: ["youtube_largo"] },
      "14_dias"
    );
    const [, par, guion] = kit.bloques;

    expect(par.contenido).toContain("Dame 5 pares");
    expect(par.contenido).toContain("Texto en miniatura");
    expect(par.contenido).not.toContain("Tomas de apoyo");

    expect(guion.contenido).toContain("Tomas de apoyo");
    expect(guion.contenido).toContain("Derivados verticales");
    expect(guion.contenido).not.toContain("Dame 5 pares");
  });

  it("asks secondary platforms for an adaptation block only when more than one was chosen", () => {
    const unaSola = buildKit({ plataformas: ["tiktok"] });
    const varias = buildKit({ plataformas: ["tiktok", "linkedin"] });

    expect(setupDe(unaSola).contenido).not.toContain("<plataformas_secundarias>");
    expect(setupDe(varias).contenido).toContain("<plataformas_secundarias>");
    expect(setupDe(varias).contenido).toContain("LinkedIn");
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

  /**
   * La guarda que hace segura la extracción de `plantillas.ts`: el esqueleto
   * del entregable se escribe una sola vez para los tres modelos, así que un
   * `##` o un `<tag>` tipeado ahí por descuido se filtraría a los tres kits.
   * El test de marcadores de arriba mira tres cadenas puntuales; éste mira la
   * sintaxis entera.
   */
  it("keeps each dialect's syntax out of the models that don't use it", () => {
    const texto = (modelo: ModeloIA) =>
      textoCompleto(buildKit({ formato: ["camara", "texto_carrusel"] }, "14_dias", modelo));

    const ETIQUETA_XML = /<\/?[a-z_]+>/;
    const ENCABEZADO_MARKDOWN = /^#{1,6} /m;
    const REGLA_NUMERADA = /^Regla \d+ —/m;
    const CAMPO_EN_LISTA = /^- \*\*[^*]+:\*\*/m;

    // Las etiquetas son la estructura de Claude y de nadie más.
    expect(texto("claude")).toMatch(ETIQUETA_XML);
    expect(texto("chatgpt")).not.toMatch(ETIQUETA_XML);
    expect(texto("gemini")).not.toMatch(ETIQUETA_XML);

    // Gemini es plano: ni encabezados ni campos como ítem de lista.
    expect(texto("gemini")).not.toMatch(ENCABEZADO_MARKDOWN);
    expect(texto("gemini")).not.toMatch(CAMPO_EN_LISTA);
    expect(texto("gemini")).toMatch(REGLA_NUMERADA);

    // Los campos como ítem de lista son de ChatGPT; las reglas numeradas, no.
    expect(texto("chatgpt")).toMatch(CAMPO_EN_LISTA);
    expect(texto("chatgpt")).not.toMatch(REGLA_NUMERADA);
    expect(texto("claude")).not.toMatch(CAMPO_EN_LISTA);
    expect(texto("claude")).not.toMatch(REGLA_NUMERADA);
  });

  it("keeps the modelo field on the kit consistent with what was requested", () => {
    expect(buildKit({}, "14_dias", "chatgpt").modelo).toBe("chatgpt");
    expect(buildKit({}, "14_dias", "gemini").modelo).toBe("gemini");
  });
});
