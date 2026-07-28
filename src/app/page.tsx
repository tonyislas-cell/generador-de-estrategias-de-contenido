"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getKitUsageTotal } from "@/lib/usage";

// `useGrouping` explícito: la variante "es" sin región solo agrupa a partir
// de 5 cifras por defecto, así que sin esto "1234" se mostraría sin punto
// mientras que "12345" sí lo tendría — inconsistente entre cantidades.
const NUMERO = new Intl.NumberFormat("es", { useGrouping: "always" });

function UsageCounter() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getKitUsageTotal()
      .then((value) => {
        if (!cancelled) setTotal(value);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Es un dato de contexto, no contenido crítico: mientras carga o si falla,
  // no hay nada que mostrar en su lugar — no vale la pena un estado de error.
  if (total === null) return null;

  return (
    <p className="text-xs text-muted-foreground">
      {total === 1
        ? "Ya se generó 1 kit de prompts."
        : `Ya se generaron ${NUMERO.format(total)} kits de prompts.`}
    </p>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <Sparkles className="size-8 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          viral-content-kit
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Responde el cuestionario y recibe tu kit de prompts para
          estrategia de contenido.
        </p>
        <Button asChild>
          <Link href="/cuestionario">Empezar el cuestionario</Link>
        </Button>
        <UsageCounter />
      </motion.div>
    </div>
  );
}
