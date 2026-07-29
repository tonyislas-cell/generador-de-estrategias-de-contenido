import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DONACION } from "@/lib/landing/content";

export function DonationLink({
  variant = "ghost",
}: {
  variant?: "ghost" | "outline";
}) {
  return (
    <Button asChild variant={variant} size="sm">
      {/* `noopener` corta el acceso de la pestaña destino a `window.opener`, y
          `noreferrer` evita filtrarle de dónde vino el visitante. */}
      <a href={DONACION.url} target="_blank" rel="noopener noreferrer">
        <Coffee aria-hidden="true" />
        {DONACION.etiqueta}
      </a>
    </Button>
  );
}
