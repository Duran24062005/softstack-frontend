"use client";

import { ArrowRight, Check, CircleNotch, PencilSimple, Sparkle, X } from "@phosphor-icons/react";
import { useState } from "react";

import { StatusNotice } from "@/components/ui/status-notice";
import { apiFetch } from "@/lib/api";
import type { AssessmentAdmin } from "@/lib/types";

type Target = "lesson" | "module";
type EditableQuestion = AssessmentAdmin["questions"][number];
type QuestionDraft = Pick<EditableQuestion, "prompt" | "options" | "correct_option_id" | "explanation" | "competency" | "difficulty">;

function draftFrom(question: EditableQuestion): QuestionDraft {
  return {
    prompt: question.prompt,
    options: question.options.map((option) => ({ ...option })),
    correct_option_id: question.correct_option_id,
    explanation: question.explanation,
    competency: question.competency,
    difficulty: question.difficulty,
  };
}

export function AssessmentEditor({ target, targetId, initialAssessment }: { target: Target; targetId: string; initialAssessment?: AssessmentAdmin | null }) {
  const [assessment, setAssessment] = useState<AssessmentAdmin | null>(initialAssessment ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<QuestionDraft | null>(null);

  async function prepare() {
    setBusy(true);
    setError("");
    try {
      const created = await apiFetch<AssessmentAdmin>(`/educator/assessments/${target}s/${targetId}`, { method: "POST" });
      setAssessment(created);
      setNotice("Banco de preguntas preparado.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos preparar la evaluación.");
    } finally { setBusy(false); }
  }

  async function generate() {
    /* c8 ignore next -- the action is only rendered after an assessment exists. */
    if (!assessment) return;
    setBusy(true);
    setError("");
    try {
      const questions = await apiFetch<AssessmentAdmin["questions"]>(`/educator/assessments/${assessment.id}/generate-suggestions`, { method: "POST", body: JSON.stringify({ count: Math.max(assessment.question_count, 5) }) });
      setAssessment({ ...assessment, questions: [...assessment.questions, ...questions] });
      setNotice("Sugerencias generadas. Revísalas antes de publicarlas.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos generar sugerencias.");
    } finally { setBusy(false); }
  }

  async function approve(questionId: string) {
    /* c8 ignore next -- approval controls are only rendered with an assessment. */
    if (!assessment) return;
    setBusy(true);
    setError("");
    try {
      const updated = await apiFetch<EditableQuestion>(`/educator/questions/${questionId}/approve`, { method: "POST" });
      setAssessment({
        ...assessment,
        questions: assessment.questions.map((question) => question.id === updated.id ? updated : question),
        approved_question_count: assessment.approved_question_count + 1,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos aprobar la pregunta.");
    } finally { setBusy(false); }
  }

  function beginEdit(question: EditableQuestion) {
    setEditingId(question.id);
    setDraft(draftFrom(question));
    setError("");
    setNotice("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  async function saveQuestion(questionId: string) {
    /* c8 ignore next -- the save action is only rendered with a draft. */
    if (!draft) return;
    /* c8 ignore next -- edit controls are only rendered with an assessment. */
    if (!assessment) return;
    setBusy(true);
    setError("");
    try {
      const updated = await apiFetch<EditableQuestion>(`/educator/questions/${questionId}`, {
        method: "PATCH",
        body: JSON.stringify(draft),
      });
      setAssessment({ ...assessment, questions: assessment.questions.map((question) => question.id === updated.id ? updated : question) });
      setNotice("Pregunta actualizada.");
      cancelEdit();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos actualizar la pregunta.");
    } finally { setBusy(false); }
  }

  async function publish() {
    /* c8 ignore next -- the action is only rendered after an assessment exists. */
    if (!assessment) return;
    setBusy(true);
    setError("");
    try {
      const updated = await apiFetch<AssessmentAdmin>(`/educator/assessments/${assessment.id}`, { method: "PATCH", body: JSON.stringify({ status: "published" }) });
      setAssessment(updated);
      setNotice("Evaluación publicada.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos publicar la evaluación.");
    } finally { setBusy(false); }
  }

  if (!assessment) return <div className="surface p-7"><p className="eyebrow text-seaweed">Evaluación</p><h2 className="display mt-3 text-3xl">Construye el banco de preguntas.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-twilight/55">La evaluación tendrá entre 3 y 5 preguntas y se calificará automáticamente. Puedes preparar el banco ahora y generar sugerencias con IA después.</p><button type="button" onClick={prepare} disabled={busy} className="button button-primary mt-6">{busy ? <CircleNotch className="animate-spin" size={18} /> : <ArrowRight size={18} />}Preparar evaluación</button>{error ? <StatusNotice tone="error" className="mt-4">{error}</StatusNotice> : null}</div>;

  const approved = assessment.questions.filter((question) => question.status === "approved").length;
  return <div className="surface p-6 sm:p-9"><div className="flex flex-col justify-between gap-5 border-b border-twilight/10 pb-6 sm:flex-row sm:items-start"><div><p className="eyebrow text-seaweed">Banco de preguntas · {assessment.target_type}</p><h2 className="display mt-3 text-3xl">Revisa antes de publicar.</h2><p className="mt-3 text-sm leading-6 text-twilight/55">{approved}/{assessment.question_count} preguntas aprobadas · umbral {assessment.passing_score}%.</p></div><div className="flex flex-wrap gap-3"><button type="button" onClick={generate} disabled={busy} className="button button-secondary">{busy ? <CircleNotch className="animate-spin" size={18} /> : <Sparkle size={18} />}Sugerir con IA</button><button type="button" onClick={publish} disabled={busy || approved < assessment.question_count} className="button button-primary"><Check size={18} />Publicar</button></div></div>{notice ? <p role="status" className="mt-4 text-sm text-teal">{notice}</p> : null}{error ? <StatusNotice tone="error" className="mt-4">{error}</StatusNotice> : null}<div className="mt-6 grid gap-4">{assessment.questions.length === 0 ? <div className="empty-state">Todavía no hay sugerencias. Genera un banco para empezar.</div> : assessment.questions.map((question, index) => {
    const isEditing = editingId === question.id && draft !== null;
    return <article key={question.id} className="rounded-xl border border-twilight/10 bg-canvas p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-teal">Pregunta {index + 1} · {isEditing ? "Editando" : question.competency}</p>{isEditing ? <label className="field mt-3 block"><span>Pregunta</span><textarea value={draft.prompt} onChange={(event) => setDraft({ ...draft, prompt: event.target.value })} /></label> : <h3 className="mt-2 font-semibold text-twilight">{question.prompt}</h3>}</div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-twilight/55">{question.status}</span></div>{isEditing ? <div className="mt-4 grid gap-4"><div className="grid gap-3 sm:grid-cols-2">{draft.options.map((option, optionIndex) => <label className="field" key={option.id}><span>Opción {option.id.toUpperCase()}</span><input value={option.text} onChange={(event) => setDraft({ ...draft, options: draft.options.map((item, index) => index === optionIndex ? { ...item, text: event.target.value } : item) })} /></label>)}</div><div className="grid gap-4 sm:grid-cols-3"><label className="field"><span>Respuesta correcta</span><select value={draft.correct_option_id} onChange={(event) => setDraft({ ...draft, correct_option_id: event.target.value })}>{draft.options.map((option) => <option key={option.id} value={option.id}>{option.id.toUpperCase()}</option>)}</select></label><label className="field"><span>Competencia</span><input value={draft.competency} onChange={(event) => setDraft({ ...draft, competency: event.target.value })} /></label><label className="field"><span>Dificultad</span><select value={draft.difficulty} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value })}><option value="basic">Básica</option><option value="intermediate">Intermedia</option><option value="advanced">Avanzada</option></select></label></div><label className="field"><span>Explicación</span><textarea value={draft.explanation} onChange={(event) => setDraft({ ...draft, explanation: event.target.value })} /></label><div className="flex flex-wrap gap-3"><button type="button" onClick={() => saveQuestion(question.id)} disabled={busy} className="button button-primary">{busy ? <CircleNotch className="animate-spin" size={16} /> : <Check size={16} />}Guardar pregunta</button><button type="button" onClick={cancelEdit} disabled={busy} className="button button-quiet"><X size={16} />Cancelar</button></div></div> : <><div className="mt-4 grid gap-2 sm:grid-cols-2">{question.options.map((option) => <div key={option.id} className={`rounded-lg border p-3 text-sm ${option.id === question.correct_option_id ? "border-seaweed bg-seaweed/5" : "border-twilight/10 bg-white"}`}><strong className="mr-2">{option.id.toUpperCase()}.</strong>{option.text}</div>)}</div>{question.explanation ? <p className="mt-3 text-sm leading-6 text-twilight/55">{question.explanation}</p> : null}<div className="flex flex-wrap gap-3">{question.status !== "approved" ? <button type="button" onClick={() => approve(question.id)} disabled={busy} className="button button-quiet mt-4">Aprobar pregunta <Check size={16} /></button> : null}<button type="button" onClick={() => beginEdit(question)} disabled={busy} className="button button-quiet mt-4"><PencilSimple size={16} />Editar pregunta</button></div></>}</article>;
  })}</div></div>;
}
