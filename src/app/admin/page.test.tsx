import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("@/lib/trends", () => ({
  getAllTrends: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { getAllTrends } from "@/lib/trends";
import AdminPage from "./page";

const mockGetAllTrends = getAllTrends as Mock;

const TIKTOK_SNIPPET = {
  plataforma: "tiktok",
  periodo: "julio 2026",
  formatos: ["formato uno", "formato dos"],
  ganchos: ["gancho uno"],
  senales: ["senal uno"],
  evitar: ["evitar uno"],
  convencionesCopy: "copy de tiktok",
};

const ALL_NULL = {
  tiktok: null,
  instagram_reels: null,
  youtube_shorts: null,
  linkedin: null,
};

describe("AdminPage", () => {
  beforeEach(() => {
    mockGetAllTrends.mockReset();
    mockPush.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("populates a platform's form from its saved snippet", async () => {
    mockGetAllTrends.mockResolvedValue({ ...ALL_NULL, tiktok: TIKTOK_SNIPPET });
    render(<AdminPage />);

    const section = within(await screen.findByRole("region", { name: "TikTok" }));

    expect(section.getByLabelText("Período")).toHaveValue("julio 2026");
    expect(section.getByLabelText(/Formatos que rinden/)).toHaveValue(
      "formato uno\nformato dos"
    );
    expect(section.getByLabelText("Convenciones de copy")).toHaveValue(
      "copy de tiktok"
    );
  });

  it("starts empty for a platform with no saved row", async () => {
    mockGetAllTrends.mockResolvedValue(ALL_NULL);
    render(<AdminPage />);

    const section = within(await screen.findByRole("region", { name: "TikTok" }));

    expect(section.getByLabelText("Período")).toHaveValue("");
  });

  it("saves a platform by splitting, trimming and dropping blank lines", async () => {
    mockGetAllTrends.mockResolvedValue({ ...ALL_NULL, tiktok: TIKTOK_SNIPPET });
    (fetch as Mock).mockResolvedValue({ ok: true });
    render(<AdminPage />);

    const section = within(await screen.findByRole("region", { name: "TikTok" }));

    fireEvent.change(section.getByLabelText(/Formatos que rinden/), {
      target: { value: "  formato nuevo  \n\nformato dos\n" },
    });
    fireEvent.click(section.getByRole("button", { name: "Guardar" }));

    expect(await section.findByText("Guardado.")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/trends/tiktok",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          periodo: "julio 2026",
          formatos: ["formato nuevo", "formato dos"],
          ganchos: ["gancho uno"],
          senales: ["senal uno"],
          evitar: ["evitar uno"],
          convencionesCopy: "copy de tiktok",
        }),
      })
    );
  });

  it("shows a recoverable error when saving fails", async () => {
    mockGetAllTrends.mockResolvedValue({ ...ALL_NULL, tiktok: TIKTOK_SNIPPET });
    (fetch as Mock).mockResolvedValue({ ok: false });
    render(<AdminPage />);

    const section = within(await screen.findByRole("region", { name: "TikTok" }));
    fireEvent.click(section.getByRole("button", { name: "Guardar" }));

    expect(await section.findByText("No se pudo guardar.")).toBeInTheDocument();
  });

  it("logs out and navigates back to the login page", async () => {
    mockGetAllTrends.mockResolvedValue(ALL_NULL);
    (fetch as Mock).mockResolvedValue({ ok: true });
    render(<AdminPage />);

    await screen.findByRole("region", { name: "TikTok" });
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/admin/login"));
    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/logout",
      expect.objectContaining({ method: "POST" })
    );
  });
});
