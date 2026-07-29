"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Aparición al entrar en pantalla, una sola vez.
 *
 * Terracotta pide movimiento calmo (200–400ms, nada rebotado), así que acá no
 * hay resortes ni rebote: solo opacidad y un desplazamiento de 8px.
 *
 * La regla de `prefers-reduced-motion` de `globals.css` no alcanza para esto,
 * porque Motion anima con transformaciones por JS y no con transiciones CSS.
 * De ahí el `useReducedMotion()`: con movimiento reducido se conserva el
 * fundido, que ayuda a entender que algo apareció, y se quita el desplazamiento,
 * que es lo que molesta.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
