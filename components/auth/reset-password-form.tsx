"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { apiFetch } from "@/lib/api";

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

  return <main className="auth-shell"><div className="auth-orbit" /><div className="relative z-10 w-full max-w-[480px]"><Link href="/login" className="mb-12 inline-flex text-sm font-semibold text-paper/75 hover:text-paper">← Volver al login</Link><div className="rounded-[2rem] border border-white/12 bg-white/[0.06] p-7 shadow-2xl shadow-black/25 backdrop-blur-sm sm:p-10"><p className="eyebrow text-lime">Nuevo acceso</p><h1 className="display mt-5 text-5xl tracking-[-0.06em]">Cambia tu clave.</h1><p className="mt-4 leading-7 text-paper/55">Usa el código de seis dígitos que recibiste por email.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="field"><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label><label className="field"><span>Código</span><input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" required /></label><label className="field"><span>Nueva contraseña</span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required /></label><label className="field"><span>Repite la contraseña</span><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} type="password" autoComplete="new-password" minLength={8} required /></label>{message && <p role="status" className="rounded-xl border border-lime/30 bg-lime/10 px-4 py-3 text-sm text-lime">{message} <Link href="/login" className="font-semibold underline">Entrar</Link></p>}{error && <p role="alert" className="rounded-xl border border-red-300/30 bg-red-300/10 px-4 py-3 text-sm text-red-100">{error}</p>}<button className="button button-lime button-large w-full justify-center" disabled={loading}>{loading ? "Actualizando…" : "Actualizar contraseña"}</button></form></div></div></main>;
}
