import { describe, expect, it } from "vitest";
import { buildKitMarkdown, kitFileName } from "./markdown";
import type { PromptKit } from "./types";

function buildKit(overrides: Partial<PromptKit> = {}): PromptKit {
  return {
    modelo: "claude",
    duracion: "14_dias",
    plataformaPrincipal: "tiktok",
    bloques: [
      {
        id: "setup",
        kind: "setup",
        titulo: "Prompt 1 — Configuración",
        descripcion: "Pégalo primero, en una conversación nueva.",
        contenido: "Contenido del setup de Claude.",
      },
      {
        id: "semana-1",
        kind: "semana",
        grupo: { unidad: "semana", numero: 1, etiqueta: "Semana 1" },
        titulo: "Prompt 2 — Semana 1",
        descripcion: "Pégalo después de que el modelo confirme el contexto.",
        contenido: "Contenido de la semana 1 de Claude.",
      },
      {
        id: "semana-2",
        kind: "semana",
        grupo: { unidad: "semana", numero: 2, etiqueta: "Semana 2" },
        titulo: "Prompt 3 — Semana 2",
        descripcion: "Pégalo cuando ya tengas los guiones de la Semana 1.",
        contenido: "Contenido de la semana 2 de Claude.",
      },
    ],
    ...overrides,
  };
}

describe("buildKitMarkdown", () => {
  it("includes the setup block and every weekly block, in order", () => {
    const md = buildKitMarkdown(buildKit());

    const setupIndex = md.indexOf("Contenido del setup de Claude.");
    const semana1Index = md.indexOf("Contenido de la semana 1 de Claude.");
    const semana2Index = md.indexOf("Contenido de la semana 2 de Claude.");

    expect(setupIndex).toBeGreaterThan(-1);
    expect(semana1Index).toBeGreaterThan(setupIndex);
    expect(semana2Index).toBeGreaterThan(semana1Index);
  });

  it("separates blocks with a markdown horizontal rule", () => {
    const md = buildKitMarkdown(buildKit());

    expect(md.split("\n\n---\n\n")).toHaveLength(4); // encabezado + 3 bloques
  });

  it("headers each block with its título and its descripción in italics", () => {
    const md = buildKitMarkdown(buildKit());

    expect(md).toContain("## Prompt 1 — Configuración");
    expect(md).toContain("_Pégalo primero, en una conversación nueva._");
    expect(md).toContain("## Prompt 2 — Semana 1");
  });

  it("opens with the model name, duration label and platform", () => {
    const md = buildKitMarkdown(
      buildKit({ modelo: "chatgpt", duracion: "1_mes", plataformaPrincipal: "linkedin" })
    );

    expect(md).toContain("# Kit de prompts — ChatGPT");
    expect(md).toContain("Plan de 1 mes");
    expect(md).toContain("LinkedIn");
  });

  it("does not mix content between kits of different models built from the same answers", () => {
    const claude = buildKit({ modelo: "claude" });
    const [setup, ...semanas] = claude.bloques;
    const chatgpt = buildKit({
      modelo: "chatgpt",
      bloques: [
        { ...setup, contenido: "Contenido del setup de ChatGPT." },
        ...semanas.map((bloque, i) => ({
          ...bloque,
          contenido: `Contenido de la semana ${i + 1} de ChatGPT.`,
        })),
      ],
    });

    const mdClaude = buildKitMarkdown(claude);
    const mdChatgpt = buildKitMarkdown(chatgpt);

    expect(mdClaude).not.toContain("ChatGPT");
    expect(mdChatgpt).not.toContain("Contenido del setup de Claude.");
    expect(mdChatgpt).not.toContain("Contenido de la semana 1 de Claude.");
  });
});

describe("kitFileName", () => {
  it("identifies the model and the 14-day duration", () => {
    expect(kitFileName(buildKit({ modelo: "claude", duracion: "14_dias" }))).toBe(
      "kit-prompts-claude-14-dias.md"
    );
  });

  it("identifies the model and the 1-month duration", () => {
    expect(kitFileName(buildKit({ modelo: "gemini", duracion: "1_mes" }))).toBe(
      "kit-prompts-gemini-1-mes.md"
    );
  });

  it("produces different file names for different models", () => {
    const claudeName = kitFileName(buildKit({ modelo: "claude" }));
    const chatgptName = kitFileName(buildKit({ modelo: "chatgpt" }));

    expect(claudeName).not.toBe(chatgptName);
  });
});
