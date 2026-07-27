import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("renders the project skeleton", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "viral-content-kit" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Todo listo" })).toBeInTheDocument();
  });
});
