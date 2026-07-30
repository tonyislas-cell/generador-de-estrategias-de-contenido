export interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export type Plataforma =
  | "tiktok"
  | "instagram_reels"
  | "youtube_shorts"
  | "youtube_largo"
  | "linkedin";

export type Tono =
  | "cercano"
  | "autoritario"
  | "divertido"
  | "provocador"
  | "profesional";

/**
 * Qué se produce. Excluyente: un plan de verticales y uno de video largo no
 * comparten cadencia ni entregable, así que quien hace las dos cosas corre el
 * cuestionario dos veces.
 */
export type TipoDeKit = "vertical" | "youtube_largo";

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
  // Capa 0 — Qué se produce
  tipoDeKit?: TipoDeKit;

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

  // Capa 5b — Inventario. Todo opcional: es la palanca más fuerte contra el
  // guion genérico, pero son seis cajas de texto libre y esta es una
  // herramienta gratuita. Quien las llena obtiene piezas con datos textuales
  // suyos; quien las saltea sigue con el mecanismo de [DATO A COMPLETAR].
  herramientas?: string;
  numeros?: string;
  frasesAudiencia?: string;
  errores?: string;
  datosQueNoTengo?: string;
  limitesPrivacidad?: string;

  // Capa 6 — Oferta/CTA (solo si objetivo === "lanzamiento")
  oferta?: string;
  objeciones?: string;
  pruebaSocial?: string;
}

export type StepId =
  | "tipo"
  | "contexto"
  | "objetivo"
  | "formato"
  | "recursos"
  | "gancho"
  | "inventario"
  | "oferta";

/** Dónde está parado el usuario: en un paso, en el resumen, eligiendo modelo(s), o en el kit. */
export type WizardPosition = StepId | "summary" | "modelos" | "result";
