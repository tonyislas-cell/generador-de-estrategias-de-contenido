import { getVisibleSteps } from "./steps";
import {
  equipoLabel,
  estiloGanchoLabel,
  etapaCuentaLabel,
  formatoLabel,
  frecuenciaLabel,
  objetivoLabel,
  plataformaLabel,
  tiempoPorPiezaLabel,
  tipoDeKitLabel,
  tonoLabel,
} from "./labels";
import type { WizardAnswers } from "./types";

export interface SummaryItem {
  label: string;
  value: string;
}

export function getSummaryItems(answers: WizardAnswers): SummaryItem[] {
  const items: SummaryItem[] = [];
  const visibleStepIds = new Set(getVisibleSteps(answers).map((s) => s.id));

  if (answers.tipoDeKit) {
    items.push({ label: "Qué produces", value: tipoDeKitLabel(answers.tipoDeKit) });
  }
  if (answers.nicho) {
    items.push({ label: "Nicho o industria", value: answers.nicho });
  }
  if (answers.audiencia) {
    items.push({ label: "Audiencia objetivo", value: answers.audiencia });
  }
  if (answers.etapaCuenta) {
    items.push({
      label: "Etapa de la cuenta",
      value: etapaCuentaLabel(answers.etapaCuenta),
    });
  }
  if (answers.plataformas?.length) {
    items.push({
      label: "Plataformas",
      value: answers.plataformas.map(plataformaLabel).join(", "),
    });
  }
  if (answers.tono) {
    items.push({ label: "Tono de marca", value: tonoLabel(answers.tono) });
  }
  if (answers.contextoMarca) {
    items.push({ label: "Contexto de marca", value: answers.contextoMarca });
  }
  if (answers.objetivo) {
    items.push({ label: "Objetivo", value: objetivoLabel(answers.objetivo) });
  }
  if (answers.formato?.length) {
    items.push({
      label: "Formato",
      value: answers.formato.map(formatoLabel).join(", "),
    });
  }
  if (answers.equipo?.length) {
    items.push({
      label: "Equipo disponible",
      value: answers.equipo.map(equipoLabel).join(", "),
    });
  }
  if (answers.tiempoPorPieza) {
    items.push({
      label: "Tiempo por pieza",
      value: tiempoPorPiezaLabel(answers.tiempoPorPieza),
    });
  }
  if (answers.frecuencia) {
    items.push({
      label: "Frecuencia de publicación",
      value: frecuenciaLabel(answers.frecuencia),
    });
  }
  if (answers.estilosGancho?.length) {
    items.push({
      label: "Estilo de gancho",
      value: answers.estilosGancho.map(estiloGanchoLabel).join(", "),
    });
  }

  const inventario: [string, string | undefined][] = [
    ["Herramientas", answers.herramientas],
    ["Números que puedo decir", answers.numeros],
    ["Frases de mi audiencia", answers.frasesAudiencia],
    ["Errores propios", answers.errores],
    ["Datos que no tengo", answers.datosQueNoTengo],
    ["Límites de privacidad", answers.limitesPrivacidad],
  ];
  for (const [label, value] of inventario) {
    if (value) items.push({ label, value });
  }

  if (visibleStepIds.has("oferta")) {
    if (answers.oferta) items.push({ label: "Qué vendes", value: answers.oferta });
    if (answers.objeciones) {
      items.push({ label: "Objeciones comunes", value: answers.objeciones });
    }
    if (answers.pruebaSocial) {
      items.push({ label: "Prueba social", value: answers.pruebaSocial });
    }
  }

  return items;
}
