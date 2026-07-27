"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getVisibleSteps, type StepDefinition } from "./steps";
import { clearWizardState, loadWizardState, saveWizardState } from "./storage";
import type { StepId, WizardAnswers } from "./types";

export type WizardStatus = "loading" | "in-progress" | "summary";

const FIRST_STEP_ID: StepId = "contexto";

export interface UseWizardResult {
  status: WizardStatus;
  answers: WizardAnswers;
  steps: StepDefinition[];
  currentStep: StepDefinition | null;
  currentStepIndex: number;
  canGoBack: boolean;
  isLastStep: boolean;
  isCurrentStepAnswered: boolean;
  updateAnswers: (partial: Partial<WizardAnswers>) => void;
  goNext: () => void;
  goBack: () => void;
  restart: () => void;
}

export function useWizard(): UseWizardResult {
  const [answers, setAnswers] = useState<WizardAnswers>({});
  const [currentStepId, setCurrentStepId] = useState<StepId | "summary">(
    FIRST_STEP_ID
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage, guarded by isHydrated so it can
    // never re-run — not the cascading-render pattern the rule guards against.
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = loadWizardState();
    if (stored) {
      setAnswers(stored.answers);
      setCurrentStepId(stored.currentStepId);
    }
    setIsHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveWizardState({ answers, currentStepId });
  }, [isHydrated, answers, currentStepId]);

  const steps = useMemo(() => getVisibleSteps(answers), [answers]);

  const rawIndex =
    currentStepId === "summary"
      ? steps.length
      : steps.findIndex((step) => step.id === currentStepId);
  const currentStepIndex = rawIndex === -1 ? 0 : rawIndex;
  const currentStep =
    currentStepId === "summary" ? null : steps[currentStepIndex] ?? null;

  const status: WizardStatus = !isHydrated
    ? "loading"
    : currentStepId === "summary"
      ? "summary"
      : "in-progress";
  const isLastStep =
    currentStepId !== "summary" && currentStepIndex === steps.length - 1;

  const updateAnswers = useCallback((partial: Partial<WizardAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...partial }));
  }, []);

  const goNext = useCallback(() => {
    if (currentStepId === "summary") return;
    if (isLastStep) {
      setCurrentStepId("summary");
      return;
    }
    const next = steps[currentStepIndex + 1];
    if (next) setCurrentStepId(next.id);
  }, [currentStepId, currentStepIndex, isLastStep, steps]);

  const goBack = useCallback(() => {
    if (currentStepId === "summary") {
      const last = steps[steps.length - 1];
      if (last) setCurrentStepId(last.id);
      return;
    }
    if (currentStepIndex === 0) return;
    const prev = steps[currentStepIndex - 1];
    if (prev) setCurrentStepId(prev.id);
  }, [currentStepId, currentStepIndex, steps]);

  const restart = useCallback(() => {
    setAnswers({});
    setCurrentStepId(FIRST_STEP_ID);
    clearWizardState();
  }, []);

  return {
    status,
    answers,
    steps,
    currentStep,
    currentStepIndex,
    canGoBack: currentStepId !== "summary" && currentStepIndex > 0,
    isLastStep,
    isCurrentStepAnswered: currentStep ? currentStep.isAnswered(answers) : true,
    updateAnswers,
    goNext,
    goBack,
    restart,
  };
}
