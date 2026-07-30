import {
  EQUIPO_OPTIONS,
  ESTILO_GANCHO_OPTIONS,
  ETAPA_CUENTA_OPTIONS,
  FORMATO_OPTIONS,
  FRECUENCIA_OPTIONS,
  OBJETIVO_OPTIONS,
  PLATAFORMA_OPTIONS,
  TIEMPO_POR_PIEZA_OPTIONS,
  TIPO_DE_KIT_OPTIONS,
  TONO_OPTIONS,
} from "./options";
import type { Option } from "./types";

/** Maps a stored option value to the Spanish label the user actually saw. */
export function labelFor<T extends string>(options: Option<T>[]) {
  return (value: T) => options.find((o) => o.value === value)?.label ?? value;
}

export const plataformaLabel = labelFor(PLATAFORMA_OPTIONS);
export const tonoLabel = labelFor(TONO_OPTIONS);
export const objetivoLabel = labelFor(OBJETIVO_OPTIONS);
export const formatoLabel = labelFor(FORMATO_OPTIONS);
export const equipoLabel = labelFor(EQUIPO_OPTIONS);
export const tiempoPorPiezaLabel = labelFor(TIEMPO_POR_PIEZA_OPTIONS);
export const frecuenciaLabel = labelFor(FRECUENCIA_OPTIONS);
export const estiloGanchoLabel = labelFor(ESTILO_GANCHO_OPTIONS);
export const etapaCuentaLabel = labelFor(ETAPA_CUENTA_OPTIONS);
export const tipoDeKitLabel = labelFor(TIPO_DE_KIT_OPTIONS);
