import { ESTILO_GANCHO_MECANICA } from "@/lib/prompt-kit/descriptors";
import type {
  Equipo,
  EstiloGancho,
  EtapaCuenta,
  Formato,
  Frecuencia,
  Objetivo,
  Option,
  Plataforma,
  TiempoPorPieza,
  TipoDeKit,
  Tono,
} from "./types";

export const PLATAFORMA_OPTIONS: Option<Plataforma>[] = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram_reels", label: "Instagram Reels" },
  { value: "youtube_shorts", label: "YouTube Shorts" },
  { value: "youtube_largo", label: "YouTube (video largo)" },
  { value: "linkedin", label: "LinkedIn" },
];

export const TIPO_DE_KIT_OPTIONS: Option<TipoDeKit>[] = [
  {
    value: "vertical",
    label: "Video vertical corto",
    description: "Reels, TikTok, Shorts. Varias piezas por semana.",
  },
  {
    value: "youtube_largo",
    label: "Video largo de YouTube",
    description:
      "Un video de 8 a 12 minutos cada dos semanas. Otro esquema: primero el par título/miniatura, después el guion.",
  },
];

/** Las plataformas del kit vertical. `youtube_largo` tiene su propia rama. */
export const PLATAFORMA_OPTIONS_VERTICAL: Option<Plataforma>[] =
  PLATAFORMA_OPTIONS.filter((option) => option.value !== "youtube_largo");

export const ETAPA_CUENTA_OPTIONS: Option<EtapaCuenta>[] = [
  {
    value: "nueva",
    label: "Cuenta nueva",
    description: "Recién estoy empezando, todavía no tengo audiencia real.",
  },
  {
    value: "establecida",
    label: "Cuenta establecida",
    description: "Ya tengo cuenta y audiencia, quiero seguir construyendo sobre eso.",
  },
];

export const TONO_OPTIONS: Option<Tono>[] = [
  { value: "cercano", label: "Cercano" },
  { value: "autoritario", label: "Autoritario" },
  { value: "divertido", label: "Divertido" },
  { value: "provocador", label: "Provocador" },
  { value: "profesional", label: "Profesional" },
];

export const OBJETIVO_OPTIONS: Option<Objetivo>[] = [
  {
    value: "lanzamiento",
    label: "Lanzamiento o campaña puntual",
    description:
      "Tengo algo específico que promocionar ahora (producto, oferta, evento).",
  },
  {
    value: "autoridad",
    label: "Autoridad y consistencia de marca",
    description:
      "Quiero construir presencia y confianza a largo plazo, sin una oferta puntual.",
  },
];

export const FORMATO_OPTIONS: Option<Formato>[] = [
  { value: "camara", label: "Cámara", description: "Grabo mostrando mi cara." },
  {
    value: "faceless",
    label: "Faceless / voiceover",
    description: "Narración sin mostrar el rostro.",
  },
  {
    value: "texto_carrusel",
    label: "Texto / carrusel",
    description: "Slides o posts de texto, sin video hablado.",
  },
];

/**
 * El carrusel de texto no existe en video largo, así que no se ofrece ahí.
 * Cámara y faceless sí: un video largo se puede grabar de las dos formas.
 */
export function opcionesDeFormato(tipoDeKit: TipoDeKit): Option<Formato>[] {
  return tipoDeKit === "youtube_largo"
    ? FORMATO_OPTIONS.filter((option) => option.value !== "texto_carrusel")
    : FORMATO_OPTIONS;
}

export const EQUIPO_OPTIONS: Option<Equipo>[] = [
  { value: "solo", label: "Solo yo" },
  { value: "con_editor", label: "Con editor" },
  { value: "con_equipo_grabacion", label: "Con equipo de grabación" },
];

export const TIEMPO_POR_PIEZA_OPTIONS: Option<TiempoPorPieza>[] = [
  { value: "menos_30min", label: "Menos de 30 minutos" },
  { value: "30_60min", label: "30 a 60 minutos" },
  { value: "1_2h", label: "1 a 2 horas" },
  { value: "mas_2h", label: "Más de 2 horas" },
];

export const FRECUENCIA_OPTIONS: Option<Frecuencia>[] = [
  { value: "semanal", label: "1 vez por semana" },
  { value: "dos_tres_semana", label: "2 a 3 veces por semana" },
  { value: "diaria", label: "Todos los días" },
];

const ESTILO_GANCHO_LABELS: { value: EstiloGancho; label: string }[] = [
  { value: "polemico", label: "Polémico" },
  { value: "educativo", label: "Educativo" },
  { value: "storytelling", label: "Storytelling" },
  { value: "humor", label: "Humor" },
  { value: "curiosidad", label: "Curiosidad" },
];

/**
 * `description` sale de `ESTILO_GANCHO_MECANICA` para que la explicación que
 * ve el usuario en el cuestionario nunca diverja de la instrucción real que
 * recibe el modelo — misma idea que `DURACION_OPTIONS` derivado de
 * `DURACION_CONFIG`.
 */
export const ESTILO_GANCHO_OPTIONS: Option<EstiloGancho>[] = ESTILO_GANCHO_LABELS.map(
  (option) => ({
    ...option,
    description: ESTILO_GANCHO_MECANICA[option.value],
  })
);
