import type { Duracion, ModeloIA } from "../prompt-kit/types";
import type { WizardAnswers, WizardPosition } from "./types";

const STORAGE_KEY = "viral-content-kit:wizard:v1";

export interface StoredWizardState {
  answers: WizardAnswers;
  /**
   * El nombre del campo se conserva aunque ahora también admita "modelos" y
   * "result": está persistido, y renombrarlo obligaría a migrar datos
   * guardados sin ganar nada. Los valores viejos siguen siendo válidos, así
   * que la clave `:v1` tampoco necesita subir de versión.
   */
  currentStepId: WizardPosition;
  /**
   * Opcional para que los estados guardados antes de este ticket sigan
   * siendo válidos sin migración: `useWizard` completa el default al hidratar.
   */
  duracion?: Duracion;
  /** Opcional por el mismo motivo que `duracion`: no existía antes de este ticket. */
  modelos?: ModeloIA[];
}

function isStoredWizardState(value: unknown): value is StoredWizardState {
  return (
    typeof value === "object" &&
    value !== null &&
    "answers" in value &&
    "currentStepId" in value
  );
}

/**
 * `formato` y `equipo` eran de valor único antes de volverse multi-selección.
 * Sin esto, un estado guardado con el string viejo (p. ej. `formato: "camara"`)
 * se recorre carácter por carácter al iterarlo como array en vez de fallar
 * limpio — envolverlo en un array de un elemento conserva el progreso
 * guardado sin corromper la salida del kit.
 */
function normalizeLegacyArrayFields(answers: WizardAnswers): WizardAnswers {
  const raw = answers as Record<string, unknown>;
  const asArray = (value: unknown) => (typeof value === "string" ? [value] : value);

  return {
    ...answers,
    formato: asArray(raw.formato) as WizardAnswers["formato"],
    equipo: asArray(raw.equipo) as WizardAnswers["equipo"],
  };
}

export function loadWizardState(): StoredWizardState | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredWizardState(parsed)) return null;
    return { ...parsed, answers: normalizeLegacyArrayFields(parsed.answers) };
  } catch {
    return null;
  }
}

export function saveWizardState(state: StoredWizardState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage is a safety net, not a requirement — ignore write failures
    // (private browsing, quota exceeded, disabled storage, etc.)
  }
}

export function clearWizardState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
