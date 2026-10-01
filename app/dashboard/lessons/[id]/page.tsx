import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock } from "@phosphor-icons/react/dist/ssr";
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
  return <div className="app-main"><div className="mx-auto max-w-4xl"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-ink/50 transition-colors hover:text-ink"><ArrowLeft size={16} /> Volver a mi ruta</Link><div className="mt-12 border-b border-ink/15 pb-10"><p className="eyebrow text-cobalt">Lección / {lesson.order.toString().padStart(2, "0")}</p><h1 className="display mt-5 max-w-3xl text-5xl leading-[.95] tracking-[-.06em] sm:text-7xl">{lesson.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-ink/60">{lesson.description}</p><div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-ink/45"><span className="flex items-center gap-2"><Clock size={17} /> {lesson.estimated_minutes} min</span>{completed && <span className="flex items-center gap-2 font-semibold text-emerald-700"><CheckCircle size={17} weight="fill" /> Completada</span>}</div></div><article className="mt-10 rounded-[1.5rem] bg-white p-5 shadow-sm sm:p-10"><LessonContent content={lesson.content} /></article><div className="mt-8 flex justify-end"><CompleteLesson lessonId={lesson.id} completed={completed} /></div></div></div>;
}
