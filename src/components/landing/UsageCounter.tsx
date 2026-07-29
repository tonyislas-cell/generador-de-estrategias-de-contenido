"use client";

import { useEffect, useState } from "react";
import { getKitUsageTotal } from "@/lib/usage";
import { cn } from "@/lib/utils";

// `useGrouping` explícito: la variante "es" sin región solo agrupa a partir
// de 5 cifras por defecto, así que sin esto "1234" se mostraría sin punto
// mientras que "12345" sí lo tendría — inconsistente entre cantidades.
const NUMERO = new Intl.NumberFormat("es", { useGrouping: "always" });

export function UsageCounter({ className }: { className?: string }) {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getKitUsageTotal()
      .then((value) => {
        if (!cancelled) setTotal(value);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Es un dato de contexto, no contenido crítico: mientras carga o si falla,
  // no hay nada que mostrar en su lugar — no vale la pena un estado de error.
  if (total === null) return null;

  // Un solo nodo de texto, sin resaltar el número dentro de un `<span>`: partir
  // la frase en varios elementos entrecorta cómo la lee un lector de pantalla,
  // y el realce visual no compensa eso en una línea secundaria.
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {total === 1
        ? "Ya se generó 1 kit de prompts."
        : `Ya se generaron ${NUMERO.format(total)} kits de prompts.`}
    </p>
  );
}
