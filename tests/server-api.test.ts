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
  getAdminStudents,
  getAdminTrainers,
  getAnalyticsOverview,
  getAnalyticsStudents,
  getAssessmentSettings,
  getEducatorAssessment,
  getLearningData,
  getLesson,
  getLessonAssessment,
  getModuleLessons,
  getModuleAssessment,
  getStudentAnalytics,
  getSession,
  requireAdmin,
  requireEducator,
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

    redirectMock.mockReset();
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ role: "trainer" }), { status: 200 }));
    await expect(requireEducator()).resolves.toEqual({ role: "trainer" });
    expect(redirectMock).not.toHaveBeenCalled();

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ role: "user" }), { status: 200 }));
    await expect(requireEducator()).resolves.toEqual({ role: "user" });
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");

    redirectMock.mockReset();
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ role: "admin" }), { status: 200 }));
    await expect(requireAdmin()).resolves.toEqual({ role: "admin" });
    expect(redirectMock).not.toHaveBeenCalled();

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ role: "admin" }), { status: 200 }));
    await expect(requireEducator()).resolves.toEqual({ role: "admin" });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("uses successful learning fallbacks and covers every resource error branch", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ completed_count: 1 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }));

    await expect(getLearningData()).resolves.toEqual({
      modules: [],
      progress: { completed_count: 1 },
    });
    await expect(getLesson("lesson-404")).resolves.toBeNull();
    await expect(getAdminModules()).resolves.toEqual([]);
    await expect(getAdminModule("module-404")).resolves.toBeNull();
    await expect(getAdminModuleLessons("module-404")).resolves.toEqual([]);
    await expect(getModuleLessons("module-404")).resolves.toEqual([]);
    await expect(getAdminLesson("lesson-404")).resolves.toBeNull();
    await expect(getLessonAssessment("lesson-404")).resolves.toBeNull();
    await expect(getModuleAssessment("module-404")).resolves.toBeNull();
    await expect(getEducatorAssessment("assessment-404")).resolves.toBeNull();
  });

  it("forwards empty cookies and returns assessment, analytics and admin fallbacks", async () => {
    cookiesMock.mockResolvedValue({ toString: () => "" });
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "lesson-assessment" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "educator-assessment" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ students: 2 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ student_id: "student-1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "student-1" }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }));

    await expect(getLessonAssessment("lesson-1")).resolves.toEqual({ id: "lesson-assessment" });
    await expect(getModuleAssessment("module-1")).resolves.toBeNull();
    await expect(getEducatorAssessment("assessment-1")).resolves.toEqual({ id: "educator-assessment" });
    await expect(getAnalyticsOverview()).resolves.toEqual({ students: 2 });
    await expect(getAnalyticsStudents()).resolves.toEqual([]);
    await expect(getStudentAnalytics("student-1")).resolves.toEqual({ student_id: "student-1" });
    await expect(getAssessmentSettings()).resolves.toEqual({ passing_score: 80, max_attempts: 3, default_question_count: 5 });
    await expect(getAdminStudents()).resolves.toEqual([{ id: "student-1" }]);
    await expect(getAdminTrainers()).resolves.toEqual([]);
  });

  it("returns successful analytics and administration resources", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "module-1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "module-assessment" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ students: 0, assigned_students: 0, attempts: 0, average_score: 0, failed_competencies: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "student-1" }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ passing_score: 90, max_attempts: 3, default_question_count: 4 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "trainer-1" }]), { status: 200 }));

    await expect(getAdminModule("module-1")).resolves.toEqual({ id: "module-1" });
    await expect(getModuleAssessment("module-1")).resolves.toEqual({ id: "module-assessment" });
    await expect(getAnalyticsOverview()).resolves.toEqual({ students: 0, assigned_students: 0, attempts: 0, average_score: 0, failed_competencies: [] });
    await expect(getAnalyticsStudents()).resolves.toEqual([{ id: "student-1" }]);
    await expect(getStudentAnalytics("student-1")).resolves.toBeNull();
    await expect(getAssessmentSettings()).resolves.toEqual({ passing_score: 90, max_attempts: 3, default_question_count: 4 });
    await expect(getAdminStudents()).resolves.toEqual([]);
    await expect(getAdminTrainers()).resolves.toEqual([{ id: "trainer-1" }]);
  });

  it("combines learning data and uses empty fallbacks for failed responses", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "module-1" }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }));

    await expect(getLearningData()).resolves.toEqual({
      modules: [{ id: "module-1" }],
      progress: { completed_lesson_ids: [], completed_count: 0, total_lessons: 0, percentage: 0, completed_module_ids: [], completed_module_count: 0, total_modules: 0, module_percentage: 0 },
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
