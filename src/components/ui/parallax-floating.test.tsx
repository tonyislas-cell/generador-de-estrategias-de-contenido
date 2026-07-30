import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FloatingElement, ParallaxFloating } from "./parallax-floating";

/**
 * El desplazamiento en sí no se puede afirmar acá: depende de un resorte que
 * avanza con `requestAnimationFrame`, y en jsdom no hay un reloj de frames
 * confiable. Lo que sí se prueba son las decisiones del componente, que son
 * deterministas: cuándo se engancha al puntero y cuándo no.
 */

/** jsdom no implementa `matchMedia`, así que hay que proveerlo por test. */
function simularEntorno({
  punteroFino,
  movimientoReducido,
}: {
  punteroFino: boolean;
  movimientoReducido: boolean;
}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((consulta: string) => ({
      matches: consulta.includes("prefers-reduced-motion")
        ? movimientoReducido
        : punteroFino,
      media: consulta,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

function contenido() {
  return (
    <ParallaxFloating sensitivity={1.5}>
      <FloatingElement depth={2} className="left-[10%]">
        <span>figura</span>
      </FloatingElement>
    </ParallaxFloating>
  );
}

describe("ParallaxFloating", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders its children and hides the whole layer from assistive tech", () => {
    simularEntorno({ punteroFino: true, movimientoReducido: false });
    const { container } = render(contenido());

    expect(screen.getByText("figura")).toBeInTheDocument();
    // Es decoración: no aporta nada a quien navega con lector de pantalla.
    expect(container.querySelector("[aria-hidden='true']")).not.toBeNull();
  });

  it("tracks the pointer when there's a fine pointer and motion is allowed", () => {
    simularEntorno({ punteroFino: true, movimientoReducido: false });
    const espia = vi.spyOn(window, "addEventListener");

    render(contenido());

    expect(espia).toHaveBeenCalledWith(
      "pointermove",
      expect.any(Function),
      // Pasivo: el handler no cancela el evento, y decirlo deja al navegador
      // procesar el scroll sin esperarlo.
      { passive: true }
    );
  });

  it("never listens when the visitor asked for reduced motion", () => {
    simularEntorno({ punteroFino: true, movimientoReducido: true });
    const espia = vi.spyOn(window, "addEventListener");

    render(contenido());

    expect(
      espia.mock.calls.filter(([evento]) => evento === "pointermove")
    ).toEqual([]);
  });

  it("never listens on a touch screen, where there is no cursor to follow", () => {
    simularEntorno({ punteroFino: false, movimientoReducido: false });
    const espia = vi.spyOn(window, "addEventListener");

    render(contenido());

    expect(
      espia.mock.calls.filter(([evento]) => evento === "pointermove")
    ).toEqual([]);
  });

  it("drops the pointer listener on unmount", () => {
    simularEntorno({ punteroFino: true, movimientoReducido: false });
    const espia = vi.spyOn(window, "removeEventListener");

    render(contenido()).unmount();

    expect(espia).toHaveBeenCalledWith("pointermove", expect.any(Function));
  });

  it("fails loudly if a FloatingElement is used outside the provider", () => {
    simularEntorno({ punteroFino: true, movimientoReducido: false });
    // React escribe el error en consola además de propagarlo; se silencia para
    // que la salida del test no parezca un fallo real.
    const consola = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      render(
        <FloatingElement depth={1}>
          <span>huérfana</span>
        </FloatingElement>
      )
    ).toThrow(/dentro de ParallaxFloating/);

    consola.mockRestore();
  });
});
