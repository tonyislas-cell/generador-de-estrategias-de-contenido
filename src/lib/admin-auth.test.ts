// @vitest-environment node
//
// Pure Node/Web Crypto logic, no DOM needed. jsdom (the project default)
// provides its own TextEncoder/Uint8Array globals, and jose's `instanceof
// Uint8Array` checks fail across that realm mismatch — this file needs
// Node's native globals.
import { describe, expect, it } from "vitest";
import {
  ADMIN_SESSION_COOKIE,
  signAdminSession,
  verifyAdminSession,
  verifyPassword,
} from "./admin-auth";

describe("verifyPassword", () => {
  it("accepts the correct password", () => {
    expect(verifyPassword("test-admin-password")).toBe(true);
  });

  it("rejects an incorrect password", () => {
    expect(verifyPassword("not-the-password")).toBe(false);
  });

  it("rejects a password of a different length without throwing", () => {
    expect(() => verifyPassword("x")).not.toThrow();
    expect(verifyPassword("x")).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(verifyPassword("")).toBe(false);
  });
});

describe("admin session tokens", () => {
  it("verifies a token it just signed", async () => {
    const token = await signAdminSession();

    expect(await verifyAdminSession(token)).toBe(true);
  });

  it("rejects an undefined token", async () => {
    expect(await verifyAdminSession(undefined)).toBe(false);
  });

  it("rejects a garbage token", async () => {
    expect(await verifyAdminSession("not.a.jwt")).toBe(false);
  });

  it("rejects a token signed with a different secret", async () => {
    const { SignJWT } = await import("jose");
    const wrongKey = new TextEncoder().encode(
      "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    );
    const forged = await new SignJWT({ admin: true })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(wrongKey);

    expect(await verifyAdminSession(forged)).toBe(false);
  });
});

describe("ADMIN_SESSION_COOKIE", () => {
  it("is a non-empty cookie name", () => {
    expect(ADMIN_SESSION_COOKIE.length).toBeGreaterThan(0);
  });
});
