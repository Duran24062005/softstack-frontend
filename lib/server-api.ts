import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AccountStatus, AdminUser, Assessment, AssessmentAdmin, Lesson, Module, ProgressSummary, User, UserRole } from "@/lib/types";

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

export async function getAnalyticsOverview(): Promise<{ students: number; assigned_students: number; attempts: number; average_score: number; failed_competencies: Array<{ competency: string; count: number }> }> {
  const response = await serverFetch<{ students: number; assigned_students: number; attempts: number; average_score: number; failed_competencies: Array<{ competency: string; count: number }> }>("/educator/analytics/overview");
  return response.ok ? response.json() : { students: 0, assigned_students: 0, attempts: 0, average_score: 0, failed_competencies: [] };
}

export async function getAnalyticsStudents(): Promise<Array<{ id: string; full_name: string; email: string; attempts: number; average_score: number; trainer_id: string | null }>> {
  const response = await serverFetch<Array<{ id: string; full_name: string; email: string; attempts: number; average_score: number; trainer_id: string | null }>>("/educator/analytics/students");
  return response.ok ? response.json() : [];
}

export async function getStudentAnalytics(id: string): Promise<{ student_id: string; student_name: string; trainer_id: string | null; attempts: Array<{ id: string; assessment_id: string; attempt_number: number; cycle: number; score: number; passed: boolean; submitted_at: string }>; failed_competencies: Array<{ competency: string; count: number }> } | null> {
  const response = await serverFetch(`/educator/analytics/students/${id}`);
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
