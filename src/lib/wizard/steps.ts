import type { StepId, WizardAnswers } from "./types";

export interface StepDefinition {
  id: StepId;
  title: string;
  /** Returns true once every field this step asks for has an answer. */
  isAnswered: (answers: WizardAnswers) => boolean;
  /** Ausente = el paso siempre se muestra. */
  isVisible?: (answers: WizardAnswers) => boolean;
}

const hasText = (value: string | undefined) => Boolean(value && value.trim());
const hasItems = (value: unknown[] | undefined) => Boolean(value && value.length > 0);

/** El kit de video largo tiene su propia plataforma y su propia cadencia. */
const esVertical = (a: WizardAnswers) => (a.tipoDeKit ?? "vertical") === "vertical";

const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: "tipo",
    title: "Qué vas a producir",
    isAnswered: (a) => Boolean(a.tipoDeKit),
  },
  {
    id: "contexto",
    title: "Contexto",
    isAnswered: (a) =>
      hasText(a.nicho) &&
      hasText(a.audiencia) &&
      // En video largo la plataforma es una sola y no se pregunta.
      (!esVertical(a) || hasItems(a.plataformas)) &&
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
    isAnswered: (a) => hasItems(a.formato),
  },
  {
    id: "recursos",
    title: "Recursos y restricciones",
    isAnswered: (a) =>
      hasItems(a.equipo) &&
      Boolean(a.tiempoPorPieza) &&
      // La cadencia del video largo sale de la duración: un video cada dos
      // semanas. Preguntar una frecuencia semanal ahí no significaría nada.
      (!esVertical(a) || Boolean(a.frecuencia)),
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
    // Solo en el camino de lanzamiento/conversión.
    isVisible: (a) => a.objetivo === "lanzamiento",
  },
];

export function getVisibleSteps(answers: WizardAnswers): StepDefinition[] {
  return STEP_DEFINITIONS.filter((step) => step.isVisible?.(answers) ?? true);
}
