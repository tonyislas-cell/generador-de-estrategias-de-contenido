import { DONACION, MARCA } from "@/lib/landing/content";
import { Container } from "./Section";
import { DonationLink } from "./DonationLink";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-[46ch]">
          <p className="font-heading text-lg text-foreground">{MARCA.nombre}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {DONACION.nota}
          </p>
        </div>
        <DonationLink variant="outline" />
      </Container>
    </footer>
  );
}
