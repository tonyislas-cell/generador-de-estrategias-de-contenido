"use client";

import type { ComponentType } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWizard } from "@/lib/wizard/useWizard";
import type { StepId } from "@/lib/wizard/types";
import { Step1Contexto } from "./Step1Contexto";
import { Step2Objetivo } from "./Step2Objetivo";
import { Step3Formato } from "./Step3Formato";
import { Step4Recursos } from "./Step4Recursos";
import { Step5Gancho } from "./Step5Gancho";
import { Step6Oferta } from "./Step6Oferta";
import { WizardSummary } from "./WizardSummary";
import { PromptKitResult } from "@/components/kit/PromptKitResult";
import type { StepProps } from "./step-props";

const STEP_COMPONENTS: Record<StepId, ComponentType<StepProps>> = {
  contexto: Step1Contexto,
  objetivo: Step2Objetivo,
  formato: Step3Formato,
  recursos: Step4Recursos,
  gancho: Step5Gancho,
  oferta: Step6Oferta,
};

export function WizardShell() {
  const wizard = useWizard();

  if (wizard.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (wizard.status === "result") {
    return (
      <PromptKitResult
        answers={wizard.answers}
        onBack={wizard.goBack}
        onRestart={wizard.restart}
      />
    );
  }

  if (wizard.status === "summary") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-12">
        <WizardSummary answers={wizard.answers} />
        <div className="flex flex-wrap gap-3">
          <Button onClick={wizard.goNext}>Generar mi kit de prompts</Button>
          <Button variant="outline" onClick={wizard.goBack}>
            Corregir una respuesta
          </Button>
          <Button variant="ghost" onClick={wizard.restart}>
            Empezar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = wizard.currentStep;
  const StepComponent = currentStep ? STEP_COMPONENTS[currentStep.id] : null;
  const progressValue = wizard.steps.length
    ? ((wizard.currentStepIndex + 1) / wizard.steps.length) * 100
    : 0;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="grid gap-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Paso {wizard.currentStepIndex + 1} de {wizard.steps.length}
          </span>
          <span>{currentStep?.title}</span>
        </div>
        <Progress value={progressValue} />
      </div>

      <motion.div
        key={currentStep?.id}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {StepComponent ? (
          <StepComponent
            answers={wizard.answers}
            onChange={wizard.updateAnswers}
          />
        ) : null}
      </motion.div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={wizard.goBack}
          disabled={!wizard.canGoBack}
        >
          Atrás
        </Button>
        <Button onClick={wizard.goNext} disabled={!wizard.isCurrentStepAnswered}>
          {wizard.isLastStep ? "Ver resumen" : "Siguiente"}
        </Button>
      </div>
    </div>
  );
}
