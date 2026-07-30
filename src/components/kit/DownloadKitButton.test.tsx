import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { DownloadKitButton } from "./DownloadKitButton";
import { buildKitMarkdown, kitFileName } from "@/lib/prompt-kit/markdown";
import type { PromptKit } from "@/lib/prompt-kit/types";

const KIT: PromptKit = {
  modelo: "claude",
  tipoDeKit: "vertical",
  duracion: "14_dias",
  plataformaPrincipal: "tiktok",
  bloques: [
    {
      id: "setup",
      kind: "setup",
      titulo: "Prompt 1 — Configuración",
      descripcion: "Pégalo primero, en una conversación nueva.",
      contenido: "Contenido del setup.",
    },
    {
      id: "semana-1",
      kind: "semana",
      grupo: { unidad: "semana", numero: 1 },
      titulo: "Prompt 2 — Semana 1",
      descripcion: "Pégalo después de que el modelo confirme el contexto.",
      contenido: "Contenido de la semana 1.",
    },
  ],
};

/**
 * El `URL.createObjectURL` real de este entorno de test rechaza el `Blob`
 * construido en el mismo test por un choque de realm (mismo tipo de bug que
 * jose vs. jsdom con `Uint8Array` en otro módulo de este proyecto), así que
 * se reemplaza por un mock — igual que `stubClipboard` hace con
 * `navigator.clipboard` en CopyButton.test.tsx.
 */
function stubObjectUrl() {
  const createObjectURL: Mock<(blob: Blob) => string> = vi.fn(
    () => "blob:mock-url"
  );
  const revokeObjectURL = vi.fn();
  Object.defineProperty(URL, "createObjectURL", {
    value: createObjectURL,
    configurable: true,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    value: revokeObjectURL,
    configurable: true,
  });
  return { createObjectURL, revokeObjectURL };
}

/**
 * `URL.createObjectURL`/`revokeObjectURL` no están ausentes en este entorno
 * de test — jsdom trae su propio stub ("not implemented") — así que borrar
 * la propiedad en `afterEach` dejaría `undefined` para siempre en vez de
 * restaurar ese stub. Guardar y reponer el descriptor original evita que un
 * test posterior en este archivo herede el estado "no soportado" a ciegas.
 */
let originalCreateObjectURL: PropertyDescriptor | undefined;
let originalRevokeObjectURL: PropertyDescriptor | undefined;

beforeEach(() => {
  originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
  originalRevokeObjectURL = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
});

afterEach(() => {
  if (originalCreateObjectURL) {
    Object.defineProperty(URL, "createObjectURL", originalCreateObjectURL);
  } else {
    Reflect.deleteProperty(URL, "createObjectURL");
  }
  if (originalRevokeObjectURL) {
    Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectURL);
  } else {
    Reflect.deleteProperty(URL, "revokeObjectURL");
  }
  vi.restoreAllMocks();
});

describe("DownloadKitButton", () => {
  it("downloads a Markdown blob containing exactly this kit's content", async () => {
    const { createObjectURL } = stubObjectUrl();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    render(<DownloadKitButton kit={KIT} />);
    fireEvent.click(screen.getByRole("button", { name: /Descargar/ }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(blob.type).toBe("text/markdown");
    await expect(blob.text()).resolves.toBe(buildKitMarkdown(KIT));
  });

  it("names the download after the kit's model and duration", () => {
    stubObjectUrl();
    let downloadName: string | undefined;
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      function (this: HTMLAnchorElement) {
        downloadName = this.download;
      }
    );

    render(<DownloadKitButton kit={KIT} />);
    fireEvent.click(screen.getByRole("button", { name: /Descargar/ }));

    expect(downloadName).toBe(kitFileName(KIT));
  });

  it("revokes the object URL after triggering the download", () => {
    const { createObjectURL, revokeObjectURL } = stubObjectUrl();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    render(<DownloadKitButton kit={KIT} />);
    fireEvent.click(screen.getByRole("button", { name: /Descargar/ }));

    expect(revokeObjectURL).toHaveBeenCalledWith(createObjectURL.mock.results[0]?.value);
  });

  it("shows a recoverable message when the browser can't create object URLs", () => {
    // jsdom does have a real `URL.createObjectURL`, so this simulates the
    // unsupported environment explicitly instead of relying on absence.
    Object.defineProperty(URL, "createObjectURL", {
      value: undefined,
      configurable: true,
    });

    render(<DownloadKitButton kit={KIT} />);
    fireEvent.click(screen.getByRole("button", { name: /Descargar/ }));

    expect(
      screen.getByText(/no permite descargar archivos/)
    ).toBeInTheDocument();
  });

  it("still downloads normally in a later test, proving the previous test's override didn't leak", () => {
    const { createObjectURL } = stubObjectUrl();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    render(<DownloadKitButton kit={KIT} />);
    fireEvent.click(screen.getByRole("button", { name: /Descargar/ }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/no permite descargar archivos/)).toBeNull();
  });
});
