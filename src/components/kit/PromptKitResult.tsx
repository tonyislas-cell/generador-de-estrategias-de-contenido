"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTrendsSnippet } from "@/lib/trends";
import type { TrendsSnippet } from "@/lib/trends/types";
import { incrementKitUsage } from "@/lib/usage";
import { generatePromptKit } from "@/lib/prompt-kit/generatePromptKit";
import { resolvePlataformaPrincipal, toKitAnswers } from "@/lib/prompt-kit/kit-answers";
import {
  DURACION_CONFIG,
  type Duracion,
  type ModeloIA,
  type PromptKit,
} from "@/lib/prompt-kit/types";
import { MODELO_OPTIONS, NOMBRE_DE_MODELO } from "@/lib/prompt-kit/adapters";
import { plataformaLabel } from "@/lib/wizard/labels";
import type { WizardAnswers } from "@/lib/wizard/types";
import { PromptBlockCard } from "./PromptBlockCard";

type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; trends: TrendsSnippet };

interface PromptKitResultProps {
  answers: WizardAnswers;
  duracion: Duracion;
  modelos: ModeloIA[];
  onBack: () => void;
  onRestart: () => void;
}

function KitPanel({ kit }: { kit: PromptKit }) {
  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground">
        Abre {NOMBRE_DE_MODELO[kit.modelo]} en una conversación nueva y pega
        los prompts en orden. No los pegues todos juntos: pega el primero,
        espera la respuesta, y recién ahí el siguiente.
      </p>

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
    </div>
  );
}

export function PromptKitResult({
  answers,
  duracion,
  modelos,
  onBack,
  onRestart,
}: PromptKitResultProps) {
  const kitAnswers = useMemo(() => toKitAnswers(answers), [answers]);
  const plataformaPrincipal = kitAnswers
    ? resolvePlataformaPrincipal(kitAnswers)
    : null;
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!kitAnswers || !plataformaPrincipal || modelos.length === 0) return;

    let cancelled = false;

    getTrendsSnippet(plataformaPrincipal)
      .then((trends) => {
        if (cancelled) return;
        setState({ status: "ready", trends });
        // El contador es un extra de la landing, no parte del flujo del
        // kit: si falla, no debe romper ni avisarle nada al usuario.
        incrementKitUsage().catch(() => {});
      })
      .catch(() => {
        if (cancelled) return;
        setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [kitAnswers, plataformaPrincipal, modelos, duracion, retryToken]);

  // `loadWizardState` valida la forma de manera laxa, así que un estado viejo o
  // editado a mano puede llegar hasta acá sin respuestas o sin modelos. Mejor
  // decirlo que romper o generar un prompt con huecos. Se resuelve antes del
  // efecto, así que este camino nunca llega a pedir tendencias por red.
  if (!kitAnswers || modelos.length === 0) {
    return (
      <div className="mx-auto grid w-full max-w-xl flex-1 content-start gap-4 px-6 py-12">
        <h1 className="text-xl font-semibold text-foreground">
          Faltan respuestas
        </h1>
        <p className="text-sm text-muted-foreground">
          No podemos armar el kit porque el cuestionario está incompleto o no
          elegiste ningún modelo.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={onBack}>Elegir otros modelos</Button>
          <Button variant="ghost" onClick={onRestart}>
            Empezar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto grid w-full max-w-xl flex-1 content-start gap-4 px-6 py-12">
        <h1 className="text-xl font-semibold text-foreground">
          No pudimos cargar las tendencias
        </h1>
        <p className="text-sm text-muted-foreground">
          Hubo un problema de conexión. Intenta de nuevo.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setState({ status: "loading" });
              setRetryToken((token) => token + 1);
            }}
          >
            Reintentar
          </Button>
          <Button variant="ghost" onClick={onBack}>
            Elegir otros modelos
          </Button>
        </div>
      </div>
    );
  }

  // Orden fijo (el de `MODELO_OPTIONS`), no el orden en que se marcaron los
  // checkboxes: así las pestañas no se reordenan según cómo el usuario haya
  // ido tildando modelos.
  const modelosEnOrden = MODELO_OPTIONS.map((option) => option.value).filter(
    (modelo) => modelos.includes(modelo)
  );
  const kits = modelosEnOrden.map((modelo) =>
    generatePromptKit(kitAnswers, state.trends, modelo, duracion)
  );

  return (
    <div className="mx-auto grid w-full max-w-2xl flex-1 content-start gap-8 px-6 py-12">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Tu kit de prompts
        </h1>
        <p className="text-sm text-muted-foreground">
          Plan de {DURACION_CONFIG[duracion].etiqueta} ·{" "}
          {plataformaPrincipal ? plataformaLabel(plataformaPrincipal) : ""}
        </p>
      </header>

      <Tabs defaultValue={kits[0]?.modelo}>
        <TabsList>
          {kits.map((kit) => (
            <TabsTrigger key={kit.modelo} value={kit.modelo}>
              {NOMBRE_DE_MODELO[kit.modelo]}
            </TabsTrigger>
          ))}
        </TabsList>
        {kits.map((kit) => (
          <TabsContent key={kit.modelo} value={kit.modelo}>
            <KitPanel kit={kit} />
          </TabsContent>
        ))}
      </Tabs>

      <footer className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onBack}>
          Elegir otros modelos
        </Button>
        <Button variant="ghost" onClick={onRestart}>
          Empezar de nuevo
        </Button>
      </footer>
    </div>
  );
}
