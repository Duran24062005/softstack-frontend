import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/lib/api";

describe("apiFetch", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("prefixes backend requests and sends JSON credentials by default", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: "user-1" }), { status: 200 }));

    await expect(apiFetch<{ id: string }>("/auth/me")).resolves.toEqual({ id: "user-1" });
    expect(fetchMock).toHaveBeenCalledWith("/api/backend/auth/me", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("preserves custom headers and does not set JSON content type for FormData", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const formData = new FormData();
    formData.append("file", "avatar");

    await apiFetch("/auth/profile-photo", {
      method: "POST",
      body: formData,
      headers: { "X-Upload-Source": "profile" },
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/backend/auth/profile-photo", {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: { "X-Upload-Source": "profile" },
    });
  });

  it("uses the backend detail when a request fails", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ detail: "Sesión expirada." }), { status: 401 }));

    await expect(apiFetch("/auth/me")).rejects.toThrow("Sesión expirada.");
  });

  it("falls back to the generic error for an invalid error body", async () => {
    fetchMock.mockResolvedValue(new Response("not-json", { status: 500 }));

    await expect(apiFetch("/modules")).rejects.toThrow("No pudimos completar la solicitud.");
  });

  it("returns undefined for a successful no-content response", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiFetch<void>("/auth/logout", { method: "POST" })).resolves.toBeUndefined();
  });
});
