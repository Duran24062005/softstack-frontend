"use client";

import { Check, CircleNotch, UserPlus } from "@phosphor-icons/react";
import { useState } from "react";

import { apiFetch } from "@/lib/api";

type Person = { id: string; full_name: string; email: string };

export function TrainerManagementForm({ candidates }: { candidates: Person[] }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function invite() {
    setBusy("invite");
    setMessage("");
    try {
      await apiFetch("/admin/trainers/invitations", { method: "POST", body: JSON.stringify({ full_name: fullName, email, password }) });
      setMessage("Invitación de trainer creada.");
      setFullName(""); setEmail(""); setPassword("");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "No pudimos crear la invitación.");
    } finally { setBusy(""); }
  }

  async function promote(userId: string) {
    setBusy(userId);
    setMessage("");
    try {
      await apiFetch(`/admin/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role: "trainer" }) });
      setMessage("Usuario promovido a trainer.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "No pudimos promover el usuario.");
    } finally { setBusy(""); }
  }

  return <div className="surface mt-8 p-6 sm:p-9"><p className="eyebrow text-seaweed">Gestión de trainers</p><h2 className="display mt-3 text-3xl">Invita o promueve acompañantes.</h2><div className="mt-6 grid gap-4 sm:grid-cols-3"><label className="field"><span>Nombre completo</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} /></label><label className="field"><span>Correo</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="field"><span>Contraseña temporal</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label></div><button type="button" onClick={invite} disabled={busy !== "" || !fullName || !email || password.length < 8} className="button button-primary mt-5">{busy === "invite" ? <CircleNotch className="animate-spin" size={16} /> : <UserPlus size={16} />}Enviar invitación</button>{candidates.length > 0 ? <div className="mt-8 border-t border-twilight/10 pt-6"><p className="text-sm font-semibold">Usuarios disponibles para promoción</p><div className="mt-3 grid gap-3">{candidates.map((candidate) => <div key={candidate.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-twilight/10 bg-canvas p-4"><span><span className="block text-sm font-semibold">{candidate.full_name}</span><span className="mt-1 block text-xs text-twilight/50">{candidate.email}</span></span><button type="button" onClick={() => promote(candidate.id)} disabled={busy !== ""} className="button button-quiet">{busy === candidate.id ? <CircleNotch className="animate-spin" size={16} /> : <Check size={16} />}Promover</button></div>)}</div></div> : null}{message ? <p role="status" className="mt-4 text-sm text-teal">{message}</p> : null}</div>;
}
