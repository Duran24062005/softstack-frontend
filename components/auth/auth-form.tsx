"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import type { AuthSession } from "@/lib/types";
import { AuthShell } from "@/components/auth/auth-shell";
import { StatusNotice } from "@/components/ui/status-notice";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (mode === "register" && fullName.trim().length < 2) { setError("Escribe tu nombre completo."); return; }
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    setLoading(true);
    try {
      const session = await apiFetch<AuthSession>(`/auth/${mode === "register" ? "register" : "login"}`, { method: "POST", body: JSON.stringify(mode === "register" ? { full_name: fullName, email, password } : { email, password }) });
      if (mode === "register" && session.verification_required) {
        router.push(`/verify-email?pending=1&email=${encodeURIComponent(email)}`);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos iniciar tu sesión.");
      setLoading(false);
    }
  }

  const register = mode === "register";

  return (
    <AuthShell
      eyebrow={register ? "Empieza tu ruta" : "Qué bueno verte"}
      title={register ? "Haz visible lo que sabes hacer." : "Continúa desde donde quedaste."}
      description={register ? "Crea tu cuenta y construye una presencia profesional a tu ritmo." : "Entra a tu espacio y retoma el siguiente movimiento de tu ruta."}
      backHref="/"
      backLabel="Volver al inicio"
    >
      <form onSubmit={submit} className="space-y-5">
        {register ? (
          <label className="field">
            <span>Nombre completo</span>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" placeholder="Alex García" required />
          </label>
        ) : null}
        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="tu@email.com" required />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={register ? "new-password" : "current-password"} placeholder="Mínimo 8 caracteres" required />
        </label>
        {!register ? (
          <Link href="/forgot-password" className="-mt-1 block text-right text-sm font-semibold text-teal hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        ) : null}
        {error ? <StatusNotice tone="error">{error}</StatusNotice> : null}
        <button className="button button-primary button-large w-full" disabled={loading}>
          {loading ? "Preparando tu espacio…" : register ? "Crear mi cuenta" : "Entrar a mi espacio"}
          {!loading ? <ArrowRight size={18} weight="bold" /> : null}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-twilight/52">
        {register ? "¿Ya tienes cuenta?" : "¿Primera vez aquí?"}{" "}
        <Link href={register ? "/login" : "/register"} className="font-semibold text-teal hover:underline">
          {register ? "Inicia sesión" : "Regístrate"}
        </Link>
      </p>
    </AuthShell>
  );
}
