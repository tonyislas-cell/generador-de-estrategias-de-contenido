"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Capa de elementos que siguen al cursor, cada uno a su propia profundidad.
 *
 * El puntero se guarda en `MotionValue`s y no en estado de React: un `useState`
 * por `pointermove` re-renderizaría el árbol entero decenas de veces por
 * segundo. Así el valor vive fuera del ciclo de render y solo se toca el
 * `transform` del nodo.
 *
 * Sobre el spring: atar la posición directamente al cursor se siente artificial
 * porque no tiene inercia. El resorte va deliberadamente blando (rigidez baja,
 * amortiguación alta) para que el movimiento quede calmo, que es lo que pide
 * `layout.md` de este sistema — nada rebotado ni ágil.
 */

/** Píxeles de desplazamiento por unidad de profundidad, a sensibilidad 1. */
const PIXELES_POR_PROFUNDIDAD = 10;

interface ContextoParallax {
  /** Posición del puntero normalizada a -1..1 desde el centro de la ventana. */
  x: MotionValue<number>;
  y: MotionValue<number>;
  sensitivity: number;
}

const ParallaxContext = createContext<ContextoParallax | null>(null);

export function ParallaxFloating({
  children,
  sensitivity = 1,
  className,
}: {
  children: ReactNode;
  sensitivity?: number;
  className?: string;
}) {
  const xCrudo = useMotionValue(0);
  const yCrudo = useMotionValue(0);
  const x = useSpring(xCrudo, { stiffness: 40, damping: 24, mass: 1 });
  const y = useSpring(yCrudo, { stiffness: 40, damping: 24, mass: 1 });

  useEffect(() => {
    // Las dos preferencias se leen del mismo modo, con `matchMedia` dentro del
    // efecto, y no con `useReducedMotion()` de motion: ese hook monta su
    // suscripción global al importarse el módulo, así que su valor no es
    // confiable en el primer render (y un visitante que pidió movimiento
    // reducido se quedaba con el parallax puesto).
    //
    // Con movimiento reducido los símbolos quedan quietos en su sitio. En
    // pantalla táctil no hay cursor que seguir, así que el listener sería
    // trabajo puro sin efecto.
    const permitido =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!permitido) return;

    const alMover = (evento: PointerEvent) => {
      xCrudo.set((evento.clientX / window.innerWidth) * 2 - 1);
      yCrudo.set((evento.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", alMover, { passive: true });
    return () => window.removeEventListener("pointermove", alMover);
  }, [xCrudo, yCrudo]);

  return (
    <ParallaxContext.Provider value={{ x, y, sensitivity }}>
      <div aria-hidden="true" className={cn("absolute inset-0", className)}>
        {children}
      </div>
    </ParallaxContext.Provider>
  );
}

export function FloatingElement({
  children,
  depth = 1,
  className,
}: {
  children: ReactNode;
  depth?: number;
  className?: string;
}) {
  const contexto = useContext(ParallaxContext);
  if (!contexto) {
    throw new Error("FloatingElement tiene que ir dentro de ParallaxFloating");
  }

  const recorrido = depth * contexto.sensitivity * PIXELES_POR_PROFUNDIDAD;
  const x = useTransform(contexto.x, (valor) => valor * recorrido);
  const y = useTransform(contexto.y, (valor) => valor * recorrido);

  return (
    <motion.div className={cn("absolute", className)} style={{ x, y }}>
      {children}
    </motion.div>
  );
}
