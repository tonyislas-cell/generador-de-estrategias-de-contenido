import { describe, expect, it } from "vitest";
import {
  agruparBloques,
  etiquetaDeGrupo,
  type PromptBlock,
  type PromptKit,
} from "./types";

function bloque(
  id: string,
  grupo?: PromptBlock["grupo"]
): PromptBlock {
  return {
    id,
    kind: grupo ? "semana" : "setup",
    grupo,
    titulo: id,
    descripcion: "",
    contenido: "",
  };
}

const semana = (numero: number) => ({ unidad: "semana", numero }) as const;

function kit(bloques: [PromptBlock, ...PromptBlock[]]): PromptKit {
  return {
    modelo: "claude",
    duracion: "14_dias",
    plataformaPrincipal: "tiktok",
    bloques,
  };
}

describe("agruparBloques", () => {
  it("pulls the setup out and leaves it ungrouped", () => {
    const { setup, tandas } = agruparBloques(
      kit([bloque("setup"), bloque("semana-1", semana(1))])
    );

    expect(setup.id).toBe("setup");
    expect(tandas).toHaveLength(1);
  });

  it("puts every block of the same tanda together, in order", () => {
    const { tandas } = agruparBloques(
      kit([
        bloque("setup"),
        bloque("semana-1-a", semana(1)),
        bloque("semana-1-b", semana(1)),
        bloque("semana-2-a", semana(2)),
      ])
    );

    expect(tandas.map((tanda) => etiquetaDeGrupo(tanda.grupo))).toEqual([
      "Semana 1",
      "Semana 2",
    ]);
    expect(tandas[0].bloques.map((b) => b.id)).toEqual([
      "semana-1-a",
      "semana-1-b",
    ]);
    expect(tandas[1].bloques.map((b) => b.id)).toEqual(["semana-2-a"]);
  });

  it("refuses to drop a block that declares no tanda", () => {
    // Saltearlo lo haría desaparecer de la pantalla y de la descarga sin
    // ninguna señal, y el usuario se llevaría un kit con un hueco.
    expect(() =>
      agruparBloques(kit([bloque("setup"), bloque("huerfano")]))
    ).toThrow(/huerfano/);
  });

  it("returns no tandas when the kit is only a setup block", () => {
    const { setup, tandas } = agruparBloques(kit([bloque("setup")]));

    expect(setup.id).toBe("setup");
    expect(tandas).toEqual([]);
  });
});
