import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CIERRE } from "@/lib/landing/content";
import { Section } from "./Section";
import { Reveal } from "./Reveal";

export function Cierre() {
  return (
    <Section aria-labelledby="cierre">
      <Reveal>
        <div className="rounded-lg border border-border bg-card p-8 shadow-xs sm:p-12">
          <div className="max-w-[52ch]">
            <h2
              id="cierre"
              className="text-3xl tracking-tight text-foreground sm:text-4xl"
            >
              {CIERRE.titulo}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {CIERRE.cuerpo}
            </p>
          </div>
          {/* El contador va solo en el hero. Repetirlo acá dispararía una
              segunda consulta a Supabase para mostrar el mismo número. */}
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/cuestionario">
                {CIERRE.cta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
