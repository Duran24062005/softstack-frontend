"use client";

import { Check, CircleNotch } from "@phosphor-icons/react";
import { useState } from "react";

import { apiFetch } from "@/lib/api";

type Person = { id: string; full_name: string; email: string };

export function TrainerAssignmentForm({ students, trainers }: { students: Person[]; trainers: Person[] }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  async function assign(studentId: string) {
    const trainerId = selected[studentId];
    /* c8 ignore next -- the button is disabled until a trainer is selected. */
    if (!trainerId) return;
    setSaving(studentId); setMessage("");
    try { await apiFetch(`/admin/students/${studentId}/trainer`, { method: "POST", body: JSON.stringify({ trainer_id: trainerId }) }); setMessage("Asignación guardada."); }
    catch (caught) { setMessage(caught instanceof Error ? caught.message : "No pudimos guardar la asignación."); }
    finally { setSaving(""); }
  }
  return <div className="surface p-6 sm:p-9"><p className="eyebrow text-seaweed">Asignaciones directas</p><h2 className="display mt-3 text-3xl">Un trainer principal por estudiante.</h2>{trainers.length === 0 ? <p className="mt-6 text-sm text-twilight/55">Primero crea o promueve un trainer desde la API administrativa.</p> : <div className="mt-6 grid gap-3">{students.map((student) => <div key={student.id} className="grid gap-3 rounded-xl border border-twilight/10 bg-canvas p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><span><span className="block text-sm font-semibold">{student.full_name}</span><span className="mt-1 block text-xs text-twilight/50">{student.email}</span></span><select value={selected[student.id] ?? ""} onChange={(event) => setSelected((current) => ({ ...current, [student.id]: event.target.value }))}><option value="">Seleccionar trainer</option>{trainers.map((trainer) => <option key={trainer.id} value={trainer.id}>{trainer.full_name}</option>)}</select><button type="button" className="button button-quiet" disabled={!selected[student.id] || saving === student.id} onClick={() => assign(student.id)}>{saving === student.id ? <CircleNotch className="animate-spin" size={16} /> : <Check size={16} />}Asignar</button></div>)}</div>}{message ? <p role="status" className="mt-4 text-sm text-teal">{message}</p> : null}</div>;
}
