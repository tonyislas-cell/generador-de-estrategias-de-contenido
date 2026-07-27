import { getSummaryItems } from "@/lib/wizard/summary";
import type { WizardAnswers } from "@/lib/wizard/types";

interface WizardSummaryProps {
  answers: WizardAnswers;
}

export function WizardSummary({ answers }: WizardSummaryProps) {
  const items = getSummaryItems(answers);

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Tu resumen
        </h2>
        <p className="text-sm text-muted-foreground">
          Esto es lo que vamos a usar para armar tu kit de prompts.
        </p>
      </div>
      <dl className="grid gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="grid gap-1 rounded-lg border border-border p-3"
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {item.label}
            </dt>
            <dd className="text-sm text-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
