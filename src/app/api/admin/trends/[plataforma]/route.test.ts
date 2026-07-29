// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/admin-auth", () => ({
  ADMIN_SESSION_COOKIE: "admin_session",
  verifyAdminSession: vi.fn(),
}));

vi.mock("@/lib/trends/admin-repository", () => ({
  updateTrendsSnippet: vi.fn(),
}));

import { verifyAdminSession } from "@/lib/admin-auth";
import { updateTrendsSnippet } from "@/lib/trends/admin-repository";
import { PUT } from "./route";

const mockVerifyAdminSession = verifyAdminSession as Mock;
const mockUpdateTrendsSnippet = updateTrendsSnippet as Mock;

const VALID_BODY = {
  periodo: "línea base",
  formatos: ["formato 1"],
  ganchos: ["gancho 1"],
  senales: ["senal 1"],
  evitar: ["evitar 1"],
  convencionesCopy: "copy de prueba",
};

function putRequest(body: unknown, cookie = "valid-token") {
  return new NextRequest("http://localhost:3000/api/admin/trends/tiktok", {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      cookie: cookie ? `admin_session=${cookie}` : "",
    },
    body: JSON.stringify(body),
  });
}

function paramsFor(plataforma: string) {
  return { params: Promise.resolve({ plataforma }) };
}

describe("PUT /api/admin/trends/[plataforma]", () => {
  beforeEach(() => {
    mockVerifyAdminSession.mockReset();
    mockUpdateTrendsSnippet.mockReset();
  });

  it("rejects without a valid session, without touching the repository", async () => {
    mockVerifyAdminSession.mockResolvedValue(false);

    const response = await PUT(putRequest(VALID_BODY), paramsFor("tiktok"));

    expect(response.status).toBe(401);
    expect(mockUpdateTrendsSnippet).not.toHaveBeenCalled();
  });

  it("rejects an unrecognized platform, without touching the repository", async () => {
    mockVerifyAdminSession.mockResolvedValue(true);

    const response = await PUT(
      putRequest(VALID_BODY),
      paramsFor("myspace")
    );

    expect(response.status).toBe(400);
    expect(mockUpdateTrendsSnippet).not.toHaveBeenCalled();
  });

  it("rejects a body with an empty periodo, without touching the repository", async () => {
    mockVerifyAdminSession.mockResolvedValue(true);

    const response = await PUT(
      putRequest({ ...VALID_BODY, periodo: "   " }),
      paramsFor("tiktok")
    );

    expect(response.status).toBe(400);
    expect(mockUpdateTrendsSnippet).not.toHaveBeenCalled();
  });

  it("rejects a body with an empty list field, without touching the repository", async () => {
    mockVerifyAdminSession.mockResolvedValue(true);

    const response = await PUT(
      putRequest({ ...VALID_BODY, formatos: [] }),
      paramsFor("tiktok")
    );

    expect(response.status).toBe(400);
    expect(mockUpdateTrendsSnippet).not.toHaveBeenCalled();
  });

  it("rejects a list field whose items are all blank, without touching the repository", async () => {
    mockVerifyAdminSession.mockResolvedValue(true);

    const response = await PUT(
      putRequest({ ...VALID_BODY, ganchos: ["   ", ""] }),
      paramsFor("tiktok")
    );

    expect(response.status).toBe(400);
    expect(mockUpdateTrendsSnippet).not.toHaveBeenCalled();
  });

  it("saves a valid body for a valid session", async () => {
    mockVerifyAdminSession.mockResolvedValue(true);
    mockUpdateTrendsSnippet.mockResolvedValue(undefined);

    const response = await PUT(putRequest(VALID_BODY), paramsFor("tiktok"));

    expect(response.status).toBe(200);
    expect(mockUpdateTrendsSnippet).toHaveBeenCalledWith("tiktok", VALID_BODY);
  });
});
