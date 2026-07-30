import type { Option, Plataforma } from "@/lib/wizard/types";

/** Modelos de IA para los que sabemos generar un kit. */
export type ModeloIA = "claude" | "chatgpt" | "gemini";

export type Duracion = "14_dias" | "1_mes";

interface DuracionConfig {
  semanas: number;
  etiqueta: string;
}

export const DURACION_CONFIG: Record<Duracion, DuracionConfig> = {
  "14_dias": { semanas: 2, etiqueta: "14 días" },
  "1_mes": { semanas: 4, etiqueta: "1 mes" },
};

/** Derivado de `DURACION_CONFIG` para que la etiqueta del toggle y la del kit nunca diverjan. */
export const DURACION_OPTIONS: Option<Duracion>[] = (
  Object.entries(DURACION_CONFIG) as [Duracion, DuracionConfig][]
).map(([duracion, config]) => ({
  value: duracion,
  label: config.etiqueta,
  description: `${config.semanas} bloques semanales`,
}));

export type PromptBlockKind = "setup" | "semana";

/**
 * A qué tanda pertenece el bloque.
 *
 * Ausente solo en el setup, que es previo a toda tanda. `unidad` existe porque
 * no todos los kits se organizan por semanas: uno de video largo avanza por
 * videos, y el rótulo que ve el usuario tiene que decir cuál de las dos cosas
 * es.
 */
export interface PromptGrupo {
  unidad: "semana";
  /** 1-based. */
  numero: number;
}

/**
 * El `Record` es lo que hace seguro sumar una unidad: en cuanto `unidad` gane
 * un valor, esto deja de compilar hasta que se le dé nombre.
 */
const NOMBRE_DE_UNIDAD: Record<PromptGrupo["unidad"], string> = {
  semana: "Semana",
};

/**
 * «Semana 1» — el rótulo que ve el usuario.
 *
 * Se deriva y no se guarda en el bloque: guardado, el rótulo y el número
 * podrían separarse, y como el agrupamiento se hace por tanda, esa separación
 * partiría una semana en dos en pantalla.
 */
export function etiquetaDeGrupo(grupo: PromptGrupo): string {
  return `${NOMBRE_DE_UNIDAD[grupo.unidad]} ${grupo.numero}`;
}

export interface PromptBlock {
  /** "setup" | "semana-1" | "semana-2" … */
  id: string;
  kind: PromptBlockKind;
  grupo?: PromptGrupo;
  titulo: string;
  /** Cuándo y cómo pegar este bloque. */
  descripcion: string;
  /** El prompt, tal cual se copia. */
  contenido: string;
}

export interface PromptKit {
  modelo: ModeloIA;
  duracion: Duracion;
  plataformaPrincipal: Plataforma;
  /**
   * En el orden en que se pegan, que es el invariante primario del producto.
   * Por eso vive en los datos y no se reconstruye aplanando: el agrupamiento
   * para pantalla se deriva con `agruparBloques`, no al revés.
   *
   * El primero siempre es el setup — invariante de `generatePromptKit`.
   */
  bloques: [PromptBlock, ...PromptBlock[]];
}

export interface TandaDeBloques {
  grupo: PromptGrupo;
  bloques: PromptBlock[];
}

/** Vista de presentación: el setup aparte, y después una tanda por semana. */
export function agruparBloques(kit: PromptKit): {
  setup: PromptBlock;
  tandas: TandaDeBloques[];
} {
  const [setup, ...resto] = kit.bloques;
  const tandas: TandaDeBloques[] = [];

  for (const bloque of resto) {
    // Saltearlo en silencio lo haría desaparecer de la pantalla y de la
    // descarga sin ninguna señal, y el usuario se llevaría un kit con un
    // hueco. Solo el setup puede no pertenecer a una tanda.
    if (!bloque.grupo) {
      throw new Error(
        `El bloque «${bloque.id}» no declara a qué tanda pertenece.`
      );
    }

    const ultima = tandas.at(-1);
    if (
      ultima &&
      ultima.grupo.unidad === bloque.grupo.unidad &&
      ultima.grupo.numero === bloque.grupo.numero
    ) {
      ultima.bloques.push(bloque);
    } else {
      tandas.push({ grupo: bloque.grupo, bloques: [bloque] });
    }
  }

  return { setup, tandas };
}
