import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AcademicProfile, AccountStatus, AdminUser, AnalyticsOverview, AnalyticsPeriod, AnalyticsStudent, Assessment, AssessmentAdmin, ContentRevision, Lesson, Module, MyAnalytics, ProgressSummary, StudentAnalytics, User, UserRole } from "@/lib/types";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function serverFetch<T>(path: string, init?: RequestInit): Promise<Response & { json(): Promise<T> }> {
  const cookieHeader = (await cookies()).toString();
  return fetch(`${backendUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(init?.headers ?? {}),
    },
  }) as Promise<Response & { json(): Promise<T> }>;
}

export async function getSession(): Promise<User | null> {
  const response = await serverFetch<User>("/auth/me");
  return response.ok ? response.json() : null;
}

export async function requireSession(): Promise<User> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireSession();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export async function requireEducator(): Promise<User> {
  const user = await requireSession();
  if (user.role !== "admin" && user.role !== "trainer") redirect("/dashboard");
  return user;
}

export async function getLearningData(): Promise<{ modules: Module[]; progress: ProgressSummary }> {
  const [modulesResponse, progressResponse] = await Promise.all([
    serverFetch<Module[]>("/modules"),
    serverFetch<ProgressSummary>("/me/progress"),
  ]);
  return {
    modules: modulesResponse.ok ? await modulesResponse.json() : [],
    progress: progressResponse.ok ? await progressResponse.json() : { completed_lesson_ids: [], completed_count: 0, total_lessons: 0, percentage: 0, completed_module_ids: [], completed_module_count: 0, total_modules: 0, module_percentage: 0 },
  };
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const response = await serverFetch<Lesson>(`/lessons/${id}`);
  return response.ok ? response.json() : null;
}

export async function getAdminModules(): Promise<Module[]> {
  const response = await serverFetch<Module[]>("/admin/modules");
  return response.ok ? response.json() : [];
}

export async function getAdminModule(id: string): Promise<Module | null> {
  const response = await serverFetch<Module>(`/admin/modules/${id}`);
  return response.ok ? response.json() : null;
}

export async function getAdminModuleLessons(id: string): Promise<Lesson[]> {
  const response = await serverFetch<Lesson[]>(`/admin/modules/${id}/lessons`);
  return response.ok ? response.json() : [];
}

export async function getModuleLessons(id: string): Promise<Lesson[]> {
  const response = await serverFetch<Lesson[]>(`/modules/${id}/lessons`);
  return response.ok ? response.json() : [];
}

export async function getAdminLesson(id: string): Promise<Lesson | null> {
  const response = await serverFetch<Lesson>(`/admin/lessons/${id}`);
  return response.ok ? response.json() : null;
}

export async function getLessonAssessment(id: string): Promise<Assessment | null> {
  const response = await serverFetch<Assessment>(`/assessments/lessons/${id}`);
  return response.ok ? response.json() : null;
}

export async function getModuleAssessment(id: string): Promise<Assessment | null> {
  const response = await serverFetch<Assessment>(`/assessments/modules/${id}`);
  return response.ok ? response.json() : null;
}

export async function getEducatorAssessment(id: string): Promise<AssessmentAdmin | null> {
  const response = await serverFetch<AssessmentAdmin>(`/educator/assessments/${id}`);
  return response.ok ? response.json() : null;
}

function analyticsPath(path: string, period: AnalyticsPeriod): string {
  return `${path}?period=${encodeURIComponent(period)}`;
}

export async function getMyAnalytics(period: AnalyticsPeriod = "30d"): Promise<MyAnalytics | null> {
  const response = await serverFetch<MyAnalytics>(analyticsPath("/me/analytics", period));
  return response.ok ? response.json() : null;
}

export async function getAnalyticsOverview(period: AnalyticsPeriod = "30d"): Promise<AnalyticsOverview | null> {
  const response = await serverFetch<AnalyticsOverview>(analyticsPath("/educator/analytics/overview", period));
  return response.ok ? response.json() : null;
}

export async function getAnalyticsStudents(period: AnalyticsPeriod = "30d"): Promise<AnalyticsStudent[]> {
  const response = await serverFetch<AnalyticsStudent[]>(analyticsPath("/educator/analytics/students", period));
  return response.ok ? response.json() : [];
}

export async function getStudentAnalytics(id: string, period: AnalyticsPeriod = "30d"): Promise<StudentAnalytics | null> {
  const response = await serverFetch<StudentAnalytics>(analyticsPath(`/educator/analytics/students/${id}`, period));
  return response.ok ? response.json() : null;
}

export async function getAssessmentSettings(): Promise<{ passing_score: number; max_attempts: number; default_question_count: number }> {
  const response = await serverFetch<{ passing_score: number; max_attempts: number; default_question_count: number }>("/admin/assessment-settings");
  return response.ok ? response.json() : { passing_score: 80, max_attempts: 3, default_question_count: 5 };
}

export async function getAdminStudents(): Promise<Array<{ id: string; full_name: string; email: string }>> {
  const response = await serverFetch<Array<{ id: string; full_name: string; email: string }>>("/admin/students");
  return response.ok ? response.json() : [];
}

export async function getAdminTrainers(): Promise<Array<{ id: string; full_name: string; email: string }>> {
  const response = await serverFetch<Array<{ id: string; full_name: string; email: string }>>("/admin/trainers");
  return response.ok ? response.json() : [];
}

export async function getAdminUsers(filters?: { role?: UserRole; account_status?: AccountStatus }): Promise<AdminUser[]> {
  const params = new URLSearchParams();
  if (filters?.role) params.set("role", filters.role);
  if (filters?.account_status) params.set("account_status", filters.account_status);
  const query = params.toString();
  const response = await serverFetch<AdminUser[]>(`/admin/users${query ? `?${query}` : ""}`);
  return response.ok ? response.json() : [];
}

export async function getMyAcademicProfile(): Promise<AcademicProfile | null> {
  const response = await serverFetch<AcademicProfile | null>("/auth/me/academic-profile");
  return response.ok ? response.json() : null;
}

export async function getAdminStudentAcademicProfile(id: string): Promise<AcademicProfile | null> {
  const response = await serverFetch<AcademicProfile | null>(`/admin/students/${id}/academic-profile`);
  return response.ok ? response.json() : null;
}

export async function getPendingContentRevision(targetType: "module" | "lesson", id: string): Promise<ContentRevision | null> {
  const response = await serverFetch<ContentRevision>(`/educator/content-revisions/${targetType}/${id}`);
  return response.ok ? response.json() : null;
}
