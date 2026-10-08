"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { AuthShell } from "@/components/auth/auth-shell";
import { StatusNotice } from "@/components/ui/status-notice";

export function VerifyEmailForm({ token = "", pendingEmail = "" }: { token?: string; pendingEmail?: string }) {
  const [email, setEmail] = useState(pendingEmail);
  const [code, setCode] = useState("");
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
        body: JSON.stringify({ email: email.trim() }),
      });
      setMessage(response.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos reenviar el código.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<{ message: string }>("/auth/verify-email-code", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      setMessage(response.message);
      setCode("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "El código no es válido o ya venció.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Un último paso"
      title="Confirma tu correo."
      description={token ? "Estamos validando el enlace. Después de confirmar tu correo, un administrador revisará tu solicitud." : "Escribe el código de seis dígitos que enviamos a tu correo. Después tendrás que esperar la aprobación administrativa."}
      backHref="/"
      backLabel="Volver al inicio"
    >
      {loading && token ? <StatusNotice tone="info">Validando el enlace…</StatusNotice> : null}
      {message ? <StatusNotice tone="success">{message} Tu cuenta queda pendiente de aprobación administrativa. <Link href="/login" className="font-semibold underline">Entrar</Link></StatusNotice> : null}
      {error ? <StatusNotice tone="error">{error}</StatusNotice> : null}
      {!token ? (
        <div className="mt-6 space-y-7">
          <form onSubmit={verifyCode} className="space-y-5">
            <label className="field"><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
            <label className="field"><span>Código de verificación</span><input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="123456" required /></label>
            <button className="button button-primary button-large w-full" disabled={loading}>{loading ? "Verificando…" : "Verificar código"}</button>
          </form>
          <form onSubmit={resend} className="space-y-5 border-t border-twilight/10 pt-6">
            <label className="field"><span>Email para reenviar</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
            <button className="button button-secondary button-large w-full" disabled={loading}>{loading ? "Enviando…" : "Reenviar código"}</button>
          </form>
        </div>
      ) : null}
    </AuthShell>
  );
}
