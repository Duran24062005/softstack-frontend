"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { AuthShell } from "@/components/auth/auth-shell";
import { StatusNotice } from "@/components/ui/status-notice";

export function VerifyEmailForm({ token = "", pendingEmail = "" }: { token?: string; pendingEmail?: string }) {
  const [email, setEmail] = useState(pendingEmail);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    apiFetch<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((response) => setMessage(response.message))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "El enlace no es válido."))
      .finally(() => setLoading(false));
  }, [token]);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(response.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos reenviar el enlace.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Un último paso"
      title="Confirma tu correo."
      description={token ? "Estamos validando el enlace. Después de confirmar tu correo, un administrador revisará tu solicitud." : "Revisa tu bandeja de entrada y abre el enlace que te enviamos. Después tendrás que esperar la aprobación administrativa."}
      backHref="/"
      backLabel="Volver al inicio"
    >
      {loading ? <StatusNotice tone="info">Validando el enlace…</StatusNotice> : null}
      {message ? <StatusNotice tone="success">{message} Tu cuenta queda pendiente de aprobación administrativa. <Link href="/login" className="font-semibold underline">Entrar</Link></StatusNotice> : null}
      {error ? <StatusNotice tone="error">{error}</StatusNotice> : null}
      {!token ? (
        <form onSubmit={resend} className="mt-6 space-y-5">
          <label className="field"><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
          <button className="button button-primary button-large w-full" disabled={loading}>{loading ? "Enviando…" : "Reenviar enlace"}</button>
        </form>
      ) : null}
    </AuthShell>
  );
}
