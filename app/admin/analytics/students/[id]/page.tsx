import { ArrowLeft, ChartBar, Pulse, TrendUp } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnalyticsChartCard } from "@/components/analytics/analytics-chart-card";
import { AnalyticsPeriodSelector } from "@/components/analytics/analytics-period-selector";
import { ResetAttemptsButton } from "@/components/admin/reset-attempts-button";
import { normalizeAnalyticsPeriod } from "@/lib/analytics";
import { getStudentAnalytics, requireEducator } from "@/lib/server-api";

export default async function StudentAnalyticsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ period?: string }> }) {
  const [{ id }, { period: requestedPeriod }] = await Promise.all([params, searchParams]);
  const period = normalizeAnalyticsPeriod(requestedPeriod);
  const [analytics, session] = await Promise.all([getStudentAnalytics(id, period), requireEducator()]);
  if (!analytics) notFound();

  return (
    <div className="app-main">
      <Link href={`/admin/analytics?period=${period}`} className="back-link"><ArrowLeft size={16} /> Resultados</Link>
      <header className="mt-8 border-b border-twilight/13 pb-8">
        <p className="eyebrow text-seaweed">Seguimiento individual</p>
        <h1 className="display mt-4 text-4xl tracking-[-.055em] sm:text-6xl lg:text-7xl">{analytics.student_name}</h1>
        <p className="mt-5 max-w-xl leading-7 text-twilight/58">Historial de intentos y competencias que requieren refuerzo.</p>
      </header>

      <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><p className="text-sm font-semibold text-twilight">Período visible</p><p className="mt-1 text-xs text-twilight/50">El detalle y sus tendencias usan el mismo rango.</p></div>
        <AnalyticsPeriodSelector pathname={`/admin/analytics/students/${id}`} period={period} />
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <article className="surface p-6"><TrendUp size={22} className="text-seaweed" /><p className="metric-number mt-5 text-3xl font-bold">{analytics.snapshot.percentage}%</p><p className="mt-1 text-sm text-twilight/52">Avance actual</p></article>
        <article className="surface p-6"><ChartBar size={22} className="text-teal" /><p className="metric-number mt-5 text-3xl font-bold">{analytics.average_score}%</p><p className="mt-1 text-sm text-twilight/52">Promedio del período</p></article>
        <article className="surface p-6"><Pulse size={22} className="text-gold" /><p className="metric-number mt-5 text-3xl font-bold">{analytics.active_students ? "Sí" : "No"}</p><p className="mt-1 text-sm text-twilight/52">Actividad registrada</p></article>
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-2">
        <AnalyticsChartCard
          title="Avance acumulado"
          description={`${analytics.snapshot.completed_lessons} de ${analytics.snapshot.total_lessons} lecciones publicadas completadas.`}
          ariaLabel={`Avance acumulado de ${analytics.student_name} por fecha`}
          format="percent"
          series={[{ id: "progress", label: "Avance", color: "#00AA80", kind: "area", data: analytics.progress_series, topColor: "rgba(0, 170, 128, .32)", bottomColor: "rgba(0, 170, 128, .04)" }]}
        />
        <AnalyticsChartCard
          title="Mejora en evaluaciones"
          description={`${analytics.attempts.length} intentos enviados en el período seleccionado.`}
          ariaLabel={`Calificaciones de ${analytics.student_name} por fecha`}
          format="percent"
          series={[{ id: "score", label: "Calificación", color: "#16697A", kind: "line", data: analytics.score_series }]}
        />
        <div className="xl:col-span-2">
          <AnalyticsChartCard
            title="Actividad registrada"
            description="Señales de estudio que permiten orientar el siguiente refuerzo."
            ariaLabel={`Actividad de ${analytics.student_name} por fecha`}
            series={[
              { id: "lessons", label: "Lecciones", color: "#00AA80", kind: "histogram", data: analytics.activity_series.map((point) => ({ time: point.time, value: point.lessons_completed })) },
              { id: "modules", label: "Módulos", color: "#F4B422", kind: "histogram", data: analytics.activity_series.map((point) => ({ time: point.time, value: point.modules_completed })) },
              { id: "attempts", label: "Intentos", color: "#16697A", kind: "histogram", data: analytics.activity_series.map((point) => ({ time: point.time, value: point.assessments_submitted })) },
            ]}
          />
        </div>
      </section>

      <section className="mt-10 surface p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-teal">Intentos</p><h2 className="display mt-3 text-3xl">Historial de evaluación.</h2></div>{session.role === "admin" ? <ResetAttemptsButton assessmentIds={[...new Set(analytics.attempts.map((attempt) => attempt.assessment_id))]} /> : null}</div>
        <div className="mt-5 grid gap-3">{analytics.attempts.length === 0 ? <p className="text-sm text-twilight/55">No hay intentos registrados en este período.</p> : analytics.attempts.map((attempt) => <div key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-twilight/10 bg-canvas px-4 py-3"><span className="text-sm font-semibold">Evaluación {attempt.assessment_id.slice(-6)} · intento {attempt.attempt_number}</span><span className={attempt.passed ? "text-sm font-bold text-seaweed" : "text-sm font-bold text-danger"}>{attempt.score}%</span></div>)}</div>
      </section>

      <section className="mt-8 surface p-6 sm:p-8">
        <p className="eyebrow text-teal">Falencias</p>
        <div className="mt-5 grid gap-3">{analytics.failed_competencies.length === 0 ? <p className="text-sm text-twilight/55">No hay falencias registradas en este período.</p> : analytics.failed_competencies.map((item) => <div key={item.competency} className="flex items-center justify-between rounded-xl border border-twilight/10 bg-canvas px-4 py-3"><span className="text-sm font-semibold">{item.competency}</span><span className="text-sm font-bold text-danger">{item.count} fallos</span></div>)}</div>
      </section>
    </div>
  );
}
