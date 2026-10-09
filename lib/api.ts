import type { ContentApplyResponse, ContentSuggestion, ContentRevision, InstructionalPlan, TiptapDocument, LessonApplySection, ModulePlanSection } from "@/lib/types";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const response = await fetch(`/api/backend${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string; code?: string } | null;
    throw new ApiError(body?.detail ?? "No pudimos completar la solicitud.", response.status, body?.code);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function suggestModuleContent(payload: Record<string, unknown>): Promise<ContentSuggestion> {
  return apiFetch<ContentSuggestion>("/educator/content-suggestions/modules", { method: "POST", body: JSON.stringify(payload) });
}

export async function suggestLessonContent(payload: Record<string, unknown>): Promise<ContentSuggestion> {
  return apiFetch<ContentSuggestion>("/educator/content-suggestions/lessons", { method: "POST", body: JSON.stringify(payload) });
}

export async function applyModuleContent(
  moduleId: string,
  payload: { base_updated_at: string; plan_sections: ModulePlanSection[]; title?: string; description?: string; instructional_plan: InstructionalPlan; lesson_orders?: Array<{ lesson_id: string; order: number }> },
): Promise<ContentApplyResponse> {
  return apiFetch<ContentApplyResponse>(`/educator/content-suggestions/modules/${moduleId}/apply`, { method: "POST", body: JSON.stringify(payload) });
}

export async function applyLessonContent(
  lessonId: string,
  payload: { base_updated_at: string; sections: LessonApplySection[]; title: string; description: string; estimated_minutes: number; instructional_plan: InstructionalPlan; content?: TiptapDocument },
): Promise<ContentApplyResponse> {
  return apiFetch<ContentApplyResponse>(`/educator/content-suggestions/lessons/${lessonId}/apply`, { method: "POST", body: JSON.stringify(payload) });
}

export async function publishContentRevision(revisionId: string): Promise<ContentApplyResponse> {
  return apiFetch<ContentApplyResponse>(`/educator/content-revisions/${revisionId}/publish`, { method: "POST" });
}

export async function discardContentRevision(revisionId: string): Promise<ContentRevision> {
  return apiFetch<ContentRevision>(`/educator/content-revisions/${revisionId}`, { method: "DELETE" });
}
