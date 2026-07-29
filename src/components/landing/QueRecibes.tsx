import { Check } from "lucide-react";
import { QUE_RECIBES } from "@/lib/landing/content";
import { MODELO_OPTIONS } from "@/lib/prompt-kit/adapters";
import { Section, SectionHeader } from "./Section";
import { Reveal } from "./Reveal";

export function QueRecibes() {
  return (
    <Section aria-labelledby="que-recibes">
      <SectionHeader
        id="que-recibes"
        eyebrow={QUE_RECIBES.eyebrow}
        titulo={QUE_RECIBES.titulo}
        entrada={QUE_RECIBES.entrada}
      />

      {/* Bento asimétrico: la tarjeta de estructura pesa el doble que la de
          extras, porque es la que explica qué es realmente el producto. */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <div className="h-full rounded-lg border border-border bg-card p-6 shadow-xs sm:p-8">
            <h3 className="text-xl text-foreground">
              {QUE_RECIBES.bloques.titulo}
            </h3>
            <div className="mt-6 grid gap-4">
              {[QUE_RECIBES.bloques.setup, QUE_RECIBES.bloques.semanal].map(
                (bloque) => (
                  <div
                    key={bloque.etiqueta}
                    className="rounded-md border border-border bg-background p-4"
                  >
                    <p className="font-mono text-xs text-primary">
                      {bloque.etiqueta}
                    </p>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      {bloque.cuerpo}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-xs sm:p-8">
            <div className="flex flex-wrap gap-2">
              {/* Derivado de `MODELO_OPTIONS`, la misma lista que ofrece el
                  cuestionario: si algún día se suma un modelo, la landing no
                  se queda mintiendo. */}
              {MODELO_OPTIONS.map((modelo) => (
                <span
                  key={modelo.value}
                  className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground"
                >
                  {modelo.label}
                </span>
              ))}
            </div>

            <h3 className="mt-6 text-xl text-foreground">
              {QUE_RECIBES.extras.titulo}
            </h3>
            <ul className="mt-4 grid gap-3">
              {QUE_RECIBES.extras.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-primary"
                  />
                  <span className="font-medium leading-relaxed text-muted-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
