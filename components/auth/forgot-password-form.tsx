"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { apiFetch } from "@/lib/api";

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

  return <main className="auth-shell"><div className="auth-orbit" /><div className="relative z-10 w-full max-w-[480px]"><Link href="/login" className="mb-12 inline-flex text-sm font-semibold text-paper/75 hover:text-paper">← Volver al login</Link><div className="rounded-[2rem] border border-white/12 bg-white/[0.06] p-7 shadow-2xl shadow-black/25 backdrop-blur-sm sm:p-10"><p className="eyebrow text-lime">Recuperación</p><h1 className="display mt-5 text-5xl tracking-[-0.06em]">Vuelve a entrar.</h1><p className="mt-4 leading-7 text-paper/55">Te enviaremos un código de recuperación si encontramos una cuenta asociada.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="field"><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="tu@email.com" required /></label>{message && <p role="status" className="rounded-xl border border-lime/30 bg-lime/10 px-4 py-3 text-sm text-lime">{message}</p>}{error && <p role="alert" className="rounded-xl border border-red-300/30 bg-red-300/10 px-4 py-3 text-sm text-red-100">{error}</p>}<button className="button button-lime button-large w-full justify-center" disabled={loading}>{loading ? "Enviando…" : "Enviar código"}</button></form><p className="mt-7 text-center text-sm text-paper/50">¿Ya tienes un código? <Link href="/reset-password" className="font-semibold text-lime hover:underline">Restablece tu contraseña</Link></p></div></div></main>;
}
