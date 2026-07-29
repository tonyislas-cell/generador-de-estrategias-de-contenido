import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("@/lib/trends", () => ({
  getTrendsSnippet: vi.fn(),
}));

vi.mock("@/lib/usage", () => ({
  incrementKitUsage: vi.fn(),
}));

import { getTrendsSnippet } from "@/lib/trends";
import { incrementKitUsage } from "@/lib/usage";
import { PromptKitResult } from "./PromptKitResult";
import type { TrendsSnippet } from "@/lib/trends/types";
import type { WizardAnswers } from "@/lib/wizard/types";

const COMPLETE: WizardAnswers = {
  nicho: "Finanzas personales",
  audiencia: "Freelancers de 25 a 35",
  plataformas: ["tiktok"],
  tono: "cercano",
  objetivo: "autoridad",
  formato: "camara",
  equipo: "solo",
  tiempoPorPieza: "30_60min",
  frecuencia: "semanal",
  estilosGancho: ["curiosidad"],
};

const FIXTURE_SNIPPET: TrendsSnippet = {
  plataforma: "tiktok",
  periodo: "línea base de prueba",
  formatos: ["Formato de prueba"],
  ganchos: ["Gancho de prueba"],
  senales: ["Señal de prueba"],
  evitar: ["Evitar de prueba"],
  convencionesCopy: "Copy de prueba",
};

const noop = () => {};
const mockGetTrendsSnippet = getTrendsSnippet as Mock;
const mockIncrementKitUsage = incrementKitUsage as Mock;

describe("PromptKitResult", () => {
  beforeEach(() => {
    mockGetTrendsSnippet.mockReset();
    mockIncrementKitUsage.mockReset();
    mockIncrementKitUsage.mockResolvedValue(undefined);
  });

  it("renders the setup block followed by both weekly blocks, in order", async () => {
    mockGetTrendsSnippet.mockResolvedValue(FIXTURE_SNIPPET);
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="14_dias"
        modelos={["claude"]}
        onBack={noop}
        onRestart={noop}
      />
    );

    const titulos = (
      await screen.findAllByRole("heading", { level: 3 })
    ).map((heading) => heading.textContent);

    expect(titulos).toEqual([
      "Prompt 1 — Configuración",
      "Prompt 2 — Semana 1",
      "Prompt 3 — Semana 2",
    ]);
  });

  it("renders four weekly blocks for a one-month plan", async () => {
    mockGetTrendsSnippet.mockResolvedValue(FIXTURE_SNIPPET);
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="1_mes"
        modelos={["claude"]}
        onBack={noop}
        onRestart={noop}
      />
    );

    const titulos = (
      await screen.findAllByRole("heading", { level: 3 })
    ).map((heading) => heading.textContent);

    expect(titulos).toEqual([
      "Prompt 1 — Configuración",
      "Prompt 2 — Semana 1",
      "Prompt 3 — Semana 2",
      "Prompt 4 — Semana 3",
      "Prompt 5 — Semana 4",
    ]);
    expect(await screen.findByRole("banner")).toHaveTextContent(
      "Plan de 1 mes · TikTok"
    );
  });

  it("separates the setup block from the weekly blocks", async () => {
    mockGetTrendsSnippet.mockResolvedValue(FIXTURE_SNIPPET);
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="14_dias"
        modelos={["claude"]}
        onBack={noop}
        onRestart={noop}
      />
    );

    expect(
      await screen.findByRole("region", { name: "Prompt de configuración" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Bloques semanales" })
    ).toBeInTheDocument();
  });

  it("gives every block its own copy button", async () => {
    mockGetTrendsSnippet.mockResolvedValue(FIXTURE_SNIPPET);
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="14_dias"
        modelos={["claude"]}
        onBack={noop}
        onRestart={noop}
      />
    );

    expect(
      await screen.findAllByRole("button", { name: "Copiar" })
    ).toHaveLength(3);
  });

  it("names the platform in the header, without picking a single model", async () => {
    mockGetTrendsSnippet.mockResolvedValue(FIXTURE_SNIPPET);
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="14_dias"
        modelos={["claude"]}
        onBack={noop}
        onRestart={noop}
      />
    );

    // Scoped to the header on purpose: the platform name also appears inside
    // the prompt text itself, so an unscoped query matches several nodes.
    expect(await screen.findByRole("banner")).toHaveTextContent(
      "Plan de 14 días · TikTok"
    );
  });

  it("shows a recoverable message instead of prompts when answers are incomplete, without touching the network", () => {
    const onBack = vi.fn();
    render(
      <PromptKitResult
        answers={{}}
        duracion="14_dias"
        modelos={["claude"]}
        onBack={onBack}
        onRestart={noop}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Faltan respuestas" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copiar" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Elegir otros modelos" })
    ).toBeInTheDocument();
    expect(mockGetTrendsSnippet).not.toHaveBeenCalled();
  });

  it("shows the same recoverable message when no model was selected, without touching the network", () => {
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="14_dias"
        modelos={[]}
        onBack={noop}
        onRestart={noop}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Faltan respuestas" })
    ).toBeInTheDocument();
    expect(mockGetTrendsSnippet).not.toHaveBeenCalled();
  });

  it("shows a loading state while the trends fetch is in flight", () => {
    mockGetTrendsSnippet.mockReturnValue(new Promise(() => {}));
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="14_dias"
        modelos={["claude"]}
        onBack={noop}
        onRestart={noop}
      />
    );

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("shows a recoverable error state when the trends fetch fails, and recovers on retry", async () => {
    mockGetTrendsSnippet.mockRejectedValueOnce(new Error("network error"));
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="14_dias"
        modelos={["claude"]}
        onBack={noop}
        onRestart={noop}
      />
    );

    expect(
      await screen.findByRole("heading", { name: "No pudimos cargar las tendencias" })
    ).toBeInTheDocument();

    mockGetTrendsSnippet.mockResolvedValueOnce(FIXTURE_SNIPPET);
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(
      await screen.findByRole("heading", { name: "Prompt 1 — Configuración" })
    ).toBeInTheDocument();
    expect(mockGetTrendsSnippet).toHaveBeenCalledTimes(2);
  });

  it("counts one use once the kit is ready", async () => {
    mockGetTrendsSnippet.mockResolvedValue(FIXTURE_SNIPPET);
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="14_dias"
        modelos={["claude"]}
        onBack={noop}
        onRestart={noop}
      />
    );

    await screen.findByRole("heading", { name: "Prompt 1 — Configuración" });

    expect(mockIncrementKitUsage).toHaveBeenCalledTimes(1);
  });

  it("still shows the kit even if counting the use fails", async () => {
    mockGetTrendsSnippet.mockResolvedValue(FIXTURE_SNIPPET);
    mockIncrementKitUsage.mockRejectedValue(new Error("network error"));
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="14_dias"
        modelos={["claude"]}
        onBack={noop}
        onRestart={noop}
      />
    );

    expect(
      await screen.findByRole("heading", { name: "Prompt 1 — Configuración" })
    ).toBeInTheDocument();
  });

  describe("multiple models", () => {
    it("shows one tab per selected model, and no others", async () => {
      mockGetTrendsSnippet.mockResolvedValue(FIXTURE_SNIPPET);
      render(
        <PromptKitResult
          answers={COMPLETE}
          duracion="14_dias"
          modelos={["claude", "chatgpt"]}
          onBack={noop}
          onRestart={noop}
        />
      );

      const tabs = await screen.findAllByRole("tab");
      expect(tabs.map((tab) => tab.textContent)).toEqual(["Claude", "ChatGPT"]);
      expect(screen.queryByRole("tab", { name: "Gemini" })).toBeNull();
    });

    it("orders tabs consistently regardless of selection order", async () => {
      mockGetTrendsSnippet.mockResolvedValue(FIXTURE_SNIPPET);
      render(
        <PromptKitResult
          answers={COMPLETE}
          duracion="14_dias"
          modelos={["gemini", "claude", "chatgpt"]}
          onBack={noop}
          onRestart={noop}
        />
      );

      const tabs = await screen.findAllByRole("tab");
      expect(tabs.map((tab) => tab.textContent)).toEqual([
        "Claude",
        "ChatGPT",
        "Gemini",
      ]);
    });

    it("fetches trends only once no matter how many models are selected", async () => {
      mockGetTrendsSnippet.mockResolvedValue(FIXTURE_SNIPPET);
      render(
        <PromptKitResult
          answers={COMPLETE}
          duracion="14_dias"
          modelos={["claude", "chatgpt", "gemini"]}
          onBack={noop}
          onRestart={noop}
        />
      );

      await screen.findAllByRole("tab");

      expect(mockGetTrendsSnippet).toHaveBeenCalledTimes(1);
    });

    it("switching tabs shows that model's own kit content", async () => {
      mockGetTrendsSnippet.mockResolvedValue(FIXTURE_SNIPPET);
      render(
        <PromptKitResult
          answers={COMPLETE}
          duracion="14_dias"
          modelos={["claude", "chatgpt"]}
          onBack={noop}
          onRestart={noop}
        />
      );

      await screen.findAllByRole("tab");
      expect(
        screen.getByText(/Abre Claude en una conversación nueva/)
      ).toBeInTheDocument();

      // Radix's TabsTrigger switches tabs on mousedown, not on click.
      fireEvent.mouseDown(screen.getByRole("tab", { name: "ChatGPT" }));

      expect(
        await screen.findByText(/Abre ChatGPT en una conversación nueva/)
      ).toBeInTheDocument();
    });
  });
});
