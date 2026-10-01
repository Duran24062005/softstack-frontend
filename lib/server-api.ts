import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { Lesson, Module, ProgressSummary, User } from "@/lib/types";

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

export async function getLearningData(): Promise<{ modules: Module[]; progress: ProgressSummary }> {
  const [modulesResponse, progressResponse] = await Promise.all([
    serverFetch<Module[]>("/modules"),
    serverFetch<ProgressSummary>("/me/progress"),
  ]);
  return {
    modules: modulesResponse.ok ? await modulesResponse.json() : [],
    progress: progressResponse.ok ? await progressResponse.json() : { completed_lesson_ids: [], completed_count: 0, total_lessons: 0, percentage: 0 },
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
