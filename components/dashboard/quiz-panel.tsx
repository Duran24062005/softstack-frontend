"use client";

import { ArrowRight, CheckCircle, CircleNotch, LockKey, XCircle } from "@phosphor-icons/react";
import { useState } from "react";

import { apiFetch } from "@/lib/api";
import type { Assessment, Attempt, AttemptResult } from "@/lib/types";

export function QuizPanel({ assessment }: { assessment: Assessment | null }) {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!assessment) {
    return <div className="rounded-2xl border border-twilight/10 bg-white p-6 text-sm text-twilight/55">Esta evaluación todavía no está disponible.</div>;
  }

  const activeAssessment = assessment;

  async function start() {
    setLoading(true);
    setError("");
    try {
      const nextAttempt = await apiFetch<Attempt>(`/assessments/${activeAssessment.id}/attempts`, { method: "POST" });
      setAttempt(nextAttempt);
      setResult(null);
      setAnswers({});
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos iniciar la evaluación.");
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    /* c8 ignore next -- the submit button is disabled until every answer exists. */
    if (!attempt || Object.keys(answers).length !== attempt.questions.length) return;
    setLoading(true);
    setError("");
    try {
      const nextResult = await apiFetch<AttemptResult>(`/attempts/${attempt.id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers: attempt.questions.map((question) => ({ question_id: question.id, selected_option_id: answers[question.id] })) }),
      });
      setResult(nextResult);
      setAttempt(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos calificar la evaluación.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return <section className="mt-8 rounded-[1.35rem] border border-twilight/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
        {result.passed ? <CheckCircle size={28} weight="fill" className="text-seaweed" /> : <XCircle size={28} weight="fill" className="text-danger" />}
        <div><p className="eyebrow text-teal">Resultado del intento {result.attempt_number}</p><h2 className="display mt-2 text-3xl">{result.passed ? "Dominio demostrado." : "Todavía hay espacio para reforzar."}</h2><p className="mt-3 text-sm leading-6 text-twilight/58">Obtuviste <strong>{result.score}%</strong>. Umbral de aprobación: {assessment.passing_score}%. Te quedan {result.attempts_remaining} intentos.</p></div>
      </div>
      <div className="mt-6 grid gap-3">{result.question_results.map((question, index) => <div key={question.question_id} className="rounded-xl border border-twilight/10 bg-canvas p-4"><p className="text-sm font-semibold">{index + 1}. {question.is_correct ? "Respuesta correcta" : `Refuerzo: ${question.competency}`}</p><p className="mt-2 text-sm leading-6 text-twilight/58">{question.explanation || "Revisa nuevamente el contenido de esta competencia."}</p></div>)}</div>
      {!result.passed && result.attempts_remaining > 0 ? <button type="button" onClick={start} className="button button-primary mt-6" disabled={loading}>{loading ? <CircleNotch className="animate-spin" size={18} /> : <ArrowRight size={18} />}{loading ? "Cargando…" : "Intentar de nuevo"}</button> : null}
    </section>;
  }

  if (attempt) {
    const answered = Object.keys(answers).length;
    return <section className="mt-8 rounded-[1.35rem] border border-twilight/10 bg-white p-6 sm:p-8"><div className="flex items-end justify-between gap-4 border-b border-twilight/10 pb-5"><div><p className="eyebrow text-teal">Evaluación activa</p><h2 className="display mt-2 text-3xl">Comprueba lo que aprendiste.</h2></div><span className="text-sm text-twilight/50">{answered}/{attempt.questions.length}</span></div><div className="mt-6 grid gap-7">{attempt.questions.map((question, index) => <fieldset key={question.id} className="rounded-xl border border-twilight/10 p-5"><legend className="px-2 text-sm font-semibold text-twilight">{index + 1}. {question.prompt}</legend><div className="mt-3 grid gap-2">{question.options.map((option) => <label key={option.id} className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm transition ${answers[question.id] === option.id ? "border-seaweed bg-seaweed/5" : "border-twilight/10 hover:border-seaweed/40"}`}><input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} /><span>{option.text}</span></label>)}</div></fieldset>)}</div>{error ? <p role="alert" className="mt-4 text-sm text-danger">{error}</p> : null}<button type="button" onClick={submit} disabled={loading || answered !== attempt.questions.length} className="button button-primary button-large mt-7">{loading ? <CircleNotch className="animate-spin" size={18} /> : <CheckCircle size={18} />}{loading ? "Calificando…" : "Enviar respuestas"}</button></section>;
  }

  return <section className="mt-8 rounded-[1.35rem] border border-twilight/10 bg-white p-6 sm:p-8"><div className="flex items-start gap-4">{assessment.locked ? <LockKey size={27} className="text-twilight/40" /> : <CheckCircle size={27} className="text-teal" />}<div><p className="eyebrow text-teal">{assessment.target_type === "module" ? "Evaluación final" : "Comprobación de aprendizaje"}</p><h2 className="display mt-2 text-3xl">{assessment.locked ? "Evaluación bloqueada." : assessment.passed ? "Evaluación aprobada." : "Es momento de comprobarlo."}</h2><p className="mt-3 text-sm leading-6 text-twilight/58">{assessment.lock_reason ?? `${assessment.question_count} preguntas · ${assessment.passing_score}% para aprobar · ${assessment.attempts_remaining} intentos disponibles.`}</p></div></div>{error ? <p role="alert" className="mt-4 text-sm text-danger">{error}</p> : null}{!assessment.locked && !assessment.passed && assessment.attempts_remaining > 0 ? <button type="button" onClick={start} disabled={loading} className="button button-accent button-large mt-6">{loading ? <CircleNotch className="animate-spin" size={18} /> : <ArrowRight size={18} />}{loading ? "Iniciando…" : "Iniciar evaluación"}</button> : null}</section>;
}
