import type { TrendsSnippet } from "@/lib/trends/types";
import { ADAPTERS } from "./adapters";
import { buildContext } from "./context";
import type { KitAnswers } from "./kit-answers";
import { planDeBloques, type BloqueRequest } from "./plan";
import {
  etiquetaDeGrupo,
  type Duracion,
  type ModeloIA,
  type PromptBlock,
  type PromptKit,
} from "./types";

/** Todo lo que define un bloque menos su contenido, que lo escribe el adaptador. */
type Ficha = Pick<PromptBlock, "id" | "kind" | "grupo" | "descripcion"> & {
  /** Sin el «Prompt N —» de adelante, que depende de la posición en el kit. */
  nombre: string;
};

function fichaDe(req: BloqueRequest): Ficha {
  if (req.kind === "setup") {
    return {
      id: "setup",
      kind: "setup",
      nombre: "Configuración",
      descripcion:
        "Pégalo primero, en una conversación nueva. El modelo va a confirmar el contexto y esperar. Todavía no te va a dar guiones: eso es a propósito.",
    };
  }

  if (req.kind === "semana") {
    const { semana } = req;
    const grupo = { unidad: "semana", numero: semana } as const;

    return {
      id: `semana-${semana}`,
      kind: "semana",
      grupo,
      nombre: etiquetaDeGrupo(grupo),
      descripcion:
        semana === 1
          ? "Pégalo después de que el modelo confirme el contexto, en la misma conversación."
          : `Pégalo cuando ya tengas los guiones de la Semana ${semana - 1}, en la misma conversación.`,
    };
  }

  const { video } = req;
  const grupo = { unidad: "video", numero: video } as const;
  const etiqueta = etiquetaDeGrupo(grupo);

  if (req.kind === "par_titulo") {
    return {
      id: `video-${video}-par`,
      kind: "par_titulo",
      grupo,
      nombre: `${etiqueta} · Título y miniatura`,
      descripcion:
        video === 1
          ? "Pégalo después de que el modelo confirme el contexto. Te va a dar cinco pares y esperar a que elijas uno."
          : `Pégalo cuando ya tengas el guion del Video ${video - 1}, en la misma conversación.`,
    };
  }

  return {
    id: `video-${video}-guion`,
    kind: "guion_largo",
    grupo,
    nombre: `${etiqueta} · Guion`,
    descripcion:
      "Pégalo después de decirle cuál de los cinco pares elegiste, en la misma conversación.",
  };
}

/**
 * Arma el kit completo de prompts.
 *
 * Es una función pura: sin red, sin base de datos, sin reloj y sin azar. El
 * fragmento de tendencias entra como parámetro justamente para que el motor no
 * dependa de dónde salen las tendencias, y para que este sea el punto donde se
 * puede probar todo el comportamiento del producto sin montar nada.
 *
 * La forma del kit —cuántos bloques y en qué orden— la decide `planDeBloques`;
 * acá solo se le pone título y descripción a cada uno y se delega el texto al
 * adaptador del modelo.
 */
export function generatePromptKit(
  answers: KitAnswers,
  trendsSnippet: TrendsSnippet,
  modelo: ModeloIA,
  duracion: Duracion
): PromptKit {
  const ctx = buildContext(answers, trendsSnippet, duracion);
  const adapter = ADAPTERS[modelo];

  const [primero, ...resto] = planDeBloques(answers.tipoDeKit, duracion).map(
    (req, index): PromptBlock => {
      const { nombre, ...ficha } = fichaDe(req);
      return {
        ...ficha,
        // La numeración es posicional: es el orden en que se pegan, y ese es
        // el único dato que le importa a quien los va a pegar.
        titulo: `Prompt ${index + 1} — ${nombre}`,
        contenido: adapter.build(ctx, req),
      };
    }
  );

  return {
    modelo,
    tipoDeKit: answers.tipoDeKit,
    duracion,
    plataformaPrincipal: ctx.plataformaPrincipal,
    bloques: [primero, ...resto],
  };
}
