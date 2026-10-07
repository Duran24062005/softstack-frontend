import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock, redirectMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import {
  getAdminLesson,
  getAdminModule,
  getAdminModuleLessons,
  getAdminModules,
  getLearningData,
  getLesson,
  getModuleLessons,
  getSession,
  requireAdmin,
  requireSession,
  serverFetch,
} from "@/lib/server-api";

describe("server API helpers", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    cookiesMock.mockResolvedValue({ toString: () => "session=abc" });
    redirectMock.mockReset();
    fetchMock.mockReset();
  });

  it("forwards the session cookie and disables server response caching", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await serverFetch("/modules", { method: "POST", headers: { "X-Trace": "test" } });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/modules", {
      method: "POST",
      cache: "no-store",
      headers: { Cookie: "session=abc", "X-Trace": "test" },
    });
  });

  it("returns the authenticated session and treats an unauthorized response as empty", async () => {
    const user = { id: "user-1", role: "user" };
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(user), { status: 200 }));
    await expect(getSession()).resolves.toEqual(user);

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    await expect(getSession()).resolves.toBeNull();
  });

  it("redirects anonymous users and non-admin users to their allowed routes", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    await expect(requireSession()).resolves.toBeNull();
    expect(redirectMock).toHaveBeenCalledWith("/login");

    redirectMock.mockReset();
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ role: "user" }), { status: 200 }));
    await expect(requireAdmin()).resolves.toEqual({ role: "user" });
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("combines learning data and uses empty fallbacks for failed responses", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "module-1" }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }));

    await expect(getLearningData()).resolves.toEqual({
      modules: [{ id: "module-1" }],
      progress: { completed_lesson_ids: [], completed_count: 0, total_lessons: 0, percentage: 0 },
    });
  });

  it("returns resources only when their server responses succeed", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "lesson-1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "module-1" }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "lesson-1" }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "lesson-1" }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "lesson-1" }), { status: 200 }));

    await expect(getLesson("lesson-1")).resolves.toEqual({ id: "lesson-1" });
    await expect(getAdminModule("module-404")).resolves.toBeNull();
    await expect(getAdminModules()).resolves.toEqual([{ id: "module-1" }]);
    await expect(getAdminModuleLessons("module-1")).resolves.toEqual([{ id: "lesson-1" }]);
    await expect(getAdminLesson("lesson-404")).resolves.toBeNull();
    await expect(getModuleLessons("module-1")).resolves.toEqual([{ id: "lesson-1" }]);
    await expect(getAdminLesson("lesson-1")).resolves.toEqual({ id: "lesson-1" });
  });
});
