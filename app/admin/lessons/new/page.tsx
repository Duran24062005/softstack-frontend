import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

import { LessonEditor } from "@/components/editor/lesson-editor";
import { getAdminModules } from "@/lib/server-api";

export default async function NewLessonPage({ searchParams }: { searchParams: Promise<{ module?: string }> }) {
  const modules = await getAdminModules();
  const { module: initialModuleId } = await searchParams;
  return <div className="app-main"><div className="mb-10 flex items-center justify-between gap-4"><div><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-ink/50 hover:text-ink"><ArrowLeft size={16} /> Dashboard</Link><p className="eyebrow mt-8 text-cobalt">Admin / Contenido</p><h1 className="display mt-4 text-5xl tracking-[-.06em]">Nueva lección.</h1></div></div>{modules.length === 0 ? <div className="max-w-xl rounded-[1.5rem] border border-dashed border-ink/20 p-8"><p className="font-semibold">Primero necesitas crear un módulo.</p><p className="mt-2 text-sm leading-6 text-ink/55">Las lecciones siempre pertenecen a un módulo para mantener la ruta organizada.</p><Link href="/admin/modules/new" className="button button-ink mt-6">Crear módulo <ArrowLeft className="rotate-180" size={16} /></Link></div> : <LessonEditor modules={modules} initialModuleId={initialModuleId} />}</div>;
}
