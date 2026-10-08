"use client";

import { CircleNotch, FloppyDisk } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";

import { apiFetch } from "@/lib/api";
import { parseOptionalProfileUrl } from "@/lib/ui-validation";
import type { AcademicProfile, AcademicProfileInput } from "@/lib/types";
import { StatusNotice } from "@/components/ui/status-notice";

const currentYear = new Date().getFullYear();

export function AcademicProfileForm({
  endpoint,
  initialProfile,
  title = "Perfil académico",
  description = "Completa los datos que identifican tu formación en Campuslands.",
}: {
  endpoint: string;
  initialProfile: AcademicProfile | null;
  title?: string;
  description?: string;
}) {
  const [startYear, setStartYear] = useState(String(initialProfile?.start_year ?? currentYear));
  const [groupName, setGroupName] = useState(initialProfile?.group_name ?? "");
  const [campusName, setCampusName] = useState(initialProfile?.campus_name ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile?.linkedin_url ?? "");
  const [githubUrl, setGithubUrl] = useState(initialProfile?.github_url ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const parsedYear = Number(startYear);
    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > currentYear) {
      setError(`El año de inicio debe estar entre 1900 y ${currentYear}.`);
      return;
    }
    if (!groupName.trim() || !campusName.trim()) {
      setError("Completa tu grupo y sede de formación.");
      return;
    }

    let parsedLinkedin: string | null;
    let parsedGithub: string | null;
    try {
      parsedLinkedin = parseOptionalProfileUrl(linkedinUrl, "linkedin");
      parsedGithub = parseOptionalProfileUrl(githubUrl, "github");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Revisa los enlaces de tus perfiles.");
      return;
    }

    const payload: AcademicProfileInput = {
      start_year: parsedYear,
      group_name: groupName.trim(),
      campus_name: campusName.trim(),
      linkedin_url: parsedLinkedin,
      github_url: parsedGithub,
    };

    setLoading(true);
    try {
      const saved = await apiFetch<AcademicProfile>(endpoint, { method: "PUT", body: JSON.stringify(payload) });
      setStartYear(String(saved.start_year));
      setGroupName(saved.group_name);
      setCampusName(saved.campus_name);
      setLinkedinUrl(saved.linkedin_url ?? "");
      setGithubUrl(saved.github_url ?? "");
      setMessage("Perfil académico actualizado.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos guardar tu trayectoria académica.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border-t border-twilight/10 pt-8">
      <div>
        <p className="eyebrow text-teal">Información académica</p>
        <h2 className="display mt-3 text-3xl tracking-[-.04em]">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-twilight/55">{description}</p>
      </div>
      <form onSubmit={submit} className="mt-7 space-y-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field">
            <span>Año de inicio</span>
            <input type="number" min={1900} max={currentYear} value={startYear} onChange={(event) => setStartYear(event.target.value)} required />
          </label>
          <label className="field">
            <span>Grupo</span>
            <input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Grupo A" required />
          </label>
          <label className="field">
            <span>Sede</span>
            <input value={campusName} onChange={(event) => setCampusName(event.target.value)} placeholder="Bucaramanga" required />
          </label>
          <label className="field">
            <span>LinkedIn <span className="font-normal text-twilight/40">(opcional)</span></span>
            <input type="url" value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} placeholder="https://www.linkedin.com/in/tu-perfil" />
          </label>
          <label className="field">
            <span>GitHub <span className="font-normal text-twilight/40">(opcional)</span></span>
            <input type="url" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} placeholder="https://github.com/tu-usuario" />
          </label>
        </div>

        {error ? <StatusNotice tone="error">{error}</StatusNotice> : null}
        {message ? <StatusNotice tone="success">{message}</StatusNotice> : null}
        <button className="button button-primary button-large" disabled={loading}>
          {loading ? <CircleNotch className="animate-spin" size={18} /> : <FloppyDisk size={18} weight="bold" />}
          {loading ? "Guardando…" : "Guardar perfil"}
        </button>
      </form>
    </section>
  );
}
