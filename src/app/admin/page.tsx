"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAllTrends } from "@/lib/trends";
import { PLATAFORMA_OPTIONS } from "@/lib/wizard/options";
import type { Plataforma } from "@/lib/wizard/types";

interface PlatformForm {
  periodo: string;
  formatos: string;
  ganchos: string;
  senales: string;
  evitar: string;
  convencionesCopy: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const EMPTY_FORM: PlatformForm = {
  periodo: "",
  formatos: "",
  ganchos: "",
  senales: "",
  evitar: "",
  convencionesCopy: "",
};

/** Une un array en texto de una línea por ítem, para poblar un textarea. */
const toLines = (values: string[]): string => values.join("\n");

/** Inverso de `toLines`: recorta cada línea y descarta las que quedan vacías. */
const fromLines = (text: string): string[] =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

export default function AdminPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Record<Plataforma, PlatformForm> | null>(
    null
  );
  const [status, setStatus] = useState<Record<Plataforma, SaveStatus>>(
    Object.fromEntries(
      PLATAFORMA_OPTIONS.map((option) => [option.value, "idle"])
    ) as Record<Plataforma, SaveStatus>
  );

  useEffect(() => {
    let cancelled = false;
    getAllTrends().then((all) => {
      if (cancelled) return;
      const next = {} as Record<Plataforma, PlatformForm>;
      for (const option of PLATAFORMA_OPTIONS) {
        const snippet = all[option.value];
        next[option.value] = snippet
          ? {
              periodo: snippet.periodo,
              formatos: toLines(snippet.formatos),
              ganchos: toLines(snippet.ganchos),
              senales: toLines(snippet.senales),
              evitar: toLines(snippet.evitar),
              convencionesCopy: snippet.convencionesCopy,
            }
          : EMPTY_FORM;
      }
      setForms(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = (
    plataforma: Plataforma,
    field: keyof PlatformForm,
    value: string
  ) => {
    setForms(
      (prev) =>
        prev && {
          ...prev,
          [plataforma]: { ...prev[plataforma], [field]: value },
        }
    );
  };

  const save = async (plataforma: Plataforma) => {
    if (!forms) return;
    const form = forms[plataforma];
    setStatus((prev) => ({ ...prev, [plataforma]: "saving" }));

    const response = await fetch(`/api/admin/trends/${plataforma}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        periodo: form.periodo.trim(),
        formatos: fromLines(form.formatos),
        ganchos: fromLines(form.ganchos),
        senales: fromLines(form.senales),
        evitar: fromLines(form.evitar),
        convencionesCopy: form.convencionesCopy.trim(),
      }),
    });

    setStatus((prev) => ({
      ...prev,
      [plataforma]: response.ok ? "saved" : "error",
    }));
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (!forms) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-2xl flex-1 content-start gap-8 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl tracking-tight text-foreground">
          Tendencias por plataforma
        </h1>
        <Button variant="ghost" onClick={logout}>
          Cerrar sesión
        </Button>
      </div>

      {PLATAFORMA_OPTIONS.map((option) => {
        const form = forms[option.value];
        const saveStatus = status[option.value];
        const idPrefix = option.value;

        return (
          <section
            key={option.value}
            aria-label={option.label}
            className="grid gap-4 rounded-lg border border-border p-4"
          >
            <h2 className="text-lg text-foreground">{option.label}</h2>

            <div className="grid gap-2">
              <Label htmlFor={`${idPrefix}-periodo`}>Período</Label>
              <Input
                id={`${idPrefix}-periodo`}
                value={form.periodo}
                onChange={(e) =>
                  updateField(option.value, "periodo", e.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${idPrefix}-formatos`}>
                Formatos que rinden (una línea por ítem)
              </Label>
              <Textarea
                id={`${idPrefix}-formatos`}
                value={form.formatos}
                onChange={(e) =>
                  updateField(option.value, "formatos", e.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${idPrefix}-ganchos`}>
                Patrones de gancho (una línea por ítem)
              </Label>
              <Textarea
                id={`${idPrefix}-ganchos`}
                value={form.ganchos}
                onChange={(e) =>
                  updateField(option.value, "ganchos", e.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${idPrefix}-senales`}>
                Señales que premia la plataforma (una línea por ítem)
              </Label>
              <Textarea
                id={`${idPrefix}-senales`}
                value={form.senales}
                onChange={(e) =>
                  updateField(option.value, "senales", e.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${idPrefix}-evitar`}>
                Qué evitar (una línea por ítem)
              </Label>
              <Textarea
                id={`${idPrefix}-evitar`}
                value={form.evitar}
                onChange={(e) =>
                  updateField(option.value, "evitar", e.target.value)
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${idPrefix}-copy`}>Convenciones de copy</Label>
              <Textarea
                id={`${idPrefix}-copy`}
                value={form.convencionesCopy}
                onChange={(e) =>
                  updateField(option.value, "convencionesCopy", e.target.value)
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => save(option.value)}
                disabled={saveStatus === "saving"}
              >
                Guardar
              </Button>
              {saveStatus === "saved" ? (
                <span className="text-sm text-muted-foreground">Guardado.</span>
              ) : null}
              {saveStatus === "error" ? (
                <span className="text-sm text-destructive">
                  No se pudo guardar.
                </span>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
