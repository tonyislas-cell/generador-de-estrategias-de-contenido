export interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export type Plataforma =
  | "tiktok"
  | "instagram_reels"
  | "youtube_shorts"
  | "linkedin";

export type Tono =
  | "cercano"
  | "autoritario"
  | "divertido"
  | "provocador"
  | "profesional";

export type Objetivo = "lanzamiento" | "autoridad";

export type Formato = "camara" | "faceless" | "texto_carrusel";

export type Equipo = "solo" | "con_editor" | "con_equipo_grabacion";

export type TiempoPorPieza = "menos_30min" | "30_60min" | "1_2h" | "mas_2h";

export type Frecuencia = "semanal" | "dos_tres_semana" | "diaria";

export type EstiloGancho =
  | "polemico"
  | "educativo"
  | "storytelling"
  | "humor"
  | "curiosidad";

export type EtapaCuenta = "nueva" | "establecida";

export interface WizardAnswers {
  // Capa 1 — Contexto fijo
  nicho?: string;
  audiencia?: string;
  plataformas?: Plataforma[];
  tono?: Tono;
  /** Opcional: quien no tiene nada que agregar más allá de nicho/audiencia lo deja vacío. */
  contextoMarca?: string;
  etapaCuenta?: EtapaCuenta;

  // Capa 2 — Objetivo
  objetivo?: Objetivo;

  // Capa 3 — Formato
  /** Puede elegir más de uno: quien combina cámara y carrusel, por ejemplo, los declara todos. */
  formato?: Formato[];

  // Capa 4 — Recursos y restricciones
  /** Puede elegir más de uno: quien a veces trabaja sola y a veces con editor los declara todos. */
  equipo?: Equipo[];
  tiempoPorPieza?: TiempoPorPieza;
  frecuencia?: Frecuencia;

  // Capa 5 — Voz y estilo de gancho
  estilosGancho?: EstiloGancho[];

  // Capa 6 — Oferta/CTA (solo si objetivo === "lanzamiento")
  oferta?: string;
  objeciones?: string;
  pruebaSocial?: string;
}

export type StepId =
  | "contexto"
  | "objetivo"
  | "formato"
  | "recursos"
  | "gancho"
  | "oferta";

/** Dónde está parado el usuario: en un paso, en el resumen, eligiendo modelo(s), o en el kit. */
export type WizardPosition = StepId | "summary" | "modelos" | "result";
