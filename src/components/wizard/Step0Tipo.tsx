import { TIPO_DE_KIT_OPTIONS } from "@/lib/wizard/options";
import { ChoiceCardGroup } from "./ChoiceCardGroup";
import type { StepProps } from "./step-props";

export function Step0Tipo({ answers, onChange }: StepProps) {
  return (
    <div className="grid gap-4">
      <ChoiceCardGroup
        name="tipoDeKit"
        options={TIPO_DE_KIT_OPTIONS}
        value={answers.tipoDeKit}
        onChange={(tipoDeKit) => onChange({ tipoDeKit })}
      />
      <p className="text-sm text-muted-foreground">
        Los dos kits no comparten esquema, así que se eligen por separado. Si
        haces las dos cosas, arma primero uno y después vuelve por el otro.
      </p>
    </div>
  );
}
