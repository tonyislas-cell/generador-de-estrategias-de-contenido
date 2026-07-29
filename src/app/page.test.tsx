import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("@/lib/usage", () => ({
  getKitUsageTotal: vi.fn(),
}));

import { getKitUsageTotal } from "@/lib/usage";
import * as contenido from "@/lib/landing/content";
import { DONACION, HERO } from "@/lib/landing/content";
import { getMisiones } from "@/lib/prompt-kit/misiones";
import Home from "./page";

const mockGetKitUsageTotal = getKitUsageTotal as Mock;

describe("Home", () => {
  beforeEach(() => {
    mockGetKitUsageTotal.mockReset();
    // Promesa que nunca resuelve: deja el contador en su estado de carga, que
    // es cuando no renderiza nada. Así los tests que no miran el contador no
    // dependen de él.
    mockGetKitUsageTotal.mockReturnValue(new Promise(() => {}));
  });

  it("leads with the headline and sends every entry point to the cuestionario", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: /No genera tu contenido/ })
    ).toBeInTheDocument();

    // Hay más de una puerta de entrada (el hero, el cierre y el botón del
    // header). Ninguna puede quedar apuntando a otro lado.
    const entradas = screen.getAllByRole("link", {
      name: new RegExp(`${HERO.cta}|^Empezar$`),
    });

    expect(entradas.length).toBeGreaterThanOrEqual(2);
    for (const entrada of entradas) {
      expect(entrada).toHaveAttribute("href", "/cuestionario");
    }
  });

  it("points every donation link at the real account, opened safely", () => {
    render(<Home />);

    const enlaces = screen.getAllByRole("link", {
      name: new RegExp(DONACION.etiqueta),
    });

    expect(enlaces.length).toBeGreaterThan(0);
    for (const enlace of enlaces) {
      expect(enlace).toHaveAttribute("href", DONACION.url);
      expect(enlace).toHaveAttribute("target", "_blank");
      // Sin `noreferrer` la pestaña destino sabría de dónde vino el visitante,
      // y sin `noopener` podría manipular esta página vía `window.opener`.
      expect(enlace).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("gives every section an accessible name that actually resolves", () => {
    const { container } = render(<Home />);

    // `aria-labelledby` apuntando a un id que no existe deja la sección sin
    // nombre accesible, y en silencio: no rompe nada visible.
    const conEtiqueta = container.querySelectorAll("[aria-labelledby]");
    expect(conEtiqueta.length).toBeGreaterThan(0);
    for (const seccion of conEtiqueta) {
      const id = seccion.getAttribute("aria-labelledby")!;
      expect(container.querySelector(`#${id}`), `falta el id "${id}"`).not.toBeNull();
    }
  });

  it("builds the weekly arc from misiones.ts instead of hardcoded copy", () => {
    render(<Home />);

    // Si alguien reescribe una misión en el motor de prompts, la landing tiene
    // que seguirla. Este test falla si los títulos se transcriben a mano.
    for (const objetivo of ["autoridad", "lanzamiento"] as const) {
      for (const mision of getMisiones(objetivo, "1_mes")) {
        expect(screen.getAllByText(mision.titulo).length).toBeGreaterThan(0);
      }
    }
  });

  it("shows the usage total once it loads, pluralized", async () => {
    mockGetKitUsageTotal.mockResolvedValue(1234);
    render(<Home />);

    expect(
      await screen.findByText("Ya se generaron 1.234 kits de prompts.")
    ).toBeInTheDocument();
  });

  it("uses the singular form for a total of exactly one", async () => {
    mockGetKitUsageTotal.mockResolvedValue(1);
    render(<Home />);

    expect(
      await screen.findByText("Ya se generó 1 kit de prompts.")
    ).toBeInTheDocument();
  });

  it("shows nothing extra while the total is loading or fails to load", () => {
    mockGetKitUsageTotal.mockRejectedValue(new Error("network error"));
    render(<Home />);

    expect(screen.queryByText(/Ya se gener/)).toBeNull();
  });
});

/**
 * El proyecto es de tuteo, nunca voseo, y ya se colaron dos formas de voseo en
 * el copy de esta landing («Invitame», «generame»). Esto no es un corrector de
 * gramática: es una lista concreta de las formas que de hecho se cuelan, que es
 * lo que atrapa este tipo de error en la práctica.
 */
describe("landing copy stays in tuteo", () => {
  const VOSEO = [
    // Presente de indicativo
    /\bsos\b/i,
    /\bvos\b/i,
    /\btenés\b/i,
    /\bpodés\b/i,
    /\bquerés\b/i,
    /\bsabés\b/i,
    /\bhacés\b/i,
    /\bvenís\b/i,
    /\belegís\b/i,
    /\bescribís\b/i,
    // Imperativo con pronombre enclítico, que en voseo pierde la tilde
    /\binvitame\b/i,
    /\bgenerame\b/i,
    /\bcontame\b/i,
    /\bmirame\b/i,
    /\bdecime\b/i,
    /\bfijate\b/i,
    // Imperativo suelto
    /\bmirá\b/i,
    /\bhacé\b/i,
    /\bponé\b/i,
    /\bempezá\b/i,
    /\belegí\b/i,
  ];

  /** Aplana el módulo de copy a la lista de cadenas que el usuario llega a leer. */
  function cadenas(valor: unknown): string[] {
    if (typeof valor === "string") return [valor];
    if (Array.isArray(valor)) return valor.flatMap(cadenas);
    if (valor && typeof valor === "object")
      return Object.values(valor).flatMap(cadenas);
    return [];
  }

  it("has no voseo forms anywhere in content.ts", () => {
    const todas = cadenas(contenido);
    // Si el aplanado devolviera nada, el test pasaría sin mirar nada.
    expect(todas.length).toBeGreaterThan(30);

    const infractoras = todas.filter((s) => VOSEO.some((v) => v.test(s)));
    expect(infractoras).toEqual([]);
  });
});
