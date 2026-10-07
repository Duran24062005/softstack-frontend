"use client";

import { Check, CircleNotch } from "@phosphor-icons/react";
import { useState } from "react";

import { apiFetch } from "@/lib/api";

export function AssessmentSettingsForm({ initial }: { initial: { passing_score: number; max_attempts: number; default_question_count: number } }) {
  const [passingScore, setPassingScore] = useState(String(initial.passing_score));
  const [questionCount, setQuestionCount] = useState(String(initial.default_question_count));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function save() {
    setSaving(true); setMessage(""); setError("");
    try {
      await apiFetch("/admin/assessment-settings", { method: "PATCH", body: JSON.stringify({ passing_score: Number(passingScore), default_question_count: Number(questionCount) }) });
      setMessage("Configuración actualizada.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "No pudimos guardar la configuración."); }
    finally { setSaving(false); }
  }
  return <div className="surface max-w-2xl p-6 sm:p-9"><p className="eyebrow text-seaweed">Reglas globales</p><h2 className="display mt-3 text-3xl">Configura la evaluación.</h2><div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="field"><span>Porcentaje mínimo</span><input type="number" min={1} max={100} value={passingScore} onChange={(event) => setPassingScore(event.target.value)} /></label><label className="field"><span>Preguntas por quiz</span><select value={questionCount} onChange={(event) => setQuestionCount(event.target.value)}><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></label></div><p className="mt-4 text-sm text-twilight/50">Los intentos máximos son siempre {initial.max_attempts} por ciclo. Los cambios de umbral aplican globalmente.</p>{message ? <p role="status" className="mt-4 text-sm text-teal">{message}</p> : null}{error ? <p role="alert" className="mt-4 text-sm text-danger">{error}</p> : null}<button type="button" onClick={save} disabled={saving} className="button button-primary mt-6">{saving ? <CircleNotch className="animate-spin" size={18} /> : <Check size={18} />}Guardar configuración</button></div>;
}
