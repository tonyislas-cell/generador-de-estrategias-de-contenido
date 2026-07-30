import { CheckboxGroup } from "./CheckboxGroup";
import { opcionesDeFormato } from "@/lib/wizard/options";
import type { StepProps } from "./step-props";

export function Step3Formato({ answers, onChange }: StepProps) {
  return (
    <div className="grid gap-2">
      <p className="text-sm text-muted-foreground">
        Puedes elegir más de uno si combinas formatos distintos.
      </p>
      <CheckboxGroup
        name="formato"
        options={opcionesDeFormato(answers.tipoDeKit ?? "vertical")}
        selected={answers.formato}
        onChange={(formato) => onChange({ formato })}
      />
    </div>
  );
}
