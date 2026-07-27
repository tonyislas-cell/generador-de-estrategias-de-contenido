import type { WizardAnswers } from "@/lib/wizard/types";

export interface StepProps {
  answers: WizardAnswers;
  onChange: (partial: Partial<WizardAnswers>) => void;
}
