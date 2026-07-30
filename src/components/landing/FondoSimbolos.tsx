import {
  FloatingElement,
  ParallaxFloating,
} from "@/components/ui/parallax-floating";

/**
 * Capa ambiental de figuras geométricas que siguen al cursor.
 *
 * Van como SVG y no como los glifos Unicode (◈ ⬡ ◎ ⬟) del diseño original:
 * varios de ellos tienen cobertura irregular de fuentes y en Android salen como
 * cuadrito de tofu. Mismas formas, sin depender de qué tipografía tenga el
 * sistema, y nítidas a cualquier tamaño.
 *
 * El color es la tinta café de la paleta al 10%, no el terracota: `colors.md`
 * reserva el terracota como único motor de interacción, y un fondo decorativo
 * del mismo tono le restaría fuerza al CTA.
 */

type Figura =
  | "rombo-doble"
  | "hexagono"
  | "circulo-doble"
  | "rombo"
  | "triangulo"
  | "cuadrado"
  | "pentagono";

/** Vértices calculados sobre un radio de 10 en un lienzo de 24, centro 12,12. */
const TRAZOS: Record<Figura, string> = {
  rombo: "M12 2 L22 12 L12 22 L2 12 Z",
  hexagono: "M12 2 L20.66 7 L20.66 17 L12 22 L3.34 17 L3.34 7 Z",
  triangulo: "M12 3 L22 20 L2 20 Z",
  cuadrado: "M3 3 H21 V21 H3 Z",
  pentagono: "M12 2 L21.51 8.91 L17.88 20.09 L6.12 20.09 L2.49 8.91 Z",
  "rombo-doble": "M12 2 L22 12 L12 22 L2 12 Z M12 7 L17 12 L12 17 L7 12 Z",
  "circulo-doble": "",
};

function Forma({ figura, className }: { figura: Figura; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      className={className}
    >
      {figura === "circulo-doble" ? (
        <>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3.5" />
        </>
      ) : (
        <path d={TRAZOS[figura]} />
      )}
    </svg>
  );
}

const SIMBOLOS: {
  figura: Figura;
  posicion: string;
  depth: number;
  tamano: string;
}[] = [
  { figura: "rombo-doble", posicion: "left-[6%] top-[12%]", depth: 0.5, tamano: "size-14" },
  { figura: "hexagono", posicion: "left-[28%] top-[30%]", depth: 1.5, tamano: "size-9" },
  { figura: "circulo-doble", posicion: "right-[18%] top-[18%]", depth: 2.5, tamano: "size-11" },
  { figura: "rombo", posicion: "left-[12%] bottom-[22%]", depth: 2, tamano: "size-9" },
  { figura: "triangulo", posicion: "right-[6%] bottom-[18%]", depth: 1, tamano: "size-14" },
  { figura: "cuadrado", posicion: "right-[38%] bottom-[38%]", depth: 3, tamano: "size-7" },
  { figura: "pentagono", posicion: "right-[10%] top-[45%]", depth: 1.8, tamano: "size-9" },
];

export function FondoSimbolos() {
  return (
    // Fija al viewport y no absoluta a la página: la capa queda quieta al hacer
    // scroll, se pinta una sola vez y no obliga al navegador a repintar una
    // superficie de 4700px de alto. `pointer-events-none` para que no se coma
    // ningún clic.
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <ParallaxFloating sensitivity={1.5}>
        {SIMBOLOS.map(({ figura, posicion, depth, tamano }) => (
          <FloatingElement className={posicion} depth={depth} key={figura}>
            <Forma figura={figura} className={`${tamano} text-foreground/10`} />
          </FloatingElement>
        ))}
      </ParallaxFloating>
    </div>
  );
}
