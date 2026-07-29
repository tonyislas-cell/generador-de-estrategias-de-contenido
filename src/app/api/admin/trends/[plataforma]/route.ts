import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import { updateTrendsSnippet } from "@/lib/trends/admin-repository";
import type { TrendsSnippet } from "@/lib/trends/types";
import { PLATAFORMA_OPTIONS } from "@/lib/wizard/options";
import type { Plataforma } from "@/lib/wizard/types";

const PLATAFORMAS: string[] = PLATAFORMA_OPTIONS.map((option) => option.value);

function isPlataforma(value: string): value is Plataforma {
  return PLATAFORMAS.includes(value);
}

type TrendsPayload = Omit<TrendsSnippet, "plataforma">;

const isNonEmptyList = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((item) => typeof item === "string" && item.trim() !== "");

function parseBody(body: unknown): TrendsPayload | null {
  if (!body || typeof body !== "object") return null;
  const { periodo, formatos, ganchos, senales, evitar, convencionesCopy } =
    body as Record<string, unknown>;

  if (typeof periodo !== "string" || periodo.trim() === "") return null;
  if (typeof convencionesCopy !== "string" || convencionesCopy.trim() === "")
    return null;
  if (!isNonEmptyList(formatos)) return null;
  if (!isNonEmptyList(ganchos)) return null;
  if (!isNonEmptyList(senales)) return null;
  if (!isNonEmptyList(evitar)) return null;

  return { periodo, formatos, ganchos, senales, evitar, convencionesCopy };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ plataforma: string }> }
) {
  // Re-verifica acá aunque src/proxy.ts ya proteja /admin: los docs de Next
  // avisan que un cambio de matcher puede sacar cobertura del proxy en
  // silencio, así que cada Route Handler no depende únicamente de él.
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSession(token))) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  const { plataforma } = await params;
  if (!isPlataforma(plataforma)) {
    return NextResponse.json({ error: "Plataforma desconocida" }, { status: 400 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    rawBody = null;
  }

  const payload = parseBody(rawBody);
  if (!payload) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  await updateTrendsSnippet(plataforma, payload);
  return NextResponse.json({ ok: true });
}
