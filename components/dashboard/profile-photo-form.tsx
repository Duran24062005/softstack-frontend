"use client";

import { ImageSquare, Trash, UploadSimple } from "@phosphor-icons/react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ProfileAvatar } from "@/components/dashboard/profile-avatar";
import { StatusNotice } from "@/components/ui/status-notice";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

const MAX_FILE_SIZE = 3_000_000;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function ProfilePhotoForm({ user }: { user: User }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [hasPhoto, setHasPhoto] = useState(user.has_profile_photo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError("");
    setMessage("");
    if (!selected) {
      setFile(null);
      setPreview("");
      return;
    }
    if (!ACCEPTED_TYPES.has(selected.type)) {
      setFile(null);
      setPreview("");
      setError("Selecciona una imagen JPG, PNG o WebP.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFile(null);
      setPreview("");
      setError("La imagen debe pesar máximo 3 MB.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function upload(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!file) {
      setError("Selecciona una imagen antes de guardar.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      const updated = await apiFetch<User>("/auth/me/profile-photo", { method: "POST", body: formData });
      setHasPhoto(updated.has_profile_photo);
      setFile(null);
      setPreview("");
      setMessage("Foto de perfil actualizada.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos guardar la foto.");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const updated = await apiFetch<User>("/auth/me/profile-photo", { method: "DELETE" });
      setHasPhoto(updated.has_profile_photo);
      setFile(null);
      setPreview("");
      setMessage("Foto de perfil eliminada.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos eliminar la foto.");
    } finally {
      setLoading(false);
    }
  }

  const avatarUser = { ...user, has_profile_photo: hasPhoto };

  return (
    <section className="flex flex-col gap-5 border-b border-twilight/10 pb-8 sm:flex-row sm:items-center">
      <div className="relative size-24 shrink-0">
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Vista previa de la foto de perfil" className="size-full rounded-[32%] object-cover" />
          </>
        ) : <ProfileAvatar user={avatarUser} className="size-24 text-3xl" />}
        <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-[35%] bg-gold text-twilight"><ImageSquare size={16} weight="bold" /></span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Foto de perfil</p>
        <p className="mt-1 text-sm leading-6 text-twilight/55">Usa una imagen JPG, PNG o WebP de máximo 3 MB. Solo tú podrás verla.</p>
        <form onSubmit={upload} className="mt-4 flex flex-wrap gap-3">
          <label className="button button-primary cursor-pointer">
            <UploadSimple size={17} weight="bold" />
            Elegir imagen
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile} className="sr-only" />
          </label>
          {file && <button type="submit" className="button button-accent" disabled={loading}>{loading ? "Guardando…" : "Guardar foto"}</button>}
          {hasPhoto && <button type="button" className="button button-danger" onClick={remove} disabled={loading}><Trash size={17} weight="bold" />Eliminar</button>}
        </form>
        {file && <p className="mt-2 text-xs text-twilight/45">Seleccionada: {file.name}</p>}
        {error && <StatusNotice tone="error" className="mt-3">{error}</StatusNotice>}
        {message && <StatusNotice tone="success" className="mt-3">{message}</StatusNotice>}
      </div>
    </section>
  );
}
