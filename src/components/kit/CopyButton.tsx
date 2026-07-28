"use client";

import { useEffect, useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type CopyState = "idle" | "copied" | "error";

const FEEDBACK: Record<
  CopyState,
  { label: string; Icon: typeof Copy }
> = {
  idle: { label: "Copiar", Icon: Copy },
  copied: { label: "¡Copiado!", Icon: Check },
  error: { label: "No se pudo copiar", Icon: TriangleAlert },
};

const RESET_MS = 2500;

export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), RESET_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const handleCopy = async () => {
    // El portapapeles no existe en orígenes no seguros ni en algunos entornos
    // embebidos, así que se comprueba en vez de asumir.
    const clipboard =
      typeof navigator === "undefined" ? undefined : navigator.clipboard;

    if (!clipboard) {
      setState("error");
      return;
    }

    try {
      await clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("error");
    }
  };

  const { label, Icon } = FEEDBACK[state];

  return (
    <div className="grid justify-items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => void handleCopy()}
        aria-label={label}
      >
        <Icon aria-hidden="true" />
        <span role="status" aria-live="polite">
          {label}
        </span>
      </Button>
      {state === "error" ? (
        <p className="text-xs text-destructive">
          Selecciona el texto del recuadro y cópialo a mano.
        </p>
      ) : null}
    </div>
  );
}
