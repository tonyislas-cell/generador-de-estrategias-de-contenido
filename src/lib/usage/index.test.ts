import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("@/lib/supabase", () => ({
  supabase: { rpc: vi.fn(), from: vi.fn() },
}));

import { supabase } from "@/lib/supabase";
import { getKitUsageTotal, incrementKitUsage } from "./index";

const mockRpc = supabase.rpc as Mock;
const mockFrom = supabase.from as Mock;

function stubSelectResult(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  mockFrom.mockReturnValue({ select });
}

describe("incrementKitUsage", () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  it("calls the atomic increment RPC", async () => {
    mockRpc.mockResolvedValue({ error: null });

    await incrementKitUsage();

    expect(mockRpc).toHaveBeenCalledWith("increment_kit_usage");
  });

  it("rejects when the RPC call fails", async () => {
    mockRpc.mockResolvedValue({ error: { message: "network error" } });

    await expect(incrementKitUsage()).rejects.toBeTruthy();
  });
});

describe("getKitUsageTotal", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("returns the current total", async () => {
    stubSelectResult({ data: { total: 42 }, error: null });

    await expect(getKitUsageTotal()).resolves.toBe(42);
  });

  it("returns 0 when the counter row doesn't exist yet", async () => {
    stubSelectResult({ data: null, error: null });

    await expect(getKitUsageTotal()).resolves.toBe(0);
  });

  it("rejects when the query fails", async () => {
    stubSelectResult({ data: null, error: { message: "network error" } });

    await expect(getKitUsageTotal()).rejects.toBeTruthy();
  });
});
