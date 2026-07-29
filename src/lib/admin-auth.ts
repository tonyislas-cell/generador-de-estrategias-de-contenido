import { createHash, timingSafeEqual } from "crypto";
import { jwtVerify, SignJWT } from "jose";

const rawPassword = process.env.ADMIN_PASSWORD;
const rawSessionSecret = process.env.ADMIN_SESSION_SECRET;

if (!rawPassword || !rawSessionSecret) {
  throw new Error("Missing ADMIN_PASSWORD or ADMIN_SESSION_SECRET");
}

// Reasignados a consts propias inmediatamente después del guard: TS no
// arrastra el narrowing de `string | undefined` hacia adentro de funciones
// declaradas más abajo, así que sin esto `ADMIN_PASSWORD` seguiría viendo
// `undefined` como posible dentro de `verifyPassword`.
const ADMIN_PASSWORD: string = rawPassword;
const SESSION_SECRET_KEY = new TextEncoder().encode(rawSessionSecret);

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

/**
 * Único punto para las opciones de la cookie de sesión, usado tanto al
 * setearla (login) como al borrarla (logout) — así no pueden divergir en
 * silencio si `secure`/`sameSite` cambian algún día.
 */
export function adminSessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    // Fijo en `true` rompería el login en http://localhost.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/**
 * Compara contra un hash de longitud fija en vez de la contraseña cruda:
 * `timingSafeEqual` tira `RangeError` si los buffers no tienen la misma
 * longitud, y comparar longitudes antes reintroduciría el timing leak que
 * esta función existe para evitar.
 */
export function verifyPassword(candidate: string): boolean {
  const candidateHash = createHash("sha256").update(candidate).digest();
  const expectedHash = createHash("sha256").update(ADMIN_PASSWORD).digest();
  return timingSafeEqual(candidateHash, expectedHash);
}

export async function signAdminSession(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${ADMIN_SESSION_TTL_SECONDS}s`)
    .sign(SESSION_SECRET_KEY);
}

export async function verifyAdminSession(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;

  try {
    await jwtVerify(token, SESSION_SECRET_KEY);
    return true;
  } catch {
    return false;
  }
}
