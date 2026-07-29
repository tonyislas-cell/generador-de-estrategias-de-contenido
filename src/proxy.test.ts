// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/admin-auth", () => ({
  ADMIN_SESSION_COOKIE: "admin_session",
  verifyAdminSession: vi.fn(),
}));

import { verifyAdminSession } from "@/lib/admin-auth";
import proxy from "./proxy";

const mockVerifyAdminSession = verifyAdminSession as Mock;

function requestFor(pathname: string, cookie?: string) {
  const headers = cookie ? { cookie: `admin_session=${cookie}` } : undefined;
  return new NextRequest(new URL(pathname, "http://localhost:3000"), {
    headers,
  });
}

describe("proxy", () => {
  beforeEach(() => {
    mockVerifyAdminSession.mockReset();
  });

  it("lets a request with a valid session through", async () => {
    mockVerifyAdminSession.mockResolvedValue(true);

    const response = await proxy(requestFor("/admin", "valid-token"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects to the login page when there is no session cookie", async () => {
    mockVerifyAdminSession.mockResolvedValue(false);

    const response = await proxy(requestFor("/admin"));

    expect(response.headers.get("location")).toContain("/admin/login");
  });

  it("redirects to the login page when the session is invalid or expired", async () => {
    mockVerifyAdminSession.mockResolvedValue(false);

    const response = await proxy(requestFor("/admin", "expired-token"));

    expect(response.headers.get("location")).toContain("/admin/login");
  });

  it("never redirects the login page itself", async () => {
    const response = await proxy(requestFor("/admin/login"));

    expect(response.headers.get("location")).toBeNull();
    expect(mockVerifyAdminSession).not.toHaveBeenCalled();
  });
});
