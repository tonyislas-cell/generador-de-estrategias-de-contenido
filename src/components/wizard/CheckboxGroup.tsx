import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Option } from "@/lib/wizard/types";

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
          <div
            key={option.value}
            className="flex items-start gap-2 rounded-lg border border-border p-3"
          >
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={(value) => toggle(option.value, value === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor={id}
              className="flex cursor-pointer flex-col gap-1 font-normal"
            >
              <span className="font-medium text-foreground">{option.label}</span>
              {option.description ? (
                <span className="text-sm text-muted-foreground">
                  {option.description}
                </span>
              ) : null}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
