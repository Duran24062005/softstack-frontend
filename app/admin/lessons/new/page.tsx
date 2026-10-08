import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { LessonEditor } from "@/components/editor/lesson-editor";
import { getAdminModules } from "@/lib/server-api";

export default async function NewLessonPage({ searchParams }: { searchParams: Promise<{ module?: string }> }) {
  const [modules, { module: initialModuleId }] = await Promise.all([getAdminModules(), searchParams]);
  return <div className="app-main"><Link href="/admin/modules" className="back-link"><ArrowLeft size={16} /> Módulos</Link><header className="mt-8 border-b border-twilight/13 pb-8"><p className="eyebrow text-seaweed">Administración / Contenido</p><h1 className="display mt-4 text-4xl tracking-[-.055em] sm:text-6xl lg:text-7xl">Nueva lección.</h1><p className="mt-5 max-w-xl leading-7 text-twilight/58">Construye una experiencia breve, útil y lista para convertirse en evidencia.</p></header>{modules.length === 0 ? <div className="empty-state mt-8 max-w-xl"><p className="font-semibold">Primero necesitas crear un módulo.</p><p className="mt-2 text-sm leading-6 text-twilight/55">Las lecciones pertenecen a un módulo para mantener la ruta organizada.</p><Link href="/admin/modules/new" className="button button-primary mt-6">Crear módulo</Link></div> : <div className="mt-8"><LessonEditor modules={modules} initialModuleId={initialModuleId} /></div>}</div>;
}
