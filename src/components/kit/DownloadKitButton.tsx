"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildKitMarkdown, kitFileName } from "@/lib/prompt-kit/markdown";
import type { PromptKit } from "@/lib/prompt-kit/types";

export function DownloadKitButton({ kit }: { kit: PromptKit }) {
  const [error, setError] = useState(false);

  const handleDownload = () => {
    // No todos los orígenes/entornos exponen `URL.createObjectURL` (mismo
    // motivo que `CopyButton` comprueba `navigator.clipboard` en vez de
    // asumirla), así que se verifica antes de usarla.
    if (typeof URL === "undefined" || !URL.createObjectURL) {
      setError(true);
      return;
    }

    const blob = new Blob([buildKitMarkdown(kit)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = kitFileName(kit);
    link.click();
    URL.revokeObjectURL(url);
    setError(false);
  };

  return (
    <div className="grid justify-items-start gap-1">
      <Button variant="outline" size="sm" onClick={handleDownload}>
        <Download aria-hidden="true" />
        Descargar kit completo (.md)
      </Button>
      {error ? (
        <p className="text-xs text-destructive">
          Tu navegador no permite descargar archivos así. Copia cada bloque a
          mano.
        </p>
      ) : null}
    </div>
  );
}
