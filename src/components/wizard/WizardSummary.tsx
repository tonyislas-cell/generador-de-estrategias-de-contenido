import { getSummaryItems } from "@/lib/wizard/summary";
import type { WizardAnswers } from "@/lib/wizard/types";

interface WizardSummaryProps {
  answers: WizardAnswers;
}

export function WizardSummary({ answers }: WizardSummaryProps) {
  const items = getSummaryItems(answers);

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <h2 className="text-2xl text-foreground sm:text-3xl">Tu resumen</h2>
        <p className="text-muted-foreground">
          Esto es lo que vamos a usar para armar tu kit de prompts.
        </p>
      </div>
      <dl className="grid gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="grid gap-1 rounded-lg border border-border bg-card p-4 shadow-xs"
          >
            <dt className="font-sans text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
              {item.label}
            </dt>
            <dd className="text-sm text-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
