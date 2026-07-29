import type {
  Equipo,
  EstiloGancho,
  EtapaCuenta,
  Formato,
  Frecuencia,
  Plataforma,
  TiempoPorPieza,
  Tono,
  WizardAnswers,
} from "@/lib/wizard/types";

interface KitAnswersBase {
  nicho: string;
  audiencia: string;
  plataformas: [Plataforma, ...Plataforma[]];
  tono: Tono;
  etapaCuenta: EtapaCuenta;
  /** `null` cuando la persona no completó el campo — es opcional, a diferencia del resto. */
  contextoMarca: string | null;
  formato: Formato;
  equipo: [Equipo, ...Equipo[]];
  tiempoPorPieza: TiempoPorPieza;
  frecuencia: Frecuencia;
  estilosGancho: [EstiloGancho, ...EstiloGancho[]];
}

/**
 * Respuestas completas y validadas, listas para construir un kit.
 *
 * Es una unión discriminada por `objetivo` a propósito: en la variante
 * "autoridad" los campos de oferta directamente no existen, así que el
 * adaptador no puede mencionarlos ni por accidente. La regla de negocio "en un
 * plan de autoridad no se vende nada" queda garantizada por el compilador y no
 * solo por un test.
 */
export type KitAnswers =
  | (KitAnswersBase & { objetivo: "autoridad" })
  | (KitAnswersBase & {
      objetivo: "lanzamiento";
      oferta: string;
      objeciones: string;
      pruebaSocial: string;
    });

function trimmed(value: string | undefined): string | null {
  const result = value?.trim();
  return result ? result : null;
}

function asNonEmpty<T>(items: T[] | undefined): [T, ...T[]] | null {
  if (!items) return null;
  const [first, ...rest] = items;
  if (first === undefined) return null;
  return [first, ...rest];
}

/**
 * Única frontera de validación entre el cuestionario y el motor de prompts.
 *
 * Devuelve `null` si falta cualquier respuesta requerida, en vez de dejar que
 * un `undefined` se filtre a un prompt que la persona va a pegar en su IA.
 */
export function toKitAnswers(answers: WizardAnswers): KitAnswers | null {
  const nicho = trimmed(answers.nicho);
  const audiencia = trimmed(answers.audiencia);
  const plataformas = asNonEmpty(answers.plataformas);
  const estilosGancho = asNonEmpty(answers.estilosGancho);
  const equipo = asNonEmpty(answers.equipo);
  const { tono, etapaCuenta, formato, tiempoPorPieza, frecuencia, objetivo } = answers;

  if (!nicho || !audiencia || !plataformas || !estilosGancho || !equipo) return null;
  if (!tono || !etapaCuenta || !formato || !tiempoPorPieza || !frecuencia) {
    return null;
  }
  if (!objetivo) return null;

  const base: KitAnswersBase = {
    nicho,
    audiencia,
    plataformas,
    tono,
    etapaCuenta,
    contextoMarca: trimmed(answers.contextoMarca),
    formato,
    equipo,
    tiempoPorPieza,
    frecuencia,
    estilosGancho,
  };

  if (objetivo === "autoridad") {
    // Los campos de oferta se descartan a propósito: si el usuario los llenó y
    // después cambió el objetivo, no tienen que llegar al prompt.
    return { ...base, objetivo };
  }

  const oferta = trimmed(answers.oferta);
  const objeciones = trimmed(answers.objeciones);
  const pruebaSocial = trimmed(answers.pruebaSocial);
  if (!oferta || !objeciones || !pruebaSocial) return null;

  return { ...base, objetivo, oferta, objeciones, pruebaSocial };
}

/**
 * La plataforma principal es la primera que la persona marcó.
 *
 * `CheckboxGroup` agrega al final al marcar, así que el array conserva el orden
 * de clic y no el orden del listado. El primer elemento es genuinamente la
 * primera plataforma por la que fue, que es el mejor proxy de "mi plataforma
 * principal" sin agregar otra pregunta al cuestionario.
 */
export function resolvePlataformaPrincipal(answers: KitAnswers): Plataforma {
  return answers.plataformas[0];
}
