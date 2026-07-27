import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("renders a link into the cuestionario", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "viral-content-kit" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Empezar el cuestionario" })
    ).toHaveAttribute("href", "/cuestionario");
  });
});
