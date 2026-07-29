import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CheckboxGroup } from "./CheckboxGroup";
import type { Option } from "@/lib/wizard/types";

const WITH_DESCRIPTIONS: Option<"a" | "b">[] = [
  { value: "a", label: "Opción A", description: "Explicación de A." },
  { value: "b", label: "Opción B", description: "Explicación de B." },
];

const WITHOUT_DESCRIPTIONS: Option<"a" | "b">[] = [
  { value: "a", label: "Opción A" },
  { value: "b", label: "Opción B" },
];

describe("CheckboxGroup", () => {
  it("shows each option's description when provided", () => {
    render(
      <CheckboxGroup
        name="test"
        options={WITH_DESCRIPTIONS}
        selected={[]}
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Explicación de A.")).toBeInTheDocument();
    expect(screen.getByText("Explicación de B.")).toBeInTheDocument();
  });

  it("renders fine without descriptions", () => {
    render(
      <CheckboxGroup
        name="test"
        options={WITHOUT_DESCRIPTIONS}
        selected={[]}
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Opción A")).toBeInTheDocument();
    expect(screen.queryByText(/Explicación/)).toBeNull();
  });

  it("still toggles selection on click", () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        name="test"
        options={WITH_DESCRIPTIONS}
        selected={["a"]}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByLabelText(/Opción B/));

    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
  });
});
