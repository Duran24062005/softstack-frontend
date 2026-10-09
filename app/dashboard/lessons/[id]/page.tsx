import { ArrowLeft, CheckCircle, Clock } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonContent } from "@/components/dashboard/lesson-content";
import { QuizPanel } from "@/components/dashboard/quiz-panel";
import { getLesson, getLessonAssessment, requireSession } from "@/lib/server-api";
import { InstructionalPlanSummary } from "@/components/dashboard/instructional-plan-summary";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const [lesson, assessment] = await Promise.all([getLesson(id), getLessonAssessment(id)]);
  if (!lesson) notFound();

  return (
    <div className="app-main">
      <div className="mx-auto max-w-5xl">
        <Link href={`/dashboard/modules/${lesson.module_id}`} className="back-link"><ArrowLeft size={16} /> Volver al módulo</Link>
        <header className="mt-8 grid gap-8 border-b border-twilight/13 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow text-seaweed">Lección / {lesson.order.toString().padStart(2, "0")}</p>
            <h1 className="display mt-5 max-w-4xl text-4xl leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-7xl">{lesson.title}</h1>
            <p className="pretty-copy mt-6 max-w-2xl text-base leading-8 text-twilight/60">{lesson.description}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-2 rounded-lg bg-twilight/[.06] px-3 py-2 text-twilight/58"><Clock size={16} /> {lesson.estimated_minutes} min</span>
            {assessment?.passed ? <span className="inline-flex items-center gap-2 rounded-lg bg-seaweed/10 px-3 py-2 text-[#006c53]"><CheckCircle size={16} weight="fill" /> Aprobada</span> : null}
          </div>
        </header>
        <InstructionalPlanSummary plan={lesson.instructional_plan} />
        <article className="surface mt-8 p-3 sm:p-7 lg:p-10"><LessonContent content={lesson.content} /></article>
        <QuizPanel assessment={assessment} />
      </div>
    </div>
  );
}
