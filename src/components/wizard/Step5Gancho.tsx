import { Label } from "@/components/ui/label";
import { CheckboxGroup } from "./CheckboxGroup";
import { ESTILO_GANCHO_OPTIONS } from "@/lib/wizard/options";
import type { StepProps } from "./step-props";

export function Step5Gancho({ answers, onChange }: StepProps) {
  return (
    <div className="grid gap-2">
      <Label>¿Qué tipo de ganchos resuenan con tu estilo?</Label>
      <p className="text-sm text-muted-foreground">
        Podés elegir más de uno — combinamos esto con las tendencias
        vigentes de tu plataforma.
      </p>
      <CheckboxGroup
        name="estilosGancho"
        options={ESTILO_GANCHO_OPTIONS}
        selected={answers.estilosGancho}
        onChange={(estilosGancho) => onChange({ estilosGancho })}
      />
    </div>
  );
}
