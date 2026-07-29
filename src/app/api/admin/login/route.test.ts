// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/admin-auth", () => ({
  ADMIN_SESSION_COOKIE: "admin_session",
  ADMIN_SESSION_TTL_SECONDS: 60,
  adminSessionCookieOptions: (maxAge: number) => ({
    httpOnly: true,
    secure: false,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  }),
  signAdminSession: vi.fn(),
  verifyPassword: vi.fn(),
}));

import { signAdminSession, verifyPassword } from "@/lib/admin-auth";
import { POST } from "./route";

const mockVerifyPassword = verifyPassword as Mock;
const mockSignAdminSession = signAdminSession as Mock;

function loginRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/login", () => {
  beforeEach(() => {
    mockVerifyPassword.mockReset();
    mockSignAdminSession.mockReset();
  });

  it("sets the session cookie when the password is correct", async () => {
    mockVerifyPassword.mockReturnValue(true);
    mockSignAdminSession.mockResolvedValue("signed-token");

    const response = await POST(loginRequest({ password: "correct" }));

    expect(response.status).toBe(200);
    expect(response.cookies.get("admin_session")?.value).toBe("signed-token");
  });

  it("rejects an incorrect password without setting a cookie", async () => {
    mockVerifyPassword.mockReturnValue(false);

    const response = await POST(loginRequest({ password: "wrong" }));

    expect(response.status).toBe(401);
    expect(response.cookies.get("admin_session")).toBeUndefined();
    expect(mockSignAdminSession).not.toHaveBeenCalled();
  });

  it("rejects a malformed body", async () => {
    const response = await POST(loginRequest({}));

    expect(response.status).toBe(401);
    expect(mockVerifyPassword).not.toHaveBeenCalled();
  });
});
