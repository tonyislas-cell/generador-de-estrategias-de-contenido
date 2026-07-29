import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-auth";

export const config = { matcher: ["/admin/:path*"] };

/**
 * No cubre /api/admin/*: un cambio de matcher puede sacar cobertura de acá
 * en silencio, así que cada Route Handler de /api/admin se re-verifica solo
 * (ver src/app/api/admin/**), sin depender únicamente de esto.
 */
export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSession(token))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}
