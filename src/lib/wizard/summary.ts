import { getVisibleSteps } from "./steps";
import {
  EQUIPO_OPTIONS,
  ESTILO_GANCHO_OPTIONS,
  FORMATO_OPTIONS,
  FRECUENCIA_OPTIONS,
  OBJETIVO_OPTIONS,
  PLATAFORMA_OPTIONS,
  TIEMPO_POR_PIEZA_OPTIONS,
  TONO_OPTIONS,
} from "./options";
import type { WizardAnswers } from "./types";

export interface SummaryItem {
  label: string;
  value: string;
}

function labelFor<T extends string>(options: { value: T; label: string }[]) {
  return (value: T) => options.find((o) => o.value === value)?.label ?? value;
}

export function getSummaryItems(answers: WizardAnswers): SummaryItem[] {
  const items: SummaryItem[] = [];
  const visibleStepIds = new Set(getVisibleSteps(answers).map((s) => s.id));

  if (answers.nicho) {
    items.push({ label: "Nicho o industria", value: answers.nicho });
  }
  if (answers.audiencia) {
    items.push({ label: "Audiencia objetivo", value: answers.audiencia });
  }
  if (answers.plataformas?.length) {
    items.push({
      label: "Plataformas",
      value: answers.plataformas.map(labelFor(PLATAFORMA_OPTIONS)).join(", "),
    });
  }
  if (answers.tono) {
    items.push({ label: "Tono de marca", value: labelFor(TONO_OPTIONS)(answers.tono) });
  }
  if (answers.objetivo) {
    items.push({
      label: "Objetivo",
      value: labelFor(OBJETIVO_OPTIONS)(answers.objetivo),
    });
  }
  if (answers.formato) {
    items.push({ label: "Formato", value: labelFor(FORMATO_OPTIONS)(answers.formato) });
  }
  if (answers.equipo) {
    items.push({ label: "Equipo disponible", value: labelFor(EQUIPO_OPTIONS)(answers.equipo) });
  }
  if (answers.tiempoPorPieza) {
    items.push({
      label: "Tiempo por pieza",
      value: labelFor(TIEMPO_POR_PIEZA_OPTIONS)(answers.tiempoPorPieza),
    });
  }
  if (answers.frecuencia) {
    items.push({
      label: "Frecuencia de publicación",
      value: labelFor(FRECUENCIA_OPTIONS)(answers.frecuencia),
    });
  }
  if (answers.estilosGancho?.length) {
    items.push({
      label: "Estilo de gancho",
      value: answers.estilosGancho.map(labelFor(ESTILO_GANCHO_OPTIONS)).join(", "),
    });
  }

  if (visibleStepIds.has("oferta")) {
    if (answers.oferta) items.push({ label: "Qué vendés", value: answers.oferta });
    if (answers.objeciones) {
      items.push({ label: "Objeciones comunes", value: answers.objeciones });
    }
    if (answers.pruebaSocial) {
      items.push({ label: "Prueba social", value: answers.pruebaSocial });
    }
  }

  return items;
}
