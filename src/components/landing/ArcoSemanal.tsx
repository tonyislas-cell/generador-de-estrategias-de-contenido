import { ARCO } from "@/lib/landing/content";
import { getMisiones } from "@/lib/prompt-kit/misiones";
import type { Objetivo } from "@/lib/wizard/types";
import { Section, SectionHeader } from "./Section";
import { Reveal } from "./Reveal";

/**
 * La primera frase de la misión, para que la tarjeta muestre en qué consiste la
 * semana sin volcar el párrafo entero que recibe el modelo.
 */
function primeraFrase(texto: string): string {
  const corte = texto.indexOf(". ");
  return corte === -1 ? texto : `${texto.slice(0, corte)}.`;
}

function Columna({ objetivo, titulo }: { objetivo: Objetivo; titulo: string }) {
  // Derivado, no transcrito: los títulos salen del mismo `misiones.ts` que arma
  // los bloques semanales del prompt, así la promesa de la landing no puede
  // divergir de lo que el producto realmente entrega.
  const misiones = getMisiones(objetivo, "1_mes");

  return (
    <div>
      <h3 className="text-xl text-foreground">{titulo}</h3>
      <ol className="mt-6 grid gap-4">
        {misiones.map((mision, i) => (
          <li key={mision.titulo} className="relative flex gap-4">
            {/* Línea conectora: marca la progresión sin recurrir a ordinales
                decorativos tipo «01», que leen a plantilla. */}
            <div className="flex flex-col items-center pt-1.5">
              <span className="size-2 shrink-0 rounded-full bg-primary" />
              {i < misiones.length - 1 ? (
                <span aria-hidden="true" className="mt-1 w-px flex-1 bg-border" />
              ) : null}
            </div>
            <div className="pb-2">
              <p className="font-medium text-foreground">{mision.titulo}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {primeraFrase(mision.mision)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ArcoSemanal() {
  return (
    <Section aria-labelledby="arco-semanal">
      <SectionHeader
        id="arco-semanal"
        eyebrow={ARCO.eyebrow}
        titulo={ARCO.titulo}
        entrada={ARCO.entrada}
      />
      <Reveal>
        <div className="grid gap-10 rounded-lg border border-border bg-card p-6 shadow-xs sm:p-8 md:grid-cols-2 md:gap-12">
          <Columna objetivo="autoridad" titulo={ARCO.autoridad} />
          <Columna objetivo="lanzamiento" titulo={ARCO.lanzamiento} />
        </div>
      </Reveal>
    </Section>
  );
}
