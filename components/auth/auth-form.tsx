"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import { parseOptionalProfileUrl } from "@/lib/ui-validation";
import type { AcademicProfileInput, AuthSession } from "@/lib/types";
import { AuthShell } from "@/components/auth/auth-shell";
import { StatusNotice } from "@/components/ui/status-notice";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [startYear, setStartYear] = useState(String(new Date().getFullYear()));
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [groupName, setGroupName] = useState("");
  const [campusName, setCampusName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (mode === "register" && fullName.trim().length < 2) { setError("Escribe tu nombre completo."); return; }
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }

    let academicProfile: AcademicProfileInput | undefined;
    if (mode === "register") {
      const parsedYear = Number(startYear);
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > currentYear) { setError(`El año de inicio debe estar entre 1900 y ${currentYear}.`); return; }
      if (!groupName.trim() || !campusName.trim()) { setError("Completa tu grupo y sede de formación."); return; }
      try {
        academicProfile = {
          start_year: parsedYear,
          linkedin_url: parseOptionalProfileUrl(linkedinUrl, "linkedin"),
          github_url: parseOptionalProfileUrl(githubUrl, "github"),
          group_name: groupName.trim(),
          campus_name: campusName.trim(),
        };
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Revisa los enlaces de tus perfiles.");
        return;
      }
    }

    setLoading(true);
    try {
      const session = await apiFetch<AuthSession>(`/auth/${mode === "register" ? "register" : "login"}`, { method: "POST", body: JSON.stringify(mode === "register" ? { full_name: fullName, email, password, academic_profile: academicProfile } : { email, password }) });
      if (mode === "register" && session.verification_required) {
        router.push(`/verify-email?pending=1&email=${encodeURIComponent(email)}`);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (caught) {
      if (mode === "login" && caught instanceof ApiError && caught.code === "EMAIL_NOT_VERIFIED") {
        router.push(`/verify-email?pending=1&email=${encodeURIComponent(email)}`);
        return;
      }
      setError(caught instanceof Error ? caught.message : "No pudimos iniciar tu sesión.");
      setLoading(false);
    }
  }

  const register = mode === "register";

  return (
    <AuthShell
      eyebrow={register ? "Empieza tu ruta" : "Qué bueno verte"}
      title={register ? "Haz visible lo que sabes hacer." : "Continúa desde donde quedaste."}
      description={register ? "Crea tu cuenta, confirma tu correo y espera la revisión de un administrador antes de entrar a tu ruta." : "Entra a tu espacio y retoma el siguiente movimiento de tu ruta."}
      backHref="/"
      backLabel="Volver al inicio"
    >
      <form onSubmit={submit} className="space-y-5">
        {register ? (
          <>
            <label className="field">
              <span>Nombre completo</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" placeholder="Alex García" required />
            </label>
            <div className="space-y-5 border-t border-twilight/10 pt-5">
              <div>
                <p className="eyebrow text-teal">Tu formación</p>
                <p className="mt-2 text-sm leading-6 text-twilight/55">Registra el grupo y la sede donde finalizas tu formación. LinkedIn y GitHub son opcionales.</p>
              </div>
              <label className="field">
                <span>Año de inicio</span>
                <input type="number" min={1900} max={new Date().getFullYear()} value={startYear} onChange={(event) => setStartYear(event.target.value)} required />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field"><span>Grupo</span><input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Grupo A" required /></label>
                <label className="field"><span>Sede</span><input value={campusName} onChange={(event) => setCampusName(event.target.value)} placeholder="Bucaramanga" required /></label>
              </div>
              <label className="field"><span>LinkedIn <span className="font-normal text-twilight/40">(opcional)</span></span><input type="url" value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} placeholder="https://www.linkedin.com/in/tu-perfil" /></label>
              <label className="field"><span>GitHub <span className="font-normal text-twilight/40">(opcional)</span></span><input type="url" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} placeholder="https://github.com/tu-usuario" /></label>
            </div>
          </>
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
