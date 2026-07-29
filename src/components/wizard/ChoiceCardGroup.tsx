import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Option } from "@/lib/wizard/types";
import { OptionCard } from "./OptionCard";

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
        return (
          <OptionCard
            key={option.value}
            htmlFor={id}
            checked={value === option.value}
            label={option.label}
            description={option.description}
            control={
              <RadioGroupItem value={option.value} id={id} className="mt-0.5" />
            }
          />
        );
      })}
    </RadioGroup>
  );
}
