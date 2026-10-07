"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { apiFetch } from "@/lib/api";
import { AuthShell } from "@/components/auth/auth-shell";
import { StatusNotice } from "@/components/ui/status-notice";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(response.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Recuperación"
      title="Recupera el acceso a tu ruta."
      description="Te enviaremos un código si encontramos una cuenta asociada con ese correo."
      backHref="/login"
      backLabel="Volver al inicio de sesión"
    >
      <form onSubmit={submit} className="space-y-5">
        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="tu@email.com" required />
        </label>
        {message ? <StatusNotice tone="success">{message}</StatusNotice> : null}
        {error ? <StatusNotice tone="error">{error}</StatusNotice> : null}
        <button className="button button-primary button-large w-full" disabled={loading}>{loading ? "Enviando…" : "Enviar código"}</button>
      </form>
      <p className="mt-7 text-center text-sm text-twilight/52">
        ¿Ya tienes un código? <Link href="/reset-password" className="font-semibold text-teal hover:underline">Restablece tu contraseña</Link>
      </p>
    </AuthShell>
  );
}
