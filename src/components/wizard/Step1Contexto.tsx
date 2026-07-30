import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckboxGroup } from "./CheckboxGroup";
import { ChoiceCardGroup } from "./ChoiceCardGroup";
import {
  ETAPA_CUENTA_OPTIONS,
  PLATAFORMA_OPTIONS_VERTICAL,
  TONO_OPTIONS,
} from "@/lib/wizard/options";
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
        <Label>Etapa de la cuenta</Label>
        <ChoiceCardGroup
          name="etapaCuenta"
          options={ETAPA_CUENTA_OPTIONS}
          value={answers.etapaCuenta}
          onChange={(etapaCuenta) => onChange({ etapaCuenta })}
        />
      </div>

      <div className="grid gap-2">
        <Label>Plataforma(s) donde vas a publicar</Label>
        <CheckboxGroup
          name="plataformas"
          options={PLATAFORMA_OPTIONS_VERTICAL}
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

      <div className="grid gap-2">
        <Label htmlFor="contextoMarca">
          Contexto adicional de tu marca (opcional)
        </Label>
        <Textarea
          id="contextoMarca"
          placeholder="Historia, valores, algo que el modelo debería saber y no entra arriba"
          value={answers.contextoMarca ?? ""}
          onChange={(e) => onChange({ contextoMarca: e.target.value })}
        />
      </div>
    </div>
  );
}
