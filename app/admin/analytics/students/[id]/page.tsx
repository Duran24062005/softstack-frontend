import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getStudentAnalytics, requireEducator } from "@/lib/server-api";
import { ResetAttemptsButton } from "@/components/admin/reset-attempts-button";

export default async function StudentAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [analytics, session] = await Promise.all([getStudentAnalytics(id), requireEducator()]);
  if (!analytics) notFound();
  return <div className="app-main"><Link href="/admin/analytics" className="back-link"><ArrowLeft size={16} /> Resultados</Link><header className="mt-8 border-b border-twilight/13 pb-8"><p className="eyebrow text-seaweed">Seguimiento individual</p><h1 className="display mt-4 text-4xl tracking-[-.055em] sm:text-6xl lg:text-7xl">{analytics.student_name}</h1><p className="mt-5 max-w-xl leading-7 text-twilight/58">Historial de intentos y competencias que requieren refuerzo.</p></header><section className="mt-10 surface p-6 sm:p-8"><p className="eyebrow text-teal">Intentos</p><div className="mt-5 grid gap-3">{analytics.attempts.length === 0 ? <p className="text-sm text-twilight/55">No hay intentos registrados.</p> : analytics.attempts.map((attempt) => <div key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-twilight/10 bg-canvas px-4 py-3"><span className="text-sm font-semibold">Evaluación {attempt.assessment_id.slice(-6)} · intento {attempt.attempt_number}</span><span className={attempt.passed ? "text-sm font-bold text-seaweed" : "text-sm font-bold text-danger"}>{attempt.score}%</span></div>)}</div>{session.role === "admin" ? <ResetAttemptsButton assessmentIds={[...new Set(analytics.attempts.map((attempt) => attempt.assessment_id))]} /> : null}</section><section className="mt-8 surface p-6 sm:p-8"><p className="eyebrow text-teal">Falencias</p><div className="mt-5 grid gap-3">{analytics.failed_competencies.length === 0 ? <p className="text-sm text-twilight/55">No hay falencias registradas.</p> : analytics.failed_competencies.map((item) => <div key={item.competency} className="flex items-center justify-between rounded-xl border border-twilight/10 bg-canvas px-4 py-3"><span className="text-sm font-semibold">{item.competency}</span><span className="text-sm font-bold text-danger">{item.count} fallos</span></div>)}</div></section></div>;
}
