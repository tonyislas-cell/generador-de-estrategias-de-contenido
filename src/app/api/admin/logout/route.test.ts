// @vitest-environment node
import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/admin/logout", () => {
  it("clears the session cookie", async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    expect(response.cookies.get("admin_session")?.value).toBe("");
  });
});
