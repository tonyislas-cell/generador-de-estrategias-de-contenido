import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import AdminLoginPage from "./page";

describe("AdminLoginPage", () => {
  beforeEach(() => {
    mockPush.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("navigates to /admin on a successful login", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "correct" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/admin"));
    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/login",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("shows an error and does not navigate on a failed login", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });
    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Contraseña incorrecta.")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
