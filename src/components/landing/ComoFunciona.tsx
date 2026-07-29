import { COMO_FUNCIONA } from "@/lib/landing/content";
import { Section, SectionHeader } from "./Section";
import { Reveal } from "./Reveal";

export function ComoFunciona() {
  return (
    <Section aria-labelledby="como-funciona">
      <SectionHeader
        id="como-funciona"
        eyebrow={COMO_FUNCIONA.eyebrow}
        titulo={COMO_FUNCIONA.titulo}
      />

      {/*
        Zig-zag de dos columnas, no la fila de tres tarjetas iguales: esa
        composición es la firma visual de las plantillas, y acá el tercer paso
        es el que carga el argumento, así que no puede pesar lo mismo que los
        otros dos.
      */}
      <ol className="grid gap-px overflow-hidden rounded-lg border border-border bg-border">
        {COMO_FUNCIONA.pasos.map((paso, i) => (
          <li key={paso.titulo} className="bg-background">
            <Reveal delay={i * 0.06}>
              <div className="grid gap-4 p-6 sm:p-8 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-12">
                <h3 className="text-2xl text-foreground">{paso.titulo}</h3>
                <div className="max-w-[60ch]">
                  <p className="leading-relaxed text-muted-foreground">
                    {paso.cuerpo}
                  </p>
                  <p className="mt-3 leading-relaxed text-foreground">
                    {paso.detalle}
                  </p>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
