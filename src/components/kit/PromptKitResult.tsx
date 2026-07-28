"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { getTrendsSnippet } from "@/lib/trends";
import { generatePromptKit } from "@/lib/prompt-kit/generatePromptKit";
import { resolvePlataformaPrincipal, toKitAnswers } from "@/lib/prompt-kit/kit-answers";
import { DURACION_CONFIG, type Duracion, type ModeloIA } from "@/lib/prompt-kit/types";
import { NOMBRE_DE_MODELO } from "@/lib/prompt-kit/adapters";
import { plataformaLabel } from "@/lib/wizard/labels";
import type { WizardAnswers } from "@/lib/wizard/types";
import { PromptBlockCard } from "./PromptBlockCard";

/**
 * Fijo por ahora. Cuando lleguen las pestañas por modelo pasa a ser estado,
 * igual que `duracion` ya lo es.
 */
const MODELO: ModeloIA = "claude";

interface PromptKitResultProps {
  answers: WizardAnswers;
  duracion: Duracion;
  onBack: () => void;
  onRestart: () => void;
}

export function PromptKitResult({
  answers,
  duracion,
  onBack,
  onRestart,
}: PromptKitResultProps) {
  const kit = useMemo(() => {
    const kitAnswers = toKitAnswers(answers);
    if (!kitAnswers) return null;

    const plataforma = resolvePlataformaPrincipal(kitAnswers);
    return generatePromptKit(
      kitAnswers,
      getTrendsSnippet(plataforma),
      MODELO,
      duracion
    );
  }, [answers, duracion]);

  // `loadWizardState` valida la forma de manera laxa, así que un estado viejo o
  // editado a mano puede llegar hasta acá sin respuestas. Mejor decirlo que
  // romper o generar un prompt con huecos.
  if (!kit) {
    return (
      <div className="mx-auto grid w-full max-w-xl flex-1 content-start gap-4 px-6 py-12">
        <h1 className="text-xl font-semibold text-foreground">
          Faltan respuestas
        </h1>
        <p className="text-sm text-muted-foreground">
          No podemos armar el kit porque el cuestionario está incompleto.
          Vuelve al resumen y completa lo que falte.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={onBack}>Volver al resumen</Button>
          <Button variant="ghost" onClick={onRestart}>
            Empezar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-2xl flex-1 content-start gap-8 px-6 py-12">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Tu kit de prompts
        </h1>
        <p className="text-sm text-muted-foreground">
          Plan de {DURACION_CONFIG[kit.duracion].etiqueta} ·{" "}
          {plataformaLabel(kit.plataformaPrincipal)} · para{" "}
          {NOMBRE_DE_MODELO[kit.modelo]}
        </p>
        <p className="text-sm text-muted-foreground">
          Abre {NOMBRE_DE_MODELO[kit.modelo]} en una conversación nueva y pega
          los prompts en orden. No los pegues todos juntos: pega el primero,
          espera la respuesta, y recién ahí el siguiente.
        </p>
      </header>

      <section className="grid gap-3" aria-label="Prompt de configuración">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Configuración
        </h2>
        <PromptBlockCard block={kit.setup} />
      </section>

      <section className="grid gap-3" aria-label="Bloques semanales">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Bloques semanales
        </h2>
        {kit.semanas.map((bloque) => (
          <PromptBlockCard key={bloque.id} block={bloque} />
        ))}
      </section>

      <footer className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onBack}>
          Volver al resumen
        </Button>
        <Button variant="ghost" onClick={onRestart}>
          Empezar de nuevo
        </Button>
      </footer>
    </div>
  );
}
