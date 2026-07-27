import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckboxGroup } from "./CheckboxGroup";
import { ChoiceCardGroup } from "./ChoiceCardGroup";
import { PLATAFORMA_OPTIONS, TONO_OPTIONS } from "@/lib/wizard/options";
import type { StepProps } from "./step-props";

export function Step1Contexto({ answers, onChange }: StepProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="nicho">Nicho o industria</Label>
        <Input
          id="nicho"
          placeholder="Ej: finanzas personales para freelancers"
          value={answers.nicho ?? ""}
          onChange={(e) => onChange({ nicho: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="audiencia">Audiencia objetivo</Label>
        <Input
          id="audiencia"
          placeholder="Ej: freelancers de 25 a 35 años que recién empiezan"
          value={answers.audiencia ?? ""}
          onChange={(e) => onChange({ audiencia: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label>Plataforma(s) donde vas a publicar</Label>
        <CheckboxGroup
          name="plataformas"
          options={PLATAFORMA_OPTIONS}
          selected={answers.plataformas}
          onChange={(plataformas) => onChange({ plataformas })}
        />
      </div>

      <div className="grid gap-2">
        <Label>Tono de marca</Label>
        <ChoiceCardGroup
          name="tono"
          options={TONO_OPTIONS}
          value={answers.tono}
          onChange={(tono) => onChange({ tono })}
        />
      </div>
    </div>
  );
}
