import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, Plus } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";

import { getAdminModule, getAdminModuleLessons } from "@/lib/server-api";

const statusLabels = { draft: "Borrador", published: "Publicado", archived: "Archivado" } as const;

export default async function AdminModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [module, lessons] = await Promise.all([getAdminModule(id), getAdminModuleLessons(id)]);
  if (!module) notFound();

  return <div className="app-main"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><Link href="/admin/modules" className="inline-flex items-center gap-2 text-sm text-ink/50 hover:text-ink"><ArrowLeft size={16} /> Módulos</Link><p className="eyebrow mt-8 text-cobalt">Admin / Módulo</p><h1 className="display mt-4 text-5xl tracking-[-.06em] sm:text-7xl">{module.title}.</h1><p className="mt-5 max-w-2xl leading-7 text-ink/60">{module.description || "Organiza aquí las lecciones que forman esta parte de la ruta."}</p></div><Link href={`/admin/lessons/new?module=${module.id}`} className="button button-ink button-large"><Plus size={18} weight="bold" /> Nueva lección</Link></div><div className="mt-14 flex items-center gap-3 text-sm text-ink/50"><BookOpen size={18} /><span>{lessons.length} {lessons.length === 1 ? "lección" : "lecciones"}</span><span className="size-1 rounded-full bg-ink/30" /><span>Estado: {statusLabels[module.status]}</span></div><section className="mt-5 overflow-hidden rounded-[1.5rem] border border-ink/12 bg-white"><div className="hidden grid-cols-[4rem_1fr_auto_auto] gap-4 border-b border-ink/10 px-6 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-ink/40 sm:grid"><span>#</span><span>Lección</span><span>Estado</span><span /></div>{lessons.length === 0 ? <div className="p-10 text-center"><p className="font-semibold">Este módulo todavía está vacío.</p><p className="mt-2 text-sm text-ink/50">Crea la primera lección para empezar a construirlo.</p></div> : lessons.map((lesson, index) => <div key={lesson.id} className="grid gap-4 border-b border-ink/10 px-6 py-5 last:border-b-0 sm:grid-cols-[4rem_1fr_auto_auto] sm:items-center"><span className="text-xs font-bold text-cobalt">{String(index + 1).padStart(2, "0")}</span><div><h2 className="font-semibold">{lesson.title}</h2><p className="mt-1 text-sm text-ink/50">{lesson.description || "Sin descripción"} · {lesson.estimated_minutes} min</p></div><span className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${lesson.status === "published" ? "bg-lime/35 text-ink" : "bg-ink/7 text-ink/50"}`}>{statusLabels[lesson.status]}</span><Link href={`/admin/lessons/${lesson.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-cobalt hover:text-ink">Editar <ArrowUpRight size={15} /></Link></div>)}</section></div>;
}
