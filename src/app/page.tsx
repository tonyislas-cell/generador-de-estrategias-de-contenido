"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      </motion.div>
    </div>
  );
}
