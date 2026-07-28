import type { WizardAnswers, WizardPosition } from "./types";

const STORAGE_KEY = "viral-content-kit:wizard:v1";

export interface StoredWizardState {
  answers: WizardAnswers;
  /**
   * El nombre del campo se conserva aunque ahora también admita "result":
   * está persistido, y renombrarlo obligaría a migrar datos guardados sin
   * ganar nada. Los valores viejos siguen siendo válidos, así que la clave
   * `:v1` tampoco necesita subir de versión.
   */
  currentStepId: WizardPosition;
}

function isStoredWizardState(value: unknown): value is StoredWizardState {
  return (
    typeof value === "object" &&
    value !== null &&
    "answers" in value &&
    "currentStepId" in value
  );
}

export function loadWizardState(): StoredWizardState | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    return isStoredWizardState(parsed) ? parsed : null;
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
