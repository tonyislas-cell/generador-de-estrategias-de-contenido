import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Option } from "@/lib/wizard/types";

interface ChoiceCardGroupProps<T extends string> {
  name: string;
  options: Option<T>[];
  value: T | undefined;
  onChange: (next: T) => void;
}

export function ChoiceCardGroup<T extends string>({
  name,
  options,
  value,
  onChange,
}: ChoiceCardGroupProps<T>) {
  return (
    <RadioGroup
      value={value ?? ""}
      onValueChange={(next) => onChange(next as T)}
      className="gap-3"
    >
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        const checked = value === option.value;
        return (
          <Label
            key={option.value}
            htmlFor={id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 font-normal transition-colors hover:bg-muted",
              checked && "border-primary bg-primary/5"
            )}
          >
            <RadioGroupItem value={option.value} id={id} className="mt-0.5" />
            <span className="flex flex-col gap-1">
              <span className="font-medium text-foreground">{option.label}</span>
              {option.description ? (
                <span className="text-sm text-muted-foreground">
                  {option.description}
                </span>
              ) : null}
            </span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}
