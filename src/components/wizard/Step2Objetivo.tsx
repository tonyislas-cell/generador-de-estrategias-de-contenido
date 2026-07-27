import { ChoiceCardGroup } from "./ChoiceCardGroup";
import { OBJETIVO_OPTIONS } from "@/lib/wizard/options";
import type { StepProps } from "./step-props";

export function Step2Objetivo({ answers, onChange }: StepProps) {
  return (
    <div className="grid gap-2">
      <ChoiceCardGroup
        name="objetivo"
        options={OBJETIVO_OPTIONS}
        value={answers.objetivo}
        onChange={(objetivo) => onChange({ objetivo })}
      />
    </div>
  );
}
