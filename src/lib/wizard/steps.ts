import type { StepId, WizardAnswers } from "./types";

export interface StepDefinition {
  id: StepId;
  title: string;
  /** Returns true once every field this step asks for has an answer. */
  isAnswered: (answers: WizardAnswers) => boolean;
}

const hasText = (value: string | undefined) => Boolean(value && value.trim());
const hasItems = (value: unknown[] | undefined) => Boolean(value && value.length > 0);

const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: "contexto",
    title: "Contexto",
    isAnswered: (a) =>
      hasText(a.nicho) &&
      hasText(a.audiencia) &&
      hasItems(a.plataformas) &&
      hasText(a.tono) &&
      hasText(a.etapaCuenta),
  },
  {
    id: "objetivo",
    title: "Objetivo",
    isAnswered: (a) => Boolean(a.objetivo),
  },
  {
    id: "formato",
    title: "Formato",
    isAnswered: (a) => Boolean(a.formato),
  },
  {
    id: "recursos",
    title: "Recursos y restricciones",
    isAnswered: (a) =>
      Boolean(a.equipo) && Boolean(a.tiempoPorPieza) && Boolean(a.frecuencia),
  },
  {
    id: "gancho",
    title: "Voz y estilo de gancho",
    isAnswered: (a) => hasItems(a.estilosGancho),
  },
  {
    id: "oferta",
    title: "Oferta / CTA",
    isAnswered: (a) =>
      hasText(a.oferta) && hasText(a.objeciones) && hasText(a.pruebaSocial),
  },
];

/**
 * The layer-6 branch is the only conditional edge in the questionnaire: it
 * only applies on the lanzamiento/conversión path (layer 2).
 */
export function getVisibleSteps(answers: WizardAnswers): StepDefinition[] {
  return STEP_DEFINITIONS.filter((step) => {
    if (step.id === "oferta") return answers.objetivo === "lanzamiento";
    return true;
  });
}
