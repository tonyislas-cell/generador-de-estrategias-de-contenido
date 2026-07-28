import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PromptKitResult } from "./PromptKitResult";
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

const noop = () => {};

describe("PromptKitResult", () => {
  it("renders the setup block followed by both weekly blocks, in order", () => {
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="14_dias"
        onBack={noop}
        onRestart={noop}
      />
    );

    const titulos = screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);

    expect(titulos).toEqual([
      "Prompt 1 — Configuración",
      "Prompt 2 — Semana 1",
      "Prompt 3 — Semana 2",
    ]);
  });

  it("renders four weekly blocks for a one-month plan", () => {
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="1_mes"
        onBack={noop}
        onRestart={noop}
      />
    );

    const titulos = screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);

    expect(titulos).toEqual([
      "Prompt 1 — Configuración",
      "Prompt 2 — Semana 1",
      "Prompt 3 — Semana 2",
      "Prompt 4 — Semana 3",
      "Prompt 5 — Semana 4",
    ]);
    expect(screen.getByRole("banner")).toHaveTextContent(
      "Plan de 1 mes · TikTok · para Claude"
    );
  });

  it("separates the setup block from the weekly blocks", () => {
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="14_dias"
        onBack={noop}
        onRestart={noop}
      />
    );

    expect(
      screen.getByRole("region", { name: "Prompt de configuración" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Bloques semanales" })
    ).toBeInTheDocument();
  });

  it("gives every block its own copy button", () => {
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="14_dias"
        onBack={noop}
        onRestart={noop}
      />
    );

    expect(screen.getAllByRole("button", { name: "Copiar" })).toHaveLength(3);
  });

  it("names the platform and target model the kit was built for", () => {
    render(
      <PromptKitResult
        answers={COMPLETE}
        duracion="14_dias"
        onBack={noop}
        onRestart={noop}
      />
    );

    // Scoped to the header on purpose: the platform name also appears inside
    // the prompt text itself, so an unscoped query matches several nodes.
    expect(screen.getByRole("banner")).toHaveTextContent(
      "Plan de 14 días · TikTok · para Claude"
    );
  });

  it("shows a recoverable message instead of prompts when answers are incomplete", () => {
    const onBack = vi.fn();
    render(
      <PromptKitResult
        answers={{}}
        duracion="14_dias"
        onBack={onBack}
        onRestart={noop}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Faltan respuestas" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copiar" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Volver al resumen" })
    ).toBeInTheDocument();
  });
});
