import type { Plataforma } from "@/lib/wizard/types";
import type { TrendsSnippet } from "@/lib/trends/types";
import * as labels from "@/lib/wizard/labels";
import {
  EQUIPO_DESCRIPTOR,
  ESTILO_GANCHO_MECANICA,
  ETAPA_CUENTA_DESCRIPTOR,
  FORMATO_DESCRIPTOR,
  PIEZAS_POR_SEMANA,
  TIEMPO_POR_PIEZA_DESCRIPTOR,
  TONO_DESCRIPTOR,
  piezasLabel,
} from "./descriptors";
import { getMisiones, type MisionSemana } from "./misiones";
import type { KitAnswers } from "./kit-answers";
import { DURACION_CONFIG, type Duracion } from "./types";

/**
 * Todo lo que un adaptador necesita, ya resuelto y agnóstico al modelo.
 *
 * Los adaptadores se quedan solo con prosa, estructura y énfasis —que es donde
 * vive la diferencia real entre escribirle a un modelo o a otro— en vez de
 * repetir cada uno la misma resolución de etiquetas y descriptores.
 */
export interface PromptContext {
  answers: KitAnswers;
  trends: TrendsSnippet;

  duracion: Duracion;
  duracionEtiqueta: string;
  totalSemanas: number;

  plataformaPrincipal: Plataforma;
  plataformaPrincipalLabel: string;
  plataformasSecundariasLabels: string[];

  // Los campos `*Label` guardan el texto que vio el usuario, no el valor crudo.
  tonoLabel: string;
  tonoDescriptor: string;
  etapaCuentaLabel: string;
  etapaCuentaDescriptor: string;
  formatoLabel: string;
  formatoDescriptor: string;
  /** Uno o más — quien trabaja distinto según la semana los declara todos. */
  equipos: { label: string; descriptor: string }[];
  tiempoPorPiezaLabel: string;
  tiempoDescriptor: string;
  frecuenciaLabel: string;

  ganchos: { label: string; mecanica: string }[];

  piezasPorSemana: number;
  piezasPorSemanaLabel: string;
  /** Con volumen alto conviene pedir que agrupe grabaciones en un mismo día. */
  requiereAgrupado: boolean;

  misiones: MisionSemana[];
}

export function buildContext(
  answers: KitAnswers,
  trends: TrendsSnippet,
  duracion: Duracion
): PromptContext {
  // El snippet manda sobre cuál es la plataforma principal: quien llama resuelve
  // las tendencias, así que si el motor eligiera por su cuenta podrían discrepar
  // y el kit hablaría de una plataforma con los datos de otra.
  const plataformaPrincipal = trends.plataforma;
  const piezasPorSemana = PIEZAS_POR_SEMANA[answers.frecuencia];

  return {
    answers,
    trends,

    duracion,
    duracionEtiqueta: DURACION_CONFIG[duracion].etiqueta,
    totalSemanas: DURACION_CONFIG[duracion].semanas,

    plataformaPrincipal,
    plataformaPrincipalLabel: labels.plataformaLabel(plataformaPrincipal),
    plataformasSecundariasLabels: answers.plataformas
      .filter((p) => p !== plataformaPrincipal)
      .map(labels.plataformaLabel),

    tonoLabel: labels.tonoLabel(answers.tono),
    tonoDescriptor: TONO_DESCRIPTOR[answers.tono],
    etapaCuentaLabel: labels.etapaCuentaLabel(answers.etapaCuenta),
    etapaCuentaDescriptor: ETAPA_CUENTA_DESCRIPTOR[answers.etapaCuenta],
    formatoLabel: labels.formatoLabel(answers.formato),
    formatoDescriptor: FORMATO_DESCRIPTOR[answers.formato],
    equipos: answers.equipo.map((equipo) => ({
      label: labels.equipoLabel(equipo),
      descriptor: EQUIPO_DESCRIPTOR[equipo],
    })),
    tiempoPorPiezaLabel: labels.tiempoPorPiezaLabel(answers.tiempoPorPieza),
    tiempoDescriptor: TIEMPO_POR_PIEZA_DESCRIPTOR[answers.tiempoPorPieza],
    frecuenciaLabel: labels.frecuenciaLabel(answers.frecuencia),

    ganchos: answers.estilosGancho.map((estilo) => ({
      label: labels.estiloGanchoLabel(estilo),
      mecanica: ESTILO_GANCHO_MECANICA[estilo],
    })),

    piezasPorSemana,
    piezasPorSemanaLabel: piezasLabel(piezasPorSemana),
    requiereAgrupado: piezasPorSemana >= 3,

    misiones: getMisiones(answers.objetivo, duracion),
  };
}
