import { Checkbox } from "@/components/ui/checkbox";
import type { Option } from "@/lib/wizard/types";
import { OptionCard } from "./OptionCard";

interface CheckboxGroupProps<T extends string> {
  name: string;
  options: Option<T>[];
  selected: T[] | undefined;
  onChange: (next: T[]) => void;
}

export function CheckboxGroup<T extends string>({
  name,
  options,
  selected,
  onChange,
}: CheckboxGroupProps<T>) {
  const current = selected ?? [];

  const toggle = (value: T, checked: boolean) => {
    onChange(
      checked ? [...current, value] : current.filter((v) => v !== value)
    );
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        const checked = current.includes(option.value);
        return (
          <OptionCard
            key={option.value}
            htmlFor={id}
            checked={checked}
            label={option.label}
            description={option.description}
            control={
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(value) => toggle(option.value, value === true)}
                className="mt-0.5"
              />
            }
          />
        );
      })}
    </div>
  );
}
