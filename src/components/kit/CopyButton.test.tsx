import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "./CopyButton";

/**
 * jsdom no trae `navigator.clipboard`, y las propiedades de `navigator` están
 * definidas con accesor, así que hay que usar `defineProperty`. `configurable`
 * es lo que permite borrarla después y probar el caso "la API no existe".
 */
function stubClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn(writeText) },
    configurable: true,
  });
}

afterEach(() => {
  Reflect.deleteProperty(navigator, "clipboard");
});

describe("CopyButton", () => {
  it("writes the exact text it was given to the clipboard", async () => {
    stubClipboard(() => Promise.resolve());
    render(<CopyButton text="contenido del prompt" />);

    fireEvent.click(screen.getByRole("button", { name: "Copiar" }));

    // Se espera al estado final para que el re-render quede dentro de act().
    await screen.findByRole("button", { name: "¡Copiado!" });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "contenido del prompt"
    );
  });

  it("confirms to the user once the copy succeeded", async () => {
    stubClipboard(() => Promise.resolve());
    render(<CopyButton text="contenido" />);

    fireEvent.click(screen.getByRole("button", { name: "Copiar" }));

    expect(
      await screen.findByRole("button", { name: "¡Copiado!" })
    ).toBeInTheDocument();
  });

  it("offers a manual fallback when the clipboard write is rejected", async () => {
    stubClipboard(() => Promise.reject(new Error("denied")));
    render(<CopyButton text="contenido" />);

    fireEvent.click(screen.getByRole("button", { name: "Copiar" }));

    expect(
      await screen.findByRole("button", { name: "No se pudo copiar" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Selecciona el texto del recuadro y cópialo a mano.")
    ).toBeInTheDocument();
  });

  it("offers a manual fallback when the clipboard API is unavailable", async () => {
    render(<CopyButton text="contenido" />);

    fireEvent.click(screen.getByRole("button", { name: "Copiar" }));

    expect(
      await screen.findByRole("button", { name: "No se pudo copiar" })
    ).toBeInTheDocument();
  });
});
