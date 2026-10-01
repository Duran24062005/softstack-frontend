import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/reveal";
import { getModuleLessons, getLearningData, serverFetch, requireSession } from "@/lib/server-api";
import type { Module } from "@/lib/types";

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const [moduleResponse, lessons, learning] = await Promise.all([serverFetch<Module>(`/modules/${id}`), getModuleLessons(id), getLearningData()]);
  if (!moduleResponse.ok) notFound();
  const learningModule = await moduleResponse.json();
  return <div className="app-main"><div className="mx-auto max-w-5xl"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-ink/50 hover:text-ink"><ArrowLeft size={16} /> Volver a mi ruta</Link><Reveal><p className="eyebrow mt-12 text-cobalt">Módulo / {learningModule.order.toString().padStart(2, "0")}</p><h1 className="display mt-5 max-w-4xl text-6xl leading-[.95] tracking-[-.07em] sm:text-8xl">{learningModule.title}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-ink/60">{learningModule.description}</p></Reveal><div className="mt-16 border-t border-ink/15">{lessons.map((lesson, index) => <Reveal key={lesson.id} delay={index * .06}><Link href={`/dashboard/lessons/${lesson.id}`} className="group grid gap-5 border-b border-ink/12 py-7 transition-colors hover:bg-white sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-4"><span className="text-sm font-bold text-cobalt">{String(index + 1).padStart(2, "0")}</span><span><span className="flex items-center gap-3"><BookOpen size={19} className="text-ink/35" /><span className="display text-2xl tracking-[-.04em]">{lesson.title}</span></span><span className="mt-2 block text-sm text-ink/55">{lesson.description}</span></span><span className="flex items-center gap-4 text-sm text-ink/40"><span>{lesson.estimated_minutes} min</span><ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span></Link></Reveal>)}</div>{lessons.length === 0 && <div className="mt-10 rounded-[1.5rem] border border-dashed border-ink/20 p-10 text-center"><p className="font-semibold">Este módulo todavía está tomando forma.</p><p className="mt-2 text-sm text-ink/50">Vuelve pronto para descubrir sus lecciones.</p></div>}<p className="mt-8 text-sm text-ink/45">{learning.progress.completed_lesson_ids.filter((lessonId) => lessons.some((lesson) => lesson.id === lessonId)).length} de {lessons.length} lecciones completadas</p></div></div>;
}
