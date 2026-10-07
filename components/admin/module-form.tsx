"use client";

/* eslint-disable @next/next/no-img-element */

import { ArrowRight, CircleNotch, ImageSquare, Plus, X } from "@phosphor-icons/react";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { StatusNotice } from "@/components/ui/status-notice";
import { UrlDialog } from "@/components/ui/url-dialog";
import { apiFetch } from "@/lib/api";
import { deleteContentMedia, getMediaKind, importContentMedia, uploadContentMedia } from "@/lib/content-media";
import type { MediaReference, Module } from "@/lib/types";

export function ModuleForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadRef = useRef<MediaReference | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");
  const [status, setStatus] = useState<Module["status"]>("draft");
  const [coverMedia, setCoverMedia] = useState<MediaReference | null>(null);
  const [mediaStatus, setMediaStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);

  function setCover(reference: MediaReference) {
    pendingUploadRef.current = reference;
    setCoverMedia(reference);
    setMediaStatus("Portada cargada en Blob.");
  }

  async function selectCover(file: File) {
    setMediaStatus("Subiendo portada…");
    try {
      setCover(await uploadContentMedia(file, (percentage) => setMediaStatus(`Subiendo portada… ${percentage}%`)));
    } catch (caught) {
      setMediaStatus(caught instanceof Error ? caught.message : "No pudimos cargar la portada.");
    }
  }

  async function importCover(url: string) {
    setMediaStatus("Importando portada…");
    try {
      setCover(await importContentMedia(url));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "No pudimos importar la portada.";
      setMediaStatus(message);
      throw new Error(message);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (title.trim().length < 3) {
      setError("El título debe tener al menos 3 caracteres.");
      return;
    }
    setSaving(true);
    try {
      await apiFetch<Module>("/admin/modules", { method: "POST", body: JSON.stringify({ title, description, order: Number(order), status, cover_media: coverMedia }) });
      pendingUploadRef.current = null;
      router.push("/admin/modules");
      router.refresh();
    } catch (caught) {
      if (pendingUploadRef.current) await deleteContentMedia(pendingUploadRef.current).catch(() => undefined);
      setError(caught instanceof Error ? caught.message : "No pudimos crear el módulo.");
      setSaving(false);
    }
  }

  const coverKind = coverMedia ? getMediaKind(coverMedia.content_type) : null;
  const removeCover = () => {
    const pending = pendingUploadRef.current;
    pendingUploadRef.current = null;
    setCoverMedia(null);
    if (pending) void deleteContentMedia(pending).catch(() => undefined);
  };

  return (
    <>
      <form onSubmit={submit} className="surface p-6 sm:p-9">
        <div className="flex items-start justify-between gap-5 border-b border-twilight/10 pb-7">
          <div><p className="eyebrow text-seaweed">Nueva pieza de ruta</p><h2 className="display mt-4 text-3xl tracking-[-.045em]">Abre un nuevo frente.</h2><p className="mt-3 max-w-md text-sm leading-6 text-twilight/55">Define la categoría que organizará las próximas lecciones de la ruta.</p></div>
          <span className="grid size-11 place-items-center rounded-[35%] bg-gold text-twilight"><Plus size={20} weight="bold" /></span>
        </div>
        <div className="mt-8 space-y-5">
          <label className="field"><span>Nombre del módulo</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Comunicación estratégica" required minLength={3} maxLength={120} /></label>
          <label className="field"><span>Descripción</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} maxLength={500} placeholder="Qué aprenderá el estudiante…" /></label>
          <div className="rounded-xl border border-twilight/12 bg-canvas p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Portada multimedia</p><p className="mt-1 text-xs text-twilight/50">Imagen o video público para presentar el módulo.</p></div><ImageSquare size={22} className="text-teal" /></div>
            {coverMedia ? <div className="relative mt-4 overflow-hidden rounded-xl bg-twilight/5">{coverKind === "video" ? <video src={coverMedia.url} controls preload="metadata" className="max-h-56 w-full object-cover" /> : <img src={coverMedia.url} alt="Vista previa de portada" className="max-h-56 w-full object-cover" />}<button type="button" aria-label="Quitar portada" className="icon-button absolute right-2 top-2 size-8 min-h-8 min-w-8 bg-white/90" onClick={removeCover}><X size={16} /></button></div> : null}
            <input ref={fileInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void selectCover(file); }} />
            <div className="mt-4 flex flex-wrap gap-3"><button type="button" className="button button-secondary" onClick={() => fileInputRef.current?.click()}>Cargar archivo</button><button type="button" className="button button-secondary" onClick={() => setUrlDialogOpen(true)}>Importar URL</button></div>
            {mediaStatus ? <p role="status" className="mt-3 text-xs text-twilight/55">{mediaStatus}</p> : null}
          </div>
          <div className="grid gap-5 sm:grid-cols-2"><label className="field"><span>Orden de aparición</span><input value={order} onChange={(event) => setOrder(event.target.value)} type="number" min={0} /></label><label className="field"><span>Estado inicial</span><select value={status} onChange={(event) => setStatus(event.target.value as Module["status"])}><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></label></div>
        </div>
        {error ? <StatusNotice tone="error" className="mt-5">{error}</StatusNotice> : null}
        <button disabled={saving} className="button button-primary button-large mt-7">{saving ? <CircleNotch className="animate-spin" size={18} /> : <ArrowRight size={18} weight="bold" />}{saving ? "Creando módulo…" : "Crear módulo"}</button>
      </form>
      <UrlDialog open={urlDialogOpen} onClose={() => setUrlDialogOpen(false)} onSubmit={importCover} title="Importar portada" description="Guardaremos una copia pública de la imagen o el video en el almacenamiento de contenido." submitLabel="Importar portada" />
    </>
  );
}
