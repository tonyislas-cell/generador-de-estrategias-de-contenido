import type { PromptBlock } from "@/lib/prompt-kit/types";
import { CopyButton } from "./CopyButton";

export function PromptBlockCard({ block }: { block: PromptBlock }) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-xs sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <h3 className="text-lg text-foreground sm:text-xl">{block.titulo}</h3>
          <p className="text-sm text-muted-foreground">{block.descripcion}</p>
        </div>
        <CopyButton text={block.contenido} />
      </div>
      {/*
        El prompt se apoya en la crema de página, más clara que la tarjeta que
        lo contiene, y no en `bg-muted`: ese token ahora resuelve al mismo hex
        que la tarjeta, así que el bloque habría desaparecido dentro de ella.
      */}
      <pre className="max-h-64 overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs whitespace-pre-wrap break-words text-foreground">
        {block.contenido}
      </pre>
    </div>
  );
}
