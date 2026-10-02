"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

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

  return <main className="auth-shell"><div className="auth-orbit" /><div className="relative z-10 w-full max-w-[480px]"><Link href="/" className="mb-12 inline-flex text-sm font-semibold text-paper/75 hover:text-paper">← Volver al inicio</Link><div className="rounded-[2rem] border border-white/12 bg-white/[0.06] p-7 shadow-2xl shadow-black/25 backdrop-blur-sm sm:p-10"><p className="eyebrow text-lime">Un último paso</p><h1 className="display mt-5 text-5xl tracking-[-0.06em]">Confirma tu email.</h1><p className="mt-4 leading-7 text-paper/55">{token ? "Estamos validando tu enlace." : "Revisa tu bandeja de entrada y abre el enlace que te enviamos."}</p>{loading && <p className="mt-8 text-sm text-paper/60">Validando…</p>}{message && <p role="status" className="mt-8 rounded-xl border border-lime/30 bg-lime/10 px-4 py-3 text-sm text-lime">{message} <Link href="/login" className="font-semibold underline">Entrar</Link></p>}{error && <p role="alert" className="mt-8 rounded-xl border border-red-300/30 bg-red-300/10 px-4 py-3 text-sm text-red-100">{error}</p>}{!token && <form onSubmit={resend} className="mt-8 space-y-5"><label className="field"><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label><button className="button button-lime button-large w-full justify-center" disabled={loading}>{loading ? "Enviando…" : "Reenviar enlace"}</button></form>}</div></div></main>;
}
