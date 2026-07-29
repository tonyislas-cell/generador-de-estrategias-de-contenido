"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(false);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      router.push("/admin");
      return;
    }

    setError(true);
    setSubmitting(false);
  };

  return (
    <div className="mx-auto grid w-full max-w-xl flex-1 content-start gap-6 px-6 py-12">
      <h1 className="text-2xl text-foreground">Panel de admin</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive">Contraseña incorrecta.</p>
        ) : null}
        <Button type="submit" disabled={submitting}>
          Entrar
        </Button>
      </form>
    </div>
  );
}
