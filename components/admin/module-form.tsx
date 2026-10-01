"use client";

import { ArrowRight, CircleNotch, Plus } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import type { Module } from "@/lib/types";

export function ModuleForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");
  const [status, setStatus] = useState<Module["status"]>("draft");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (title.trim().length < 3) {
      setError("El título debe tener al menos 3 caracteres.");
      return;
    }
    setSaving(true);
    try {
      await apiFetch<Module>("/admin/modules", { method: "POST", body: JSON.stringify({ title, description, order: Number(order), status }) });
      router.push("/admin/modules");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos crear el módulo.");
      setSaving(false);
    }
  }

  return <form onSubmit={submit} className="rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-9"><div className="flex items-start justify-between gap-5"><div><p className="eyebrow text-cobalt">Nuevo módulo</p><h2 className="display mt-4 text-3xl tracking-[-.05em]">Abre un nuevo frente.</h2><p className="mt-3 max-w-md text-sm leading-6 text-ink/55">Define la categoría que organizará las próximas lecciones de la ruta.</p></div><span className="grid size-11 place-items-center rounded-full bg-lime text-ink"><Plus size={20} weight="bold" /></span></div><div className="mt-8 space-y-5"><label className="field field-dark"><span>Nombre del módulo</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Comunicación estratégica" required minLength={3} maxLength={120} /></label><label className="field field-dark"><span>Descripción</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} maxLength={500} placeholder="Qué aprenderá el estudiante…" /></label><div className="grid gap-5 sm:grid-cols-2"><label className="field field-dark"><span>Orden de aparición</span><input value={order} onChange={(event) => setOrder(event.target.value)} type="number" min={0} /></label><label className="field field-dark"><span>Estado inicial</span><select value={status} onChange={(event) => setStatus(event.target.value as Module["status"])}><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></label></div></div>{error && <p role="alert" className="mt-5 rounded-xl border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<button disabled={saving} className="button button-ink button-large mt-7">{saving ? <CircleNotch className="animate-spin" size={18} /> : <ArrowRight size={18} weight="bold" />}{saving ? "Creando módulo…" : "Crear módulo"}</button></form>;
}
