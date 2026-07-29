import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * La tarjeta de opción que comparten `ChoiceCardGroup` (selección única) y
 * `CheckboxGroup` (múltiple). Las dos tenían la misma cadena de clases
 * duplicada, y con ella el riesgo de que el estado seleccionado se editara en
 * una y no en la otra.
 *
 * Toda la tarjeta es el `<label>`, no solo el texto: así el relleno también
 * responde al toque y el objetivo táctil es la tarjeta completa.
 */
export function OptionCard({
  htmlFor,
  checked,
  control,
  label,
  description,
}: {
  htmlFor: string;
  checked: boolean;
  control: ReactNode;
  label: string;
  description?: string;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 font-normal shadow-xs transition-colors duration-200",
        checked
          ? // El anillo hace el trabajo del borde de 2px sin cambiar la caja,
            // así que la tarjeta no salta al elegirla.
            "border-primary bg-accent ring-1 ring-primary"
          : // El hover solo tiene sentido en lo que no está elegido: sobre la
            // tarjeta activa oscurecería el estado y leería como si se
            // estuviera por deseleccionar.
            "hover:bg-[var(--card-hover)]"
      )}
    >
      {control}
      <span className="flex flex-col gap-1">
        <span className="font-medium text-foreground">{label}</span>
        {description ? (
          <span className="text-sm text-muted-foreground">{description}</span>
        ) : null}
      </span>
    </Label>
  );
}
