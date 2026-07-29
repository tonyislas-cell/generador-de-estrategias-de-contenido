import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * El contenedor único de la página: 1152px centrado con 24px de aire lateral,
 * como pide `layout.md`. Lo usan las secciones y también la cabecera y el pie,
 * que no llevan el ritmo vertical de 96px pero sí tienen que alinear con el
 * mismo borde izquierdo y derecho que todo lo demás.
 */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1152px] px-6", className)}>
      {children}
    </div>
  );
}

/**
 * Sección de contenido: el contenedor más los 96px de padding vertical.
 *
 * Todas comparten el mismo fondo a propósito. En este sistema la página nunca
 * alterna color de fondo: la separación la cargan la tipografía, las tarjetas
 * cálidas y el espacio en blanco.
 */
export function Section({
  children,
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("py-16 sm:py-24", className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

/**
 * Eyebrow + título + entrada, con los 48px hasta el contenido que pide el
 * sistema. El `id` va en el `<h2>` para que la sección que lo contiene pueda
 * apuntarle con `aria-labelledby` y así tener nombre accesible.
 */
export function SectionHeader({
  id,
  eyebrow,
  titulo,
  entrada,
}: {
  id: string;
  eyebrow: string;
  titulo: string;
  entrada?: string;
}) {
  return (
    <div className="mb-12 max-w-[768px]">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 id={id} className="text-3xl tracking-tight text-foreground sm:text-4xl">
        {titulo}
      </h2>
      {entrada ? (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {entrada}
        </p>
      ) : null}
    </div>
  );
}
