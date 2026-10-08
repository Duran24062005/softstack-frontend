import { ChartBar, Pulse, TrendUp, UsersThree } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { AnalyticsChartCard } from "@/components/analytics/analytics-chart-card";
import { AnalyticsPeriodSelector } from "@/components/analytics/analytics-period-selector";
import { normalizeAnalyticsPeriod } from "@/lib/analytics";
import { getAnalyticsOverview, getAnalyticsStudents } from "@/lib/server-api";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { period: requestedPeriod } = await searchParams;
  const period = normalizeAnalyticsPeriod(requestedPeriod);
  const [analytics, students] = await Promise.all([getAnalyticsOverview(period), getAnalyticsStudents(period)]);

  return (
    <div className="app-main">
      <header className="border-b border-twilight/13 pb-8">
        <p className="eyebrow text-seaweed">Acompañamiento educativo</p>
        <h1 className="display mt-4 text-4xl tracking-[-.055em] sm:text-6xl lg:text-7xl">Entiende dónde reforzar.</h1>
        <p className="pretty-copy mt-5 max-w-xl leading-7 text-twilight/58">Resultados de quizzes, intentos y competencias con mayor dificultad.</p>
      </header>

      <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-twilight">Período visible</p>
          <p className="mt-1 text-xs text-twilight/50">Las cifras y tendencias se actualizan con el mismo rango.</p>
        </div>
        <AnalyticsPeriodSelector pathname="/admin/analytics" period={period} />
      </div>

      {analytics ? (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="surface p-6"><UsersThree size={23} className="text-teal" /><p className="metric-number mt-6 text-4xl font-bold text-twilight">{analytics.students}</p><p className="mt-2 text-sm text-twilight/50">Estudiantes en tu ámbito</p></article>
            <article className="surface p-6"><TrendUp size={23} className="text-seaweed" /><p className="metric-number mt-6 text-4xl font-bold text-twilight">{analytics.snapshot.percentage}%</p><p className="mt-2 text-sm text-twilight/50">Avance promedio actual</p></article>
            <article className="surface p-6"><ChartBar size={23} className="text-teal" /><p className="metric-number mt-6 text-4xl font-bold text-twilight">{analytics.attempts}</p><p className="mt-2 text-sm text-twilight/50">Intentos en el período</p></article>
            <article className="surface p-6"><Pulse size={23} className="text-gold" /><p className="metric-number mt-6 text-4xl font-bold text-twilight">{analytics.active_students}</p><p className="mt-2 text-sm text-twilight/50">Estudiantes con actividad</p></article>
          </section>

          <section className="mt-10 grid gap-4 xl:grid-cols-2">
            <AnalyticsChartCard
              title="Avance de la cohorte"
              description="Porcentaje promedio de lecciones completadas acumuladas por fecha."
              ariaLabel="Avance promedio de estudiantes por fecha"
              format="percent"
              series={[{ id: "progress", label: "Avance", color: "#00AA80", kind: "area", data: analytics.progress_series, topColor: "rgba(0, 170, 128, .32)", bottomColor: "rgba(0, 170, 128, .04)" }]}
            />
            <AnalyticsChartCard
              title="Mejora en resultados"
              description="Promedio diario de calificaciones de los intentos enviados."
              ariaLabel="Promedio de calificaciones por fecha"
              format="percent"
              series={[{ id: "score", label: "Calificación", color: "#16697A", kind: "line", data: analytics.score_series }]}
            />
            <div className="xl:col-span-2">
              <AnalyticsChartCard
                title="Actividad registrada"
                description="Eventos reales de aprendizaje dentro del rango seleccionado."
                ariaLabel="Actividad de estudiantes por fecha"
                series={[
                  { id: "lessons", label: "Lecciones", color: "#00AA80", kind: "histogram", data: analytics.activity_series.map((point) => ({ time: point.time, value: point.lessons_completed })) },
                  { id: "modules", label: "Módulos", color: "#F4B422", kind: "histogram", data: analytics.activity_series.map((point) => ({ time: point.time, value: point.modules_completed })) },
                  { id: "attempts", label: "Intentos", color: "#16697A", kind: "histogram", data: analytics.activity_series.map((point) => ({ time: point.time, value: point.assessments_submitted })) },
                ]}
              />
            </div>
          </section>
        </>
      ) : (
        <div className="status-notice status-notice-error mt-8"><Pulse size={19} /> No pudimos cargar métricas reales del sistema en este momento.</div>
      )}

      <section className="mt-10 surface p-6 sm:p-8">
        <p className="eyebrow text-teal">Estudiantes</p>
        <h2 className="display mt-3 text-3xl">Seguimiento individual.</h2>
        <div className="mt-6 grid gap-3">{students.length === 0 ? <p className="text-sm text-twilight/55">Todavía no hay estudiantes en tu ámbito.</p> : students.map((student) => <Link key={student.id} href={`/admin/analytics/students/${student.id}?period=${period}`} className="flex items-center justify-between rounded-xl border border-twilight/10 bg-canvas px-4 py-3 transition hover:border-seaweed/40"><span><span className="block text-sm font-semibold">{student.full_name}</span><span className="mt-1 block text-xs text-twilight/50">{student.attempts} intentos · promedio {student.average_score}%</span></span><span className="text-xs font-bold text-teal">Ver detalle →</span></Link>)}</div>
      </section>

      {analytics ? (
        <section className="mt-10 surface p-6 sm:p-8">
          <p className="eyebrow text-teal">Falencias agregadas</p>
          <h2 className="display mt-3 text-3xl">Competencias para reforzar.</h2>
          {analytics.failed_competencies.length === 0 ? <p className="mt-6 text-sm text-twilight/55">Todavía no hay respuestas incorrectas registradas.</p> : <div className="mt-6 grid gap-3">{analytics.failed_competencies.map((item) => <div key={item.competency} className="flex items-center justify-between rounded-xl border border-twilight/10 bg-canvas px-4 py-3"><span className="text-sm font-semibold">{item.competency}</span><span className="metric-number text-sm font-bold text-danger">{item.count} fallos</span></div>)}</div>}
        </section>
      ) : null}
    </div>
  );
}
