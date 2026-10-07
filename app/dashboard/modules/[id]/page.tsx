/* eslint-disable @next/next/no-img-element */

import { ArrowLeft, ArrowRight, BookOpen, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/reveal";
import { QuizPanel } from "@/components/dashboard/quiz-panel";
import { getLearningData, getModuleAssessment, getModuleLessons, requireSession, serverFetch } from "@/lib/server-api";
import type { Module } from "@/lib/types";

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const [moduleResponse, lessons, learning, assessment] = await Promise.all([
    serverFetch<Module>(`/modules/${id}`),
    getModuleLessons(id),
    getLearningData(),
    getModuleAssessment(id),
  ]);
  if (!moduleResponse.ok) notFound();

  const learningModule = await moduleResponse.json();
  const completedCount = learning.progress.completed_lesson_ids.filter((lessonId) => lessons.some((lesson) => lesson.id === lessonId)).length;
  const moduleProgress = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const cover = learningModule.cover_media;

  return (
    <div className="app-main">
      <Link href="/dashboard" className="back-link"><ArrowLeft size={16} /> Volver a mi ruta</Link>
      <section className="mt-8 grid overflow-hidden rounded-[1.5rem] border border-twilight/10 bg-white lg:grid-cols-[1.1fr_.9fr]">
        <Reveal className="p-7 sm:p-10 lg:p-12">
          <p className="eyebrow text-seaweed">Módulo / {learningModule.order.toString().padStart(2, "0")}</p>
          <h1 className="display mt-5 max-w-4xl text-5xl leading-[.96] tracking-[-.055em] sm:text-7xl">{learningModule.title}</h1>
          <p className="pretty-copy mt-6 max-w-2xl text-base leading-8 text-twilight/60">{learningModule.description}</p>
          <div className="mt-9 flex items-center gap-4">
            <span className="metric-number text-4xl font-bold text-teal">{moduleProgress}%</span>
            <span className="text-sm leading-6 text-twilight/48">{completedCount} de {lessons.length}<br />lecciones completadas</span>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="relative min-h-72 overflow-hidden bg-twilight">
          {cover ? (
            cover.content_type.startsWith("video/") ? <video src={cover.url} controls preload="metadata" className="size-full min-h-72 object-cover" /> : <img src={cover.url} alt={`Portada de ${learningModule.title}`} className="size-full min-h-72 object-cover" />
          ) : (
            <div className="flex size-full min-h-72 flex-col justify-between p-8 text-white">
              <span className="eyebrow text-gold">Campuslands · SoftStack</span>
              <p className="display max-w-sm text-4xl tracking-[-.045em]">Del conocimiento a la evidencia.</p>
            </div>
          )}
        </Reveal>
      </section>
      <section className="mt-16">
        <div className="flex items-end justify-between gap-5 border-b border-twilight/13 pb-5">
          <div><p className="eyebrow text-teal">Contenido del módulo</p><h2 className="display mt-3 text-3xl tracking-[-.04em]">Tu siguiente tramo.</h2></div>
          <BookOpen size={24} className="text-seaweed" />
        </div>
        {lessons.length === 0 ? (
          <div className="empty-state mt-8"><p className="font-semibold">Este módulo todavía está tomando forma.</p><p className="mt-2 text-sm text-twilight/50">Vuelve pronto para descubrir sus lecciones.</p></div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-twilight/10 bg-white">
            {lessons.map((lesson, index) => {
              const completed = learning.progress.completed_lesson_ids.includes(lesson.id);
              return <Reveal key={lesson.id} delay={index * 0.04}><Link href={`/dashboard/lessons/${lesson.id}`} className="group grid gap-4 border-b border-twilight/10 px-5 py-6 last:border-b-0 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center sm:px-7"><span className="metric-number text-xs font-bold text-seaweed">{String(index + 1).padStart(2, "0")}</span><span><span className="flex items-center gap-3"><span className="display text-xl tracking-[-.025em] sm:text-2xl">{lesson.title}</span>{completed ? <CheckCircle size={17} weight="fill" className="shrink-0 text-seaweed" aria-label="Completada" /> : null}</span><span className="mt-2 block text-sm leading-6 text-twilight/52">{lesson.description}</span></span><span className="flex items-center gap-4 text-xs font-semibold text-twilight/45">{lesson.estimated_minutes} min<ArrowRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:text-teal" /></span></Link></Reveal>;
            })}
          </div>
        )}
      </section>
      <QuizPanel assessment={assessment} />
    </div>
  );
}
