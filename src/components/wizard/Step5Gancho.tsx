import { Label } from "@/components/ui/label";
import { CheckboxGroup } from "./CheckboxGroup";
import { ESTILO_GANCHO_OPTIONS } from "@/lib/wizard/options";
import type { StepProps } from "./step-props";

export function Step5Gancho({ answers, onChange }: StepProps) {
  return (
    <div className="grid gap-2">
      <Label>¿Qué tipo de ganchos resuenan con tu estilo?</Label>
      <p className="text-sm text-muted-foreground">
        Puedes elegir más de uno — combinamos esto con las mecánicas que
        mejor funcionan en tu plataforma.
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
