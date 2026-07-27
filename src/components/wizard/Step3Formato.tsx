import { ChoiceCardGroup } from "./ChoiceCardGroup";
import { FORMATO_OPTIONS } from "@/lib/wizard/options";
import type { StepProps } from "./step-props";

export function Step3Formato({ answers, onChange }: StepProps) {
  return (
    <div className="grid gap-2">
      <ChoiceCardGroup
        name="formato"
        options={FORMATO_OPTIONS}
        value={answers.formato}
        onChange={(formato) => onChange({ formato })}
      />
    </div>
  );
}
