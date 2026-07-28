import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("@/lib/usage", () => ({
  getKitUsageTotal: vi.fn(),
}));

import { getKitUsageTotal } from "@/lib/usage";
import Home from "./page";

const mockGetKitUsageTotal = getKitUsageTotal as Mock;

describe("Home", () => {
  beforeEach(() => {
    mockGetKitUsageTotal.mockReset();
  });

  it("renders a link into the cuestionario", () => {
    mockGetKitUsageTotal.mockReturnValue(new Promise(() => {}));
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "viral-content-kit" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Empezar el cuestionario" })
    ).toHaveAttribute("href", "/cuestionario");
  });

  it("shows the usage total once it loads, pluralized", async () => {
    mockGetKitUsageTotal.mockResolvedValue(1234);
    render(<Home />);

    expect(
      await screen.findByText("Ya se generaron 1.234 kits de prompts.")
    ).toBeInTheDocument();
  });

  it("uses the singular form for a total of exactly one", async () => {
    mockGetKitUsageTotal.mockResolvedValue(1);
    render(<Home />);

    expect(
      await screen.findByText("Ya se generó 1 kit de prompts.")
    ).toBeInTheDocument();
  });

  it("shows nothing extra while the total is loading or fails to load", () => {
    mockGetKitUsageTotal.mockRejectedValue(new Error("network error"));
    render(<Home />);

    expect(screen.queryByText(/Ya se gener/)).toBeNull();
  });
});
