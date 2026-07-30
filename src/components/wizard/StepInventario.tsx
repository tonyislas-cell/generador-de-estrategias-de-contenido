import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WizardAnswers } from "@/lib/wizard/types";
import type { StepProps } from "./step-props";

/**
 * Los datos concretos del mundo del creador.
 *
 * Todo opcional. Es la palanca más fuerte que tiene el producto contra el
 * guion genérico —cada pieza puede usar un dato textual en vez de «muchos» o
 * «la mayoría»— pero son seis cajas de texto libre, y esto es una herramienta
 * gratuita: obligarlas antes de ver el primer resultado costaría más de lo que
 * suma.
 */
const CAMPOS: {
  campo: keyof WizardAnswers;
  label: string;
  placeholder: string;
}[] = [
  {
    campo: "herramientas",
    label: "Herramientas que usas, por nombre exacto",
    placeholder:
      "Las que nombrarías en cámara sin dudar. El nombre real, no «una app de notas».",
  },
  {
    campo: "numeros",
    label: "Cinco números que puedes decir sin dudar",
    placeholder:
      "Cuánto cobraste, cuánto tardaste, cuántos clientes, qué te costó un error. Con su unidad.",
  },
  {
    campo: "frasesAudiencia",
    label: "Frases que tu audiencia dice literal",
    placeholder:
      "Textuales, como las escriben o las dicen. Son los ganchos que ya funcionan.",
  },
  {
    campo: "errores",
    label: "Errores tuyos que puedes contar con detalle",
    placeholder:
      "Con fecha y con lo que costaron. La autoridad se demuestra con un caso difícil, no repitiendo consejos correctos.",
  },
  {
    campo: "datosQueNoTengo",
    label: "Datos que NO tienes y no se deben simular",
    placeholder:
      "Métricas que nunca mediste, casos que no viviste. El modelo los va a dejar marcados en vez de inventarlos.",
  },
  {
    campo: "limitesPrivacidad",
    label: "Límites de privacidad",
    placeholder:
      "Qué no se muestra ni se nombra nunca: personas, lugares, rutinas que ubiquen a alguien.",
  },
];

export function StepInventario({ answers, onChange }: StepProps) {
  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground">
        Todo esto es opcional y puedes saltarlo. Si lo llenas, cada pieza va a
        usar un dato tuyo, textual, en vez de generalidades — es lo que más
        separa un guion que solo tú podrías haber escrito de uno que sirve para
        cualquiera.
      </p>

      {CAMPOS.map(({ campo, label, placeholder }) => (
        <div key={campo} className="grid gap-2">
          <Label htmlFor={campo}>{label}</Label>
          <Textarea
            id={campo}
            rows={3}
            placeholder={placeholder}
            value={(answers[campo] as string | undefined) ?? ""}
            onChange={(event) => onChange({ [campo]: event.target.value })}
          />
        </div>
      ))}
    </div>
  );
}
