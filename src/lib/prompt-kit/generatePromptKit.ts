import type { TrendsSnippet } from "@/lib/trends/types";
import { ADAPTERS } from "./adapters";
import { buildContext } from "./context";
import type { KitAnswers } from "./kit-answers";
import { DURACION_CONFIG, type Duracion, type ModeloIA, type PromptBlock, type PromptKit } from "./types";

function descripcionDeSemana(semana: number): string {
  return semana === 1
    ? "Pégalo después de que el modelo confirme el contexto, en la misma conversación."
    : `Pégalo cuando ya tengas los guiones de la Semana ${semana - 1}, en la misma conversación.`;
}

/**
 * Arma el kit completo de prompts.
 *
 * Es una función pura: sin red, sin base de datos, sin reloj y sin azar. El
 * fragmento de tendencias entra como parámetro justamente para que el motor no
 * dependa de dónde salen las tendencias, y para que este sea el punto donde se
 * puede probar todo el comportamiento del producto sin montar nada.
 */
export function generatePromptKit(
  answers: KitAnswers,
  trendsSnippet: TrendsSnippet,
  modelo: ModeloIA,
  duracion: Duracion
): PromptKit {
  const ctx = buildContext(answers, trendsSnippet, duracion);
  const adapter = ADAPTERS[modelo];

  const setup: PromptBlock = {
    id: "setup",
    kind: "setup",
    titulo: "Prompt 1 — Configuración",
    descripcion:
      "Pégalo primero, en una conversación nueva. El modelo va a confirmar el contexto y esperar. Todavía no te va a dar guiones: eso es a propósito.",
    contenido: adapter.buildSetup(ctx),
  };

  const semanas: PromptBlock[] = Array.from(
    { length: DURACION_CONFIG[duracion].semanas },
    (_, index) => {
      const semana = index + 1;
      return {
        id: `semana-${semana}`,
        kind: "semana",
        semana,
        titulo: `Prompt ${semana + 1} — Semana ${semana}`,
        descripcion: descripcionDeSemana(semana),
        contenido: adapter.buildSemana(ctx, semana),
      };
    }
  );

  return {
    modelo,
    duracion,
    plataformaPrincipal: ctx.plataformaPrincipal,
    setup,
    semanas,
  };
}
