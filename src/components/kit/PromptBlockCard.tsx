import type { PromptBlock } from "@/lib/prompt-kit/types";
import { CopyButton } from "./CopyButton";

export function PromptBlockCard({ block }: { block: PromptBlock }) {
  return (
    <div className="grid gap-3 rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <h3 className="font-medium text-foreground">{block.titulo}</h3>
          <p className="text-sm text-muted-foreground">{block.descripcion}</p>
        </div>
        <CopyButton text={block.contenido} />
      </div>
      <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap break-words text-foreground">
        {block.contenido}
      </pre>
    </div>
  );
}
