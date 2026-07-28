import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StepProps } from "./step-props";

export function Step6Oferta({ answers, onChange }: StepProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="oferta">¿Qué estás vendiendo?</Label>
        <Textarea
          id="oferta"
          placeholder="Describe tu producto, servicio u oferta"
          value={answers.oferta ?? ""}
          onChange={(e) => onChange({ oferta: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="objeciones">Objeciones comunes de tus clientes</Label>
        <Textarea
          id="objeciones"
          placeholder="¿Qué dudas o excusas escuchas más seguido?"
          value={answers.objeciones ?? ""}
          onChange={(e) => onChange({ objeciones: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="pruebaSocial">Prueba social disponible</Label>
        <Textarea
          id="pruebaSocial"
          placeholder="Testimonios, casos de éxito, números, reseñas..."
          value={answers.pruebaSocial ?? ""}
          onChange={(e) => onChange({ pruebaSocial: e.target.value })}
        />
      </div>
    </div>
  );
}
