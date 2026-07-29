import { CheckboxGroup } from "./CheckboxGroup";
import { FORMATO_OPTIONS } from "@/lib/wizard/options";
import type { StepProps } from "./step-props";

export function Step3Formato({ answers, onChange }: StepProps) {
  return (
    <div className="grid gap-2">
      <p className="text-sm text-muted-foreground">
        Puedes elegir más de uno si combinas formatos distintos.
      </p>
      <CheckboxGroup
        name="formato"
        options={FORMATO_OPTIONS}
        selected={answers.formato}
        onChange={(formato) => onChange({ formato })}
      />
    </div>
  );
}
