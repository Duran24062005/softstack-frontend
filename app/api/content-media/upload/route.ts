import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/server-api";

const allowedContentTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm", "video/quicktime"];

export async function POST(request: Request) {
  const sessionResponse = await serverFetch<{ role?: string; id?: string }>("/auth/me");
  if (!sessionResponse.ok) return NextResponse.json({ detail: "La sesión administrativa es necesaria." }, { status: 401 });
  const session = await sessionResponse.json();
  if (session.role !== "admin") return NextResponse.json({ detail: "Solo los administradores pueden cargar medios." }, { status: 403 });
  if (!process.env.CONTENT_BLOB_READ_WRITE_TOKEN) return NextResponse.json({ detail: "El almacenamiento de contenido no está configurado." }, { status: 503 });

  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      token: process.env.CONTENT_BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!pathname.startsWith("content-media/")) throw new Error("Invalid content media pathname");
        const payload = clientPayload ? JSON.parse(clientPayload) as { contentType?: string; kind?: string; size?: number } : {};
        const contentType = payload.contentType?.toLowerCase();
        const maximumSizeInBytes = payload.kind === "image" ? 10_000_000 : 100_000_000;
        const expectedKind = contentType?.startsWith("image/") ? "image" : contentType?.startsWith("video/") ? "video" : null;
        if (!contentType || !allowedContentTypes.includes(contentType) || expectedKind !== payload.kind || typeof payload.size !== "number" || payload.size < 1 || payload.size > maximumSizeInBytes) {
          throw new Error("Invalid content media metadata");
        }
        return {
          allowedContentTypes: [contentType],
          maximumSizeInBytes,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({ userId: session.id ?? "admin" }),
        };
      },
    });
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ detail: "No pudimos preparar la carga del medio." }, { status: 400 });
  }
}
