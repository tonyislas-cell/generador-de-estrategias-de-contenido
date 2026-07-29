import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  adminSessionCookieOptions,
  signAdminSession,
  verifyPassword,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const password =
    body && typeof body === "object" && "password" in body
      ? (body as { password: unknown }).password
      : undefined;

  if (typeof password !== "string" || !verifyPassword(password)) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const token = await signAdminSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    token,
    adminSessionCookieOptions(ADMIN_SESSION_TTL_SECONDS)
  );
  return response;
}
