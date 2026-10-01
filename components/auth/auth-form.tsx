"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Lightning } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import type { AuthSession } from "@/lib/types";

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
      await apiFetch<AuthSession>(`/auth/${mode === "register" ? "register" : "login"}`, { method: "POST", body: JSON.stringify(mode === "register" ? { full_name: fullName, email, password } : { email, password }) });
      router.push("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos iniciar tu sesión.");
      setLoading(false);
    }
  }

  return <main className="auth-shell"><div className="auth-orbit" /><div className="relative z-10 w-full max-w-[480px]"><Link href="/" className="mb-12 inline-flex items-center gap-3 text-sm font-semibold text-paper/75 transition-colors hover:text-paper"><span className="grid size-8 place-items-center rounded-full bg-lime text-ink"><Lightning weight="fill" size={16} /></span> soft<span className="-ml-3 text-lime">stack</span></Link><div className="rounded-[2rem] border border-white/12 bg-white/[0.06] p-7 shadow-2xl shadow-black/25 backdrop-blur-sm sm:p-10"><p className="eyebrow text-lime">{mode === "register" ? "Empieza tu ruta" : "Qué bueno verte"}</p><h1 className="display mt-5 text-5xl tracking-[-0.06em]">{mode === "register" ? "Hazlo visible." : "Vuelve a avanzar."}</h1><p className="mt-4 leading-7 text-paper/55">{mode === "register" ? "Crea tu cuenta y construye una presencia profesional a tu ritmo." : "Continúa desde donde quedaste y sigue construyendo tu siguiente nivel."}</p><form onSubmit={submit} className="mt-8 space-y-5">{mode === "register" && <label className="field"><span>Nombre completo</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" placeholder="Alex García" required /></label>}<label className="field"><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="tu@email.com" required /></label><label className="field"><span>Contraseña</span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} placeholder="Mínimo 8 caracteres" required /></label>{error && <p role="alert" className="rounded-xl border border-red-300/30 bg-red-300/10 px-4 py-3 text-sm text-red-100">{error}</p>}<button className="button button-lime button-large w-full justify-center" disabled={loading}>{loading ? "Preparando tu espacio…" : mode === "register" ? "Crear mi cuenta" : "Entrar a mi espacio"}{!loading && <ArrowRight size={18} weight="bold" />}</button></form><p className="mt-7 text-center text-sm text-paper/50">{mode === "register" ? "¿Ya tienes cuenta?" : "¿Primera vez aquí?"}{" "}<Link href={mode === "register" ? "/login" : "/register"} className="font-semibold text-lime hover:underline">{mode === "register" ? "Inicia sesión" : "Regístrate"}</Link></p></div><Link href="/" className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-paper/35 hover:text-paper/70"><ArrowLeft size={14} /> Volver al inicio</Link></div></main>;
}
