import { PROHIBIDO } from "@/lib/landing/content";
import { Section, SectionHeader } from "./Section";
import { Reveal } from "./Reveal";

export function Prohibiciones() {
  return (
    <Section aria-labelledby="prohibiciones">
      <SectionHeader
        id="prohibiciones"
        eyebrow={PROHIBIDO.eyebrow}
        titulo={PROHIBIDO.titulo}
        entrada={PROHIBIDO.entrada}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <Reveal>
          <ul className="flex flex-wrap gap-3">
            {PROHIBIDO.frases.map((frase) => (
              <li
                key={frase}
                className="rounded-lg border border-border bg-card px-4 py-2.5 shadow-xs"
              >
                {/* `<s>` y no un `line-through` suelto: el tachado acá significa
                    algo (está vetado), así que va marcado en el HTML y no solo
                    pintado con CSS. */}
                <s className="text-muted-foreground decoration-destructive decoration-2">
                  «{frase}»
                </s>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08}>
          <figure className="h-full rounded-lg border border-border bg-card p-6 shadow-xs sm:p-8">
            <figcaption className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
              {PROHIBIDO.citaTitulo}
            </figcaption>
            <blockquote className="mt-4 font-heading text-2xl leading-snug text-foreground">
              {PROHIBIDO.cita}
            </blockquote>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {PROHIBIDO.citaPie}
            </p>
          </figure>
        </Reveal>
      </div>
    </Section>
  );
}
