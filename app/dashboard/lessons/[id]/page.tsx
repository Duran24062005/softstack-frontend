import { ArrowLeft, CheckCircle, Clock } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CompleteLesson } from "@/components/dashboard/complete-lesson";
import { LessonContent } from "@/components/dashboard/lesson-content";
import { getLearningData, getLesson, requireSession } from "@/lib/server-api";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const [lesson, learning] = await Promise.all([getLesson(id), getLearningData()]);
  if (!lesson) notFound();
  const completed = learning.progress.completed_lesson_ids.includes(lesson.id);

  return (
    <div className="app-main">
      <div className="mx-auto max-w-5xl">
        <Link href={`/dashboard/modules/${lesson.module_id}`} className="back-link"><ArrowLeft size={16} /> Volver al módulo</Link>
        <header className="mt-8 grid gap-8 border-b border-twilight/13 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow text-seaweed">Lección / {lesson.order.toString().padStart(2, "0")}</p>
            <h1 className="display mt-5 max-w-4xl text-5xl leading-[.96] tracking-[-.055em] sm:text-7xl">{lesson.title}</h1>
            <p className="pretty-copy mt-6 max-w-2xl text-base leading-8 text-twilight/60">{lesson.description}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-2 rounded-lg bg-twilight/[.06] px-3 py-2 text-twilight/58"><Clock size={16} /> {lesson.estimated_minutes} min</span>
            {completed ? <span className="inline-flex items-center gap-2 rounded-lg bg-seaweed/10 px-3 py-2 text-[#006c53]"><CheckCircle size={16} weight="fill" /> Completada</span> : null}
          </div>
        </header>
        <article className="surface mt-8 p-3 sm:p-7 lg:p-10"><LessonContent content={lesson.content} /></article>
        <div className="mt-8 flex justify-end"><CompleteLesson lessonId={lesson.id} completed={completed} /></div>
      </div>
    </div>
  );
}
