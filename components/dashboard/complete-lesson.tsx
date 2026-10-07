"use client";

import { Check, CircleNotch } from "@phosphor-icons/react";
import { useState } from "react";

import { apiFetch } from "@/lib/api";
import type { ProgressSummary } from "@/lib/types";

export function CompleteLesson({ lessonId, completed }: { lessonId: string; completed: boolean }) {
  const [done, setDone] = useState(completed);
  const [loading, setLoading] = useState(false);
  async function complete() {
    setLoading(true);
    try { await apiFetch<ProgressSummary>(`/lessons/${lessonId}/complete`, { method: "POST" }); setDone(true); } finally { setLoading(false); }
  }
  return <button onClick={complete} disabled={done || loading} className={`button button-large ${done ? "button-complete" : "button-accent"}`}>{loading ? <CircleNotch className="animate-spin" size={18} /> : <Check weight="bold" size={18} />}{done ? "Lección completada" : "Marcar como completada"}</button>;
}
