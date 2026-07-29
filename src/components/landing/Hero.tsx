import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO } from "@/lib/landing/content";
import { Container } from "./Section";
import { UsageCounter } from "./UsageCounter";
import { Reveal } from "./Reveal";

function PilaDePrompts() {
  return (
    <div aria-hidden="true" className="grid gap-3">
      {HERO.pila.map((bloque, i) => (
        <div
          key={bloque.etiqueta}
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
          // Escalonado creciente: sugiere una secuencia que avanza, que es
          // exactamente lo que el producto hace. El margen encoge la tarjeta en
          // vez de empujarla, así que no genera scroll horizontal en móvil.
          style={{ marginInlineStart: `calc(${i} * 0.75rem)` }}
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
            {bloque.etiqueta}
          </p>
          <div className="rounded-md border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-foreground">
            {bloque.lineas.map((linea) => (
              <p key={linea} className="truncate">
                {linea}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        {/* Asimétrico a propósito: la columna de texto pesa más que la del
            visual, y por debajo de lg todo colapsa a una sola columna. */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Reveal>
            <h1 className="text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {HERO.titularLinea1}
              <br />
              {/* El énfasis es tipográfico, no cromático: subrayado fino en vez
                  de un color que competiría con el único acento del sistema. */}
              <span className="underline decoration-primary decoration-2 underline-offset-[6px]">
                {HERO.titularLinea2}
              </span>
            </h1>

            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
              {HERO.entrada}
            </p>

            <div className="mt-8 flex flex-col items-start gap-3">
              <Button asChild size="lg">
                <Link href="/cuestionario">
                  {HERO.cta}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">{HERO.ctaNota}</p>
              <UsageCounter />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <PilaDePrompts />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
