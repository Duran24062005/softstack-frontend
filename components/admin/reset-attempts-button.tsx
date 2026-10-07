"use client";

import { ArrowClockwise, CircleNotch } from "@phosphor-icons/react";
import { useState } from "react";

import { apiFetch } from "@/lib/api";

export function ResetAttemptsButton({ assessmentIds }: { assessmentIds: string[] }) {
  const [assessmentId, setAssessmentId] = useState(assessmentIds[0] ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function reset() {
    /* c8 ignore next -- the button is disabled while no assessment is selected. */
    if (!assessmentId) return;
    setBusy(true); setMessage("");
    try { await apiFetch(`/admin/assessments/${assessmentId}/students/${(window.location.pathname.split("/").pop() ?? "")}/reset?reason=${encodeURIComponent("Reinicio administrativo solicitado desde seguimiento")}`, { method: "POST" }); setMessage("Ciclo reiniciado; el historial anterior se conserva."); }
    catch (caught) { setMessage(caught instanceof Error ? caught.message : "No pudimos reiniciar los intentos."); }
    finally { setBusy(false); }
  }
  return <div className="mt-6 border-t border-twilight/10 pt-6"><p className="text-sm font-semibold">Reiniciar intentos</p><div className="mt-3 flex flex-wrap gap-3"><select value={assessmentId} onChange={(event) => setAssessmentId(event.target.value)}><option value="">Seleccionar evaluación</option>{assessmentIds.map((id) => <option key={id} value={id}>Evaluación {id.slice(-6)}</option>)}</select><button type="button" onClick={reset} disabled={busy || !assessmentId} className="button button-secondary">{busy ? <CircleNotch className="animate-spin" size={16} /> : <ArrowClockwise size={16} />}Reiniciar ciclo</button></div>{message ? <p role="status" className="mt-3 text-sm text-teal">{message}</p> : null}</div>;
}
