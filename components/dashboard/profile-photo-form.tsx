"use client";

import { ImageSquare, Trash, UploadSimple } from "@phosphor-icons/react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ProfileAvatar } from "@/components/dashboard/profile-avatar";
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
    <section className="flex flex-col gap-5 border-b border-ink/10 pb-8 sm:flex-row sm:items-center">
      <div className="relative size-24 shrink-0">
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Vista previa de la foto de perfil" className="size-full rounded-full object-cover" />
          </>
        ) : <ProfileAvatar user={avatarUser} className="size-24 text-3xl" />}
        <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-lime text-ink"><ImageSquare size={16} weight="bold" /></span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Foto de perfil</p>
        <p className="mt-1 text-sm leading-6 text-ink/55">Usa una imagen JPG, PNG o WebP de máximo 3 MB. Solo tú podrás verla.</p>
        <form onSubmit={upload} className="mt-4 flex flex-wrap gap-3">
          <label className="button button-ink cursor-pointer">
            <UploadSimple size={17} weight="bold" />
            Elegir imagen
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile} className="sr-only" />
          </label>
          {file && <button type="submit" className="button button-lime" disabled={loading}>{loading ? "Guardando…" : "Guardar foto"}</button>}
          {hasPhoto && <button type="button" className="button button-complete" onClick={remove} disabled={loading}><Trash size={17} weight="bold" />Eliminar</button>}
        </form>
        {file && <p className="mt-2 text-xs text-ink/45">Seleccionada: {file.name}</p>}
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mt-3 text-sm text-ink">{message}</p>}
      </div>
    </section>
  );
}
