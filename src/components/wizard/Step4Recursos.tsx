import { Label } from "@/components/ui/label";
import { CheckboxGroup } from "./CheckboxGroup";
import { ChoiceCardGroup } from "./ChoiceCardGroup";
import {
  EQUIPO_OPTIONS,
  FRECUENCIA_OPTIONS,
  TIEMPO_POR_PIEZA_OPTIONS,
} from "@/lib/wizard/options";
import type { StepProps } from "./step-props";

export function Step4Recursos({ answers, onChange }: StepProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label>Equipo disponible</Label>
        <p className="text-sm text-muted-foreground">
          Puedes elegir más de uno si tu forma de trabajar varía.
        </p>
        <CheckboxGroup
          name="equipo"
          options={EQUIPO_OPTIONS}
          selected={answers.equipo}
          onChange={(equipo) => onChange({ equipo })}
        />
      </div>

      <div className="grid gap-2">
        <Label>Tiempo disponible por pieza de contenido</Label>
        <ChoiceCardGroup
          name="tiempoPorPieza"
          options={TIEMPO_POR_PIEZA_OPTIONS}
          value={answers.tiempoPorPieza}
          onChange={(tiempoPorPieza) => onChange({ tiempoPorPieza })}
        />
      </div>

      <div className="grid gap-2">
        <Label>Frecuencia real de publicación posible</Label>
        <ChoiceCardGroup
          name="frecuencia"
          options={FRECUENCIA_OPTIONS}
          value={answers.frecuencia}
          onChange={(frecuencia) => onChange({ frecuencia })}
        />
      </div>
    </div>
  );
}
