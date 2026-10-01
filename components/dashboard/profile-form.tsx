"use client";

import { Check, FloppyDisk } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { ProfileUpdateRequest, User } from "@/lib/types";

export function ProfileForm({ user }: { user: User }) {
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (newPassword && !currentPassword) { setError("Necesitas tu contraseña actual para cambiar credenciales."); return; }
    const payload: ProfileUpdateRequest = { full_name: fullName, email: email === user.email ? undefined : email, current_password: currentPassword || undefined, new_password: newPassword || undefined };
    setLoading(true);
    try { await apiFetch<User>("/auth/me", { method: "PATCH", body: JSON.stringify(payload) }); setMessage("Perfil actualizado."); setCurrentPassword(""); setNewPassword(""); } catch (caught) { setError(caught instanceof Error ? caught.message : "No pudimos actualizar tu perfil."); } finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="space-y-7"><div className="grid gap-5 md:grid-cols-2"><label className="field field-dark"><span>Nombre completo</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} /></label><label className="field field-dark"><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /></label></div><div className="border-t border-ink/10 pt-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/45">Cambiar contraseña</p><div className="mt-5 grid gap-5 md:grid-cols-2"><label className="field field-dark"><span>Contraseña actual</span><input value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} type="password" autoComplete="current-password" /></label><label className="field field-dark"><span>Nueva contraseña</span><input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" minLength={8} autoComplete="new-password" /></label></div></div>{error && <p role="alert" className="rounded-xl border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="flex items-center gap-2 rounded-xl border border-lime/40 bg-lime/20 px-4 py-3 text-sm text-ink"><Check weight="bold" />{message}</p>}<button className="button button-ink button-large" disabled={loading}>{loading ? "Guardando…" : "Guardar cambios"}{!loading && <FloppyDisk size={18} weight="bold" />}</button></form>;
}
