import { upload } from "@vercel/blob/client";

import { apiFetch } from "@/lib/api";
import type { MediaReference } from "@/lib/types";

export const CONTENT_MEDIA_LIMITS = {
  image: 10_000_000,
  video: 100_000_000,
} as const;

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const videoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export type MediaKind = "image" | "video";

export function getMediaKind(contentType: string): MediaKind | null {
  if (imageTypes.has(contentType.toLowerCase())) return "image";
  if (videoTypes.has(contentType.toLowerCase())) return "video";
  return null;
}

function validateFile(file: File): MediaKind {
  const kind = getMediaKind(file.type);
  if (!kind) throw new Error("Solo aceptamos JPEG, PNG, WebP, AVIF, MP4, WebM o MOV.");
  if (file.size > CONTENT_MEDIA_LIMITS[kind]) {
    throw new Error(kind === "image" ? "La imagen supera el límite de 10 MB." : "El video supera el límite de 100 MB.");
  }
  return kind;
}

export async function uploadContentMedia(file: File, onProgress?: (percentage: number) => void): Promise<MediaReference> {
  const kind = validateFile(file);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "media";
  const result = await upload(`content-media/${crypto.randomUUID()}-${safeName}`, file, {
    access: "public",
    contentType: file.type,
    clientPayload: JSON.stringify({ contentType: file.type, kind, size: file.size }),
    multipart: file.size > 5_000_000,
    handleUploadUrl: "/api/content-media/upload",
    onUploadProgress: ({ percentage }) => onProgress?.(percentage),
  });
  return {
    url: result.url,
    pathname: result.pathname,
    content_type: file.type.toLowerCase(),
    size: file.size,
  };
}

export async function importContentMedia(sourceUrl: string, kind?: MediaKind): Promise<MediaReference> {
  return apiFetch<MediaReference>("/admin/content-media/import", {
    method: "POST",
    body: JSON.stringify({ source_url: sourceUrl, ...(kind ? { kind } : {}) }),
  });
}

export async function deleteContentMedia(reference: Pick<MediaReference, "pathname">): Promise<void> {
  await apiFetch<void>("/admin/content-media", {
    method: "DELETE",
    body: JSON.stringify({ pathname: reference.pathname }),
  });
}

export function collectMediaPathnames(value: unknown): Set<string> {
  const pathnames = new Set<string>();
  const visit = (current: unknown) => {
    if (Array.isArray(current)) {
      current.forEach(visit);
      return;
    }
    if (!current || typeof current !== "object") return;
    const record = current as Record<string, unknown>;
    const attrs = record.attrs;
    if ((record.type === "image" || record.type === "video") && attrs && typeof attrs === "object") {
      const pathname = (attrs as Record<string, unknown>).mediaPathname;
      if (typeof pathname === "string") pathnames.add(pathname);
    }
    Object.values(record).forEach(visit);
  };
  visit(value);
  return pathnames;
}
