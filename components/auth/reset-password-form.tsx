"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { apiFetch } from "@/lib/api";
import { AuthShell } from "@/components/auth/auth-shell";
import { StatusNotice } from "@/components/ui/status-notice";

export function ResetPasswordForm({ initialEmail = "", initialCode = "" }: { initialEmail?: string; initialCode?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(initialCode);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code, new_password: password }),
      });
      setMessage(response.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos actualizar tu contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Nuevo acceso"
      title="Define una nueva contraseña."
      description="Usa el código de seis dígitos que recibiste por correo y crea una clave de mínimo ocho caracteres."
      backHref="/login"
      backLabel="Volver al inicio de sesión"
    >
      <form onSubmit={submit} className="space-y-5">
        <label className="field"><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
        <label className="field"><span>Código</span><input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" required /></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field"><span>Nueva contraseña</span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required /></label>
          <label className="field"><span>Repite la contraseña</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} type="password" autoComplete="new-password" minLength={8} required /></label>
        </div>
        {message ? <StatusNotice tone="success">{message} <Link href="/login" className="font-semibold underline">Entrar</Link></StatusNotice> : null}
        {error ? <StatusNotice tone="error">{error}</StatusNotice> : null}
        <button className="button button-primary button-large w-full" disabled={loading}>{loading ? "Actualizando…" : "Actualizar contraseña"}</button>
      </form>
    </AuthShell>
  );
}
